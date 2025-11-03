# Phase 3: 장바구니 & 주문 구현 완료 ✅

## 📅 완료 일자
2025년 11월 3일

## 🎯 구현 목표
장바구니에서 주문 생성까지의 전체 플로우 구현 (결제 연동 제외)

---

## ✅ 완료된 작업

### 1. 타입 정의
**파일**: `types/order.ts`

- `ShippingAddress`: 배송지 정보 (수령인, 연락처, 우편번호, 주소1, 주소2)
- `Order`: 주문 정보 (orders 테이블 스키마)
- `OrderItem`: 주문 상세 아이템 (order_items 테이블 스키마)
- `OrderWithItems`: 주문 + 주문 상세 아이템 목록
- `CreateOrderInput`: 주문 생성 입력
- `OrderActionResult`: 주문 작업 결과

### 2. 주문 쿼리 함수
**파일**: `lib/supabase/queries/order.ts`

#### `createOrder()`
주문 생성 트랜잭션 처리:
1. 장바구니 비어있는지 확인
2. 총 금액 계산
3. 재고 확인 (모든 상품)
4. 주문 생성 (orders 테이블)
5. 주문 상세 생성 (order_items 테이블)
6. 재고 차감 (decrement_stock RPC 함수 호출)
7. 장바구니 비우기 (cart_items 삭제)
8. 에러 발생 시 롤백

#### `getOrderById()`
- 주문 ID로 주문 조회
- order_items 포함
- 본인 주문만 조회 가능

#### `getUserOrders()`
- 사용자별 주문 목록 조회
- 최신 순 정렬

### 3. 주문 Server Actions
**파일**: `actions/order.ts`

#### `createOrder()`
- 인증 확인
- 배송지 정보 유효성 검사
  - 전화번호 형식: 숫자와 하이픈만 허용
  - 우편번호 형식: 5자리 숫자
- 장바구니 조회
- 주문 생성 (쿼리 함수 호출)
- 주문 ID 반환

#### `getOrder()` & `getUserOrders()`
- 인증 확인
- 주문 조회 및 반환

### 4. 체크아웃 컴포넌트

#### `CheckoutForm` (Client Component)
**파일**: `components/checkout/checkout-form.tsx`

- react-hook-form + Zod 유효성 검사
- 배송지 입력 필드:
  - 수령인 (필수)
  - 연락처 (필수, 전화번호 형식 검증)
  - 우편번호 (필수, 5자리 숫자)
  - 기본주소 (필수)
  - 상세주소 (선택)
  - 주문 메모 (선택, textarea)
- 로딩 상태 및 에러 메시지 표시
- 주문 성공 시 `/checkout/success`로 리다이렉트

#### `CheckoutSummary`
**파일**: `components/checkout/checkout-summary.tsx`

- 장바구니 아이템 목록 표시 (읽기 전용)
- 상품별 수량 및 금액
- 총 수량 및 총 금액 계산

### 5. 페이지 구현

#### 체크아웃 페이지
**파일**: `app/checkout/page.tsx`

- Server Component
- 인증 확인 (비로그인 시 로그인 페이지로 리다이렉트)
- 장바구니 조회
- 빈 장바구니 체크 (빈 경우 장바구니로 리다이렉트)
- 2열 레이아웃:
  - 좌측: 배송지 입력 폼
  - 우측: 주문 요약

#### 주문 완료 페이지
**파일**: `app/checkout/success/page.tsx`

- Server Component
- 쿼리 파라미터로 주문 ID 받기
- 주문 정보 조회 및 표시:
  - 주문 번호 (UUID 앞 8자리만 표시)
  - 주문 상태 (pending: 결제 대기)
  - 주문 일시
  - 주문 상품 목록 (상품명, 수량, 가격)
  - 총 결제 금액
  - 배송지 정보 (수령인, 연락처, 주소)
  - 배송 메모 (있는 경우)
