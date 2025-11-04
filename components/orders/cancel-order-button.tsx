/**
 * @file components/orders/cancel-order-button.tsx
 * @description 주문 취소 버튼 컴포넌트
 *
 * pending 상태의 주문만 취소할 수 있는 버튼 컴포넌트
 * 확인 Dialog 표시 및 취소 처리
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/actions/order";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CancelOrderButtonProps {
  orderId: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
}

/**
 * 주문 취소 버튼 컴포넌트
 *
 * pending 상태일 때만 표시되며, 클릭 시 확인 Dialog를 표시
 */
export function CancelOrderButton({ orderId, status }: CancelOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // pending 상태일 때만 표시
  if (status !== "pending") {
    return null;
  }

  const handleCancelOrder = async () => {
    console.group("🗑️ [CancelOrderButton] 주문 취소 시작");
    console.log(`📦 주문 ID: ${orderId}`);

    setIsLoading(true);

    try {
      const result = await cancelOrder(orderId);

      if (result.success) {
        console.log("✅ [CancelOrderButton] 주문 취소 성공");
        toast.success("주문이 취소되었습니다.");

        // Dialog 닫기
        setIsOpen(false);

        // 페이지 새로고침으로 상태 업데이트
        router.refresh();

        console.groupEnd();
      } else if (result.success === false) {
        console.error("❌ [CancelOrderButton] 주문 취소 실패:", result);
        const errorResult = result as { success: false; error: string };
        toast.error(errorResult.error || "주문 취소에 실패했습니다.");
        console.groupEnd();
      }
    } catch (error) {
      console.error("❌ [CancelOrderButton] 예외 발생:", error);
      toast.error("주문 취소 중 오류가 발생했습니다.");
      console.groupEnd();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          주문 취소
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>주문 취소</AlertDialogTitle>
          <AlertDialogDescription>
            정말로 이 주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancelOrder}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                취소 중...
              </>
            ) : (
              "주문 취소"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
