import { instance } from '../src/utils/server/instance';
import {
  createBillApi,
  finalizeBillApi,
  getBillByIdApi,
  getBillHistoryApi,
  recordPaymentApi,
  refundBillApi,
} from '../src/services/billing.service';
import { getDashboardApi } from '../src/services/reports.service';
import { getCatalogItemsApi, searchCatalogApi } from '../src/services/catalog.service';
import { getStaffApi } from '../src/services/staff.service';
import { getApiErrorMessage } from '../src/utils/helpers/apiError';
import { API } from '../src/utils/constants';
import { CreateBillDto, BillItem } from '../src/types';
import { buildBillHtml } from '../src/utils/printer/EscPosBuilder';
import { sanitizePhoneNumber } from '../src/utils/share/BillShareService';

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(),
}));

jest.mock('../src/utils/server/instance', () => ({
  instance: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

describe('eBill OpenAPI Services & Error Handling Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Home / Dashboard API Service', () => {
    it('should call GET /api/v1/dashboard without parameters when no date specified', async () => {
      const mockDashboardData = {
        date: '2026-09-09',
        store: {
          id: 'store-1',
          name: 'Royal Salon & Spa',
          store_type: 'salon',
          phone: '+919876543210',
          address: 'Shop 1, Salt Lake, Kolkata',
          is_active: true,
        },
        kpis: {
          today_sales: 12500,
          today_bills_count: 18,
          today_customers_count: 15,
          today_cash_sales: 4500,
          today_upi_sales: 7000,
          today_card_sales: 1000,
          today_refunds: 0,
          average_bill_value: 694.44,
          yesterday_sales: 11000,
          sales_growth_percentage: 13.6,
        },
        quick_stats: {
          low_stock_items_count: 2,
          printers_count: 2,
          default_printer: 'EPSON TM-T82',
        },
        system_status: {
          cloud_sync: { status: 'active', label: 'Cloud Sync Active' },
          memory: { used: '2.4GB', total: '4GB', percentage: 60 },
        },
        recent_activities: [
          {
            id: 'b-1',
            bill_number: 'INV-0001',
            customer_name: 'Rahul Sharma',
            amount: 1250,
            payment_method: 'upi',
            time: '14:30',
            status: 'paid',
          },
        ],
      };

      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { statusCode: 200, success: true, data: mockDashboardData },
      });

      const res = await getDashboardApi();
      expect(instance.get).toHaveBeenCalledWith(API.dashboard, { params: {} });
      expect(res.data.data.store.name).toBe('Royal Salon & Spa');
      expect(res.data.data.kpis.today_sales).toBe(12500);
    });

    it('should pass date query param when specified', async () => {
      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { success: true },
      });

      await getDashboardApi('2026-09-08');
      expect(instance.get).toHaveBeenCalledWith(API.dashboard, {
        params: { date: '2026-09-08' },
      });
    });
  });

  describe('Create Billing API Service (Strict OpenAPI CreateBillDto)', () => {
    it('should submit POST /api/v1/bills with required staff_id and items schema', async () => {
      const payload: CreateBillDto = {
        customer_name: 'John Doe',
        customer_phone: '+919876543210',
        staff_id: 'stf-01',
        items: [
          {
            catalog_item_id: 'svc-001',
            type: 'service',
            name: 'Haircut',
            quantity: 1,
            unit_price: 450,
            discount: 0,
            tax_rate: 18,
          },
        ],
        discount: 0,
        client_bill_id: 'MOB-12345',
        notes: 'VIP customer',
      };

      const mockBillResponse = {
        id: 'bill-123',
        bill_number: 'INV-0001',
        date: '2026-09-09',
        time: '14:35:12',
        status: 'paid',
        grand_total: '531.00',
      };

      (instance.post as jest.Mock).mockResolvedValueOnce({
        status: 201,
        data: { statusCode: 201, success: true, data: mockBillResponse },
      });

      const res = await createBillApi(payload);
      expect(instance.post).toHaveBeenCalledWith(API.bills.base, payload);
      expect(res.data.data.id).toBe('bill-123');
      expect(res.data.data.bill_number).toBe('INV-0001');
    });

    it('should call recordPaymentApi and finalizeBillApi with proper endpoints', async () => {
      (instance.post as jest.Mock)
        .mockResolvedValueOnce({ status: 200, data: { success: true } })
        .mockResolvedValueOnce({ status: 200, data: { success: true } });

      await recordPaymentApi('bill-123', {
        method: 'upi',
        amount: 531,
        status: 'paid',
      });
      expect(instance.post).toHaveBeenCalledWith(API.bills.payment('bill-123'), {
        method: 'upi',
        amount: 531,
        status: 'paid',
      });

      await finalizeBillApi('bill-123', { notes: 'Completed' });
      expect(instance.post).toHaveBeenCalledWith(API.bills.finalize('bill-123'), {
        notes: 'Completed',
      });
    });
  });

  describe('Billing History API Service (OpenAPI Query Params)', () => {
    it('should query GET /api/v1/bills with period shortcuts (today, this_week, this_month)', async () => {
      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { statusCode: 200, success: true, data: { items: [], total: 0 } },
      });

      await getBillHistoryApi({ period: 'today', limit: 50 });
      expect(instance.get).toHaveBeenCalledWith(API.bills.base, {
        params: { period: 'today', limit: 50 },
      });
    });

    it('should query GET /api/v1/bills with custom date range (from, to) and search keyword', async () => {
      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { statusCode: 200, success: true, data: { items: [], total: 0 } },
      });

      await getBillHistoryApi({
        period: 'custom',
        from: '2026-09-01',
        to: '2026-09-09',
        search: 'Rahul',
        limit: 100,
      });

      expect(instance.get).toHaveBeenCalledWith(API.bills.base, {
        params: {
          period: 'custom',
          from: '2026-09-01',
          to: '2026-09-09',
          search: 'Rahul',
          limit: 100,
        },
      });
    });

    it('should map legacy start_date and end_date to from and to for backward compatibility', async () => {
      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { statusCode: 200, success: true, data: [] },
      });

      await getBillHistoryApi({
        start_date: '2026-09-01',
        end_date: '2026-09-05',
      });

      expect(instance.get).toHaveBeenCalledWith(API.bills.base, {
        params: { from: '2026-09-01', to: '2026-09-05' },
      });
    });
  });

  describe('Catalog & Staff API Services', () => {
    it('should query active staff with status=active per OpenAPI documentation', async () => {
      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: [{ id: 'stf-1', name: 'Vikram Singh', role: 'Stylist' }],
      });

      await getStaffApi('active');
      expect(instance.get).toHaveBeenCalledWith(API.staff.base, {
        params: { status: 'active' },
      });
    });

    it('should query catalog with active_only=true per OpenAPI documentation', async () => {
      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: [{ id: 'cat-1', name: 'Coffee', selling_price: '450.00' }],
      });

      await getCatalogItemsApi({ active_only: true });
      expect(instance.get).toHaveBeenCalledWith(API.catalog.base, {
        params: { active_only: true },
      });
    });
  });

  describe('API Error Normalization Utility (getApiErrorMessage)', () => {
    it('should format NestJS class-validator array of error strings', () => {
      const err = {
        response: {
          status: 400,
          data: {
            statusCode: 400,
            message: ['staff_id should not be empty', 'items must contain at least 1 item'],
          },
        },
      };

      const msg = getApiErrorMessage(err);
      expect(msg).toBe('staff_id should not be empty, items must contain at least 1 item');
    });

    it('should handle 401 unauthorized gracefully', () => {
      const err = {
        response: {
          status: 401,
          data: {},
        },
      };

      const msg = getApiErrorMessage(err);
      expect(msg).toContain('Authentication required or session expired');
    });

    it('should handle 404 not found gracefully', () => {
      const err = {
        response: {
          status: 404,
          data: {},
        },
      };

      const msg = getApiErrorMessage(err);
      expect(msg).toContain('The requested record or endpoint was not found');
    });

    it('should handle network failure gracefully', () => {
      const err = {
        message: 'Network Error',
      };

      const msg = getApiErrorMessage(err);
      expect(msg).toContain('Unable to reach the server. Please verify your internet connection.');
    });

    it('should handle timeout errors gracefully', () => {
      const err = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
      };

      const msg = getApiErrorMessage(err);
      expect(msg).toContain('Connection timed out');
    });
  });

  describe('Billing Creation → Bill Preview Flow & Receipts', () => {
    it('should fetch authoritative bill details using getBillByIdApi', async () => {
      const mockBill = {
        id: 'bill-999',
        bill_number: 'INV-0999',
        date: '2026-09-09',
        time: '15:00:00',
        status: 'paid',
        store: {
          name: 'RC BILLING CORP',
          address: 'Tech Park, Sector V',
          phone: '+919876543210',
          gstin: '22AAAAA0000A1Z5',
        },
        customer: {
          name: 'Priya Patel',
          phone: '+919876543210',
        },
        staff: {
          name: 'Vikram Singh',
        },
        items: [
          {
            id: 'item-1',
            name: 'Deluxe Facial',
            quantity: 1,
            unit_price: '1200.00',
            discount: '100.00',
            tax_rate: '18',
            tax_amount: '198.00',
            total: '1298.00',
          },
        ],
        subtotal: '1200.00',
        discount: '100.00',
        taxable_amount: '1100.00',
        tax: '198.00',
        cgst: '99.00',
        sgst: '99.00',
        igst: '0.00',
        rounding: '0.00',
        grand_total: '1298.00',
        payment: {
          method: 'upi',
          amount: '1298.00',
          status: 'paid',
          reference: 'UPI/987654321',
        },
        receipt_title: 'TAX INVOICE / RECEIPT',
        invoice_footer_note: '🙏 Thank you for your visit!',
        barcode: 'rc-inv-0999',
      };

      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { statusCode: 200, success: true, data: mockBill },
      });

      const res = await getBillByIdApi('bill-999');
      expect(instance.get).toHaveBeenCalledWith(API.bills.byId('bill-999'));
      expect(res.data.data.id).toBe('bill-999');
      expect(res.data.data.grand_total).toBe('1298.00');
      expect(res.data.data.store.name).toBe('RC BILLING CORP');
      expect(res.data.data.customer.name).toBe('Priya Patel');
    });

    it('should generate printable HTML containing @media print and authoritative tax details', () => {
      const sampleBill: BillItem = {
        id: '1',
        billNumber: 'INV-0001',
        customerName: 'Rahul Sharma',
        phone: '+919876543210',
        dateTime: '2026-09-09 14:30',
        dateSection: 'Today',
        time: '14:30:00',
        date: '2026-09-09',
        paymentMethod: 'UPI',
        amount: 1240.0,
        status: 'PAID',
        staff: 'Vikram',
        items: [{ id: 'p-1', name: 'Hair Spa', qty: 1, price: 1000 }],
        subtotal: 1000,
        gst: 180,
        grandTotal: 1180,
      };

      const storeInfo = {
        storeName: 'ROYAL SALON',
        storeAddress: '123 Avenue',
        storePhone: '+919876543210',
        gstin: '22AAAAA0000A1Z5',
      };

      const apiBill = {
        subtotal: '1000.00',
        discount: '50.00',
        taxable_amount: '950.00',
        tax: '171.00',
        cgst: '85.50',
        sgst: '85.50',
        grand_total: '1121.00',
        receipt_title: 'TAX INVOICE',
        invoice_footer_note: 'Thank you for visiting us!',
      };

      const html = buildBillHtml(sampleBill, storeInfo, apiBill);

      expect(html).toContain('@media print');
      expect(html).toContain('ROYAL SALON');
      expect(html).toContain('TAX INVOICE');
      expect(html).toContain('INV-0001');
      expect(html).toContain('CGST');
      expect(html).toContain('85.50');
      expect(html).toContain('SGST');
      expect(html).toContain('1121.00');
      expect(html).toContain('Thank you for visiting us!');
    });

    it('should sanitize phone number and format dynamic WhatsApp message', () => {
      const phone = '+91 98765 43210';
      const cleanPhone = sanitizePhoneNumber(phone);
      expect(cleanPhone).toBe('919876543210');

      const tenDigit = '9876543210';
      expect(sanitizePhoneNumber(tenDigit)).toBe('919876543210');

      const storeName = 'RC BILLING CORP';
      const billNo = 'INV-0001';
      const grandTotalFormatted = '₹3,363.00';
      const msg = `${storeName}\n\nBill: ${billNo}\nDate: 06-Sep-2026\nTotal: ${grandTotalFormatted}\nPayment: Paid\n\nThank you for your visit!`;

      expect(msg).toContain('RC BILLING CORP');
      expect(msg).toContain('Bill: INV-0001');
      expect(msg).toContain('Total: ₹3,363.00');
      expect(msg).toContain('Payment: Paid');
      expect(msg).toContain('Thank you for your visit!');
    });
  });
});
