/**
 * @file types/product.ts
 * @description 상품 관련 TypeScript 타입 정의
 */

/**
 * 상품 카테고리 타입
 */
export type Category =
  | "electronics"
  | "clothing"
  | "books"
  | "food"
  | "sports"
  | "beauty"
  | "home";

/**
 * 상품 인터페이스
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: Category | null;
  stock_quantity: number;
  is_active: boolean;
  view_count?: number;
  created_at: string;
  updated_at: string;
}

/**
 * 카테고리 한글 표시명 매핑
 */
export const CATEGORY_LABELS: Record<Category, string> = {
  electronics: "전자제품",
  clothing: "의류",
  books: "도서",
  food: "식품",
  sports: "스포츠",
  beauty: "뷰티",
  home: "생활/가정",
};

