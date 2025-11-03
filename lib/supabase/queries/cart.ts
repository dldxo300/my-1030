/**
 * @file lib/supabase/queries/cart.ts
 * @description 장바구니 관련 Supabase 쿼리 함수 (클라이언트 컴포넌트용)
 *
 * 주요 기능:
 * 1. 장바구니 아이템 조회 (상품 정보 포함)
 * 2. 장바구니 개수 조회
 *
 * @dependencies
 * - lib/supabase/clerk-client: useClerkSupabaseClient (Client Component용)
 * - types/cart: CartItemWithProduct
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItemWithProduct } from "@/types/cart";

/**
 * 장바구니 아이템 조회 (상품 정보 포함)
 * Client Component에서 사용
 *
 * @param {SupabaseClient} supabase - Supabase 클라이언트
 * @param {string} clerkId - 사용자 Clerk ID
 * @returns {Promise<CartItemWithProduct[]>} 장바구니 아이템 목록
 */
export async function getCartItemsWithProducts(
  supabase: SupabaseClient,
  clerkId: string
): Promise<CartItemWithProduct[]> {
  console.group("📋 [getCartItemsWithProducts] 장바구니 조회 시작");
  console.log(`👤 사용자 ID: ${clerkId}`);

  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        clerk_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        product:products (
          id,
          name,
          description,
          price,
          category,
          stock_quantity,
          is_active,
          view_count,
          created_at,
          updated_at
        )
      `
      )
      .eq("clerk_id", clerkId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ [getCartItemsWithProducts] 조회 실패:", error);
      console.groupEnd();
      throw new Error(`장바구니 조회 실패: ${error.message}`);
    }

    // 타입 변환
    const cartItems: CartItemWithProduct[] = (data || []).map((item: any) => ({
      id: item.id,
      clerk_id: item.clerk_id,
      product_id: item.product_id,
      quantity: item.quantity,
      created_at: item.created_at,
      updated_at: item.updated_at,
      product: item.product,
    }));

    console.log(`✅ [getCartItemsWithProducts] 조회 성공 (${cartItems.length}개)`);
    console.groupEnd();

    return cartItems;
  } catch (error) {
    console.error("❌ [getCartItemsWithProducts] 예외 발생:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 장바구니 아이템 개수 조회 (배지 표시용)
 * Client Component에서 사용
 *
 * @param {SupabaseClient} supabase - Supabase 클라이언트
 * @param {string} clerkId - 사용자 Clerk ID
 * @returns {Promise<number>} 장바구니에 담긴 상품 종류 수
 */
export async function getCartItemCount(
  supabase: SupabaseClient,
  clerkId: string
): Promise<number> {
  console.group("🔢 [getCartItemCount] 장바구니 상품 종류 수 조회 시작");
  console.log(`👤 사용자 ID: ${clerkId}`);

  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select("id")
      .eq("clerk_id", clerkId);

    if (error) {
      console.error("❌ [getCartItemCount] 조회 실패:", error);
      console.groupEnd();
      throw new Error(`장바구니 개수 조회 실패: ${error.message}`);
    }

    // 장바구니 항목(상품 종류) 개수
    const totalCount = (data || []).length;

    console.log(`✅ [getCartItemCount] 총 ${totalCount}종류의 상품`);
    console.groupEnd();

    return totalCount;
  } catch (error) {
    console.error("❌ [getCartItemCount] 예외 발생:", error);
    console.groupEnd();
    return 0; // 에러 시 0 반환
  }
}

