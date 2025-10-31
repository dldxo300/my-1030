/**
 * @file components/products/product-grid.tsx
 * @description 상품 목록을 그리드 레이아웃으로 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 반응형 그리드 레이아웃 (모바일 1열, 태블릿 2-3열, 데스크톱 4열)
 * 2. ProductCard 컴포넌트 반복 렌더링
 * 3. 빈 상태 UI 표시
 *
 * @dependencies
 * - types/product: Product
 * - components/products/product-card: ProductCard
 */

import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";
import { Package } from "lucide-react";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  // 빈 상태 처리
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          상품이 없습니다
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          해당 카테고리에 등록된 상품이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