- 액션 버튼:
  - 홈으로
  - 쇼핑 계속하기
- Phase 4 안내 메시지 (결제는 토스 페이먼츠 연동 후 진행)

#### 장바구니 페이지 수정
**파일**: `components/cart/cart-summary.tsx`

- "주문하기" 버튼 추가
- `/checkout`으로 이동하는 링크
- 버튼 활성화 (기존 비활성화 상태에서 변경)

### 6. Supabase 데이터베이스 함수
**파일**: `supabase/migrations/20251103000000_create_decrement_stock_function.sql`

#### `decrement_stock(product_id UUID, quantity INTEGER)`
- 재고 차감 함수
- 재고가 충분한 경우에만 차감
- 재고 부족 시 예외 발생 → 주문 롤백
- 트랜잭션 안전성 보장

**실행 방법**:
```sql
-- Supabase Dashboard > SQL Editor에서 실행
CREATE OR REPLACE FUNCTION decrement_stock(
    product_id UUID,
    quantity INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity - quantity
    WHERE id = product_id
    AND stock_quantity >= quantity;

    IF NOT FOUND THEN
        RAISE EXCEPTION '재고가 부족합니다.';
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INTEGER) TO anon, authenticated, service_role;
```

---

## 🔄 사용자 플로우

```
1. /cart (장바구니)
   - 장바구니 아이템 확인
   - 수량 조절, 아이템 삭제
   - 주문 요약 확인
   ↓ "주문하기" 버튼 클릭
   
2. /checkout (체크아웃)
   - 장바구니 정보 확인 (읽기 전용)
   - 배송지 정보 입력:
     * 수령인 (필수)
     * 연락처 (필수, 전화번호 형식 검증)
     * 우편번호 (필수, 5자리 숫자)
     * 기본주소 (필수)
     * 상세주소 (선택)
   - 주문 메모 입력 (선택)
   ↓ "주문하기" 버튼 클릭
   
3. 주문 생성 처리 (Server Action)
   - 배송지 정보 유효성 검사
   - 장바구니 재고 확인
   - 주문 생성 (orders 테이블)
   - 주문 상세 생성 (order_items 테이블)
   - 재고 차감 (products 테이블)
   - 장바구니 비우기 (cart_items 테이블)
   ↓ 성공 시
   
4. /checkout/success?orderId=xxx (주문 완료)
   - 주문 번호 표시
   - 주문 상태: 결제 대기 (pending)
   - 주문 상품 목록
   - 배송지 정보
   - 총 결제 금액
   - 안내 메시지: Phase 4에서 결제 진행 예정
```

---

## 🗂️ 파일 구조

```
types/
  └── order.ts                          # 주문 타입 정의

lib/supabase/queries/
  └── order.ts                          # 주문 쿼리 함수

actions/
  └── order.ts                          # 주문 Server Actions

components/
  ├── cart/
  │   └── cart-summary.tsx              # 장바구니 요약 (주문하기 버튼 추가)
  └── checkout/
      ├── checkout-form.tsx             # 배송지 입력 폼
      └── checkout-summary.tsx          # 체크아웃 요약

app/
  └── checkout/
      ├── page.tsx                      # 체크아웃 페이지
      └── success/
          └── page.tsx                  # 주문 완료 페이지

supabase/migrations/
  └── 20251103000000_create_decrement_stock_function.sql  # 재고 차감 함수
```

---

## 📊 데이터베이스 스키마 활용

### orders 테이블
```sql
id                UUID         PRIMARY KEY
clerk_id          TEXT         NOT NULL (Clerk User ID)
total_amount      DECIMAL      NOT NULL (총 주문 금액)
status            TEXT         NOT NULL (pending, confirmed, shipped, delivered, cancelled)
shipping_address  JSONB        (ShippingAddress 타입)
order_note        TEXT         (주문 메모)
created_at        TIMESTAMPTZ  NOT NULL
updated_at        TIMESTAMPTZ  NOT NULL
```

