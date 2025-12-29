import jalaliMoment from 'jalali-moment';

/**
 * Persian (Solar Hijri / Jalali) calendar utilities
 */

// Persian month names
export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

export const PERSIAN_MONTHS_SHORT = [
  'فرو', 'ارد', 'خرد',
  'تیر', 'مرد', 'شهر',
  'مهر', 'آبا', 'آذر',
  'دی', 'بهم', 'اسف'
];

// Persian weekday names
export const PERSIAN_WEEKDAYS = [
  'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه',
  'چهارشنبه', 'پنجشنبه', 'جمعه'
];

/**
 * Convert a Gregorian date string (YYYY-MM-DD) or Date object to Persian date
 */
export function toPersianDate(date: string | Date, format: 'full' | 'short' | 'numeric' = 'full'): string {
  try {
    const m = jalaliMoment(date);
    m.locale('fa');
    
    switch (format) {
      case 'numeric':
        return m.format('jYYYY/jMM/jDD');
      case 'short':
        return m.format('jD jMMMM');
      case 'full':
      default:
        return m.format('jD jMMMM jYYYY');
    }
  } catch {
    return '';
  }
}

/**
 * Get both Gregorian and Persian date formatted string
 */
export function getDualDate(date: string | Date): { gregorian: string; persian: string } {
  try {
    const d = new Date(date);
    const gregorian = d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    const persian = toPersianDate(date, 'full');
    return { gregorian, persian };
  } catch {
    return { gregorian: '', persian: '' };
  }
}

/**
 * Format a date for compliance display with both calendars
 */
export function formatComplianceDate(date: string | Date, showPersian: boolean = true): string {
  const d = new Date(date);
  const gregorian = d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  if (showPersian) {
    const persian = toPersianDate(date, 'short');
    return `${gregorian} (${persian})`;
  }
  
  return gregorian;
}

/**
 * Get Persian date components
 */
export function getPersianDateComponents(date: string | Date): {
  year: number;
  month: number;
  day: number;
  monthName: string;
} {
  try {
    const m = jalaliMoment(date);
    return {
      year: m.jYear(),
      month: m.jMonth() + 1,
      day: m.jDate(),
      monthName: PERSIAN_MONTHS[m.jMonth()]
    };
  } catch {
    return { year: 0, month: 0, day: 0, monthName: '' };
  }
}

/**
 * Calculate days remaining in Persian calendar format
 */
export function getDaysRemainingPersian(dueDate: string | Date): {
  days: number;
  isOverdue: boolean;
  persianText: string;
} {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const isOverdue = diffDays < 0;
  const absDays = Math.abs(diffDays);
  
  let persianText: string;
  if (isOverdue) {
    persianText = `${absDays} روز گذشته`;
  } else if (diffDays === 0) {
    persianText = 'امروز';
  } else if (diffDays === 1) {
    persianText = 'فردا';
  } else {
    persianText = `${absDays} روز مانده`;
  }
  
  return { days: diffDays, isOverdue, persianText };
}

/**
 * Get current Persian year
 */
export function getCurrentPersianYear(): number {
  return jalaliMoment().jYear();
}

/**
 * Convert Persian date to Gregorian date string (YYYY-MM-DD)
 */
export function persianToGregorian(jYear: number, jMonth: number, jDay: number): string {
  try {
    const m = jalaliMoment(`${jYear}/${jMonth}/${jDay}`, 'jYYYY/jMM/jDD');
    return m.format('YYYY-MM-DD');
  } catch {
    return '';
  }
}
