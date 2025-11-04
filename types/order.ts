/**
 * @file types/order.ts
 * @description 주문 관련 TypeScript 타입 정의
 */

import type { Product } from "./product";

/**
 * 배송지 정보 타입
 * orders.shipping_address JSONB 필드에 저장됨
 */
export interface ShippingAddress {
  recipient: string; // 수령인
  phone: string; // 연락처
  postalCode: string; // 우편번호
  address1: string; // 기본주소
  address2?: string; // 상세주소 (선택)
}

/**
 * 주문 정보 타입 (orders 테이블 스키마 기반)
 */
export interface Order {
  id: string;
  clerk_id: string;
  total_amount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shipping_address: ShippingAddress;
  order_note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 주문 상세 아이템 타입 (order_items 테이블 스키마 기반)
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string; // 주문 시점의 상품명 (스냅샷)
  quantity: number;
  price: number; // 주문 시점의 가격 (스냅샷)
  created_at: string;
}

/**
 * 주문 + 주문 상세 아이템 목록
 * (주문 상세 페이지 표시용)
 */
export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

/**
 * 주문 생성 입력 타입
 */
export interface CreateOrderInput {
  shippingAddress: ShippingAddress;
  orderNote?: string;
}

/**
 * 주문 작업 결과 타입
 */
export type OrderActionResult =
  | { success: true; message: string; orderId: string }
  | { success: false; error: string };

/**
 * 주문 취소 결과 타입
 */
export type CancelOrderResult =
  | { success: true; message: string }
  | { success: false; error: string };

