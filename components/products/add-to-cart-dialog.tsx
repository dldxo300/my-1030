/**
 * @file components/products/add-to-cart-dialog.tsx
 * @description 장바구니 담기 후 선택 Dialog
 *
 * 주요 기능:
 * 1. 장바구니 추가 성공 메시지 표시
 * 2. 장바구니로 이동 또는 계속 쇼핑하기 선택
 *
 * @dependencies
 * - components/ui/dialog: shadcn Dialog 컴포넌트
 * - next/navigation: useRouter (페이지 이동)
 */

"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ShoppingBag } from "lucide-react";

interface AddToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
}

export function AddToCartDialog({
  open,
  onOpenChange,
  productName,
}: AddToCartDialogProps) {
  const router = useRouter();

  const handleGoToCart = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  const handleContinueShopping = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            장바구니에 추가되었습니다
          </DialogTitle>
          <DialogDescription className="pt-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {productName}
            </span>
            이(가) 장바구니에 추가되었습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleContinueShopping}
            className="w-full sm:w-auto"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            계속 쇼핑하기
          </Button>
          <Button onClick={handleGoToCart} className="w-full sm:w-auto">
            <ShoppingCart className="w-4 h-4 mr-2" />
            장바구니로 이동
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

