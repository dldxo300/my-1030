/**
 * @file types/cart.ts
 * @description 장바구니 관련 TypeScript 타입 정의
 */

import type { Product } from "./product";

/**
 * 장바구니 아이템 타입 (cart_items 테이블 스키마 기반)
 */
export interface CartItem {
  id: string;
  clerk_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

/**
 * 장바구니 아이템 + 상품 정보
 * (화면 표시용)
 */
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

/**
 * 장바구니 요약 정보
 */
export interface CartSummary {
  totalItems: number; // 총 아이템 개수 (수량 합계)
  totalPrice: number; // 총 금액 합계
  itemCount: number; // 장바구니에 담긴 상품 종류 개수
}

/**
 * 장바구니 추가/수정 결과 타입
 */
export type CartActionResult =
  | { success: true; message: string; cartItemId?: string }
  | { success: false; error: string };

