"use client";

/**
 * @file components/products/category-filter.tsx
 * @description 상품 카테고리 필터 컴포넌트 (Client Component)
 *
 * 주요 기능:
 * 1. 카테고리 드롭다운 UI
 * 2. 선택된 카테고리 상태 관리
 * 3. 카테고리 변경 시 콜백 호출
 *
 * @dependencies
 * - types/product: Category, CATEGORY_LABELS
 * - lucide-react: Filter 아이콘
 */

import { Filter } from "lucide-react";
import type { Category } from "@/types/product";
import { CATEGORY_LABELS } from "@/types/product";

interface CategoryFilterProps {
  selectedCategory: Category | "all";
  onCategoryChange: (category: Category | "all") => void;
}

const CATEGORIES = [
  { value: "all" as const, label: "전체" },
  { value: "electronics" as const, label: CATEGORY_LABELS.electronics },
  { value: "clothing" as const, label: CATEGORY_LABELS.clothing },
  { value: "books" as const, label: CATEGORY_LABELS.books },
  { value: "food" as const, label: CATEGORY_LABELS.food },
  { value: "sports" as const, label: CATEGORY_LABELS.sports },
  { value: "beauty" as const, label: CATEGORY_LABELS.beauty },
  { value: "home" as const, label: CATEGORY_LABELS.home },
];

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const handleCategoryChange = (category: Category | "all") => {
    console.log(`🏷️ [CategoryFilter] 카테고리 선택: ${category}`);
    onCategoryChange(category);
  };

  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-gray-500" />
      <select
        value={selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value as Category | "all")}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {CATEGORIES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

