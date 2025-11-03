-- ==========================================
-- 재고 차감 함수 생성
-- 파일명: 20251103000000_create_decrement_stock_function.sql
-- ==========================================

-- 재고 차감 함수
CREATE OR REPLACE FUNCTION decrement_stock(
    product_id UUID,
    quantity INTEGER
) RETURNS VOID AS $$
BEGIN
    -- 재고 차감
    UPDATE products
    SET stock_quantity = stock_quantity - quantity
    WHERE id = product_id
    AND stock_quantity >= quantity;

    -- 업데이트된 행이 없으면 에러
    IF NOT FOUND THEN
        RAISE EXCEPTION '재고가 부족합니다.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 함수 권한 부여
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INTEGER) TO anon, authenticated, service_role;

