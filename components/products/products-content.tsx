/**
 * @file components/products/products-content.tsx
 * @description 상품 목록 페이지 컨텐츠 (Suspense 내부)
 *
 * 주요 기능:
 * 1. 카테고리별 필터링
 * 2. 정렬 옵션 (최신순, 가격순, 인기순)
 * 3. 페이지네이션 (12개씩)
 * 4. URL 쿼리 파라미터를 통한 상태 관리
 *
 * @dependencies
 * - lib/supabase/queries/products: getProductsWithFilters
 * - components/products: CategoryFilter, SortSelector, ProductGrid, Pagination
 * - types/product: Category, SortOption
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CategoryFilter } from "@/components/products/category-filter";
import { SortSelector } from "@/components/products/sort-selector";
import { ProductGrid } from "@/components/products/product-grid";
import { Pagination } from "@/components/products/pagination";
import { getProductsWithFilters } from "@/lib/supabase/queries/products";
import type { Category, SortOption, Product } from "@/types/product";

export function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 쿼리 파라미터에서 초기값 가져오기
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    (searchParams.get("category") as Category | "all") || "all"
  );
  const [selectedSort, setSelectedSort] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "latest"
  );
  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get("page")) || 1
  );

  // 상품 데이터 상태
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL 업데이트 함수
  const updateURL = (category: Category | "all", sort: SortOption, page: number) => {
    console.log("🔗 [ProductsContent] URL 업데이트:", { category, sort, page });

    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (sort !== "latest") params.set("sort", sort);
    if (page !== 1) params.set("page", page.toString());

    const queryString = params.toString();
    const newURL = queryString ? `/products?${queryString}` : "/products";
    router.push(newURL, { scroll: false });
  };

  // 상품 데이터 로드
  useEffect(() => {
    async function loadProducts() {
      console.group("🛍️ [ProductsContent] 상품 목록 로딩 시작");
      console.log(`📦 카테고리: ${selectedCategory}`);
      console.log(`🔢 정렬: ${selectedSort}`);
      console.log(`📄 페이지: ${currentPage}`);

      setIsLoading(true);
      setError(null);

      try {
        const result = await getProductsWithFilters({
          category: selectedCategory,
          sort: selectedSort,
          page: currentPage,
          pageSize: 12,
        });

        setProducts(result.products);
        setTotal(result.total);
        setTotalPages(result.totalPages);

        console.log(`✅ [ProductsContent] 로딩 성공`);
        console.log(`📊 전체 상품: ${result.total}개`);
        console.log(`📄 현재 페이지 상품: ${result.products.length}개`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "상품 로딩 실패";
        console.error("❌ [ProductsContent] 에러:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        console.groupEnd();
      }
    }

    loadProducts();
  }, [selectedCategory, selectedSort, currentPage]);

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: Category | "all") => {
    console.log(`🔄 [ProductsContent] 카테고리 변경: ${selectedCategory} → ${category}`);
    setSelectedCategory(category);
    setCurrentPage(1); // 카테고리 변경 시 1페이지로 리셋
    updateURL(category, selectedSort, 1);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (sort: SortOption) => {
    console.log(`🔄 [ProductsContent] 정렬 변경: ${selectedSort} → ${sort}`);
    setSelectedSort(sort);
    setCurrentPage(1); // 정렬 변경 시 1페이지로 리셋
    updateURL(selectedCategory, sort, 1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    console.log(`🔄 [ProductsContent] 페이지 변경: ${currentPage} → ${page}`);
    setCurrentPage(page);
    updateURL(selectedCategory, selectedSort, page);
    // 페이지 변경 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">상품 목록</h1>
          {!isLoading && (
            <p className="text-gray-600 dark:text-gray-400">
              전체 {total.toLocaleString()}개의 상품
            </p>
          )}
        </div>

        {/* 필터 및 정렬 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          {/* 카테고리 필터 */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {/* 정렬 선택기 */}
          <SortSelector
            selectedSort={selectedSort}
            onSortChange={handleSortChange}
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
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : (
          <>
            {/* 상품 그리드 */}
            <ProductGrid products={products} />

            {/* 페이지네이션 */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </main>
  );
}

