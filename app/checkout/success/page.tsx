/**
 * @file app/checkout/success/page.tsx
 * @description 주문 완료 페이지
 *
 * 주요 기능:
 * 1. 주문 번호 표시
 * 2. 주문 상세 정보 표시 (주문 내역, 배송지, 총액)
 * 3. 홈으로 이동 버튼
 *
 * @dependencies
 * - actions/order: getOrder
 * - @clerk/nextjs/server: auth
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrder } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Home, Package } from "lucide-react";

export const metadata = {
  title: "주문 완료",
  description: "주문이 완료되었습니다",
};

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  console.group("🎉 [CheckoutSuccessPage] 주문 완료 페이지 렌더링 시작");

  // 1. 인증 확인
  const { userId } = await auth();

  if (!userId) {
    console.log(
      "⚠️ [CheckoutSuccessPage] 비로그인 사용자 - 로그인 페이지로 리다이렉트"
    );
    console.groupEnd();
    redirect("/sign-in");
  }

  // 2. 쿼리 파라미터에서 주문 ID 가져오기
  const params = await searchParams;
  const orderId = params.orderId;

  if (!orderId) {
    console.warn("⚠️ [CheckoutSuccessPage] 주문 ID 없음 - 홈으로 리다이렉트");
    console.groupEnd();
    redirect("/");
  }

  console.log(`📦 주문 ID: ${orderId}`);

  try {
    // 3. 주문 정보 조회
    const order = await getOrder(orderId);

    if (!order) {
      console.warn("⚠️ [CheckoutSuccessPage] 주문을 찾을 수 없음 - 홈으로 리다이렉트");
      console.groupEnd();
      redirect("/");
    }

    console.log(
      `✅ [CheckoutSuccessPage] 주문 조회 완료 (${order.order_items.length}개 아이템)`
    );
    console.groupEnd();

    // 4. 주문 완료 페이지 렌더링
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* 성공 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              주문이 완료되었습니다!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              주문해 주셔서 감사합니다.
            </p>
          </div>

          {/* 주문 정보 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>주문 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  주문 번호
                </span>
                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                  {order.id.slice(0, 8)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  주문 상태
                </span>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-sm font-medium rounded-full">
                  결제 대기
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  주문 일시
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(order.created_at).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 주문 상품 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>주문 상품</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.order_items.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.price.toLocaleString()}원 × {item.quantity}개
                      </p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  총 결제 금액
                </span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {order.total_amount.toLocaleString()}원
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 배송지 정보 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>배송지 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  수령인
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shipping_address.recipient}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  연락처
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shipping_address.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  배송 주소
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  [{order.shipping_address.postalCode}]{" "}
                  {order.shipping_address.address1}
                  {order.shipping_address.address2 &&
                    `, ${order.shipping_address.address2}`}
                </p>
              </div>
              {order.order_note && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    배송 메모
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.order_note}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 결제는 Phase 4에서 토스 페이먼츠 연동 후 진행됩니다.
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              현재는 주문 정보만 저장되었으며, 결제 대기 상태입니다.
            </p>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-4">
            <Link href="/" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                <Home className="w-5 h-5 mr-2" />
                홈으로
              </Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button size="lg" className="w-full">
                <Package className="w-5 h-5 mr-2" />
                쇼핑 계속하기
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("❌ [CheckoutSuccessPage] 에러 발생:", error);
    console.groupEnd();

    // 에러 발생 시 홈으로 리다이렉트
    redirect("/");
  }
}

