/**
 * @file components/products/sort-selector.tsx
 * @description 상품 정렬 옵션 선택 컴포넌트
 *
 * 주요 기능:
 * 1. 정렬 옵션 드롭다운 표시
 * 2. 선택된 정렬 옵션 하이라이트
 * 3. 정렬 변경 시 콜백 호출
 *
 * @dependencies
 * - types/product: SortOption, SORT_LABELS
 * - lucide-react: ArrowUpDown 아이콘
 */

"use client";

import { ArrowUpDown } from "lucide-react";
import type { SortOption } from "@/types/product";
import { SORT_LABELS } from "@/types/product";

interface SortSelectorProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SortSelector({
  selectedSort,
  onSortChange,
}: SortSelectorProps) {
  const sortOptions: SortOption[] = ["latest", "price_asc", "price_desc", "popular"];

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-gray-500" />
      <select
        value={selectedSort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option} value={option}>
            {SORT_LABELS[option]}
          </option>
        ))}
      </select>
    </div>
  );
}

