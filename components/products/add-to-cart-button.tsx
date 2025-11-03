/**
 * @file components/products/add-to-cart-button.tsx
 * @description 상품 상세 페이지 장바구니 담기 버튼
 *
 * 주요 기능:
 * 1. 재고 확인 (품절 시 비활성화)
 * 2. 로그인 상태 확인 (비로그인 시 로그인 모달 유도)
 * 3. Server Action 호출하여 장바구니 추가
 * 4. 성공 시 Dialog 표시
 *
 * @dependencies
 * - actions/cart: addToCart
 * - components/products/add-to-cart-dialog: AddToCartDialog
 * - @clerk/nextjs: useAuth
 * - hooks/use-cart-count: useCartCount (장바구니 개수 업데이트)
 */

"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { addToCart } from "@/actions/cart";
import { AddToCartDialog } from "./add-to-cart-dialog";
import { useCartCount } from "@/hooks/use-cart-count";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  stockQuantity: number;
}

export function AddToCartButton({
  productId,
  productName,
  stockQuantity,
}: AddToCartButtonProps) {
  const { isSignedIn } = useAuth();
  const { refetch: refetchCartCount } = useCartCount();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddToCart = async () => {
    console.group("🛒 [AddToCartButton] 장바구니 담기 시작");

    // 1. 로그인 확인
    if (!isSignedIn) {
      console.warn("⚠️ [AddToCartButton] 비로그인 사용자");
      setErrorMessage("로그인이 필요합니다.");
      console.groupEnd();
      return;
    }

    // 2. 재고 확인
    if (stockQuantity === 0) {
      console.warn("⚠️ [AddToCartButton] 품절 상품");
      setErrorMessage("품절된 상품입니다.");
      console.groupEnd();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 3. 장바구니 추가
      const result = await addToCart(productId, 1);

      if (result.success) {
        console.log("✅ [AddToCartButton] 장바구니 추가 성공");
        
        // 4. 장바구니 개수 업데이트
        await refetchCartCount();
        
        // 5. 성공 Dialog 표시
        setDialogOpen(true);
      } else {
        console.error("❌ [AddToCartButton] 장바구니 추가 실패:", result.error);
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error("❌ [AddToCartButton] 예외 발생:", error);
      setErrorMessage("장바구니 추가 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  };

  const isOutOfStock = stockQuantity === 0;

  return (
    <div className="pt-6 space-y-3">
      <Button
        onClick={handleAddToCart}
        disabled={isLoading || isOutOfStock || !isSignedIn}
        className="w-full py-4 px-6 font-medium"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            추가 중...
          </>
        ) : isOutOfStock ? (
          "품절"
        ) : !isSignedIn ? (
          "로그인 후 구매 가능"
        ) : (
          <>
            <ShoppingCart className="w-5 h-5 mr-2" />
            장바구니 담기
          </>
        )}
      </Button>

      {/* 에러 메시지 */}
      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          {errorMessage}
        </p>
      )}

      {/* 비로그인 사용자 안내 */}
      {!isSignedIn && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          장바구니 담기는 로그인 후 이용 가능합니다.
        </p>
      )}

      {/* 성공 Dialog */}
      <AddToCartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productName={productName}
      />
    </div>
  );
}

