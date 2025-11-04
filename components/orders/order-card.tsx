/**
 * @file components/orders/order-card.tsx
 * @description 주문 카드 컴포넌트
 *
 * 주문 목록에서 각 주문을 카드로 표시하는 컴포넌트
 */

import Link from "next/link";
import type { Order } from "@/types/order";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./order-status-badge";
import { ChevronRight, Package } from "lucide-react";

interface OrderCardProps {
  order: Order;
}

/**
 * 주문 카드 컴포넌트
 *
 * 주문 번호, 날짜, 상태, 금액, 상품 미리보기, 상세 보기 링크 표시
 */
export function OrderCard({ order }: OrderCardProps) {
  // 주문 번호 (UUID 앞 8자리)
  const orderNumber = order.id.slice(0, 8);

  // 한국 시간대 포맷팅
  const orderDate = new Date(order.created_at).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 총 금액 포맷팅
  const totalAmount = order.total_amount.toLocaleString();

  // 상품 미리보기 (첫 번째 상품명 + 외 N개)
  const getProductPreview = () => {
    // 주문 상세가 없으므로 간단한 표시만 (실제 구현 시 order_items 필요)
    return "주문 상품";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-500" />
            <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
              {orderNumber}
            </span>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 주문 날짜 */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">주문일</span>
          <span className="text-gray-900 dark:text-white">{orderDate}</span>
        </div>

        {/* 총 금액 */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">총 금액</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {totalAmount}원
          </span>
        </div>

        {/* 상품 미리보기 (나중에 order_items와 연동) */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {getProductPreview()}
        </div>

        {/* 상세 보기 버튼 */}
        <div className="pt-2">
          <Link href={`/my-page/${order.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              주문 상세 보기
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
