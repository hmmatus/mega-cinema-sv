'use client';

import { useSelect } from './Select.viewmodel';
import type { SelectProps, SelectOption } from './types';

export function Select<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  clearable = false,
  multiple = false,
}: SelectProps<T>) {
  const { isOpen, handleToggle, handleClose, ref } = useSelect({ clearable });

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (option: SelectOption<T>) => {
    if (!option.disabled) {
      onChange(option.value);
      if (!multiple) {
        handleClose();
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined as unknown as T);
  };

  return (
    <div ref={ref} className="relative inline-block w-full">
      <button
        onClick={handleToggle}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-gray-400"
      >
        <div className="flex items-center justify-between">
          <span>{selectedOption?.label || placeholder}</span>
          <div className="flex items-center gap-1">
            {clearable && value && (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                ✕
              </button>
            )}
            <span className="text-gray-400">▼</span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded-md bg-white shadow-lg">
          {options.map((option) => (
            <div
              key={String(option.value)}
              onClick={() => handleSelect(option)}
              className={`px-3 py-2 cursor-pointer ${
                option.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'hover:bg-blue-50 text-gray-900'
              } ${option.value === value ? 'bg-blue-100' : ''}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
