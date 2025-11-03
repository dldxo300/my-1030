/**
 * @file components/products/product-card.tsx
 * @description 개별 상품 정보를 표시하는 카드 컴포넌트
 *
 * 주요 기능:
 * 1. 상품 이미지 (플레이스홀더)
 * 2. 상품 이름, 가격, 카테고리 표시
 * 3. 재고 부족 시 경고 표시
 * 4. 가격 포맷팅 (천단위 구분)
 *
 * @dependencies
 * - types/product: Product, CATEGORY_LABELS
 */

import Link from "next/link";
import type { Product } from "@/types/product";
import { CATEGORY_LABELS } from "@/types/product";
import { Package } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

/**
 * 가격을 한국 원화 형식으로 포맷팅
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

export function ProductCard({ product }: ProductCardProps) {
  const isLowStock = product.stock_quantity < 10;

  return (
    <Link 
      href={`/products/${product.id}`}
      className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800 block"
    >
      {/* 상품 이미지 (플레이스홀더) */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        <Package className="w-20 h-20 text-gray-400 dark:text-gray-500" />
      </div>

      {/* 상품 정보 */}
      <div className="p-4 space-y-2">
        {/* 카테고리 */}
        {product.category && (
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {CATEGORY_LABELS[product.category]}
          </span>
        )}

        {/* 상품명 */}
        <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        {/* 설명 */}
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* 가격 */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPrice(product.price)}
          </span>

          {/* 재고 상태 */}
          {isLowStock && (
            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              재고 {product.stock_quantity}개
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

