/**
 * RedCat E-Billing API TypeScript Models & Payloads
 * Based on OpenAPI 3.0 specification from https://ebill.rabbul.in/docs#/
 */

// --- General ---
export interface ApiSuccessResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// --- Store Types ---
export interface StoreType {
  id: string;
  name?: string;
  title?: string;
  icon?: string;
  icon_type?: string;
  features?: string[];
  description?: string;
  default_tax_rate?: number;
  isActive?: boolean;
  is_active?: boolean;
}

export interface CreateCustomStoreTypePayload {
  title: string;
  description?: string;
  default_tax_rate?: number;
}

// --- Store Profile & Tax Configuration ---
export interface StoreProfile {
  id: string;
  store_name: string;
  owner_name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  logo_url?: string;
  google_review_link?: string;
  currency?: string;
  timezone?: string;
}

export interface UpdateStoreProfilePayload {
  store_name?: string;
  owner_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  logo_url?: string;
  google_review_link?: string;
}

export interface TaxSettings {
  is_gst_enabled: boolean;
  gstin: string;
  is_composition_scheme: boolean;
  default_tax_rate: number;
  tax_slabs: number[];
}

export interface UpdateTaxSettingsPayload {
  is_gst_enabled?: boolean;
  gstin?: string;
  is_composition_scheme?: boolean;
  default_tax_rate?: number;
}

// --- Authentication ---
export interface VerifyResetOtpRequestPayload {
  identifier: string;
  otp: string;
}

