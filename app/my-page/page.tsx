/**
 * @file app/my-page/page.tsx
 * @description 마이페이지 - 주문 목록
 *
 * 사용자의 주문 내역을 목록으로 표시하는 페이지
 * 최신순 정렬, 각 주문의 기본 정보 표시
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserOrders } from "@/actions/order";
import { OrderCard } from "@/components/orders/order-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "마이페이지",
  description: "주문 내역 조회",
};

/**
 * 마이페이지 - 주문 목록 페이지
 *
 * 로그인된 사용자의 주문 목록을 표시
 * 주문이 없을 경우 빈 상태 UI 표시
 */
export default async function MyPage() {
  console.group("📋 [MyPage] 마이페이지 렌더링 시작");

  // 1. 인증 확인
  const { userId } = await auth();

  if (!userId) {
    console.log("⚠️ [MyPage] 비로그인 사용자 - 로그인 페이지로 리다이렉트");
    console.groupEnd();
    redirect("/sign-in");
  }

  console.log(`👤 사용자 ID: ${userId}`);

  try {
    // 2. 주문 목록 조회
    const orders = await getUserOrders();

    console.log(`✅ [MyPage] 주문 목록 조회 완료 (${orders.length}개 주문)`);
    console.groupEnd();

    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              마이페이지
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              주문 내역을 확인하고 관리하세요.
            </p>
          </div>

          {/* 주문 목록 */}
          {orders.length === 0 ? (
            // 빈 상태
            <Card className="text-center py-12">
              <CardContent>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  주문 내역이 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  아직 주문한 상품이 없습니다.
                </p>
                <Link href="/products">
                  <Button>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    쇼핑 시작하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            // 주문 목록
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  주문 내역 ({orders.length}개)
                </h2>
              </div>

              <div className="grid gap-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error("❌ [MyPage] 에러 발생:", error);
    console.groupEnd();

    // 에러 발생 시 빈 상태 표시
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              마이페이지
            </h1>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <Package className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                주문 내역을 불러올 수 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                잠시 후 다시 시도해주세요.
              </p>
              <Link href="/">
                <Button variant="outline">
                  홈으로 돌아가기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }
}
