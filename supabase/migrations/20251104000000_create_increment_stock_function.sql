-- ==========================================
-- 재고 증가 함수 생성
-- 파일명: 20251104000000_create_increment_stock_function.sql
-- ==========================================

-- 재고 증가 함수 (주문 취소 시 사용)
CREATE OR REPLACE FUNCTION increment_stock(
    product_id UUID,
    quantity INTEGER
) RETURNS VOID AS $$
BEGIN
    -- 재고 증가
    UPDATE products
    SET stock_quantity = stock_quantity + quantity
    WHERE id = product_id;

    -- 업데이트된 행이 없으면 에러
    IF NOT FOUND THEN
        RAISE EXCEPTION '상품을 찾을 수 없습니다.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 함수 권한 부여
GRANT EXECUTE ON FUNCTION increment_stock(UUID, INTEGER) TO anon, authenticated, service_role;
