/**
 * @file components/checkout/checkout-summary.tsx
 * @description 체크아웃 장바구니 요약 컴포넌트
 *
 * 주요 기능:
 * 1. 장바구니 아이템 목록 표시 (읽기 전용)
 * 2. 상품별 수량 및 금액 표시
 * 3. 총 수량 및 총 금액 표시
 *
 * @dependencies
 * - types/cart: CartItemWithProduct
 */

import type { CartItemWithProduct } from "@/types/cart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CheckoutSummaryProps {
  items: CartItemWithProduct[];
}

/**
 * 카테고리 한글 표시명 매핑
 */
const CATEGORY_LABELS: Record<string, string> = {
  electronics: "전자제품",
  clothing: "의류",
  books: "도서",
  food: "식품",
  sports: "스포츠",
  beauty: "뷰티",
  home: "생활/가정",
};

export function CheckoutSummary({ items }: CheckoutSummaryProps) {
  // 총 수량 및 총 금액 계산
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>주문 요약</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 상품 목록 */}
        <div className="space-y-3">
          {items.map((item) => {
            const itemTotal = item.product.price * item.quantity;
            const categoryLabel =
              CATEGORY_LABELS[item.product.category] || item.product.category;

            return (
              <div
                key={item.id}
                className="flex justify-between items-start text-sm"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {categoryLabel} · {item.quantity}개
                  </p>
                </div>
                <p className="font-medium text-gray-900 dark:text-white ml-4">
                  {itemTotal.toLocaleString()}원
                </p>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* 합계 정보 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              상품 종류
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {items.length}종
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">총 수량</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {totalQuantity}개
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span className="text-gray-900 dark:text-white">총 결제 금액</span>
            <span className="text-blue-600 dark:text-blue-400">
              {totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

