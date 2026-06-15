'use client';

import { useState } from 'react';
import type { DatePickerProps } from './types';

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  format = 'MM/dd/yyyy',
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return format === 'MM/dd/yyyy' ? `${month}/${day}/${year}` : `${year}-${month}-${day}`;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateDisabled(date)) {
      onChange(date);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="px-2 py-1 hover:bg-gray-100 rounded">
          ◀
        </button>
        <span className="font-semibold">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={handleNextMonth} className="px-2 py-1 hover:bg-gray-100 rounded">
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`}></div>
        ))}
        {days.map((day) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const disabled = isDateDisabled(date);
          const isSelected =
            value &&
            value.toDateString() === date.toDateString();

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={disabled}
              className={`px-2 py-1 text-sm rounded ${
                isSelected
                  ? 'bg-blue-500 text-white'
                  : disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {value && (
        <div className="mt-4 pt-4 border-t text-sm">
          <input
            type="text"
            value={formatDate(value)}
            readOnly
            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700"
          />
        </div>
      )}
    </div>
  );
}

export function DateRangePicker(props: DateRangePickerProps) {
  const { startDate, endDate, onStartDateChange, onEndDateChange, minDate, maxDate } = props;
  return (
    <div className="flex gap-4">
      <div>
        <label className="text-sm font-semibold text-gray-700">Start Date</label>
        <DatePicker
          value={startDate}
          onChange={onStartDateChange}
          minDate={minDate}
          maxDate={endDate || maxDate}
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700">End Date</label>
        <DatePicker
          value={endDate}
          onChange={onEndDateChange}
          minDate={startDate || minDate}
          maxDate={maxDate}
        />
      </div>
    </div>
  );
}
