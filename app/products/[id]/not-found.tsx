/**
 * @file app/products/[id]/not-found.tsx
 * @description 상품을 찾을 수 없을 때 표시되는 404 페이지
 */

import { PackageX } from "lucide-react";
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12">
          <PackageX className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            상품을 찾을 수 없습니다
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            요청하신 상품이 존재하지 않거나 판매가 중단되었습니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              상품 목록 보기
            </Link>
            
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              홈으로 가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

