/**
 * @file components/checkout/checkout-form.tsx
 * @description 체크아웃 배송지 입력 폼 컴포넌트
 *
 * 주요 기능:
 * 1. 배송지 정보 입력 (수령인, 연락처, 우편번호, 주소1, 주소2)
 * 2. 주문 메모 입력
 * 3. 폼 유효성 검사 (react-hook-form + Zod)
 * 4. 주문 생성 및 로딩 상태 관리
 *
 * @dependencies
 * - react-hook-form: 폼 관리
 * - zod: 유효성 검사
 * - actions/order: createOrder
 * - types/order: CreateOrderInput
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createOrder } from "@/actions/order";
import type { CreateOrderInput } from "@/types/order";

// 폼 유효성 검사 스키마
const checkoutFormSchema = z.object({
  recipient: z.string().min(1, "수령인을 입력해주세요."),
  phone: z
    .string()
    .min(1, "연락처를 입력해주세요.")
    .regex(/^[0-9-]+$/, "올바른 전화번호 형식이 아닙니다."),
  postalCode: z
    .string()
    .min(1, "우편번호를 입력해주세요.")
    .regex(/^[0-9]{5}$/, "우편번호는 5자리 숫자여야 합니다."),
  address1: z.string().min(1, "기본주소를 입력해주세요."),
  address2: z.string().optional(),
  orderNote: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    console.group("📝 [CheckoutForm] 주문 제출 시작");
    console.log("입력 데이터:", data);

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const orderInput: CreateOrderInput = {
        shippingAddress: {
          recipient: data.recipient,
          phone: data.phone,
          postalCode: data.postalCode,
          address1: data.address1,
          address2: data.address2,
        },
        orderNote: data.orderNote,
      };

      const result = await createOrder(orderInput);

      if (result.success) {
        console.log("✅ [CheckoutForm] 주문 생성 성공:", result.orderId);
        console.groupEnd();
        // 주문 완료 페이지로 이동
        router.push(`/checkout/success?orderId=${result.orderId}`);
      } else {
        console.error("❌ [CheckoutForm] 주문 생성 실패:", result.error);
        console.groupEnd();
        setErrorMessage(result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("❌ [CheckoutForm] 예외 발생:", error);
      console.groupEnd();
      setErrorMessage("주문 처리 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>배송지 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 수령인 */}
          <div className="space-y-2">
            <Label htmlFor="recipient">
              수령인 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="recipient"
              placeholder="홍길동"
              {...register("recipient")}
              disabled={isSubmitting}
            />
            {errors.recipient && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.recipient.message}
              </p>
            )}
          </div>

          {/* 연락처 */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              연락처 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="010-1234-5678"
              {...register("phone")}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* 우편번호 */}
          <div className="space-y-2">
            <Label htmlFor="postalCode">
              우편번호 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postalCode"
              placeholder="12345"
              maxLength={5}
              {...register("postalCode")}
              disabled={isSubmitting}
            />
            {errors.postalCode && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          {/* 기본주소 */}
          <div className="space-y-2">
            <Label htmlFor="address1">
              기본주소 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address1"
              placeholder="서울시 강남구 테헤란로 123"
              {...register("address1")}
              disabled={isSubmitting}
            />
            {errors.address1 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.address1.message}
              </p>
            )}
          </div>

          {/* 상세주소 */}
          <div className="space-y-2">
            <Label htmlFor="address2">상세주소</Label>
            <Input
              id="address2"
              placeholder="101동 202호"
              {...register("address2")}
              disabled={isSubmitting}
            />
          </div>

          {/* 주문 메모 */}
          <div className="space-y-2">
            <Label htmlFor="orderNote">주문 메모</Label>
            <Textarea
              id="orderNote"
              placeholder="배송 시 요청사항을 입력해주세요."
              rows={3}
              {...register("orderNote")}
              disabled={isSubmitting}
            />
          </div>

          {/* 에러 메시지 */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            </div>
          )}

          {/* 주문하기 버튼 */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                주문 처리 중...
              </>
            ) : (
              "주문하기"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

