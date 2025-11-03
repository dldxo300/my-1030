# Phase 3 주문 기능 테스트 가이드

## ✅ 사전 확인

### 1. Supabase 함수 확인
`decrement_stock` 함수가 제대로 생성되었는지 확인:

```sql
-- Supabase Dashboard > SQL Editor에서 실행
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'decrement_stock';
```

결과가 나오면 정상입니다.

### 2. 환경 변수 확인
`.env.local` 파일에 다음 변수들이 설정되어 있는지 확인:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. 개발 서버 실행
```bash
pnpm dev
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 기본 주문 생성 플로우 ✅

**목표**: 장바구니 → 체크아웃 → 주문 완료까지 정상 동작 확인

**단계**:
1. **로그인**
   - `/sign-in`에서 로그인
   - Clerk 인증 완료 확인

2. **상품 장바구니에 추가**
   - 홈페이지 또는 상품 목록에서 상품 선택
   - 상품 상세 페이지에서 "장바구니에 담기" 클릭
   - 장바구니 아이콘에 배지 표시 확인

3. **장바구니 확인**
   - `/cart` 페이지 접속
   - 장바구니 아이템 목록 표시 확인
   - 주문 요약 (총 수량, 총 금액) 확인
   - **"주문하기" 버튼 확인** ✅

4. **체크아웃 페이지**
   - "주문하기" 버튼 클릭
   - `/checkout` 페이지 접속 확인
   - 좌측: 배송지 입력 폼
   - 우측: 주문 요약 (읽기 전용)

5. **배송지 정보 입력**
   - 수령인: `홍길동`
   - 연락처: `010-1234-5678`
   - 우편번호: `12345`
   - 기본주소: `서울시 강남구 테헤란로 123`
   - 상세주소: `101동 202호` (선택)
   - 주문 메모: `문 앞에 놓아주세요` (선택)

6. **주문 생성**
   - "주문하기" 버튼 클릭
   - 로딩 상태 확인 ("주문 처리 중...")
   - 성공 시 `/checkout/success?orderId=xxx`로 리다이렉트 확인

7. **주문 완료 페이지 확인**
   - 주문 번호 표시 확인 (UUID 앞 8자리)
   - 주문 상태: "결제 대기" (pending)
   - 주문 상품 목록 확인
   - 배송지 정보 확인
   - 총 결제 금액 확인

---

### 시나리오 2: 폼 유효성 검사 ✅

**목표**: 잘못된 입력값에 대한 에러 처리 확인

**테스트 케이스**:

#### 2-1. 필수 필드 누락
- 수령인, 연락처, 우편번호, 기본주소 중 하나를 비워두고 제출
- **예상 결과**: 해당 필드에 에러 메시지 표시

#### 2-2. 잘못된 전화번호 형식
- 연락처: `abc-def-ghij` (문자 포함)
- **예상 결과**: "올바른 전화번호 형식이 아닙니다." 에러 표시

#### 2-3. 잘못된 우편번호 형식
- 우편번호: `123` (5자리 미만)
- 우편번호: `123456` (5자리 초과)
- 우편번호: `12-34` (하이픈 포함)
- **예상 결과**: "우편번호는 5자리 숫자여야 합니다." 에러 표시

---

### 시나리오 3: 재고 부족 처리 ✅

**목표**: 재고가 부족한 경우 주문 생성 실패 확인

**단계**:
1. 상품을 장바구니에 추가
2. 수량을 재고보다 많이 설정 (예: 재고 10개, 수량 15개)
3. 체크아웃 페이지에서 주문하기 시도
4. **예상 결과**: "재고가 부족합니다." 에러 메시지 표시

---

### 시나리오 4: 빈 장바구니 처리 ✅

**목표**: 장바구니가 비어있을 때 체크아웃 접근 방지

**단계**:
1. 빈 장바구니 상태에서 `/checkout` 직접 접근
2. **예상 결과**: `/cart`로 자동 리다이렉트

---

### 시나리오 5: 비로그인 사용자 처리 ✅

**목표**: 로그인하지 않은 사용자 접근 방지

**단계**:
1. 로그아웃 상태에서 `/checkout` 접근
2. **예상 결과**: `/sign-in`으로 리다이렉트

---

### 시나리오 6: 주문 완료 후 데이터 확인 ✅

**목표**: 데이터베이스에 주문 정보가 제대로 저장되었는지 확인

**Supabase Dashboard에서 확인**:

#### orders 테이블 확인
```sql
SELECT 
  id,
  clerk_id,
  total_amount,
  status,
  shipping_address,
  order_note,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 1;
```

**확인 사항**:
- ✅ 주문 ID 생성됨
- ✅ clerk_id가 현재 사용자 ID와 일치
- ✅ total_amount가 장바구니 합계와 일치
- ✅ status가 'pending'
- ✅ shipping_address JSONB에 배송지 정보 저장
- ✅ order_note에 메모 저장 (있는 경우)

#### order_items 테이블 확인
```sql
SELECT 
  oi.*,
  p.name as current_product_name,
  p.price as current_product_price
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = '<주문ID>'
ORDER BY oi.created_at;
```

**확인 사항**:
- ✅ 주문한 상품들이 모두 저장됨
- ✅ product_name이 주문 시점 상품명과 일치 (스냅샷)
- ✅ price가 주문 시점 가격과 일치 (스냅샷)
- ✅ quantity가 장바구니 수량과 일치

#### products 테이블 재고 확인
```sql
SELECT 
  id,
  name,
  stock_quantity
