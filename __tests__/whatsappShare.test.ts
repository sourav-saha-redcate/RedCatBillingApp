import { NativeModules } from 'react-native';
import { BillItem } from '@app/types';
import {
  formatWhatsAppFriendlyMessage,
  sanitizePhoneNumber,
  sendBillViaWhatsAppWithPdf,
  generateBillPdf,
} from '@app/utils/share/BillShareService';
import {
  DEFAULT_STORE_CONFIG,
  extractGoogleReviewLink,
  StoreSettingsService,
} from '@app/utils/store/StoreSettingsService';

const mockBill: BillItem = {
  id: 'b101',
  billNumber: '#1024',
  customerName: 'Aarav Sharma',
  phone: '9876543210',
  dateTime: '07-Sep-2026, 11:30 am',
  dateSection: 'Today',
  time: '11:30:00',
  date: '07-Sep-2026',
  paymentMethod: 'UPI',
  amount: 1550.0,
  status: 'PAID',
  staff: 'Pooja',
  items: [
    { id: 'i1', name: 'Hair Spa Deluxe', qty: 1, price: 1200.0 },
    { id: 'i2', name: 'Herbal Shampoo 200ml', qty: 1, price: 350.0 },
  ],
  subtotal: 1550.0,
  gst: 77.5,
  grandTotal: 1627.5,
};

