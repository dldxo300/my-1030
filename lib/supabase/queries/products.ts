/**
 * @file lib/supabase/queries/products.ts
 * @description 상품 관련 Supabase 쿼리 함수 (클라이언트용)
 *
 * 주요 기능:
 * 1. 전체 상품 조회
 * 2. 카테고리별 상품 조회
 *
 * @dependencies
 * - lib/supabase/client: Supabase 클라이언트 (인증 불필요한 공개 데이터용)
 * - types/product: Product, Category 타입
 */

import { supabase } from "@/lib/supabase/client";
import type { Product, Category } from "@/types/product";

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