FROM products
WHERE id IN (
  SELECT product_id 
  FROM order_items 
  WHERE order_id = '<주문ID>'
);
```

**확인 사항**:
- ✅ 재고가 주문 수량만큼 차감됨
- ✅ 재고가 0 이상 (음수 불가)

#### cart_items 테이블 확인
```sql
SELECT * 
FROM cart_items 
WHERE clerk_id = '<현재사용자ID>';
```

**확인 사항**:
- ✅ 장바구니가 비워짐 (결과 없음)

---

### 시나리오 7: 주문 완료 페이지 직접 접근 ✅

**목표**: 잘못된 주문 ID로 접근 시 처리

**단계**:
1. `/checkout/success?orderId=invalid-id` 접근
2. **예상 결과**: 홈 페이지(`/`)로 리다이렉트

---

## 🔍 콘솔 로그 확인

개발자 도구(F12)의 콘솔에서 다음 로그들이 순서대로 출력되는지 확인:

### 주문 생성 플로우
```
🛒 [CheckoutPage] 체크아웃 페이지 렌더링 시작
👤 사용자 ID: user_xxx
✅ [CheckoutPage] 장바구니 조회 성공 (N개 아이템)

📝 [CheckoutForm] 주문 제출 시작
입력 데이터: {...}

🛒 [createOrder Action] 주문 생성 시작
📦 배송지 정보: {...}
👤 사용자 ID: user_xxx
✅ [createOrder Action] 배송지 정보 유효성 검사 통과
📦 장바구니 아이템 수: N

📝 [createOrder] 주문 생성 시작
👤 사용자 ID: user_xxx
📦 장바구니 아이템 수: N
💰 총 주문 금액: XXX원
✅ [createOrder] 재고 확인 완료
✅ [createOrder] 주문 생성 완료: order_id
✅ [createOrder] 주문 상세 생성 완료 (N개)
✅ [createOrder] 재고 차감 완료
✅ [createOrder] 장바구니 비우기 완료
🎉 [createOrder] 주문 처리 완료: order_id

🎉 [CheckoutForm] 주문 생성 성공: order_id
(리다이렉트)

🎉 [CheckoutSuccessPage] 주문 완료 페이지 렌더링 시작
📦 주문 ID: order_id
✅ [CheckoutSuccessPage] 주문 조회 완료 (N개 아이템)
```

---

## ⚠️ 주의사항

### 트랜잭션 안전성
주문 생성 중 에러가 발생하면:
- 주문(orders)이 생성되었어도 롤백됨
- 재고가 차감되었어도 롤백됨 (decrement_stock 함수가 실행되지 않음)
- 장바구니는 주문 성공 후에만 비워짐

### 주문 상태
현재 모든 주문은 `pending` 상태로 생성됩니다.
- Phase 4에서 토스 페이먼츠 결제 연동 후 `confirmed`로 변경 예정

### 재고 차감 타이밍
재고는 주문 생성 시점에 차감됩니다:
- 주문 성공 → 재고 차감
- 주문 실패 → 재고 유지 (롤백)

---

## 🐛 문제 해결

### 문제 1: "재고가 부족합니다" 에러
**원인**: `decrement_stock` 함수가 없거나 권한 없음
**해결**: Supabase Dashboard에서 함수 생성 SQL 실행

### 문제 2: 주문 생성 실패
**원인**: 데이터베이스 연결 오류 또는 권한 문제
**해결**: 
- Supabase 연결 확인
- 환경 변수 확인
- 콘솔 로그에서 정확한 에러 메시지 확인

### 문제 3: 장바구니가 비워지지 않음
**원인**: 주문 생성은 성공했지만 장바구니 비우기 실패
**해결**: 
- 콘솔 로그 확인 (장바구니 비우기 로그)
- 수동으로 Supabase에서 삭제 가능 (문제 없음)

---

## ✅ 테스트 체크리스트

- [ ] 로그인 → 장바구니 → 체크아웃 → 주문 완료 플로우 정상 동작
- [ ] 폼 유효성 검사 (필수 필드, 전화번호, 우편번호)
- [ ] 재고 부족 시 에러 처리
- [ ] 빈 장바구니 체크아웃 접근 방지
- [ ] 비로그인 사용자 접근 방지
- [ ] 주문 완료 후 데이터베이스 저장 확인 (orders, order_items)
- [ ] 재고 차감 확인 (products 테이블)
- [ ] 장바구니 비우기 확인 (cart_items 테이블)
- [ ] 주문 완료 페이지 표시 확인

---

**테스트 완료 후 Phase 4 (결제 통합)로 진행하세요!** 🚀

