/**
 * @file components/cart/cart-client-wrapper.tsx
 * @description 장바구니 아이템 목록 클라이언트 래퍼
 *
 * Server Component에서 전달받은 초기 데이터를 사용하고,
 * 업데이트 시 페이지 리프레시를 통해 최신 데이터를 가져옵니다.
 *
 * @dependencies
 * - components/cart/cart-item: CartItem
 * - types/cart: CartItemWithProduct
 * - next/navigation: useRouter
 */

"use client";

import { useRouter } from "next/navigation";
import { CartItem } from "./cart-item";
import type { CartItemWithProduct } from "@/types/cart";

interface CartClientWrapperProps {
  initialItems: CartItemWithProduct[];
}

export function CartClientWrapper({ initialItems }: CartClientWrapperProps) {
  const router = useRouter();

  const handleUpdate = () => {
    console.log("🔄 [CartClientWrapper] 장바구니 업데이트 - 페이지 리프레시");
    router.refresh();
  };

  return (
    <>
      {initialItems.map((item) => (
        <CartItem key={item.id} item={item} onUpdate={handleUpdate} />
      ))}
    </>
  );
}

