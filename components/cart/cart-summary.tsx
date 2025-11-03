/**
 * @file components/cart/cart-summary.tsx
 * @description 장바구니 요약 컴포넌트
 *
 * 주요 기능:
 * 1. 전체 상품 개수 표시
 * 2. 전체 금액 합계 표시
 * 3. 주문하기 버튼
 *
 * @dependencies
 * - types/cart: CartItemWithProduct
 * - components/ui/button: Button
 * - next/link: Link
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import type { CartItemWithProduct } from "@/types/cart";

interface CartSummaryProps {
  items: CartItemWithProduct[];
}

export function CartSummary({ items }: CartSummaryProps) {
  /**
   * 가격 포맷팅
   */
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  // 총 아이템 개수 (수량 합계)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // 총 금액
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 상품 종류 개수
  const itemCount = items.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        주문 요약
      </h2>

      <div className="space-y-3 mb-6">
        {/* 상품 종류 */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">상품 종류</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {itemCount}개
          </span>
        </div>

        {/* 총 수량 */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">총 수량</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {totalItems}개
          </span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          {/* 총 금액 */}
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              총 금액
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* 주문하기 버튼 */}
      <Link href="/checkout">
        <Button
          size="lg"
          className="w-full font-semibold"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          주문하기
        </Button>
      </Link>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
        * 배송지 정보를 입력하고 주문을 완료하세요
      </p>
    </div>
  );
}

