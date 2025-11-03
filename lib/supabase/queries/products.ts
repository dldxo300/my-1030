/**
 * @file lib/supabase/queries/products.ts
 * @description 상품 관련 Supabase 쿼리 함수 (클라이언트용)
 *
 * 주요 기능:
 * 1. 전체 상품 조회
 * 2. 카테고리별 상품 조회
 * 3. 인기 상품 조회 (조회수 + 판매량 복합 점수)
 *
 * @dependencies
 * - lib/supabase/client: Supabase 클라이언트 (인증 불필요한 공개 데이터용)
 * - types/product: Product, Category 타입
 */

import { supabase } from "@/lib/supabase/client";
import type { Product, Category, SortOption, PaginatedProducts } from "@/types/product";

/**
 * 모든 활성 상품 조회
 *
 * @returns {Promise<Product[]>} 활성 상품 목록
 */
export async function getAllProducts(): Promise<Product[]> {
  console.group("🔍 [getAllProducts] 상품 조회 시작");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ [getAllProducts] 에러 발생:", error);
    console.groupEnd();
    throw new Error(`상품 조회 실패: ${error.message}`);
  }

  console.log(`✅ [getAllProducts] 조회된 상품 개수: ${data?.length ?? 0}`);
  console.groupEnd();

  return (data as Product[]) ?? [];
}

/**
 * 카테고리별 상품 조회
 *
 * @param {Category} category - 조회할 카테고리
 * @returns {Promise<Product[]>} 해당 카테고리의 활성 상품 목록
 */
export async function getProductsByCategory(
  category: Category
): Promise<Product[]> {
  console.group(
    `🔍 [getProductsByCategory] 카테고리별 상품 조회 시작: ${category}`
  );

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ [getProductsByCategory] 에러 발생:", error);
    console.groupEnd();
    throw new Error(`카테고리별 상품 조회 실패: ${error.message}`);
  }

  console.log(
    `✅ [getProductsByCategory] 조회된 상품 개수: ${data?.length ?? 0}`
  );
  console.groupEnd();

  return (data as Product[]) ?? [];
}

/**
 * 인기 상품 조회 (조회수 + 판매량 복합 점수 기반)
 *
 * 복합 점수 계산 방식:
 * - 조회수 점수: 정규화된 view_count * 0.4 (가중치 40%)
 * - 판매량 점수: 정규화된 판매량 * 0.6 (가중치 60%)
 * - 판매량은 order_items 테이블에서 집계
 *
 * @param {number} limit - 반환 개수 (기본값: 6)
 * @returns {Promise<Product[]>} 인기 상품 목록 (최대 limit개)
 */
