/**
 * @file actions/order.ts
 * @description 주문 관련 Server Actions
 *
 * 주요 기능:
 * 1. 주문 생성
 * 2. 주문 조회
 * 3. 사용자 주문 목록 조회
 *
 * @dependencies
 * - lib/supabase/server: createClerkSupabaseClient
 * - lib/supabase/queries/order: createOrder, getOrderById, getUserOrders
 * - @clerk/nextjs/server: auth
 * - types/order: CreateOrderInput, OrderActionResult, OrderWithItems, Order
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import {
  createOrder as createOrderQuery,
  getOrderById as getOrderByIdQuery,
  getUserOrders as getUserOrdersQuery,
  cancelOrder as cancelOrderQuery,
} from "@/lib/supabase/queries/order";
import { getCartItems } from "./cart";
import type {
  CreateOrderInput,
  OrderActionResult,
  OrderWithItems,
  Order,
  CancelOrderResult,
} from "@/types/order";

/**
 * 주문 생성 Server Action
 *
 * @param {CreateOrderInput} orderInput - 주문 생성 입력 (배송지, 메모)
 * @returns {Promise<OrderActionResult>} 작업 결과
 */
export async function createOrder(
  orderInput: CreateOrderInput
): Promise<OrderActionResult> {
  console.group("🛒 [createOrder Action] 주문 생성 시작");
  console.log("📦 배송지 정보:", orderInput.shippingAddress);

  try {
    // 1. 인증 확인
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      console.error("❌ [createOrder Action] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "로그인이 필요합니다." };
    }

    console.log(`👤 사용자 ID: ${clerkId}`);

    // 2. 배송지 정보 유효성 검사
    const { shippingAddress } = orderInput;

    if (
      !shippingAddress.recipient ||
      !shippingAddress.phone ||
      !shippingAddress.postalCode ||
      !shippingAddress.address1
    ) {
      console.error("❌ [createOrder Action] 배송지 정보 누락");
      console.groupEnd();
      return { success: false, error: "배송지 정보를 모두 입력해주세요." };
    }

    // 전화번호 형식 검증 (간단한 검증)
    const phoneRegex = /^[0-9-]+$/;
    if (!phoneRegex.test(shippingAddress.phone)) {
      console.error("❌ [createOrder Action] 잘못된 전화번호 형식");
      console.groupEnd();
      return { success: false, error: "올바른 전화번호를 입력해주세요." };
    }

    // 우편번호 형식 검증 (5자리 숫자)
    const postalCodeRegex = /^[0-9]{5}$/;
    if (!postalCodeRegex.test(shippingAddress.postalCode)) {
      console.error("❌ [createOrder Action] 잘못된 우편번호 형식");
      console.groupEnd();
      return {
        success: false,
        error: "올바른 우편번호를 입력해주세요. (5자리 숫자)",
      };
    }

    console.log("✅ [createOrder Action] 배송지 정보 유효성 검사 통과");

    // 3. 장바구니 조회
    const cartItems = await getCartItems();

    if (cartItems.length === 0) {
      console.error("❌ [createOrder Action] 장바구니가 비어있음");
      console.groupEnd();
      return { success: false, error: "장바구니가 비어있습니다." };
    }

    console.log(`📦 장바구니 아이템 수: ${cartItems.length}`);

    // 4. 주문 생성
    const supabase = createClerkSupabaseClient();
    const orderId = await createOrderQuery(
      supabase,
      clerkId,
      cartItems,
      orderInput
    );

    console.log(`🎉 [createOrder Action] 주문 생성 완료: ${orderId}`);
    console.groupEnd();

    return {
      success: true,
      message: "주문이 완료되었습니다.",
      orderId,
    };
  } catch (error) {
    console.error("❌ [createOrder Action] 예외 발생:", error);
    console.groupEnd();

    const errorMessage =
      error instanceof Error ? error.message : "주문 처리 중 오류가 발생했습니다.";

    return { success: false, error: errorMessage };
  }
}

/**
 * 주문 조회 Server Action
 *
 * @param {string} orderId - 주문 ID
 * @returns {Promise<OrderWithItems | null>} 주문 정보 (order_items 포함)
 */
export async function getOrder(orderId: string): Promise<OrderWithItems | null> {
  console.group("🔍 [getOrder Action] 주문 조회 시작");
  console.log(`📦 주문 ID: ${orderId}`);

  try {
    // 1. 인증 확인
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      console.error("❌ [getOrder Action] 인증되지 않은 사용자");
      console.groupEnd();
      return null;
    }

    console.log(`👤 사용자 ID: ${clerkId}`);

    // 2. 주문 조회
    const supabase = createClerkSupabaseClient();
    const order = await getOrderByIdQuery(supabase, orderId, clerkId);

    if (!order) {
      console.warn("⚠️ [getOrder Action] 주문을 찾을 수 없음");
      console.groupEnd();
      return null;
    }

    console.log("✅ [getOrder Action] 주문 조회 완료");
    console.groupEnd();

    return order;
  } catch (error) {
    console.error("❌ [getOrder Action] 예외 발생:", error);
    console.groupEnd();
    return null;
  }
}

/**
 * 사용자 주문 목록 조회 Server Action
 *
 * @returns {Promise<Order[]>} 주문 목록
 */
export async function getUserOrders(): Promise<Order[]> {
  console.group("📋 [getUserOrders Action] 주문 목록 조회 시작");

  try {
    // 1. 인증 확인
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      console.error("❌ [getUserOrders Action] 인증되지 않은 사용자");
      console.groupEnd();
      return [];
    }

    console.log(`👤 사용자 ID: ${clerkId}`);

    // 2. 주문 목록 조회
    const supabase = createClerkSupabaseClient();
    const orders = await getUserOrdersQuery(supabase, clerkId);

    console.log(`✅ [getUserOrders Action] 조회 완료 (${orders.length}개 주문)`);
    console.groupEnd();

    return orders;
  } catch (error) {
    console.error("❌ [getUserOrders Action] 예외 발생:", error);
    console.groupEnd();
    return [];
  }
}

/**
 * 주문 취소 Server Action
 *
 * @param {string} orderId - 취소할 주문 ID
 * @returns {Promise<CancelOrderResult>} 취소 결과
 */
export async function cancelOrder(orderId: string): Promise<CancelOrderResult> {
  console.group("❌ [cancelOrder Action] 주문 취소 시작");
  console.log(`📦 주문 ID: ${orderId}`);

  try {
    // 1. 인증 확인
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      console.error("❌ [cancelOrder Action] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "로그인이 필요합니다." };
    }

    console.log(`👤 사용자 ID: ${clerkId}`);

    // 2. 주문 취소 처리
    const supabase = createClerkSupabaseClient();
    const result = await cancelOrderQuery(supabase, orderId, clerkId);

    if (result.success) {
      console.log("✅ [cancelOrder Action] 주문 취소 완료");
      console.groupEnd();
      return result;
    } else if (result.success === false) {
      console.error("❌ [cancelOrder Action] 주문 취소 실패:", result);
      console.groupEnd();
      return result;
    }
  } catch (error) {
    console.error("❌ [cancelOrder Action] 예외 발생:", error);
    console.groupEnd();

    const errorMessage =
      error instanceof Error ? error.message : "주문 취소 중 오류가 발생했습니다.";

    return { success: false, error: errorMessage };
  }
}

