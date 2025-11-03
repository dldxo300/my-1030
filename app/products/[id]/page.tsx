/**
 * @file app/products/[id]/page.tsx
 * @description 상품 상세 페이지
 *
 * 주요 기능:
 * 1. 상품 ID로 단일 상품 조회
 * 2. 상단 섹션: 상품 이름, 가격, 재고 상태 표시
 * 3. 존재하지 않는 상품 처리 (404)
 * 4. 에러 처리
 *
 * @dependencies
 * - lib/supabase/queries/products: getProductById
 * - types/product: Product, CATEGORY_LABELS
 */

import { notFound } from "next/navigation";
import { Package, AlertCircle } from "lucide-react";
import { getProductById } from "@/lib/supabase/queries/products";
import { CATEGORY_LABELS } from "@/types/product";
import type { Product } from "@/types/product";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
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

/**
 * 재고 상태 뱃지 컴포넌트
 */
function StockStatusBadge({ stockQuantity }: { stockQuantity: number }) {
  if (stockQuantity === 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
        <AlertCircle className="w-4 h-4" />
        품절
      </div>
    );
  }

  if (stockQuantity < 10) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium">
        <AlertCircle className="w-4 h-4" />
        재고 부족 ({stockQuantity}개 남음)
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
      재고 있음 ({stockQuantity}개)
    </div>
  );
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  console.group("🛍️ [ProductDetailPage] 상품 상세 페이지 렌더링 시작");

  // Next.js 15에서 params는 Promise
  const { id } = await params;
  console.log(`📦 상품 ID: ${id}`);

  try {
    // 상품 데이터 조회
    const product = await getProductById(id);

    // 상품이 존재하지 않으면 404 페이지로 이동
    if (!product) {
      console.log("⚠️ [ProductDetailPage] 상품을 찾을 수 없습니다 - 404로 이동");
      console.groupEnd();
      notFound();
    }

    console.log(`✅ [ProductDetailPage] 상품 로딩 성공: ${product.name}`);
    
    // 중단 섹션 데이터 로깅
    console.group("📋 [ProductDetailPage] 중단 섹션 데이터 확인");
    console.log(`📝 상품 설명 존재 여부: ${product.description ? '있음' : '없음'}`);
    if (product.description) {
      console.log(`📝 상품 설명 길이: ${product.description.length}자`);
    }
    console.log(`🏷️ 카테고리: ${product.category ? CATEGORY_LABELS[product.category] : '미지정'}`);
    console.groupEnd();
    
    console.groupEnd();

    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 좌측: 상품 이미지 (플레이스홀더) */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Package className="w-32 h-32 text-gray-400 dark:text-gray-600" />
            </div>

            {/* 우측: 상품 정보 (상단 섹션) */}
            <div className="space-y-6">
              {/* 카테고리 */}
              {product.category && (
                <div>
                  <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-md">
                    {CATEGORY_LABELS[product.category]}
                  </span>
                </div>
              )}

              {/* 상품 이름 */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {product.name}
              </h1>

              {/* 가격 */}
              <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    판매가
                  </span>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              {/* 재고 상태 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    재고 상태
                  </span>
                </div>
                <StockStatusBadge stockQuantity={product.stock_quantity} />
              </div>

              {/* 장바구니 추가 버튼 영역 (Phase 3에서 구현) */}
              <div className="pt-6">
                <button
                  disabled
                  className="w-full py-4 px-6 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg font-medium cursor-not-allowed"
                >
                  장바구니 추가 (준비 중)
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  * Phase 3에서 장바구니 기능이 추가될 예정입니다
                </p>
              </div>
            </div>
          </div>

          {/* 중단 섹션: 상품 설명 및 카테고리 정보 */}
          <div className="mt-12 space-y-8">
            {/* 상품 설명 섹션 */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                상품 설명
              </h2>
              {product.description ? (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {product.description}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    상품 설명이 등록되지 않았습니다.
                  </p>
                </div>
              )}
            </section>

            {/* 카테고리 정보 섹션 */}
            {product.category && (
              <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  상품 정보
                </h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <dl className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        카테고리
                      </dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                        {CATEGORY_LABELS[product.category]}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("❌ [ProductDetailPage] 에러 발생:", error);
    console.groupEnd();

    // 에러 발생 시 에러 페이지 표시
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
              상품을 불러올 수 없습니다
            </h2>
            <p className="text-red-700 dark:text-red-400 mb-4">
              {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}
            </p>
            <a
              href="/products"
              className="inline-block px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              상품 목록으로 돌아가기
            </a>
          </div>
        </div>
      </main>
    );
  }
}

