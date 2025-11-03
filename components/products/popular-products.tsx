/**
 * @file components/products/popular-products.tsx
 * @description 인기 상품 섹션 컴포넌트
 *
 * 주요 기능:
 * 1. 인기 상품 목록을 받아 표시
 * 2. "인기 상품" 제목 포함
 * 3. ProductGrid를 활용한 그리드 레이아웃
 * 4. 로딩 및 에러 상태 처리
 *
 * @dependencies
 * - types/product: Product
 * - components/products/product-grid: ProductGrid
 */

"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductGrid } from "./product-grid";
import { getPopularProducts } from "@/lib/supabase/queries/products";

interface PopularProductsProps {
  /**
   * 최대 표시할 인기 상품 개수 (기본값: 6)
   */
  limit?: number;
}

export function PopularProducts({ limit = 6 }: PopularProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPopularProducts() {
      console.group("🔥 [PopularProducts] 인기 상품 로딩 시작");
      console.log(`📊 표시 제한: ${limit}개`);
      
      setIsLoading(true);
      setError(null);

      try {
        const data = await getPopularProducts(limit);
        setProducts(data);
        console.log(`✅ [PopularProducts] 로딩 완료: ${data.length}개`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "인기 상품 로딩 실패";
        console.error("❌ [PopularProducts] 에러:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        console.groupEnd();
      }
    }

    loadPopularProducts();
  }, [limit]);

  // 로딩 상태
  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">인기 상품</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            인기 상품을 불러오는 중...
          </span>
        </div>
      </section>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">인기 상품</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">
            인기 상품을 불러오는데 실패했습니다
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error}
          </p>
        </div>
      </section>
    );
  }

  // 상품이 없을 때
  if (products.length === 0) {
    return null; // 빈 상태는 표시하지 않음
  }

  // 정상 상태
  return (
    <section className="space-y-6">
      {/* 섹션 제목 */}
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold">인기 상품</h2>
      </div>

      {/* 인기 상품 그리드 */}
      <ProductGrid products={products} />
    </section>
  );
}

