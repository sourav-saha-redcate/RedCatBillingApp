import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Fonts } from '@app/themes';
import {
  CalendarDay,
  formatBillDate,
  formatDateRange,
  getMonthCalendarDays,
  isFutureDate,
  isSameDay,
  normalizeDate,
  parseBillDate,
  validateDateRange,
} from '@app/utils/helpers/dateUtils';

interface CustomDatePickerModalProps {
  visible: boolean;
  startDate: Date | null;
  endDate: Date | null;
  onSelectRange: (startDate: Date, endDate: Date) => void;
  onClear: () => void;
  onClose: () => void;
  billDates?: string[];
  maxDate?: Date;
}

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CustomDatePickerModal: FC<CustomDatePickerModalProps> = ({
  visible,
  startDate,
  endDate,
  onSelectRange,
  onClear,
  onClose,
  billDates = [],
  maxDate,
}) => {
  // Use today in local timezone as max selectable date
  const today = useMemo(() => normalizeDate(maxDate || new Date()), [maxDate]);

  const [viewDate, setViewDate] = useState<Date>(() => startDate || today);
  const [tempStart, setTempStart] = useState<Date | null>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);

  // Sync internal view when modal becomes visible or props change
  useEffect(() => {
    if (visible) {
      setTempStart(startDate);
      setTempEnd(endDate);
      const initial = startDate || endDate || today;
      // Do not open to a future month
      if (initial.getTime() > today.getTime()) {
        setViewDate(today);
      } else {
        setViewDate(initial);
      }
    }
  }, [visible, startDate, endDate, today]);

  // Set of keys (YYYY-M-D) that have transactions
  const markedDatesSet = useMemo(() => {
    const set = new Set<string>();
    billDates.forEach(dStr => {
      const parsed = parseBillDate(dStr);
      if (parsed) {
        set.add(`${parsed.getFullYear()}-${parsed.getMonth()}-${parsed.getDate()}`);
      }
    });
    return set;
  }, [billDates]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const isCurrentOrFutureMonth = useMemo(() => {
    return (
      viewYear > today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth >= today.getMonth())
    );
  }, [viewYear, viewMonth, today]);

  const isCurrentOrFutureYear = useMemo(() => {
    return viewYear >= today.getFullYear();
  }, [viewYear, today]);

  const calendarDays = useMemo(() => {
    return getMonthCalendarDays(viewYear, viewMonth, tempStart, tempEnd, markedDatesSet, today);
  }, [viewYear, viewMonth, tempStart, tempEnd, markedDatesSet, today]);

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (isCurrentOrFutureMonth) return;
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handlePrevYear = () => {
    setViewDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
  };

  const handleNextYear = () => {
    if (isCurrentOrFutureYear) return;
    setViewDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
  };

  const handleSelectDay = (day: CalendarDay) => {
    // Prevent future date selection
    if (day.isDisabled || day.isFuture) {
      return;
    }

    const clickedDate = day.date;
    if (isFutureDate(clickedDate, today)) {
      return;
    }

    // Step 1: If neither is selected OR both were already selected, start a fresh range
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(clickedDate);
      setTempEnd(null);
      return;
    }

    // Step 2: From Date is selected, now user is selecting To Date
    if (tempStart && !tempEnd) {
      const startNorm = normalizeDate(tempStart).getTime();
      const clickedNorm = normalizeDate(clickedDate).getTime();

      if (clickedNorm >= startNorm) {
        // To Date is equal or after From Date, and <= today
        setTempEnd(clickedDate);
        onSelectRange(tempStart, clickedDate);
      } else {
        // Prevent/handle case where To Date is earlier than From Date:
        // Seamlessly auto-swap so earlier date is From Date and later date is To Date
        const newStart = clickedDate;
        const newEnd = tempStart;
        setTempStart(newStart);
        setTempEnd(newEnd);
        onSelectRange(newStart, newEnd);
      }
    }
  };

  const handleApply = () => {
    if (tempStart && tempEnd) {
      const validation = validateDateRange(tempStart, tempEnd, today);
      if (validation.isValid && validation.validatedStart && validation.validatedEnd) {
        onSelectRange(validation.validatedStart, validation.validatedEnd);
        onClose();
      }
    } else if (tempStart && !tempEnd) {
      if (!isFutureDate(tempStart, today)) {
        onSelectRange(tempStart, tempStart);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleGoToToday = () => {
    setViewDate(today);
    setTempStart(today);
    setTempEnd(today);
    onSelectRange(today, today);
  };

  const handleClearFilter = () => {
    setTempStart(null);
    setTempEnd(null);
    onClear();
    onClose();
  };

  // Helper text describing current selection
  const selectionHint = useMemo(() => {
    if (!tempStart && !tempEnd) {
      return 'Step 1: Tap to select From Date (up to today)';
    }
    if (tempStart && !tempEnd) {
      return `From: ${formatBillDate(tempStart, 'readable')} → Tap to select To Date`;
    }
    return formatDateRange(tempStart, tempEnd, 'readable');
  }, [tempStart, tempEnd]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.calendarCard}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={{ flex: 1, paddingRight: normalize(8) }}>
                  <Text style={styles.headerTitle}>Select Date Range</Text>
                  <Text style={styles.headerSubtitle} numberOfLines={1}>
                    {selectionHint}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Range Status Indicators (From & To badges) */}
              <View style={styles.rangeBadgeRow}>
                <View
                  style={[
                    styles.rangeBadge,
                    tempStart ? styles.rangeBadgeActive : styles.rangeBadgePending,
                  ]}>
                  <Text style={styles.rangeBadgeLabel}>FROM</Text>
                  <Text style={styles.rangeBadgeValue}>
                    {tempStart ? formatBillDate(tempStart, 'readable') : 'Select date'}
                  </Text>
                </View>

                <Text style={styles.rangeArrow}>→</Text>

                <View
                  style={[
                    styles.rangeBadge,
                    tempEnd ? styles.rangeBadgeActive : styles.rangeBadgePending,
                  ]}>
                  <Text style={styles.rangeBadgeLabel}>TO</Text>
                  <Text style={styles.rangeBadgeValue}>
                    {tempEnd ? formatBillDate(tempEnd, 'readable') : 'Select date'}
                  </Text>
                </View>
              </View>

              {/* Month / Year Navigation */}
              <View style={styles.navRow}>
                <View style={styles.navGroup}>
                  <TouchableOpacity
                    onPress={handlePrevYear}
                    style={styles.navBtn}
                    accessibilityLabel="Previous Year">
                    <Text style={styles.navDoubleArrowText}>«</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePrevMonth}
                    style={styles.navBtn}
                    accessibilityLabel="Previous Month">
                    <Text style={styles.navArrowText}>‹</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.navMonthYearText}>
                  {formatBillDate(viewDate, 'monthYear')}
                </Text>

                <View style={styles.navGroup}>
                  <TouchableOpacity
                    onPress={handleNextMonth}
                    disabled={isCurrentOrFutureMonth}
                    style={[
                      styles.navBtn,
                      isCurrentOrFutureMonth && styles.navBtnDisabled,
                    ]}
                    accessibilityLabel="Next Month">
                    <Text
                      style={[
                        styles.navArrowText,
                        isCurrentOrFutureMonth && styles.navArrowTextDisabled,
                      ]}>
                      ›
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleNextYear}
                    disabled={isCurrentOrFutureYear}
                    style={[
                      styles.navBtn,
                      isCurrentOrFutureYear && styles.navBtnDisabled,
                    ]}
                    accessibilityLabel="Next Year">
                    <Text
                      style={[
                        styles.navDoubleArrowText,
                        isCurrentOrFutureYear && styles.navArrowTextDisabled,
                      ]}>
                      »
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Weekday Labels */}
              <View style={styles.weekDaysRow}>
                {WEEK_DAYS.map((wd, index) => (
                  <View key={index} style={styles.weekDayCell}>
                    <Text
                      style={[
                        styles.weekDayText,
                        (index === 0 || index === 6) && styles.weekendText,
                      ]}>
                      {wd}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {calendarDays.map((item, index) => {
                  const isCurrent = item.isCurrentMonth;
                  const isToday = item.isToday;
                  const isStart = item.isRangeStart;
                  const isEnd = item.isRangeEnd;
                  const inRange = item.isInRange && !isStart && !isEnd;
                  const hasRange = tempStart && tempEnd && !isSameDay(tempStart, tempEnd);
                  const isDisabled = item.isDisabled || item.isFuture;

                  return (
                    <View
                      key={index}
                      style={[
                        styles.dayCellContainer,
                        // Highlight track connecting range (only for non-disabled days)
                        !isDisabled && hasRange && inRange && styles.cellInRangeTrack,
                        !isDisabled && hasRange && isStart && styles.cellStartTrack,
                        !isDisabled && hasRange && isEnd && styles.cellEndTrack,
                      ]}>
                      <TouchableOpacity
                        disabled={isDisabled}
                        accessibilityState={{ disabled: isDisabled }}
                        style={[
                          styles.dayCell,
                          (isStart || isEnd) && styles.dayCellSelected,
                          !isStart && !isEnd && inRange && styles.dayCellInRange,
                          !isStart && !isEnd && !inRange && isToday && styles.dayCellToday,
                          isDisabled && styles.dayCellDisabled,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleSelectDay(item)}>
                        <Text
                          style={[
                            styles.dayText,
                            !isCurrent && styles.dayTextOtherMonth,
                            (isStart || isEnd) && styles.dayTextSelected,
                            inRange && styles.dayTextInRange,
                            !isStart && !isEnd && !inRange && isToday && styles.dayTextToday,
                            isDisabled && styles.dayTextDisabled,
                          ]}>
                          {item.day}
                        </Text>

                        {/* Dot for dates that have bills (hide if future) */}
                        {!isDisabled && item.hasBills && (
                          <View
                            style={[
                              styles.billsDot,
                              (isStart || isEnd) && styles.billsDotSelected,
                            ]}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* Legend Row */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={styles.legendDot} />
                  <Text style={styles.legendText}>Has bills</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={styles.legendRangeBar} />
                  <Text style={styles.legendText}>Selected range</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={styles.legendDisabledDot} />
                  <Text style={styles.legendText}>Future (Disabled)</Text>
                </View>
              </View>

              {/* Footer Actions */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={handleGoToToday}
                  activeOpacity={0.7}>
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>

                <View style={styles.footerRightActions}>
                  {(tempStart || tempEnd) && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={handleClearFilter}
                      activeOpacity={0.7}>
                      <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.applyButton,
                      !tempStart && styles.applyButtonDisabled,
                    ]}
                    onPress={handleApply}
                    activeOpacity={0.8}
                    disabled={!tempStart}>
                    <Text style={styles.applyButtonText}>
                      {tempStart && tempEnd ? 'Apply Range' : 'Done'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomDatePickerModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
  },

  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    width: '100%',
    maxWidth: normalize(380),
    paddingHorizontal: normalize(18),
    paddingTop: normalize(18),
    paddingBottom: normalize(16),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: normalize(10),
  },

  headerTitle: {
    fontSize: normalize(16),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  headerSubtitle: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#2563EB',
    marginTop: normalize(2),
  },

  closeButton: {
    width: normalize(30),
    height: normalize(30),
    borderRadius: normalize(15),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: normalize(13),
    color: '#64748B',
    fontWeight: '700',
  },

  rangeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(10),
    padding: normalize(8),
    marginBottom: normalize(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  rangeBadge: {
    flex: 1,
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(8),
    alignItems: 'center',
  },

  rangeBadgeActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  rangeBadgePending: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  rangeBadgeLabel: {
    fontSize: normalize(9.5),
    fontFamily: Fonts.Figtree_Bold,
    color: '#64748B',
    letterSpacing: 0.5,
  },

  rangeBadgeValue: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: normalize(2),
  },

  rangeArrow: {
    fontSize: normalize(16),
    color: '#94A3B8',
    paddingHorizontal: normalize(6),
    fontWeight: '700',
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(10),
  },

  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },

  navBtn: {
    width: normalize(30),
    height: normalize(30),
    borderRadius: normalize(8),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navBtnDisabled: {
    opacity: 0.3,
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },

  navArrowText: {
    fontSize: normalize(18),
    color: '#0F172A',
    fontWeight: '700',
    lineHeight: normalize(20),
  },

  navArrowTextDisabled: {
    color: '#94A3B8',
  },

  navDoubleArrowText: {
    fontSize: normalize(14),
    color: '#475569',
    fontWeight: '700',
    lineHeight: normalize(16),
  },

  navMonthYearText: {
    fontSize: normalize(14.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
  },

  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: normalize(6),
  },

  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },

  weekDayText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#64748B',
    textTransform: 'uppercase',
  },

  weekendText: {
    color: '#94A3B8',
  },

  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayCellContainer: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: normalize(1.5),
  },

  cellInRangeTrack: {
    backgroundColor: '#EFF6FF',
  },

  cellStartTrack: {
    backgroundColor: '#EFF6FF',
    borderTopLeftRadius: normalize(20),
    borderBottomLeftRadius: normalize(20),
  },

  cellEndTrack: {
    backgroundColor: '#EFF6FF',
    borderTopRightRadius: normalize(20),
    borderBottomRightRadius: normalize(20),
  },

  dayCell: {
    width: '90%',
    height: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(20),
    position: 'relative',
  },

  dayCellSelected: {
    backgroundColor: '#0F172A',
  },

  dayCellInRange: {
    backgroundColor: '#EFF6FF',
  },

  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },

  dayCellDisabled: {
    opacity: 0.28,
  },

  dayText: {
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_Medium,
    color: '#0F172A',
  },

  dayTextOtherMonth: {
    color: '#CBD5E1',
  },

  dayTextToday: {
    color: '#0284C7',
    fontWeight: '700',
  },

  dayTextSelected: {
    color: '#FFFFFF',
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '800',
  },

  dayTextInRange: {
    color: '#1E40AF',
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '700',
  },

  dayTextDisabled: {
    color: '#94A3B8',
  },

  billsDot: {
    width: normalize(4),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: '#10B981',
    position: 'absolute',
    bottom: normalize(3),
  },

  billsDotSelected: {
    backgroundColor: '#38BDF8',
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(8),
    marginBottom: normalize(10),
    paddingHorizontal: normalize(4),
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: '#10B981',
    marginRight: normalize(5),
  },

  legendRangeBar: {
    width: normalize(14),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: '#BFDBFE',
    marginRight: normalize(5),
  },

  legendDisabledDot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: '#94A3B8',
    opacity: 0.5,
    marginRight: normalize(5),
  },

  legendText: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#94A3B8',
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: normalize(10),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  todayButton: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
    backgroundColor: '#F1F5F9',
  },

  todayButtonText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#0F172A',
  },

  footerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },

  clearButton: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
    backgroundColor: '#FEE2E2',
  },

  clearButtonText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Bold,
    color: '#EF4444',
  },

  applyButton: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
    backgroundColor: '#0F172A',
  },

  applyButtonDisabled: {
    backgroundColor: '#94A3B8',
  },

  applyButtonText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
