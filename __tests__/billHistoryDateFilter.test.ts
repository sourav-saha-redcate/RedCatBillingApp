import {
  formatBillDate,
  formatDateRange,
  getMonthCalendarDays,
  getPresetDateRange,
  getStartOfWeek,
  isDateInRange,
  isFutureDate,
  isSameDay,
  parseBillDate,
  validateDateRange,
} from '../src/utils/helpers/dateUtils';
import { INITIAL_BILLS } from '../src/screens/protected/BillHistory';

describe('Bill History Date Filter & Range Utilities', () => {
  describe('parseBillDate', () => {
    it('should parse DD-MMM-YYYY format accurately', () => {
      const d1 = parseBillDate('24-Oct-2023');
      expect(d1).not.toBeNull();
      expect(d1?.getFullYear()).toBe(2023);
      expect(d1?.getMonth()).toBe(9); // 0-indexed: October is 9
      expect(d1?.getDate()).toBe(24);

      const d2 = parseBillDate('08-Sep-2026');
      expect(d2).not.toBeNull();
      expect(d2?.getFullYear()).toBe(2026);
      expect(d2?.getMonth()).toBe(8); // September is 8
      expect(d2?.getDate()).toBe(8);

      const d3 = parseBillDate('08-Sept-2026');
      expect(d3).not.toBeNull();
      expect(d3?.getFullYear()).toBe(2026);
      expect(d3?.getMonth()).toBe(8);
      expect(d3?.getDate()).toBe(8);
    });

    it('should parse YYYY-MM-DD format accurately', () => {
      const d = parseBillDate('2026-09-08');
      expect(d).not.toBeNull();
      expect(d?.getFullYear()).toBe(2026);
      expect(d?.getMonth()).toBe(8);
      expect(d?.getDate()).toBe(8);
    });

    it('should parse DD/MM/YYYY format accurately', () => {
      const d = parseBillDate('08/09/2026');
      expect(d).not.toBeNull();
      expect(d?.getFullYear()).toBe(2026);
      expect(d?.getMonth()).toBe(8);
      expect(d?.getDate()).toBe(8);
    });

    it('should return null for invalid or empty inputs', () => {
      expect(parseBillDate('')).toBeNull();
      expect(parseBillDate(null as any)).toBeNull();
      expect(parseBillDate(undefined as any)).toBeNull();
      expect(parseBillDate('invalid-date-string')).toBeNull();
    });
  });

  describe('isSameDay', () => {
    it('should return true for two dates on the same calendar day regardless of time', () => {
      const date1 = new Date(2026, 8, 8, 9, 30, 0);
      const date2 = new Date(2026, 8, 8, 21, 45, 12);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date(2026, 8, 8);
      const date2 = new Date(2026, 8, 9);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should handle null/undefined safely', () => {
      expect(isSameDay(null, new Date())).toBe(false);
      expect(isSameDay(new Date(), undefined)).toBe(false);
      expect(isSameDay(null, null)).toBe(false);
    });
  });

  describe('Future Date Restrictions', () => {
    const mockToday = new Date(2026, 8, 8); // Sep 8, 2026

    it('should identify future dates correctly relative to reference date', () => {
      // Historical dates -> not future
      expect(isFutureDate(new Date(2026, 8, 1), mockToday)).toBe(false);
      expect(isFutureDate(new Date(2026, 8, 7), mockToday)).toBe(false);

      // Today -> NOT future, must remain selectable
      expect(isFutureDate(new Date(2026, 8, 8), mockToday)).toBe(false);

      // Future dates -> future / disabled
      expect(isFutureDate(new Date(2026, 8, 9), mockToday)).toBe(true);
      expect(isFutureDate(new Date(2026, 8, 15), mockToday)).toBe(true);
      expect(isFutureDate(new Date(2026, 9, 1), mockToday)).toBe(true);
    });

    it('should mark future days as disabled in getMonthCalendarDays', () => {
      const days = getMonthCalendarDays(2026, 8, null, null, undefined, mockToday);

      // Days up to Sep 8 are selectable
      const day1 = days.find(d => d.day === 1 && d.isCurrentMonth);
      expect(day1?.isDisabled).toBe(false);
      expect(day1?.isFuture).toBe(false);

      const day8 = days.find(d => d.day === 8 && d.isCurrentMonth);
      expect(day8?.isDisabled).toBe(false);
      expect(day8?.isFuture).toBe(false);

      // Days after Sep 8 are disabled & future
      const day9 = days.find(d => d.day === 9 && d.isCurrentMonth);
      expect(day9?.isDisabled).toBe(true);
      expect(day9?.isFuture).toBe(true);

      const day15 = days.find(d => d.day === 15 && d.isCurrentMonth);
      expect(day15?.isDisabled).toBe(true);
      expect(day15?.isFuture).toBe(true);
    });

    it('should validate and reject ranges containing future dates', () => {
      // Valid range: Sep 1 to Sep 8, 2026
      const valid = validateDateRange(new Date(2026, 8, 1), new Date(2026, 8, 8), mockToday);
      expect(valid.isValid).toBe(true);

      // Invalid range: From date is future
      const futureFrom = validateDateRange(new Date(2026, 8, 9), new Date(2026, 8, 10), mockToday);
      expect(futureFrom.isValid).toBe(false);
      expect(futureFrom.error).toContain('future');

      // Invalid range: To date is future
      const futureTo = validateDateRange(new Date(2026, 8, 7), new Date(2026, 8, 9), mockToday);
      expect(futureTo.isValid).toBe(false);
      expect(futureTo.error).toContain('future');
    });
  });

  describe('isDateInRange', () => {
    const fromDate = new Date(2026, 8, 1); // Sep 1, 2026
    const toDate = new Date(2026, 8, 8);   // Sep 8, 2026

    it('should return true for dates within the range inclusive of endpoints', () => {
      expect(isDateInRange(new Date(2026, 8, 1), fromDate, toDate)).toBe(true);
      expect(isDateInRange(new Date(2026, 8, 5), fromDate, toDate)).toBe(true);
      expect(isDateInRange(new Date(2026, 8, 8), fromDate, toDate)).toBe(true);
    });

    it('should return false for dates outside the range', () => {
      expect(isDateInRange(new Date(2026, 7, 31), fromDate, toDate)).toBe(false);
      expect(isDateInRange(new Date(2026, 8, 9), fromDate, toDate)).toBe(false);
    });

    it('should handle single day ranges (fromDate === toDate)', () => {
      expect(isDateInRange(new Date(2026, 8, 1), fromDate, fromDate)).toBe(true);
      expect(isDateInRange(new Date(2026, 8, 2), fromDate, fromDate)).toBe(false);
    });

    it('should handle when toDate is earlier than fromDate seamlessly', () => {
      expect(isDateInRange(new Date(2026, 8, 5), toDate, fromDate)).toBe(true);
    });

    it('should return false for invalid or missing inputs', () => {
      expect(isDateInRange(null, fromDate, toDate)).toBe(false);
      expect(isDateInRange(new Date(2026, 8, 5), null, toDate)).toBe(false);
    });
  });

  describe('formatDateRange', () => {
    it('should format date range cleanly as Sep 1, 2026 – Sep 8, 2026', () => {
      const d1 = new Date(2026, 8, 1);
      const d2 = new Date(2026, 8, 8);
      expect(formatDateRange(d1, d2, 'readable')).toBe('Sep 1, 2026 – Sep 8, 2026');
    });

    it('should format single date when startDate === endDate', () => {
      const d1 = new Date(2026, 8, 1);
      expect(formatDateRange(d1, d1, 'readable')).toBe('Sep 1, 2026');
    });

    it('should handle only startDate provided', () => {
      const d1 = new Date(2026, 8, 1);
      expect(formatDateRange(d1, null, 'readable')).toBe('Sep 1, 2026');
    });

    it('should handle reversed dates properly', () => {
      const d1 = new Date(2026, 8, 8);
      const d2 = new Date(2026, 8, 1);
      expect(formatDateRange(d1, d2, 'readable')).toBe('Sep 1, 2026 – Sep 8, 2026');
    });
  });

  describe('formatBillDate', () => {
    const testDate = new Date(2026, 8, 8); // Sep 8, 2026 (Tuesday)

    it('should format display style as DD-MMM-YYYY', () => {
      expect(formatBillDate(testDate, 'display')).toBe('08-Sep-2026');
    });

    it('should format readable style as MMM D, YYYY', () => {
      expect(formatBillDate(testDate, 'readable')).toBe('Sep 8, 2026');
    });

    it('should format full style with day name', () => {
      expect(formatBillDate(testDate, 'full')).toBe('Tuesday, 08 Sep 2026');
    });

    it('should format monthYear style', () => {
      expect(formatBillDate(testDate, 'monthYear')).toBe('September 2026');
    });

    it('should return empty string for null or invalid date', () => {
      expect(formatBillDate(null)).toBe('');
      expect(formatBillDate(new Date('invalid'))).toBe('');
    });
  });

  describe('getMonthCalendarDays with Range Highlights', () => {
    const maxDate = new Date(2026, 8, 8);

    it('should calculate isRangeStart, isRangeEnd, and isInRange correctly', () => {
      const start = new Date(2026, 8, 1);
      const end = new Date(2026, 8, 8);
      const days = getMonthCalendarDays(2026, 8, start, end, undefined, maxDate);

      const day1 = days.find(d => d.day === 1 && d.isCurrentMonth);
      expect(day1?.isRangeStart).toBe(true);
      expect(day1?.isInRange).toBe(true);

      const day5 = days.find(d => d.day === 5 && d.isCurrentMonth);
      expect(day5?.isRangeStart).toBe(false);
      expect(day5?.isRangeEnd).toBe(false);
      expect(day5?.isInRange).toBe(true);

      const day8 = days.find(d => d.day === 8 && d.isCurrentMonth);
      expect(day8?.isRangeEnd).toBe(true);
      expect(day8?.isInRange).toBe(true);

      const day9 = days.find(d => d.day === 9 && d.isCurrentMonth);
      expect(day9?.isInRange).toBe(false);
      expect(day9?.isDisabled).toBe(true);
    });

    it('should mark days that have bills', () => {
      const marked = new Set(['2026-8-8']); // Sep 8, 2026 (month index 8)
      const days = getMonthCalendarDays(2026, 8, null, null, marked, maxDate);
      const day8 = days.find(d => d.day === 8 && d.isCurrentMonth);
      expect(day8?.hasBills).toBe(true);

      const day9 = days.find(d => d.day === 9 && d.isCurrentMonth);
      expect(day9?.hasBills).toBe(false);
    });
  });

  describe('Bill Filtering by Custom Date Range', () => {
    it('should correctly filter bills for Sep 1, 2026 – Sep 8, 2026 range', () => {
      const from = new Date(2026, 8, 1);
      const to = new Date(2026, 8, 8);

      const matchingBills = INITIAL_BILLS.filter(bill => {
        const bDate = parseBillDate(bill.date);
        return isDateInRange(bDate, from, to);
      });

      // Bills from Sep 1 (#0045), Sep 5 (#0046), Sep 7 (#0047), Sep 8 (#0043, #0044)
      expect(matchingBills.length).toBe(5);
      expect(matchingBills.map(b => b.billNumber)).toEqual(
        expect.arrayContaining(['#0045', '#0046', '#0047', '#0043', '#0044'])
      );
    });

    it('should correctly filter bills for a single day range (Sep 1, 2026 – Sep 1, 2026)', () => {
      const from = new Date(2026, 8, 1);
      const to = new Date(2026, 8, 1);

      const matchingBills = INITIAL_BILLS.filter(bill => {
        const bDate = parseBillDate(bill.date);
        return isDateInRange(bDate, from, to);
      });

      expect(matchingBills.length).toBe(1);
      expect(matchingBills[0].billNumber).toBe('#0045');
    });

    it('should correctly filter all bills between Oct 23, 2023 and Oct 24, 2023', () => {
      const from = new Date(2023, 9, 23);
      const to = new Date(2023, 9, 24);

      const matchingBills = INITIAL_BILLS.filter(bill => {
        const bDate = parseBillDate(bill.date);
        return isDateInRange(bDate, from, to);
      });

      expect(matchingBills.length).toBe(6);
    });

    it('should return empty list when no bills fall within the selected date range', () => {
      const from = new Date(2026, 7, 10); // Aug 10
      const to = new Date(2026, 7, 15);   // Aug 15

      const matchingBills = INITIAL_BILLS.filter(bill => {
        const bDate = parseBillDate(bill.date);
        return isDateInRange(bDate, from, to);
      });

      expect(matchingBills.length).toBe(0);
    });

    it('should allow clearing date range filter to view all bills', () => {
      let from: Date | null = new Date(2026, 8, 1);
      let to: Date | null = new Date(2026, 8, 8);

      // Filtered
      let filtered = INITIAL_BILLS.filter(bill => {
        if (!from || !to) return true;
        const bDate = parseBillDate(bill.date);
        return isDateInRange(bDate, from, to);
      });
      expect(filtered.length).toBe(5);

      // Reset
      from = null;
      to = null;
      filtered = INITIAL_BILLS.filter(bill => {
        if (!from || !to) return true;
        const bDate = parseBillDate(bill.date);
        return isDateInRange(bDate, from, to);
      });
      expect(filtered.length).toBe(INITIAL_BILLS.length);
    });

    it('should support combining search query with date range filter', () => {
      const from = new Date(2026, 8, 1);
      const to = new Date(2026, 8, 8);
      const query = 'Rohan';

      const filtered = INITIAL_BILLS.filter(bill => {
        const inRange = isDateInRange(parseBillDate(bill.date), from, to);
        const matchesQuery =
          bill.customerName.toLowerCase().includes(query.toLowerCase()) ||
          bill.billNumber.toLowerCase().includes(query.toLowerCase());
        return inRange && matchesQuery;
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].customerName).toBe('Rohan Gupta');
    });
  });

  describe('Dynamic Preset Date Ranges (Today, This Week, This Month)', () => {
    // Reference date: Tuesday, September 8, 2026
    const refDate = new Date(2026, 8, 8);

    describe('getStartOfWeek', () => {
      it('should calculate Monday as start of week for a Tuesday (Sep 8 -> Sep 7)', () => {
        const start = getStartOfWeek(new Date(2026, 8, 8));
        expect(start.getFullYear()).toBe(2026);
        expect(start.getMonth()).toBe(8);
        expect(start.getDate()).toBe(7); // Monday Sep 7
        expect(start.getDay()).toBe(1); // Monday
      });

      it('should calculate current Monday when reference date is Monday', () => {
        const start = getStartOfWeek(new Date(2026, 8, 7)); // Monday
        expect(start.getDate()).toBe(7);
        expect(start.getDay()).toBe(1);
      });

      it('should calculate previous Monday when reference date is Sunday', () => {
        const start = getStartOfWeek(new Date(2026, 8, 13)); // Sunday
        expect(start.getDate()).toBe(7); // Previous Monday
        expect(start.getDay()).toBe(1);
      });
    });

    describe('getPresetDateRange', () => {
      it('Today: should return today as both start and end date (Sep 8, 2026)', () => {
        const range = getPresetDateRange('Today', refDate);
        expect(isSameDay(range.startDate, new Date(2026, 8, 8))).toBe(true);
        expect(isSameDay(range.endDate, new Date(2026, 8, 8))).toBe(true);
        expect(formatBillDate(range.startDate, 'readable')).toBe('Sep 8, 2026');
      });

      it('This Week: should return start of week (Monday) through today (Sep 7 – Sep 8, 2026)', () => {
        const range = getPresetDateRange('This Week', refDate);
        expect(isSameDay(range.startDate, new Date(2026, 8, 7))).toBe(true);
        expect(isSameDay(range.endDate, new Date(2026, 8, 8))).toBe(true);
        expect(formatDateRange(range.startDate, range.endDate, 'readable')).toBe(
          'Sep 7, 2026 – Sep 8, 2026'
        );
      });

      it('This Month: should return 1st of month through today (Sep 1 – Sep 8, 2026)', () => {
        const range = getPresetDateRange('This Month', refDate);
        expect(isSameDay(range.startDate, new Date(2026, 8, 1))).toBe(true);
        expect(isSameDay(range.endDate, new Date(2026, 8, 8))).toBe(true);
        expect(formatDateRange(range.startDate, range.endDate, 'readable')).toBe(
          'Sep 1, 2026 – Sep 8, 2026'
        );
      });

      it('should never produce an end date in the future', () => {
        const todayRange = getPresetDateRange('Today', refDate);
        const weekRange = getPresetDateRange('This Week', refDate);
        const monthRange = getPresetDateRange('This Month', refDate);

        expect(isFutureDate(todayRange.endDate, refDate)).toBe(false);
        expect(isFutureDate(weekRange.endDate, refDate)).toBe(false);
        expect(isFutureDate(monthRange.endDate, refDate)).toBe(false);
      });
    });

    describe('Filtering INITIAL_BILLS with Presets', () => {
      it('Today: should filter bills to show only bills created on today (Sep 8, 2026)', () => {
        const { startDate, endDate } = getPresetDateRange('Today', refDate);
        const todayBills = INITIAL_BILLS.filter(bill => {
          const bDate = parseBillDate(bill.date);
          if (!bDate || isFutureDate(bDate, refDate)) return false;
          return isDateInRange(bDate, startDate, endDate);
        });

        // 08-Sep-2026 bills: #0043 (Aarav Mehta), #0044 (Ananya Iyer)
        expect(todayBills.length).toBe(2);
        expect(todayBills.map(b => b.billNumber)).toEqual(
          expect.arrayContaining(['#0043', '#0044'])
        );
        todayBills.forEach(b => {
          expect(b.date).toBe('08-Sep-2026');
        });
      });

      it('This Week: should filter bills from beginning of week through today (Sep 7 – Sep 8, 2026)', () => {
        const { startDate, endDate } = getPresetDateRange('This Week', refDate);
        const weekBills = INITIAL_BILLS.filter(bill => {
          const bDate = parseBillDate(bill.date);
          if (!bDate || isFutureDate(bDate, refDate)) return false;
          return isDateInRange(bDate, startDate, endDate);
        });

        // Bills: #0047 (07-Sep-2026), #0043 (08-Sep-2026), #0044 (08-Sep-2026)
        expect(weekBills.length).toBe(3);
        expect(weekBills.map(b => b.billNumber)).toEqual(
          expect.arrayContaining(['#0047', '#0043', '#0044'])
        );
      });

      it('This Month: should filter bills from 1st of month through today (Sep 1 – Sep 8, 2026)', () => {
        const { startDate, endDate } = getPresetDateRange('This Month', refDate);
        const monthBills = INITIAL_BILLS.filter(bill => {
          const bDate = parseBillDate(bill.date);
          if (!bDate || isFutureDate(bDate, refDate)) return false;
          return isDateInRange(bDate, startDate, endDate);
        });

        // Bills: #0045 (01-Sep), #0046 (05-Sep), #0047 (07-Sep), #0043 (08-Sep), #0044 (08-Sep)
        expect(monthBills.length).toBe(5);
        expect(monthBills.map(b => b.billNumber)).toEqual(
          expect.arrayContaining(['#0045', '#0046', '#0047', '#0043', '#0044'])
        );
      });

      it('All: should return all available historical records regardless of date, excluding future bills', () => {
        const mockFutureBill = {
          id: 'test-future-all',
          billNumber: '#0099',
          customerName: 'Future Person',
          phone: '+91 99999 99999',
          dateTime: '09-Sep-2026, 10:00 am',
          dateSection: 'Today',
          time: '10:00:00',
          date: '09-Sep-2026',
          paymentMethod: 'Cash',
          amount: 500,
          status: 'PAID' as const,
          staff: 'Staff-01',
          items: [],
          subtotal: 500,
          gst: 0,
          grandTotal: 500,
          barcode: 'test-barcode',
        };

        const testBills = [...INITIAL_BILLS, mockFutureBill];

        // "All" filter logic:
        const allBills = testBills.filter(bill => {
          const bDate = parseBillDate(bill.date);
          if (bDate && isFutureDate(bDate, refDate)) return false;
          return true;
        });

        // Exactly matches INITIAL_BILLS count (11 bills) including both 2023 and 2026 records
        expect(allBills.length).toBe(INITIAL_BILLS.length);
        expect(allBills.some(b => b.date === '24-Oct-2023')).toBe(true);
        expect(allBills.some(b => b.date === '23-Oct-2023')).toBe(true);
        expect(allBills.some(b => b.date === '01-Sep-2026')).toBe(true);
        expect(allBills.some(b => b.date === '08-Sep-2026')).toBe(true);
        expect(allBills.some(b => b.billNumber === '#0099')).toBe(false);
      });

      it('Switching from All to other filters immediately changes matching bill count', () => {
        // All bills:
        const allBills = INITIAL_BILLS.filter(b => {
          const bDate = parseBillDate(b.date);
          return !bDate || !isFutureDate(bDate, refDate);
        });
        expect(allBills.length).toBe(11);

        // Switch to Today:
        const { startDate: todayStart, endDate: todayEnd } = getPresetDateRange('Today', refDate);
        const todayBills = INITIAL_BILLS.filter(b => {
          const bDate = parseBillDate(b.date);
          return bDate && !isFutureDate(bDate, refDate) && isDateInRange(bDate, todayStart, todayEnd);
        });
        expect(todayBills.length).toBe(2);

        // Switch to This Week:
        const { startDate: weekStart, endDate: weekEnd } = getPresetDateRange('This Week', refDate);
        const weekBills = INITIAL_BILLS.filter(b => {
          const bDate = parseBillDate(b.date);
          return bDate && !isFutureDate(bDate, refDate) && isDateInRange(bDate, weekStart, weekEnd);
        });
        expect(weekBills.length).toBe(3);

        // Switch to This Month:
        const { startDate: monthStart, endDate: monthEnd } = getPresetDateRange('This Month', refDate);
        const monthBills = INITIAL_BILLS.filter(b => {
          const bDate = parseBillDate(b.date);
          return bDate && !isFutureDate(bDate, refDate) && isDateInRange(bDate, monthStart, monthEnd);
        });
        expect(monthBills.length).toBe(5);
      });
    });
  });
});