export interface VerifyResetOtpResponse {
  success?: boolean;
  message?: string;
  token?: string;
  reset_token?: string;
  resetToken?: string;
  data?: {
    token?: string;
    reset_token?: string;
    resetToken?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ResetPasswordRequestPayload {
  identifier: string;
  token_or_otp?: string;
  new_password: string;
  otp?: string;
  code?: string;
  [key: string]: any;
}

export interface ResetPasswordResponse {
  success?: boolean;
  message?: string;
  [key: string]: any;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

// --- Staff ---
export type StaffRole = 'admin' | 'cashier' | 'staff' | 'manager' | 'stylist' | string;

export interface StaffMember {
  id: string;
  name: string;
  phone?: string;
  role: StaffRole;
  is_active: boolean;
  pin?: string;
  commission_rate?: number;
  created_at?: string;
}

export interface CreateStaffPayload {
  name: string;
  phone?: string;
  role: StaffRole;
  pin?: string;
  commission_rate?: number;
}

export interface UpdateStaffPayload {
  name?: string;
  phone?: string;
  role?: StaffRole;
  is_active?: boolean;
  pin?: string;
  commission_rate?: number;
}

// --- Customers ---
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  total_bills?: number;
  total_spent?: number;
  created_at?: string;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
}

// --- Categories ---
export interface Category {
  id: string;
  name: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
  items_count?: number;
}

export interface CreateCategoryPayload {
  name: string;
  icon?: string;
  display_order?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

// --- Catalog (Products & Services) ---
export type CatalogItemType = 'product' | 'service';

export interface CatalogItem {
  id: string;
  name: string;
  type: CatalogItemType;
  category_id: string;
  category_name?: string;
  price: number;
  cost_price?: number;
  sku?: string;
  barcode?: string;
  tax_rate?: number;
  unit?: string;
  track_inventory?: boolean;
  current_stock?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface CreateCatalogItemPayload {
  name: string;
  type: CatalogItemType;
  category_id: string;
  price: number;
  cost_price?: number;
  sku?: string;
  barcode?: string;
  tax_rate?: number;
  unit?: string;
  track_inventory?: boolean;
}

export interface UpdateCatalogItemPayload {
  name?: string;
  type?: CatalogItemType;
  category_id?: string;
  price?: number;
  cost_price?: number;
  sku?: string;
  barcode?: string;
  tax_rate?: number;
  unit?: string;
  track_inventory?: boolean;
  is_active?: boolean;
}

// --- Inventory ---
export interface InventoryItem {
  id: string;
  catalog_item_id: string;
  name: string;
  sku?: string;
  barcode?: string;
  current_stock: number;
  reorder_level?: number;
  unit?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  unit_cost?: number;
}

export interface InventorySummary {
  total_items: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_valuation: number;
}

export type StockAdjustmentType = 'purchase' | 'damage' | 'return' | 'audit';

export interface AdjustStockPayload {
  quantity_change: number;
  type: StockAdjustmentType;
  reason?: string;
  unit_cost?: number;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  item_name: string;
  quantity_change: number;
  type: StockAdjustmentType | 'sale' | 'refund';
  previous_stock: number;
  new_stock: number;
  reason?: string;
  created_at: string;
  created_by?: string;
}

// --- Billing (OpenAPI 3.0 Contract) ---
export interface CreateBillItemDto {
  catalog_item_id?: string;
  type?: 'product' | 'service' | 'manual';
  name?: string;
  quantity: number;
  unit_price?: number;
  discount?: number;
  tax_rate?: number;
}

export interface CreateBillDto {
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  staff_id: string;
  items: CreateBillItemDto[];
  discount?: number;
  client_bill_id?: string;
  notes?: string;
}

export interface BillStoreInfoDto {
  name: string;
  address: string;
  phone: string;
  gstin?: string | null;
}

export interface BillCustomerInfoDto {
  name: string;
  phone?: string | null;
}

export interface BillStaffInfoDto {
  name: string;
}

export interface BillItemResponseDto {
  id: string;
  catalog_item_id?: string | null;
  item_type: 'product' | 'service' | 'manual' | string;
  name: string;
  quantity: number;
  unit_price: string;
  discount: string;
  tax_rate: string;
  tax_amount: string;
  total: string;
  staff_id?: string | null;
}

export interface BillPaymentDto {
  method: string;
  amount: string;
  status: string;
  reference?: string | null;
}

export interface BillResponseDto {
  id: string;
  bill_number: string | null;
  client_bill_id?: string | null;
  date: string;
  time: string;
  status: 'pending' | 'paid' | 'partially_refunded' | 'refunded' | 'cancelled' | string;
  store: BillStoreInfoDto;
  customer?: BillCustomerInfoDto | null;
  staff?: BillStaffInfoDto | null;
  items: BillItemResponseDto[];
  subtotal: string;
  discount: string;
  taxable_amount: string;
  tax: string;
  cgst: string;
  sgst: string;
  igst: string;
  rounding: string;
  grand_total: string;
  payment?: BillPaymentDto | null;
  notes?: string | null;
  formatted_date_time?: string;
  receipt_title?: string;
  receipt_footer_subnote?: string | null;
  barcode?: string | null;
  invoice_footer_note?: string | null;
  formatted_receipt_text?: string;
}

export interface BillHistoryQueryParams {
  period?: 'today' | 'this_week' | 'this_month' | 'custom';
  from?: string;
  to?: string;
  status?: 'pending' | 'paid' | 'partially_refunded' | 'refunded' | 'cancelled' | string;
  payment_method?: 'cash' | 'upi' | 'card' | 'credit' | 'other' | string;
  staff_id?: string;
  customer_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BillHistoryResponseDto {
  items?: BillResponseDto[];
  bills?: BillResponseDto[];
  data?: BillResponseDto[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  kpis?: {
    total_sales?: number;
    bills_count?: number;
    cash_sales?: number;
    upi_sales?: number;
    card_sales?: number;
    refunds?: number;
  };
}

// Legacy compatibility aliases for Bill
export interface BillLineItemPayload {
  item_id: string;
  name: string;
  price: number;
  qty: number;
  staff_id?: string;
  tax_rate?: number;
}

export interface CreateBillPayload {
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  staff_id?: string;
  items: (BillLineItemPayload | CreateBillItemDto)[];
  discount?: number;
  discount_amount?: number;
  client_bill_id?: string;
  notes?: string;
}

export type PaymentMethodType = 'cash' | 'upi' | 'card' | 'credit' | 'split' | 'other';

export interface RecordPaymentPayload {
  payment_method: PaymentMethodType;
  amount: number | string;
  transaction_ref?: string;
}

export interface RecordPaymentDto {
  method: 'cash' | 'upi' | 'card' | 'credit' | 'other' | string;
  amount: string | number;
  status: 'paid' | string;
  reference?: string;
}

export interface FinalizeBillPayload {
  notes?: string;
}

export interface FinalizeBillDto {
  notes?: string;
}

export interface SendReceiptPayload {
  channel: 'whatsapp' | 'sms' | 'email';
  recipient?: string;
}

export interface RefundBillPayload {
  amount: number;
  reason: string;
  return_to_inventory: boolean;
}

export interface RefundBillDto {
  amount: number;
  reason: string;
  return_to_inventory?: boolean;
}

export interface BillRefund {
  id: string;
  bill_id: string;
  amount: number;
  reason: string;
  refunded_at: string;
  refunded_by?: string;
  refund_method?: string;
}

// --- Dashboard (OpenAPI 3.0 Contract) ---
export interface DashboardStoreInfoDto {
  id: string;
  name: string;
  store_type: string;
  phone: string;
  gstin?: string | null;
  address: string;
  is_active: boolean;
}

export interface DashboardKpiDto {
  today_sales: number;
  today_bills_count: number;
  today_customers_count: number;
  today_cash_sales: number;
  today_upi_sales: number;
  today_card_sales: number;
  today_refunds: number;
  average_bill_value: number;
  yesterday_sales: number;
  sales_growth_percentage: number;
}

export interface DashboardQuickStatsDto {
  low_stock_items_count: number;
  printers_count: number;
  default_printer?: string | null;
}

export interface DashboardCloudSyncStatusDto {
  status: string;
  label: string;
}

export interface DashboardMemoryStatusDto {
  used: string;
  total: string;
  percentage: number;
}

export interface DashboardSystemStatusDto {
  cloud_sync: DashboardCloudSyncStatusDto;
  memory: DashboardMemoryStatusDto;
}

export interface DashboardRecentActivityDto {
  id: string;
  bill_number: string;
  customer_name?: string | null;
  amount: number;
  payment_method?: string | null;
  time: string;
  date_label?: string;
  icon_type?: 'retail' | 'service' | 'medical' | string;
  status: string;
}

export interface DashboardResponseDto {
  date: string;
  store: DashboardStoreInfoDto;
  kpis: DashboardKpiDto;
  quick_stats: DashboardQuickStatsDto;
  system_status: DashboardSystemStatusDto;
  recent_activities: DashboardRecentActivityDto[];
}

// Legacy dashboard structure alias
export interface DashboardData {
  today_sales: number;
  today_bills_count: number;
  recent_bills: any[];
  top_items: { name: string; qty: number; revenue: number }[];
  low_stock_alerts: number;
  active_staff_count: number;
}

// --- Reports ---
export interface DailySummaryReport {
  date: string;
  total_revenue: number;
  total_bills: number;
  unique_customers: number;
  average_bill_value: number;
  peak_hour?: string;
  hourly_sales: { hour: string; amount: number; bills_count: number }[];
  payment_methods: { method: string; amount: number; count: number }[];
  top_services: { name: string; count: number; revenue: number }[];
}

export interface PeriodSalesReport {
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_bills: number;
  daily_breakdown: { date: string; revenue: number; bills: number }[];
  payment_breakdown: { method: string; amount: number }[];
}

export interface GstReportSlab {
  tax_rate: number;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_tax: number;
}

export interface GstReport {
  start_date: string;
  end_date: string;
  gstin?: string;
  total_sales: number;
  total_taxable: number;
  total_tax: number;
  slabs: GstReportSlab[];
}

export interface StaffPerformanceReport {
  start_date: string;
  end_date: string;
  staff: {
    staff_id: string;
    staff_name: string;
    bills_count: number;
    total_sales: number;
    commission_earned?: number;
  }[];
}

// --- Audit Logs ---
export interface AuditLogItem {
  id: string;
  actor_id: string;
  actor_name?: string;
  action: string;
  entity: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}

// --- Sync & Backup ---
export interface SyncStatus {
  is_online: boolean;
  last_synced_at?: string;
  pending_bills_count: number;
  pending_adjustments_count: number;
}

export interface SyncBatchPayload {
  bills: any[];
  inventory_adjustments: any[];
}

export interface BackupItem {
  id: string;
  filename: string;
  size_bytes: number;
  created_at: string;
  checksum?: string;
}
