'use client';

import { useState, useCallback } from 'react';
import type { PaginationProps } from './types';

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  showPageInfo = true,
}: PaginationProps) {
  const [inputValue, setInputValue] = useState(String(currentPage));

  const handlePrev = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      setInputValue(String(currentPage - 1));
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      setInputValue(String(currentPage + 1));
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  const handleInputSubmit = useCallback(() => {
    const page = parseInt(inputValue, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setInputValue(String(currentPage));
    }
  }, [inputValue, totalPages, currentPage, onPageChange]);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1 || loading}
        className="px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        ← Previous
      </button>

      {showPageInfo && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Page</span>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
            min="1"
            max={totalPages}
            className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
            disabled={loading}
          />
          <span className="text-sm text-gray-700">of {totalPages}</span>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || loading}
        className="px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next →
      </button>
    </div>
  );
}