describe('WhatsApp Bill Sharing Feature with PDF & Google Review Link', () => {
  beforeEach(() => {
    StoreSettingsService.clearCache();
    jest.clearAllMocks();
  });

  describe('Google Review Link Extraction', () => {
    it('extracts googleReviewLink from store.settings.googleReviewLink', () => {
      const store = {
        name: 'My Store',
        settings: {
          googleReviewLink: 'https://g.page/r/test-review-link/review',
        },
      };
      expect(extractGoogleReviewLink(store)).toBe('https://g.page/r/test-review-link/review');
    });

    it('extracts googleReviewLink from store.googleReviewLink (flat config)', () => {
      const store = {
        name: 'My Store',
        googleReviewLink: 'https://g.page/r/flat-review-link/review',
      };
      expect(extractGoogleReviewLink(store)).toBe('https://g.page/r/flat-review-link/review');
    });

    it('trims whitespace from googleReviewLink', () => {
      const store = {
        settings: {
          googleReviewLink: '   https://g.page/r/trimmed/review   ',
        },
      };
      expect(extractGoogleReviewLink(store)).toBe('https://g.page/r/trimmed/review');
    });

    it('returns empty string if googleReviewLink is not configured', () => {
      expect(extractGoogleReviewLink({})).toBe('');
      expect(extractGoogleReviewLink({ settings: {} })).toBe('');
      expect(extractGoogleReviewLink(undefined)).toBe('');
      expect(extractGoogleReviewLink(null)).toBe('');
      expect(extractGoogleReviewLink({ googleReviewLink: '   ' })).toBe('');
    });
  });

  describe('WhatsApp Friendly Message Formatting', () => {
    it('formats friendly message with Google Review link when configured', () => {
      const storeInfo = {
        storeName: 'Royal Salon & Spa',
        googleReviewLink: 'https://g.page/r/royal-salon/review',
      };

      const message = formatWhatsAppFriendlyMessage(mockBill, storeInfo);

      expect(message).toBe(
        `Hello Aarav Sharma, thank you for visiting Royal Salon & Spa! 🙏\n\n` +
        `Please find your bill attached.\n\n` +
        `We'd love to hear your feedback. Please rate us on Google:\n` +
        `https://g.page/r/royal-salon/review\n\n` +
        `Thank you for your support!`
      );
    });

    it('cleanly omits the Google review section when link is not configured', () => {
      const storeInfo = {
        storeName: 'Royal Salon & Spa',
        googleReviewLink: '',
      };

      const message = formatWhatsAppFriendlyMessage(mockBill, storeInfo);

      expect(message).toBe(
        `Hello Aarav Sharma, thank you for visiting Royal Salon & Spa! 🙏\n\n` +
        `Please find your bill attached.\n\n` +
        `Thank you for your support!`
      );
      // Ensure no broken links or empty brackets
      expect(message).not.toContain('Google');
      expect(message).not.toContain('undefined');
      expect(message).not.toContain('null');
      expect(message).not.toContain('{}');
    });

    it('cleanly omits the review section when storeInfo has settings with empty link', () => {
      const storeInfo = {
        storeName: 'Royal Salon & Spa',
        settings: { googleReviewLink: '   ' },
      };

      const message = formatWhatsAppFriendlyMessage(mockBill, storeInfo);

      expect(message).toBe(
        `Hello Aarav Sharma, thank you for visiting Royal Salon & Spa! 🙏\n\n` +
        `Please find your bill attached.\n\n` +
        `Thank you for your support!`
      );
    });

    it('uses fallback customerName and storeName when not provided', () => {
      const billWithoutName = { ...mockBill, customerName: '' };
      const message = formatWhatsAppFriendlyMessage(billWithoutName, { storeName: '' });

      expect(message).toContain('Hello Customer, thank you for visiting our store! 🙏');
      expect(message).toContain('Please find your bill attached.');
      expect(message).toContain('Thank you for your support!');
    });
  });

  describe('Phone Number Sanitization', () => {
    it('prepends 91 to 10-digit phone numbers', () => {
      expect(sanitizePhoneNumber('9876543210')).toBe('919876543210');
    });

    it('strips non-digit characters correctly', () => {
      expect(sanitizePhoneNumber('+91 98765-43210')).toBe('919876543210');
      expect(sanitizePhoneNumber('(555) 123-4567')).toBe('915551234567');
    });

    it('handles empty or missing phone gracefully', () => {
      expect(sanitizePhoneNumber('')).toBe('');
    });
  });

  describe('StoreSettingsService Persistence', () => {
    it('loads default store config when nothing is stored', async () => {
      const config = await StoreSettingsService.getStoreConfig();
      expect(config.storeName).toBe('RC Electronics Hub');
      expect(config.googleReviewLink).toBe('');
    });

    it('saves and retrieves updated store configuration with googleReviewLink', async () => {
      const reviewUrl = 'https://g.page/r/redcat-custom-link/review';
      const updated = await StoreSettingsService.saveStoreConfig({
        storeName: 'Redcat Flagship Store',
        googleReviewLink: reviewUrl,
      });

      expect(updated.storeName).toBe('Redcat Flagship Store');
      expect(updated.googleReviewLink).toBe(reviewUrl);
      expect(updated.settings?.googleReviewLink).toBe(reviewUrl);

      // Verify cached retrieval
      const fetched = await StoreSettingsService.getStoreConfig();
      expect(fetched.storeName).toBe('Redcat Flagship Store');
      expect(fetched.googleReviewLink).toBe(reviewUrl);
    });
  });

  describe('PDF Generation and WhatsApp Sharing Flow', () => {
    it('generates PDF invoice via PrinterModule.generateBillPdf', async () => {
      const store = {
        storeName: 'Redcat Store',
        googleReviewLink: 'https://g.page/r/test',
      };

      const result = await generateBillPdf(mockBill, store);
      expect(NativeModules.PrinterModule.generateBillPdf).toHaveBeenCalledWith(
        mockBill,
        expect.objectContaining({
          storeName: 'Redcat Store',
          googleReviewLink: 'https://g.page/r/test',
        })
      );
      expect(result.filePath).toContain('.pdf');
    });

    it('orchestrates complete flow: generate PDF -> attach to WhatsApp -> send friendly message', async () => {
      const store = {
        storeName: 'Royal Boutique',
        googleReviewLink: 'https://g.page/r/royal-boutique/review',
      };

      const success = await sendBillViaWhatsAppWithPdf(mockBill, '9876543210', store);

      expect(success).toBe(true);

      // 1. PDF generated
      expect(NativeModules.PrinterModule.generateBillPdf).toHaveBeenCalledTimes(1);

      // 2. WhatsApp called with attached PDF path and friendly message with Google Review link
      expect(NativeModules.PrinterModule.sharePdfToWhatsApp).toHaveBeenCalledTimes(1);
      const [filePath, phone, message] =
        NativeModules.PrinterModule.sharePdfToWhatsApp.mock.calls[0];

      expect(filePath).toContain('.pdf');
      expect(phone).toBe('9876543210');
      expect(message).toContain('Hello Aarav Sharma, thank you for visiting Royal Boutique! 🙏');
      expect(message).toContain('Please find your bill attached.');
      expect(message).toContain('https://g.page/r/royal-boutique/review');
      expect(message).toContain('Thank you for your support!');
    });
  });
});
