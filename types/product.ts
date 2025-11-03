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

/**
 * 정렬 옵션 타입
 */
export type SortOption =
  | "latest" // 최신순
  | "price_asc" // 가격 낮은순
  | "price_desc" // 가격 높은순
  | "popular"; // 인기순

/**
 * 정렬 옵션 한글 표시명 매핑
 */
export const SORT_LABELS: Record<SortOption, string> = {
  latest: "최신순",
  price_asc: "가격 낮은순",
  price_desc: "가격 높은순",
  popular: "인기순",
};

/**
 * 페이지네이션 결과 인터페이스
 */
export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

