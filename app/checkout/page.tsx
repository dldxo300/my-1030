/**
 * @file app/checkout/page.tsx
 * @description 체크아웃 페이지
 *
 * 주요 기능:
 * 1. 장바구니 정보 조회
 * 2. 배송지 입력 폼 표시
 * 3. 주문 요약 정보 표시
 *
 * @dependencies
 * - actions/cart: getCartItems
 * - components/checkout/checkout-form: CheckoutForm
 * - components/checkout/checkout-summary: CheckoutSummary
 * - @clerk/nextjs/server: auth
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCartItems } from "@/actions/cart";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";

export const metadata = {
  title: "주문/결제",
  description: "주문 정보 입력 및 결제",
};

export default async function CheckoutPage() {
  console.group("🛒 [CheckoutPage] 체크아웃 페이지 렌더링 시작");

  // 1. 인증 확인
  const { userId } = await auth();

  if (!userId) {
    console.log("⚠️ [CheckoutPage] 비로그인 사용자 - 로그인 페이지로 리다이렉트");
    console.groupEnd();
    redirect("/sign-in");
  }

  console.log(`👤 사용자 ID: ${userId}`);

  try {
    // 2. 장바구니 조회
    const cartItems = await getCartItems();

    console.log(`✅ [CheckoutPage] 장바구니 조회 성공 (${cartItems.length}개 아이템)`);

    // 3. 빈 장바구니 체크
    if (cartItems.length === 0) {
      console.log("⚠️ [CheckoutPage] 장바구니가 비어있음 - 장바구니로 리다이렉트");
      console.groupEnd();
      redirect("/cart");
    }

    console.groupEnd();

    // 4. 체크아웃 페이지 렌더링
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            주문/결제
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 좌측: 배송지 입력 폼 */}
            <div className="lg:col-span-2">
              <CheckoutForm />
            </div>

            {/* 우측: 주문 요약 */}
            <div className="lg:col-span-1">
              <CheckoutSummary items={cartItems} />
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("❌ [CheckoutPage] 에러 발생:", error);
    console.groupEnd();

    // 에러 발생 시 장바구니로 리다이렉트
    redirect("/cart");
  }
}