### order_items 테이블
```sql
id            UUID         PRIMARY KEY
order_id      UUID         NOT NULL (orders 테이블 FK)
product_id    UUID         NOT NULL (products 테이블 FK)
product_name  TEXT         NOT NULL (주문 시점 상품명 스냅샷)
quantity      INTEGER      NOT NULL (주문 수량)
price         DECIMAL      NOT NULL (주문 시점 가격 스냅샷)
created_at    TIMESTAMPTZ  NOT NULL
```

---

## 🎨 UI/UX 특징

### 폼 유효성 검사
- react-hook-form + Zod 조합
- 실시간 에러 메시지 표시
- 필수 필드 표시 (빨간색 별표)

### 로딩 상태
- 주문 처리 중 버튼 비활성화
- 로딩 스피너 표시
- "주문 처리 중..." 텍스트

### 에러 처리
- 폼 유효성 검사 에러
- 서버 에러 (재고 부족 등)
- 네트워크 에러
- 에러 메시지는 사용자 친화적으로 표시

### 반응형 디자인
- 모바일: 1열 레이아웃
- 데스크톱: 2열 레이아웃 (폼 + 요약)

---

## 🔒 보안 고려사항

1. **인증 확인**: 모든 주문 관련 작업에서 Clerk 인증 확인
2. **본인 확인**: 주문 조회 시 clerk_id로 본인 주문만 조회
3. **재고 확인**: 주문 생성 시 재고 확인 및 차감
4. **트랜잭션**: 주문 생성 실패 시 롤백 (재고, 주문 데이터)
5. **유효성 검사**: 서버 사이드에서 배송지 정보 검증

---

## ⚠️ 주의사항

### Supabase 함수 실행 필요
`decrement_stock` 함수를 Supabase Dashboard에서 수동 실행해야 합니다.

**실행 위치**: Supabase Dashboard → SQL Editor

**파일 경로**: `supabase/migrations/20251103000000_create_decrement_stock_function.sql`

### RLS 비활성화 유지
개발 환경에서는 RLS가 비활성화되어 있습니다. 프로덕션 배포 전 RLS 정책 검토 필요.

### 주문 상태
현재 모든 주문은 `pending` 상태로 생성됩니다. Phase 4에서 결제 완료 시 `confirmed`로 업데이트 예정.

---

## 🚀 다음 단계 (Phase 4)

### 결제 통합 (Toss Payments)
1. 토스 페이먼츠 SDK 설치
2. 결제 위젯 연동
3. 결제 성공/실패 콜백 처리
4. 주문 상태 업데이트 (`pending` → `confirmed`)
5. 결제 실패 시 처리 로직

### 예상 작업
- 환경 변수 추가 (토스 페이먼츠 API 키)
- 결제 페이지 또는 결제 위젯 컴포넌트
- 결제 성공 페이지 수정
- 주문 상태 업데이트 Server Action

---

## 📈 성과

✅ 장바구니에서 주문 생성까지 전체 플로우 완성
✅ 트랜잭션 안전성 확보 (재고 차감 + 주문 생성)
✅ 사용자 친화적인 UI/UX
✅ 에러 처리 및 유효성 검사 완료
✅ 타입 안전성 확보 (TypeScript + Zod)
✅ 반응형 디자인 적용

---

## 👨‍💻 개발자 노트

### 트랜잭션 처리
Supabase에서는 네이티브 트랜잭션을 지원하지 않으므로, RPC 함수(`decrement_stock`)와 에러 처리로 트랜잭션 안전성을 확보했습니다.

### 타입 안전성
모든 주문 관련 데이터는 TypeScript 타입으로 정의하여 컴파일 타임 에러 방지.

### 로깅
모든 주요 함수에 console.group/log를 추가하여 디버깅 용이성 확보. 프로덕션 배포 전 제거 또는 최소화 필요.

---

**Phase 3 완료! 🎉**

