-- ==========================================
-- products 테이블에 view_count 컬럼 추가
-- 조회수 기반 인기 상품 기능을 위한 마이그레이션
-- ==========================================

-- 1. products 테이블에 view_count 컬럼 추가
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL;

-- 2. 기존 데이터의 view_count를 0으로 초기화 (이미 기본값이지만 명시적으로 설정)
UPDATE public.products 
SET view_count = 0 
WHERE view_count IS NULL;

-- 3. view_count에 인덱스 추가 (인기 상품 조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_products_view_count 
ON public.products(view_count DESC);

-- 4. 기존 상품들의 view_count를 0~100 사이 랜덤 값으로 초기화 (테스트 데이터)
-- 실제 운영 시에는 이 부분을 제거하거나 주석 처리하세요
UPDATE public.products 
SET view_count = FLOOR(RANDOM() * 100)::INTEGER;

