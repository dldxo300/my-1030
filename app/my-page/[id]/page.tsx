/**
 * @file app/my-page/[id]/page.tsx
 * @description 주문 상세 페이지
 *
 * 특정 주문의 상세 정보를 표시하는 페이지
 * 주문 상품, 배송지 정보, 취소 기능 포함
 */

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrder } from "@/actions/order";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, MapPin, MessageSquare } from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "주문 상세",
  description: "주문 상세 정보",
};

/**
 * 주문 상세 페이지
 *
 * 주문 ID를 받아 해당 주문의 상세 정보를 표시
 * 본인 주문만 조회 가능
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  console.group("🔍 [OrderDetailPage] 주문 상세 페이지 렌더링 시작");

  // 1. 인증 확인
  const { userId } = await auth();

  if (!userId) {
    console.log("⚠️ [OrderDetailPage] 비로그인 사용자 - 로그인 페이지로 리다이렉트");
    console.groupEnd();
    redirect("/sign-in");
  }

  // 2. URL 파라미터에서 주문 ID 추출
  const { id: orderId } = await params;

  if (!orderId) {
    console.warn("⚠️ [OrderDetailPage] 주문 ID 없음 - 404");
    console.groupEnd();
    notFound();
  }

  console.log(`📦 주문 ID: ${orderId}`);
  console.log(`👤 사용자 ID: ${userId}`);

  try {
    // 3. 주문 상세 조회
    const order = await getOrder(orderId);

    if (!order) {
      console.warn("⚠️ [OrderDetailPage] 주문을 찾을 수 없음 - 404");
      console.groupEnd();
      notFound();
    }

    console.log(`✅ [OrderDetailPage] 주문 조회 완료 (${order.order_items.length}개 아이템)`);
    console.groupEnd();

    // 4. 주문 상세 페이지 렌더링
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <Link href="/my-page">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                주문 목록으로
              </Button>
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              주문 상세
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              주문 번호: {order.id.slice(0, 8)}
            </p>
          </div>

          {/* 주문 정보 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                주문 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">주문 번호</span>
                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                  {order.id.slice(0, 8)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">주문 상태</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">주문 일시</span>
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
            <CardContent className="space-y-4">
              {order.order_items.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator />}
                  <div className="flex justify-between items-start py-2">
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
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                배송지 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">수령인</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shipping_address.recipient}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">연락처</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shipping_address.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">배송 주소</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  [{order.shipping_address.postalCode}] {order.shipping_address.address1}
                  {order.shipping_address.address2 && `, ${order.shipping_address.address2}`}
                </p>
              </div>
              {order.order_note && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    배송 메모
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.order_note}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex gap-4">
            <Link href="/my-page" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                <ArrowLeft className="w-5 h-5 mr-2" />
                주문 목록으로
              </Button>
            </Link>

            <CancelOrderButton orderId={order.id} status={order.status} />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("❌ [OrderDetailPage] 에러 발생:", error);
    console.groupEnd();

    // 에러 발생 시 404 표시
    notFound();
  }
}
