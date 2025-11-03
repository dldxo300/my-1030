/**
 * @file components/cart/cart-item.tsx
 * @description 장바구니 아이템 컴포넌트
 *
 * 주요 기능:
 * 1. 상품 정보 표시 (이름, 가격, 카테고리)
 * 2. 수량 조절 UI (감소/증가 버튼, 직접 입력)
 * 3. 재고 확인 및 경고 표시
 * 4. 아이템 삭제 기능
 * 5. 아이템별 총액 계산
 *
 * @dependencies
 * - actions/cart: updateCartQuantity, removeFromCart
 * - types/cart: CartItemWithProduct
 * - types/product: CATEGORY_LABELS
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, X, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCartQuantity, removeFromCart } from "@/actions/cart";
import type { CartItemWithProduct } from "@/types/cart";
import { CATEGORY_LABELS } from "@/types/product";

interface CartItemProps {
  item: CartItemWithProduct;
  onUpdate: () => void;
}

export function CartItem({ item, onUpdate }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { product, quantity } = item;
  const itemTotal = product.price * quantity;
  const isLowStock = product.stock_quantity < 10 && product.stock_quantity > 0;
  const isOutOfStock = product.stock_quantity === 0;

  /**
   * 가격 포맷팅
   */
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  /**
   * 수량 변경 처리
   */
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock_quantity) {
      setErrorMessage(`재고가 부족합니다. (최대: ${product.stock_quantity}개)`);
      return;
    }

    console.group("🔢 [CartItem] 수량 변경");
    console.log(`${quantity} → ${newQuantity}`);

    setIsUpdating(true);
    setErrorMessage(null);

    try {
      const result = await updateCartQuantity(item.id, newQuantity);

      if (result.success) {
        console.log("✅ [CartItem] 수량 변경 성공");
        onUpdate();
      } else {
        console.error("❌ [CartItem] 수량 변경 실패:", result.error);
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error("❌ [CartItem] 예외 발생:", error);
      setErrorMessage("수량 변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
      console.groupEnd();
    }
  };

  /**
   * 아이템 삭제 처리
   */
  const handleRemove = async () => {
    console.group("🗑️ [CartItem] 아이템 삭제");
    console.log(`상품: ${product.name}`);

    setIsRemoving(true);
    setErrorMessage(null);

    try {
      const result = await removeFromCart(item.id);

      if (result.success) {
        console.log("✅ [CartItem] 삭제 성공");
        onUpdate();
      } else {
        console.error("❌ [CartItem] 삭제 실패:", result.error);
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error("❌ [CartItem] 예외 발생:", error);
      setErrorMessage("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsRemoving(false);
      console.groupEnd();
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* 상품 이미지 (플레이스홀더) */}
      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
        <Package className="w-12 h-12 text-gray-400 dark:text-gray-600" />
      </div>

      {/* 상품 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          {/* 상품명 & 카테고리 */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${product.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
            >
              {product.name}
            </Link>
            {product.category && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                {CATEGORY_LABELS[product.category]}
              </span>
            )}
          </div>

          {/* 삭제 버튼 */}
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
            aria-label="삭제"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 가격 & 수량 조절 */}
        <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
          {/* 단가 */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            단가: <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
          </div>

          {/* 수량 조절 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <input
              type="number"
              min="1"
              max={product.stock_quantity}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) handleQuantityChange(val);
              }}
              disabled={isUpdating}
              className="w-16 h-8 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating || quantity >= product.stock_quantity}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* 아이템 총액 */}
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(itemTotal)}
          </div>
        </div>

        {/* 재고 경고 */}
        {isOutOfStock && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>품절된 상품입니다.</span>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-4 h-4" />
            <span>재고가 {product.stock_quantity}개 남았습니다.</span>
          </div>
        )}

        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

