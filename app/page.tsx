"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { CategoryFilter } from "@/components/products/category-filter";
import { ProductGrid } from "@/components/products/product-grid";
import { getAllProducts, getProductsByCategory } from "@/lib/supabase/queries/products";
import type { Product, Category } from "@/types/product";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 상품 데이터 로드
  useEffect(() => {
    async function loadProducts() {
      console.group("🏠 [HomePage] 상품 로딩 시작");
      console.log(`📦 선택된 카테고리: ${selectedCategory}`);
      
      setIsLoading(true);
      setError(null);

      try {
        let data: Product[];
        
        if (selectedCategory === "all") {
          data = await getAllProducts();
        } else {
          data = await getProductsByCategory(selectedCategory);
        }

        setProducts(data);
        console.log(`✅ [HomePage] 표시 중인 상품 개수: ${data.length}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "상품 로딩 실패";
        console.error("❌ [HomePage] 에러:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        console.groupEnd();
      }
    }

    loadProducts();
  }, [selectedCategory]);

  const handleCategoryChange = (category: Category | "all") => {
    console.log(`🔄 [HomePage] 카테고리 변경: ${selectedCategory} → ${category}`);
    setSelectedCategory(category);
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold mb-8">전체 상품</h1>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* 상품 그리드 또는 로딩/에러 상태 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              상품을 불러오는 중...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">
              오류가 발생했습니다
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {error}
            </p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </main>
  );
}
