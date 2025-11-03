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

import { useEffect, useState } from "react";
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

  const fetchCount = async () => {
    if (!userId) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const total = await getCartItemCount(supabase, userId);
      setCount(total);
    } catch (error) {
      console.error("장바구니 개수 조회 실패:", error);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [userId]);

  return {
    count,
    refetch: fetchCount,
    isLoading,
  };
}

