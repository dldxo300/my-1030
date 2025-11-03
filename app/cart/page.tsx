/**
 * @file app/cart/page.tsx
 * @description 장바구니 페이지
 *
 * 주요 기능:
 * 1. 현재 사용자의 장바구니 조회
 * 2. 장바구니 아이템 목록 표시
 * 3. 빈 장바구니 UI
 * 4. 장바구니 요약 (총 개수, 총액)
 *
 * @dependencies
 * - actions/cart: getCartItems
 * - components/cart/cart-item: CartItem
 * - components/cart/cart-summary: CartSummary
 * - @clerk/nextjs/server: auth
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCartItems } from "@/actions/cart";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { CartClientWrapper } from "@/components/cart/cart-client-wrapper";

export const metadata = {
  title: "장바구니",
  description: "내 장바구니",
};

export default async function CartPage() {
  console.group("🛒 [CartPage] 장바구니 페이지 렌더링 시작");

  // 1. 인증 확인
  const { userId } = await auth();

  if (!userId) {
    console.log("⚠️ [CartPage] 비로그인 사용자 - 로그인 페이지로 리다이렉트");
    console.groupEnd();
    redirect("/sign-in");
  }

  console.log(`👤 사용자 ID: ${userId}`);

  try {
    // 2. 장바구니 조회
    const cartItems = await getCartItems();

    console.log(`✅ [CartPage] 장바구니 조회 성공 (${cartItems.length}개 아이템)`);
    console.groupEnd();

    // 3. 빈 장바구니 UI
    if (cartItems.length === 0) {
      return (
        <main className="min-h-screen px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              장바구니
            </h1>

            {/* 빈 장바구니 상태 */}
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                장바구니가 비어있습니다
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                쇼핑을 시작하고 상품을 장바구니에 담아보세요!
              </p>
              <Link href="/products">
                <Button size="lg">
                  <Package className="w-5 h-5 mr-2" />
                  상품 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </main>
      );
    }

    // 4. 장바구니 아이템 목록
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            장바구니
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 좌측: 장바구니 아이템 목록 */}
            <div className="lg:col-span-2 space-y-4">
              <CartClientWrapper initialItems={cartItems} />
            </div>

            {/* 우측: 주문 요약 */}
            <div className="lg:col-span-1">
              <CartSummary items={cartItems} />
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("❌ [CartPage] 에러 발생:", error);
    console.groupEnd();

    // 에러 발생 시 에러 페이지
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <ShoppingCart className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
              장바구니를 불러올 수 없습니다
            </h2>
            <p className="text-red-700 dark:text-red-400 mb-4">
              잠시 후 다시 시도해주세요.
            </p>
            <Link href="/products">
              <Button variant="outline">상품 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }
}

