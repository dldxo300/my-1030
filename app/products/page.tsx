/**
 * @file app/products/page.tsx
 * @description 상품 목록 페이지 (Suspense 경계)
 *
 * Suspense로 ProductsContent를 감싸서 useSearchParams() 사용을 허용합니다.
 */

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ProductsContent } from "@/components/products/products-content";

export const metadata = {
  title: "상품 목록",
  description: "다양한 상품을 둘러보세요",
};

function ProductsLoadingFallback() {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            상품 목록을 불러오는 중...
          </span>
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoadingFallback />}>
      <ProductsContent />
    </Suspense>
  );
}
