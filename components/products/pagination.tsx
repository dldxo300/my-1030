/**
 * @file components/products/pagination.tsx
 * @description 페이지네이션 컴포넌트
 *
 * 주요 기능:
 * 1. 페이지 번호 버튼 표시
 * 2. 이전/다음 버튼
 * 3. 현재 페이지 하이라이트
 * 4. 모바일 반응형 (간소화된 버튼)
 *
 * @dependencies
 * - lucide-react: ChevronLeft, ChevronRight 아이콘
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // 페이지가 1개 이하면 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }

  // 표시할 페이지 번호 계산 (최대 5개)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // 전체 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 5개 이상이면 현재 페이지 중심으로 표시
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      // 시작이 1이면 끝을 5로 조정
      if (start === 1) {
        end = Math.min(5, totalPages);
      }

      // 끝이 totalPages면 시작을 조정
      if (end === totalPages) {
        start = Math.max(1, totalPages - 4);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="이전 페이지"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* 페이지 번호 버튼 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`
              flex items-center justify-center w-10 h-10 rounded-lg border transition-colors
              ${
                pageNum === currentPage
                  ? "bg-blue-500 text-white border-blue-500 font-semibold"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              }
            `}
            aria-label={`페이지 ${pageNum}`}
            aria-current={pageNum === currentPage ? "page" : undefined}
          >
            {pageNum}
          </button>
        ))}
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="다음 페이지"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

