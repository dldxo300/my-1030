/**
 * @file components/orders/order-status-badge.tsx
 * @description 주문 상태 배지 컴포넌트
 *
 * 주문 상태에 따라 색상과 텍스트를 다르게 표시하는 배지 컴포넌트
 */

import type { Order } from "@/types/order";

interface OrderStatusBadgeProps {
  status: Order["status"];
}

/**
 * 주문 상태 배지 컴포넌트
 */
export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: "결제 대기",
          className: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400",
        };
      case "confirmed":
        return {
          label: "주문 확인",
          className: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400",
        };
      case "shipped":
        return {
          label: "배송 중",
          className: "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400",
        };
      case "delivered":
        return {
          label: "배송 완료",
          className: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400",
        };
      case "cancelled":
        return {
          label: "취소됨",
          className: "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400",
        };
      default:
        return {
          label: "알 수 없음",
          className: "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
