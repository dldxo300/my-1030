/**
 * @file actions/cart.ts
 * @description 장바구니 관련 Server Actions
 *
 * 주요 기능:
 * 1. 장바구니 추가/수량 업데이트
 * 2. 장바구니 아이템 삭제
 * 3. 장바구니 수량 변경
 * 4. 장바구니 조회 (상품 정보 포함)
 *
 * @dependencies
 * - lib/supabase/server: createClerkSupabaseClient (Server Component용)
 * - @clerk/nextjs/server: auth (인증 정보 가져오기)
 * - types/cart: CartActionResult, CartItemWithProduct
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { CartActionResult, CartItemWithProduct } from "@/types/cart";

/**
 * 장바구니에 상품 추가 또는 수량 증가
 *
 * @param {string} productId - 추가할 상품 ID
 * @param {number} quantity - 추가할 수량 (기본값: 1)
 * @returns {Promise<CartActionResult>} 작업 결과
 */
export async function addToCart(
  productId: string,
  quantity: number = 1
): Promise<CartActionResult> {
  console.group("🛒 [addToCart] 장바구니 추가 시작");
  console.log(`📦 상품 ID: ${productId}`);
  console.log(`🔢 수량: ${quantity}`);

  try {
    // 1. 인증 확인
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      console.error("❌ [addToCart] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "로그인이 필요합니다." };
    }

    console.log(`👤 사용자 ID: ${clerkId}`);

    const supabase = createClerkSupabaseClient();

    // 2. 상품 존재 여부 및 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, stock_quantity, is_active")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("❌ [addToCart] 상품 조회 실패:", productError);
      console.groupEnd();
      return { success: false, error: "상품을 찾을 수 없습니다." };
    }

    if (!product.is_active) {
      console.error("❌ [addToCart] 비활성 상품");
      console.groupEnd();
      return { success: false, error: "판매가 중단된 상품입니다." };
    }

    console.log(`📦 상품 정보: ${product.name} (재고: ${product.stock_quantity})`);

    // 3. 기존 장바구니 아이템 확인
    const { data: existingItem, error: existingError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("clerk_id", clerkId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingError) {
      console.error("❌ [addToCart] 기존 아이템 조회 실패:", existingError);
      console.groupEnd();
      return {
        success: false,
        error: "장바구니 조회 중 오류가 발생했습니다.",
      };
    }

    if (existingItem) {
      // 4-1. 기존 아이템이 있으면 수량 증가
      const newQuantity = existingItem.quantity + quantity;

      // 재고 확인
      if (newQuantity > product.stock_quantity) {
        console.warn(
          `⚠️ [addToCart] 재고 부족 (요청: ${newQuantity}, 재고: ${product.stock_quantity})`
        );
        console.groupEnd();
        return {
          success: false,
          error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
        };
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("❌ [addToCart] 수량 업데이트 실패:", updateError);
        console.groupEnd();
        return {
          success: false,
          error: "장바구니 수량 업데이트 중 오류가 발생했습니다.",
        };
      }

      console.log(
        `✅ [addToCart] 수량 업데이트 성공 (${existingItem.quantity} → ${newQuantity})`
      );
      console.groupEnd();
      return {
        success: true,
        message: "장바구니에 추가되었습니다.",
        cartItemId: existingItem.id,
      };
    } else {
      // 4-2. 새로운 아이템 추가
      // 재고 확인
      if (quantity > product.stock_quantity) {
        console.warn(
          `⚠️ [addToCart] 재고 부족 (요청: ${quantity}, 재고: ${product.stock_quantity})`
        );
        console.groupEnd();
        return {
          success: false,
          error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
        };
      }

      const { data: newItem, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          clerk_id: clerkId,
          product_id: productId,
          quantity,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("❌ [addToCart] 아이템 추가 실패:", insertError);
        console.groupEnd();
        return {
          success: false,
          error: "장바구니 추가 중 오류가 발생했습니다.",
        };
      }

      console.log(`✅ [addToCart] 새 아이템 추가 성공 (수량: ${quantity})`);
      console.groupEnd();
      return {
        success: true,
        message: "장바구니에 추가되었습니다.",
        cartItemId: newItem.id,
      };
    }
  } catch (error) {
    console.error("❌ [addToCart] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      error: "장바구니 추가 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 장바구니 아이템 삭제
 *
 * @param {string} cartItemId - 삭제할 장바구니 아이템 ID
 * @returns {Promise<CartActionResult>} 작업 결과
 */
export async function removeFromCart(
  cartItemId: string
): Promise<CartActionResult> {
  console.group("🗑️ [removeFromCart] 장바구니 아이템 삭제 시작");
  console.log(`📦 장바구니 아이템 ID: ${cartItemId}`);

  try {
    // 1. 인증 확인
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      console.error("❌ [removeFromCart] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 2. 아이템 삭제 (본인의 아이템만 삭제 가능)
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("clerk_id", clerkId);

    if (deleteError) {
      console.error("❌ [removeFromCart] 삭제 실패:", deleteError);
      console.groupEnd();
      return {
        success: false,
        error: "장바구니 아이템 삭제 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [removeFromCart] 삭제 성공");
    console.groupEnd();
    return { success: true, message: "장바구니에서 삭제되었습니다." };
  } catch (error) {
    console.error("❌ [removeFromCart] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      error: "장바구니 아이템 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 장바구니 아이템 수량 변경
 *
 * @param {string} cartItemId - 수정할 장바구니 아이템 ID
 * @param {number} quantity - 새로운 수량 (최소 1)
 * @returns {Promise<CartActionResult>} 작업 결과
 */
export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
): Promise<CartActionResult> {
  console.group("🔢 [updateCartQuantity] 장바구니 수량 변경 시작");
  console.log(`📦 장바구니 아이템 ID: ${cartItemId}`);
  console.log(`🔢 새로운 수량: ${quantity}`);

  try {
    // 1. 수량 유효성 검사
    if (quantity < 1) {
      console.error("❌ [updateCartQuantity] 잘못된 수량 (최소 1)");
      console.groupEnd();
      return { success: false, error: "수량은 최소 1개 이상이어야 합니다." };
    }

    // 2. 인증 확인
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      console.error("❌ [updateCartQuantity] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 3. 장바구니 아이템 조회 (본인 소유 확인)
    const { data: cartItem, error: cartError } = await supabase
      .from("cart_items")
      .select("id, product_id")
      .eq("id", cartItemId)
      .eq("clerk_id", clerkId)
      .single();

    if (cartError || !cartItem) {
      console.error("❌ [updateCartQuantity] 장바구니 아이템 조회 실패:", cartError);
      console.groupEnd();
      return { success: false, error: "장바구니 아이템을 찾을 수 없습니다." };
    }

    // 4. 상품 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", cartItem.product_id)
      .single();

    if (productError || !product) {
      console.error("❌ [updateCartQuantity] 상품 조회 실패:", productError);
      console.groupEnd();
      return { success: false, error: "상품 정보를 찾을 수 없습니다." };
    }

    // 재고 초과 확인
    if (quantity > product.stock_quantity) {
      console.warn(
        `⚠️ [updateCartQuantity] 재고 부족 (요청: ${quantity}, 재고: ${product.stock_quantity})`
      );
      console.groupEnd();
      return {
        success: false,
        error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 5. 수량 업데이트
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId);

    if (updateError) {
      console.error("❌ [updateCartQuantity] 수량 업데이트 실패:", updateError);
      console.groupEnd();
      return {
        success: false,
        error: "수량 변경 중 오류가 발생했습니다.",
      };
    }

    console.log(`✅ [updateCartQuantity] 수량 변경 성공 (→ ${quantity})`);
    console.groupEnd();
    return { success: true, message: "수량이 변경되었습니다." };
  } catch (error) {
    console.error("❌ [updateCartQuantity] 예외 발생:", error);
    console.groupEnd();
    return { success: false, error: "수량 변경 중 오류가 발생했습니다." };
  }
}

/**
 * 현재 사용자의 장바구니 조회 (상품 정보 포함)
 *
 * @returns {Promise<CartItemWithProduct[]>} 장바구니 아이템 목록
 */
export async function getCartItems(): Promise<CartItemWithProduct[]> {
  console.group("📋 [getCartItems] 장바구니 조회 시작");

  try {
    // 1. 인증 확인
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      console.warn("⚠️ [getCartItems] 인증되지 않은 사용자");
      console.groupEnd();
      return [];
    }

    console.log(`👤 사용자 ID: ${clerkId}`);

    const supabase = createClerkSupabaseClient();

    // 2. 장바구니 아이템 조회 (상품 정보 JOIN)
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        clerk_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        product:products (
          id,
          name,
          description,
          price,
          category,
          stock_quantity,
          is_active,
          view_count,
          created_at,
          updated_at
        )
      `
      )
      .eq("clerk_id", clerkId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ [getCartItems] 조회 실패:", error);
      console.groupEnd();
      throw new Error(`장바구니 조회 실패: ${error.message}`);
    }

    // 3. 타입 변환
    const cartItems: CartItemWithProduct[] = (data || []).map((item: any) => ({
      id: item.id,
      clerk_id: item.clerk_id,
      product_id: item.product_id,
      quantity: item.quantity,
      created_at: item.created_at,
      updated_at: item.updated_at,
      product: item.product,
    }));

    console.log(`✅ [getCartItems] 조회 성공 (${cartItems.length}개 아이템)`);
    console.groupEnd();

    return cartItems;
  } catch (error) {
    console.error("❌ [getCartItems] 예외 발생:", error);
    console.groupEnd();
    throw error;
  }
}

