/**
 * @file hooks/use-cart-count.ts
 * @description 장바구니 아이템 개수 조회 훅
 *
 * 주요 기능:
 * 1. 현재 사용자의 장바구니 아이템 총 개수 조회
 * 2. 실시간 업데이트 지원 (refetch 함수 제공)
 *
 * @dependencies
 * - lib/supabase/clerk-client: useClerkSupabaseClient
 * - @clerk/nextjs: useAuth
 * - lib/supabase/queries/cart: getCartItemCount
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { getCartItemCount } from "@/lib/supabase/queries/cart";

/**
 * 장바구니 아이템 개수 조회 훅
 *
 * @returns {{ count: number, refetch: () => Promise<void>, isLoading: boolean }}
 */
export function useCartCount() {
  const { userId } = useAuth();
  const supabase = useClerkSupabaseClient();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    console.group("🔢 [useCartCount] 장바구니 개수 조회 시작");
    
    if (!userId) {
      console.log("⚠️ [useCartCount] 비로그인 사용자");
      setCount(0);
      setIsLoading(false);
      console.groupEnd();
      return;
    }

    console.log(`👤 사용자 ID: ${userId}`);

    try {
      setIsLoading(true);
      const total = await getCartItemCount(supabase, userId);
      setCount(total);
      console.log(`✅ [useCartCount] 조회 성공 (${total}개)`);
    } catch (error) {
      console.error("❌ [useCartCount] 장바구니 개수 조회 실패:", error);
      setCount(0);
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return {
    count,
    refetch: fetchCount,
    isLoading,
  };
}

