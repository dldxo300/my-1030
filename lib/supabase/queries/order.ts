/**
 * @file lib/supabase/queries/order.ts
 * @description 주문 관련 Supabase 쿼리 함수
 *
 * 주요 기능:
 * 1. 주문 생성 (트랜잭션 처리)
 * 2. 주문 조회 (order_items 포함)
 * 3. 사용자별 주문 목록 조회
 *
 * @dependencies
 * - lib/supabase/server: createClerkSupabaseClient
 * - types/order: Order, OrderItem, OrderWithItems, CreateOrderInput
 * - types/cart: CartItemWithProduct
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Order,
  OrderWithItems,
  CreateOrderInput,
} from "@/types/order";
import type { CartItemWithProduct } from "@/types/cart";

/**
 * 주문 생성 (트랜잭션 처리)
 *
 * @param {SupabaseClient} supabase - Supabase 클라이언트
 * @param {string} clerkId - 사용자 Clerk ID
 * @param {CartItemWithProduct[]} cartItems - 장바구니 아이템 목록
 * @param {CreateOrderInput} orderInput - 주문 생성 입력 (배송지, 메모)
 * @returns {Promise<string>} 생성된 주문 ID
 */
export async function createOrder(
  supabase: SupabaseClient,
  clerkId: string,
  cartItems: CartItemWithProduct[],
  orderInput: CreateOrderInput
): Promise<string> {
  console.group("📝 [createOrder] 주문 생성 시작");
  console.log(`👤 사용자 ID: ${clerkId}`);
  console.log(`📦 장바구니 아이템 수: ${cartItems.length}`);

  try {
    // 1. 장바구니가 비어있는지 확인
    if (cartItems.length === 0) {
      console.error("❌ [createOrder] 장바구니가 비어있음");
      console.groupEnd();
      throw new Error("장바구니가 비어있습니다.");
    }

    // 2. 총 금액 계산
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    console.log(`💰 총 주문 금액: ${totalAmount.toLocaleString()}원`);

    // 3. 재고 확인
    for (const cartItem of cartItems) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock_quantity, is_active")
        .eq("id", cartItem.product_id)
        .single();

      if (productError || !product) {
        console.error(
          `❌ [createOrder] 상품 조회 실패: ${cartItem.product.name}`,
          productError
        );
        console.groupEnd();
        throw new Error(`상품을 찾을 수 없습니다: ${cartItem.product.name}`);
      }

      if (!product.is_active) {
        console.error(`❌ [createOrder] 비활성 상품: ${cartItem.product.name}`);
        console.groupEnd();
        throw new Error(`판매 중단된 상품이 포함되어 있습니다: ${cartItem.product.name}`);
      }

      if (product.stock_quantity < cartItem.quantity) {
        console.error(
          `❌ [createOrder] 재고 부족: ${cartItem.product.name} (재고: ${product.stock_quantity}, 주문: ${cartItem.quantity})`
        );
        console.groupEnd();
        throw new Error(
          `재고가 부족합니다: ${cartItem.product.name} (현재 재고: ${product.stock_quantity}개)`
        );
      }
    }

    console.log("✅ [createOrder] 재고 확인 완료");

    // 4. 주문 생성
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        clerk_id: clerkId,
        total_amount: totalAmount,
        status: "pending",
        shipping_address: orderInput.shippingAddress,
        order_note: orderInput.orderNote || null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("❌ [createOrder] 주문 생성 실패:", orderError);
      console.groupEnd();
      throw new Error("주문 생성에 실패했습니다.");
    }

    console.log(`✅ [createOrder] 주문 생성 완료: ${order.id}`);

    // 5. 주문 상세 아이템 생성
    const orderItems = cartItems.map((cartItem) => ({
      order_id: order.id,
      product_id: cartItem.product_id,
      product_name: cartItem.product.name,
      quantity: cartItem.quantity,
      price: cartItem.product.price,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("❌ [createOrder] 주문 상세 생성 실패:", orderItemsError);
      // 주문 삭제 (롤백)
      await supabase.from("orders").delete().eq("id", order.id);
      console.groupEnd();
      throw new Error("주문 상세 생성에 실패했습니다.");
    }

    console.log(`✅ [createOrder] 주문 상세 생성 완료 (${orderItems.length}개)`);

    // 6. 재고 차감
    for (const cartItem of cartItems) {
      const { error: stockError } = await supabase.rpc("decrement_stock", {
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
      });

      if (stockError) {
        console.error(
          `⚠️ [createOrder] 재고 차감 실패: ${cartItem.product.name}`,
          stockError
        );
        // 주문 및 주문 상세 삭제 (롤백)
        await supabase.from("orders").delete().eq("id", order.id);
        console.groupEnd();
        throw new Error("재고 차감에 실패했습니다.");
      }
    }

    console.log("✅ [createOrder] 재고 차감 완료");

    // 7. 장바구니 비우기
    const { error: cartDeleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("clerk_id", clerkId);

    if (cartDeleteError) {
      console.warn("⚠️ [createOrder] 장바구니 비우기 실패:", cartDeleteError);
      // 장바구니 비우기 실패는 주문 롤백하지 않음 (주문은 이미 성공)
    } else {
      console.log("✅ [createOrder] 장바구니 비우기 완료");
    }

    console.log(`🎉 [createOrder] 주문 처리 완료: ${order.id}`);
    console.groupEnd();

    return order.id;
  } catch (error) {
    console.error("❌ [createOrder] 예외 발생:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 주문 ID로 주문 조회 (order_items 포함)
 *
 * @param {SupabaseClient} supabase - Supabase 클라이언트
 * @param {string} orderId - 주문 ID
 * @param {string} clerkId - 사용자 Clerk ID (본인 확인용)
 * @returns {Promise<OrderWithItems | null>} 주문 정보 (order_items 포함)
 */
export async function getOrderById(
  supabase: SupabaseClient,
  orderId: string,
  clerkId: string
): Promise<OrderWithItems | null> {
  console.group("🔍 [getOrderById] 주문 조회 시작");
  console.log(`📦 주문 ID: ${orderId}`);
  console.log(`👤 사용자 ID: ${clerkId}`);

  try {
    // 주문 조회 (본인 주문만)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("clerk_id", clerkId)
      .single();

    if (orderError) {
      console.error("❌ [getOrderById] 주문 조회 실패:", orderError);
      console.groupEnd();
      return null;
    }

    if (!order) {
      console.warn("⚠️ [getOrderById] 주문을 찾을 수 없음");
      console.groupEnd();
      return null;
    }

    // 주문 상세 아이템 조회
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error("❌ [getOrderById] 주문 상세 조회 실패:", itemsError);
      console.groupEnd();
      throw new Error("주문 상세 조회에 실패했습니다.");
    }

    const orderWithItems: OrderWithItems = {
      ...order,
      order_items: orderItems || [],
    };

    console.log(
      `✅ [getOrderById] 조회 성공 (${orderItems?.length || 0}개 아이템)`
    );
    console.groupEnd();

    return orderWithItems;
  } catch (error) {
    console.error("❌ [getOrderById] 예외 발생:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 사용자별 주문 목록 조회
 *
 * @param {SupabaseClient} supabase - Supabase 클라이언트
 * @param {string} clerkId - 사용자 Clerk ID
 * @returns {Promise<Order[]>} 주문 목록
 */
export async function getUserOrders(
  supabase: SupabaseClient,
  clerkId: string
): Promise<Order[]> {
  console.group("📋 [getUserOrders] 사용자 주문 목록 조회 시작");
  console.log(`👤 사용자 ID: ${clerkId}`);

  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("clerk_id", clerkId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ [getUserOrders] 조회 실패:", error);
      console.groupEnd();
      throw new Error("주문 목록 조회에 실패했습니다.");
    }

    console.log(`✅ [getUserOrders] 조회 성공 (${orders?.length || 0}개 주문)`);
    console.groupEnd();

    return orders || [];
  } catch (error) {
    console.error("❌ [getUserOrders] 예외 발생:", error);
    console.groupEnd();
    throw error;
  }
}

