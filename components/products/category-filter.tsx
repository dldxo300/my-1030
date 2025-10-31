"use client";

/**
 * @file components/products/category-filter.tsx
 * @description 상품 카테고리 필터 컴포넌트 (Client Component)
 *
 * 주요 기능:
 * 1. 카테고리 버튼/탭 UI
 * 2. 선택된 카테고리 상태 관리
 * 3. 카테고리 변경 시 콜백 호출
 *
 * @dependencies
 * - types/product: Category, CATEGORY_LABELS
 * - lucide-react: 카테고리 아이콘
 */

import type { Category } from "@/types/product";
import { CATEGORY_LABELS } from "@/types/product";
import {
  Laptop,
  Shirt,
  BookOpen,
  UtensilsCrossed,
  Dumbbell,
  Sparkles,
  Home,
  Grid3x3,
} from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: Category | "all";
  onCategoryChange: (category: Category | "all") => void;
}

// 카테고리별 아이콘 매핑
const CATEGORY_ICONS = {
  all: Grid3x3,
  electronics: Laptop,
  clothing: Shirt,
  books: BookOpen,
  food: UtensilsCrossed,
  sports: Dumbbell,
  beauty: Sparkles,
  home: Home,
};

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
  const handleCategoryClick = (category: Category | "all") => {
    console.log(`🏷️ [CategoryFilter] 카테고리 선택: ${category}`);
    onCategoryChange(category);
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max px-1">
        {CATEGORIES.map(({ value, label }) => {
          const Icon = CATEGORY_ICONS[value];
          const isSelected = selectedCategory === value;

          return (
            <button
              key={value}
              onClick={() => handleCategoryClick(value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  isSelected
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