export async function getPopularProducts(
  limit: number = 6
): Promise<Product[]> {
  console.group("🔥 [getPopularProducts] 인기 상품 조회 시작");
  console.log(`📊 반환 제한: ${limit}개`);

  try {
    // 1. 모든 활성 상품 조회 (view_count 포함)
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (productsError) {
      console.error("❌ [getPopularProducts] 상품 조회 에러:", productsError);
      console.groupEnd();
      throw new Error(`상품 조회 실패: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      console.log("⚠️ [getPopularProducts] 활성 상품이 없습니다");
      console.groupEnd();
      return [];
    }

    console.log(`✅ [getPopularProducts] 조회된 상품 개수: ${products.length}`);

    // 2. 판매량 집계 (order_items에서 product_id별 quantity SUM)
    const { data: salesData, error: salesError } = await supabase
      .from("order_items")
      .select("product_id, quantity");

    if (salesError) {
      console.warn(
        "⚠️ [getPopularProducts] 판매량 조회 에러 (조회수만 사용):",
        salesError.message
      );
      // 판매량 조회 실패 시 조회수만 사용
    }

    // 3. 판매량 집계 객체 생성
    const salesMap = new Map<string, number>();
    if (salesData) {
      for (const item of salesData) {
        const productId = item.product_id;
        const quantity = item.quantity || 0;
        salesMap.set(
          productId,
          (salesMap.get(productId) || 0) + quantity
        );
      }
    }

    console.log(
      `📦 [getPopularProducts] 판매량 집계 완료 (${salesMap.size}개 상품)`
    );

    // 4. 각 상품에 판매량 추가 및 점수 계산 준비
    const productsWithSales = products.map((product) => {
      const salesCount = salesMap.get(product.id) || 0;
      return {
        ...product,
        sales_count: salesCount,
      };
    });

    // 5. 정규화를 위한 최대값 계산
    const maxViewCount = Math.max(
      ...productsWithSales.map((p) => p.view_count || 0),
      1
    );
    const maxSalesCount = Math.max(
      ...productsWithSales.map((p) => p.sales_count || 0),
      1
    );

    console.log(
      `📈 [getPopularProducts] 최대 조회수: ${maxViewCount}, 최대 판매량: ${maxSalesCount}`
    );

    // 6. 복합 점수 계산 및 정렬
    const productsWithScore = productsWithSales.map((product) => {
      const viewCount = product.view_count || 0;
      const salesCount = product.sales_count || 0;

      // 정규화된 점수 (0~1 사이)
      const normalizedViewScore = maxViewCount > 0 ? viewCount / maxViewCount : 0;
      const normalizedSalesScore =
        maxSalesCount > 0 ? salesCount / maxSalesCount : 0;

      // 가중 평균 (조회수 40%, 판매량 60%)
      const compositeScore =
        normalizedViewScore * 0.4 + normalizedSalesScore * 0.6;

      return {
        ...product,
        composite_score: compositeScore,
        view_score: normalizedViewScore,
        sales_score: normalizedSalesScore,
      };
    });

    // 7. 점수 기준 내림차순 정렬
    productsWithScore.sort((a, b) => b.composite_score - a.composite_score);

    // 8. 정확히 limit개만 반환 및 디버깅 로그
    const topProducts = productsWithScore.slice(0, Math.min(limit, productsWithScore.length));

    console.log(
      `✅ [getPopularProducts] 인기 상품 ${topProducts.length}개 반환`
    );
    console.log(
      `🏆 [getPopularProducts] 상위 상품 점수:`,
      topProducts.slice(0, 3).map((p) => ({
        name: p.name,
        score: p.composite_score.toFixed(3),
        view: p.view_count,
        sales: p.sales_count,
      }))
    );

    // 9. 추가 속성 제거하고 Product 타입으로 반환
    const finalProducts: Product[] = topProducts.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sales_count, composite_score, view_score, sales_score, ...product } = item;
      return product;
    });

    console.groupEnd();

    return finalProducts;
  } catch (error) {
    console.error("❌ [getPopularProducts] 예외 발생:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 상품 ID로 단일 상품 조회
 *
 * @param {string} id - 조회할 상품 ID
 * @returns {Promise<Product | null>} 상품 객체 또는 null (존재하지 않는 경우)
 */
export async function getProductById(id: string): Promise<Product | null> {
  console.group("🔍 [getProductById] 상품 상세 조회 시작");
  console.log(`📦 상품 ID: ${id}`);

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      // PGRST116은 "결과 없음" 에러 코드
      if (error.code === "PGRST116") {
        console.log("⚠️ [getProductById] 상품을 찾을 수 없습니다");
        console.groupEnd();
        return null;
      }

      console.error("❌ [getProductById] 에러 발생:", error);
      console.groupEnd();
      throw new Error(`상품 조회 실패: ${error.message}`);
    }

    console.log(`✅ [getProductById] 상품 조회 성공: ${data.name}`);
    console.groupEnd();

    return data as Product;
  } catch (error) {
    console.error("❌ [getProductById] 예외 발생:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 페이지네이션 및 정렬을 지원하는 통합 상품 조회 함수
 *
 * @param {Object} options - 쿼리 옵션
 * @param {Category | "all"} options.category - 카테고리 (기본값: "all")
 * @param {SortOption} options.sort - 정렬 옵션 (기본값: "latest")
 * @param {number} options.page - 페이지 번호 (1부터 시작, 기본값: 1)
 * @param {number} options.pageSize - 페이지당 상품 수 (기본값: 12)
 * @returns {Promise<PaginatedProducts>} 페이지네이션된 상품 목록
 */
export async function getProductsWithFilters(options: {
  category?: Category | "all";
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedProducts> {
  const {
    category = "all",
    sort = "latest",
    page = 1,
    pageSize = 12,
  } = options;

  console.group("🔍 [getProductsWithFilters] 상품 조회 시작");
  console.log(`📦 카테고리: ${category}`);
  console.log(`🔢 정렬: ${sort}`);
  console.log(`📄 페이지: ${page} (${pageSize}개씩)`);

  try {
    // 1. 기본 쿼리 생성
    let query = supabase.from("products").select("*", { count: "exact" });

    // 2. 활성 상품만 필터링
    query = query.eq("is_active", true);

    // 3. 카테고리 필터링
    if (category !== "all") {
      query = query.eq("category", category);
    }

    // 4. 정렬 적용
    switch (sort) {
      case "latest":
        query = query.order("created_at", { ascending: false });
        break;
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "popular":
        // 인기순은 조회수 기준 (추후 판매량 포함 가능)
        query = query.order("view_count", { ascending: false, nullsFirst: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    // 5. 페이지네이션 적용
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    // 6. 쿼리 실행
    const { data, error, count } = await query;

    if (error) {
      console.error("❌ [getProductsWithFilters] 에러 발생:", error);
      console.groupEnd();
      throw new Error(`상품 조회 실패: ${error.message}`);
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    console.log(`✅ [getProductsWithFilters] 조회 성공`);
    console.log(`📊 전체 상품 수: ${total}`);
    console.log(`📄 전체 페이지 수: ${totalPages}`);
    console.log(`📦 현재 페이지 상품 수: ${data?.length ?? 0}`);
    console.groupEnd();

    return {
      products: (data as Product[]) ?? [],
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error("❌ [getProductsWithFilters] 예외 발생:", error);
    console.groupEnd();
    throw error;
  }
}
