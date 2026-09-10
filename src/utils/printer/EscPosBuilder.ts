import { BillItem, StoreSettings } from '@app/types';

export interface StorePrintInfo {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  gstin?: string;
  googleReviewLink?: string;
  settings?: StoreSettings;
}

export type PaperSize = '58mm' | '80mm';

export class EscPosBuilder {
  private buffer: number[] = [];
  private maxChars: number;
  private paperSize: PaperSize;

  constructor(paperSize: PaperSize = '58mm') {
    this.paperSize = paperSize;
    // 58mm typically has 32 chars per line, 80mm typically has 48 chars
    this.maxChars = paperSize === '58mm' ? 32 : 48;
    this.init();
  }

  init(): this {
    // ESC @ : Initialize printer
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  align(alignment: 'left' | 'center' | 'right'): this {
    // ESC a n : Align
    const n = alignment === 'center' ? 1 : alignment === 'right' ? 2 : 0;
    this.buffer.push(0x1b, 0x61, n);
    return this;
  }

  bold(enable: boolean = true): this {
    // ESC E n : Bold mode
    this.buffer.push(0x1b, 0x45, enable ? 1 : 0);
    return this;
  }

  size(textSize: 'normal' | 'doubleHeight' | 'doubleWidth' | 'large'): this {
    // GS ! n : Character size
    let n = 0x00;
    if (textSize === 'doubleHeight') {
      n = 0x01;
    } else if (textSize === 'doubleWidth') {
      n = 0x10;
    } else if (textSize === 'large') {
      n = 0x11;
    }
    this.buffer.push(0x1d, 0x21, n);
    return this;
  }

  underline(enable: boolean = true): this {
    // ESC - n : Underline mode
    this.buffer.push(0x1b, 0x2d, enable ? 1 : 0);
    return this;
  }

  text(str: string): this {
    // Clean currency and unicode for ESC/POS ASCII printers
    const safeStr = str.replace(/₹/g, 'Rs.');
    for (let i = 0; i < safeStr.length; i++) {
      const code = safeStr.charCodeAt(i);
      if (code < 128) {
        this.buffer.push(code);
      } else {
        // Unicode fallback to space
        this.buffer.push(0x20);
      }
    }
    return this;
  }

  line(str: string = ''): this {
    if (str) {
      this.text(str);
    }
    // LF (0x0A)
    this.buffer.push(0x0a);
    return this;
  }

  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0a);
    }
    return this;
  }

  divider(char: string = '-'): this {
    this.align('left');
    const repeated = char.repeat(this.maxChars).slice(0, this.maxChars);
    this.line(repeated);
    return this;
  }

  twoColumn(left: string, right: string): this {
    this.align('left');
    const safeLeft = left.replace(/₹/g, 'Rs.').trim();
    const safeRight = right.replace(/₹/g, 'Rs.').trim();

    const maxLen = this.maxChars;
    const rightLen = safeRight.length;

    if (rightLen >= maxLen) {
      this.line(safeLeft);
      this.line(safeRight);
      return this;
    }

    const availableForLeft = maxLen - rightLen - 1;
    let leftText = safeLeft;
    if (leftText.length > availableForLeft) {
      leftText = leftText.slice(0, Math.max(1, availableForLeft));
    }

    const spaces = maxLen - leftText.length - rightLen;
    this.line(leftText + ' '.repeat(Math.max(1, spaces)) + safeRight);
    return this;
  }

  threeColumn(col1: string, col2: string, col3: string): this {
    this.align('left');
    const safe1 = col1.replace(/₹/g, 'Rs.').trim();
    const safe2 = col2.replace(/₹/g, 'Rs.').trim();
    const safe3 = col3.replace(/₹/g, 'Rs.').trim();

    if (this.maxChars === 32) {
      // 58mm Paper: 32 columns
      if (safe1.length > 16) {
        this.line(safe1);
        const qStr = safe2.padStart(4);
        const pStr = safe3.padStart(11);
        const spaces = 32 - qStr.length - pStr.length;
        this.line(' '.repeat(Math.max(0, spaces)) + qStr + pStr);
      } else {
        const c1 = safe1.padEnd(16);
        const c2 = safe2.padStart(4);
        const c3 = safe3.padStart(12);
        this.line(c1 + c2 + c3);
      }
    } else {
      // 80mm Paper: 48 columns
      const w2 = 6;
      const w3 = 14;
      const w1 = 48 - w2 - w3;

      const c1 = safe1.length > w1 ? safe1.slice(0, w1 - 1) + ' ' : safe1.padEnd(w1);
      const c2 = safe2.padStart(w2);
      const c3 = safe3.padStart(w3);
      this.line(c1 + c2 + c3);
    }
    return this;
  }

  cut(): this {
    if (this.paperSize === '80mm') {
      this.feed(3);
      this.buffer.push(0x1d, 0x56, 0x42, 0x00);
    } else {
      // 58mm tear-off: feed 4 lines without sending invalid cut opcode
      this.feed(4);
    }
    return this;
  }

  toBase64(): string {
    const uint8Array = new Uint8Array(this.buffer);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i += 3) {
      const b1 = uint8Array[i];
      const b2 = i + 1 < len ? uint8Array[i + 1] : NaN;
      const b3 = i + 2 < len ? uint8Array[i + 2] : NaN;

      output += chars.charAt(b1 >> 2);
      output += chars.charAt(((b1 & 3) << 4) | (b2 >> 4));
      output += isNaN(b2) ? '=' : chars.charAt(((b2 & 15) << 2) | (b3 >> 6));
      output += isNaN(b3) ? '=' : chars.charAt(b3 & 63);
    }
    return output;
  }
}

/**
 * Builds a formatted ESC/POS receipt Base64 payload for a BillItem
 */
export const buildBillEscPos = (
  bill: BillItem,
  storeInfo: StorePrintInfo,
  paperSize: PaperSize = '58mm'
): string => {
  const p = new EscPosBuilder(paperSize);

  // Store Header
  p.align('center').bold(true);
  if (paperSize === '58mm') {
    p.size('doubleHeight');
  } else {
    p.size('large');
  }
  p.line(storeInfo.storeName || 'REDCAT BILLING');
  p.bold(false).size('normal');

  if (storeInfo.storeAddress) {
    p.line(storeInfo.storeAddress);
  }
  if (storeInfo.storePhone) {
    p.line(`Tel: ${storeInfo.storePhone}`);
  }
  if (storeInfo.gstin) {
    p.line(`GSTIN: ${storeInfo.gstin}`);
  }

  p.divider('=');

  // Metadata
  p.align('left');
  if (paperSize === '58mm') {
    p.twoColumn(`Bill: ${bill.billNumber}`, bill.date || '');
    p.twoColumn(`Time: ${bill.time || ''}`, bill.paymentMethod || 'Cash');
    if (bill.customerName && bill.customerName.toLowerCase() !== 'walk-in') {
      p.line(`Cust: ${bill.customerName}`);
    }
    if (bill.phone) {
      p.line(`Ph: ${bill.phone}`);
    }
  } else {
    p.twoColumn(`Bill: ${bill.billNumber}`, `Date: ${bill.date}`);
    p.twoColumn(`Time: ${bill.time}`, `Mode: ${bill.paymentMethod}`);
    p.twoColumn(`Cust: ${bill.customerName}`, `Ph: ${bill.phone}`);
    if (bill.staff) {
      p.line(`Staff: ${bill.staff}`);
    }
  }

  p.divider('-');

  // Itemized Table Header
  p.bold(true).threeColumn('ITEM', 'QTY', 'PRICE').bold(false);
  p.divider('-');

  // Items List
  bill.items.forEach(item => {
    const qtyStr = `${item.qty}`;
    const priceStr = `Rs.${item.price.toFixed(2)}`;
    p.threeColumn(item.name, qtyStr, priceStr);
  });

  p.divider('-');

  // Totals
  p.align('right');
  p.twoColumn('Subtotal:', `Rs.${bill.subtotal.toFixed(2)}`);
  if (bill.gst && bill.gst > 0) {
    p.twoColumn('GST (5%):', `Rs.${bill.gst.toFixed(2)}`);
  }

  p.divider('=');
  p.bold(true);
  if (paperSize === '58mm') {
    p.size('doubleHeight');
    p.twoColumn('TOTAL:', `Rs.${bill.grandTotal.toFixed(2)}`);
  } else {
    p.size('doubleHeight');
    p.twoColumn('GRAND TOTAL:', `Rs.${bill.grandTotal.toFixed(2)}`);
  }
  p.bold(false).size('normal');
  p.divider('=');

  // Footer & Barcode text
  p.align('center');
  p.line('Thank you for your visit!');
  if (bill.barcode) {
    p.line(`* ${bill.barcode} *`);
  }

  p.cut();
  return p.toBase64();
};

/**
 * Builds a sample Test Print slip
 */
export const buildTestSlipEscPos = (paperSize: PaperSize = '58mm'): string => {
  const p = new EscPosBuilder(paperSize);

  p.align('center').bold(true);
  if (paperSize === '58mm') {
    p.size('doubleHeight');
  } else {
    p.size('large');
  }
  p.line('REDCAT BILLING');
  p.bold(false).size('normal');
  p.line('Hardware Printer Test');
  p.divider('=');
  p.align('left');
  p.line('Status: PRINTER ONLINE');
  p.line(`Paper Width: ${paperSize}`);
  p.line('Connection: Direct Wi-Fi OK');
  p.line(`Time: ${new Date().toLocaleTimeString()}`);
  p.divider('-');
  p.align('center');
  p.bold(true).line('*** TEST SUCCESSFUL ***').bold(false);
  p.line('Ready for printing');
  p.cut();

  return p.toBase64();
};

/**
 * Builds an HTML receipt for Browser Print, Android System Print, and PDF export
 */
export const buildBillHtml = (
  bill: BillItem,
  storeInfo: StorePrintInfo,
  apiBill?: any
): string => {
  const storeName = apiBill?.store?.name || storeInfo.storeName || 'REDCAT BILLING';
  const storeAddress = apiBill?.store?.address || storeInfo.storeAddress || '';
  const storePhone = apiBill?.store?.phone || storeInfo.storePhone || '';
  const gstin = apiBill?.store?.gstin || storeInfo.gstin || '';

  const receiptTitle = apiBill?.receipt_title || 'TAX INVOICE / RECEIPT';
  const billNo = apiBill?.bill_number || bill.billNumber;
  const clientBillId = apiBill?.client_bill_id || '';
  const dateStr = apiBill?.date || bill.date;
  const timeStr = apiBill?.time || bill.time;
  const statusStr = (apiBill?.status || bill.status || 'PAID').toUpperCase();

  const customerName = apiBill?.customer?.name || bill.customerName || 'Walk-in Customer';
  const customerPhone = apiBill?.customer?.phone || bill.phone || '';
  const staffName = apiBill?.staff?.name || bill.staff || 'Staff';

  const subtotal = apiBill?.subtotal !== undefined ? Number(apiBill.subtotal) : bill.subtotal;
  const discountVal = apiBill?.discount !== undefined ? Number(apiBill.discount) : 0;
  const taxableAmount = apiBill?.taxable_amount !== undefined ? Number(apiBill.taxable_amount) : subtotal;
  const taxTotal = apiBill?.tax !== undefined ? Number(apiBill.tax) : bill.gst;
  const cgstVal = apiBill?.cgst !== undefined ? Number(apiBill.cgst) : 0;
  const sgstVal = apiBill?.sgst !== undefined ? Number(apiBill.sgst) : 0;
  const igstVal = apiBill?.igst !== undefined ? Number(apiBill.igst) : 0;
  const roundingVal = apiBill?.rounding !== undefined ? Number(apiBill.rounding) : 0;
  const grandTotal = apiBill?.grand_total !== undefined ? Number(apiBill.grand_total) : bill.grandTotal;

  const paymentMethod = (apiBill?.payment?.method || bill.paymentMethod || 'UPI').toUpperCase();
  const paymentStatus = (apiBill?.payment?.status || statusStr).toUpperCase();
  const paymentRef = apiBill?.payment?.reference || '';

  const footerSubnote = apiBill?.receipt_footer_subnote || 'Please retain this receipt for your records.';
  const invoiceFooterNote = apiBill?.invoice_footer_note || '🙏 Thank you for your visit!';
  const barcodeValue = apiBill?.barcode || bill.barcode || `rc-${billNo.replace(/[^a-zA-Z0-9]/g, '')}`;

  // Build items rows
  const items: any[] = apiBill?.items && apiBill.items.length > 0 ? apiBill.items : bill.items;
  const itemsHtml = items
    .map((item: any) => {
      const name = item.name || 'Item';
      const qty = item.quantity !== undefined ? item.quantity : item.qty;
      const unitPrice = item.unit_price !== undefined ? Number(item.unit_price) : item.price;
      const lineTotal = item.total !== undefined ? Number(item.total) : qty * unitPrice;
      const itemType = item.item_type || item.type;
      const itemDisc = Number(item.discount || 0);
      const taxRate = item.tax_rate !== undefined ? `${item.tax_rate}%` : '';

      return `
      <tr>
        <td style="padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-weight: 500;">
          <div>${name}</div>
          ${itemType || taxRate ? `<div style="font-size: 10px; color: #64748b;">${[itemType, taxRate].filter(Boolean).join(' • ')}</div>` : ''}
        </td>
        <td style="padding: 6px 0; text-align: center; border-bottom: 1px dashed #e2e8f0;">${qty}</td>
        <td style="padding: 6px 0; text-align: right; border-bottom: 1px dashed #e2e8f0;">₹${unitPrice.toFixed(2)}</td>
        <td style="padding: 6px 0; text-align: right; border-bottom: 1px dashed #e2e8f0; font-weight: 600;">
          ₹${lineTotal.toFixed(2)}
          ${itemDisc > 0 ? `<div style="font-size: 10px; color: #16a34a;">-₹${itemDisc.toFixed(2)}</div>` : ''}
        </td>
      </tr>
    `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${receiptTitle} - ${billNo}</title>
        <style>
          @page {
            size: auto;
            margin: 8mm 10mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 12px;
            font-size: 12.5px;
            line-height: 1.45;
            background-color: #f8fafc;
          }
          .receipt-box {
            max-width: 420px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          .header { text-align: center; margin-bottom: 12px; }
          .receipt-title { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #475569; margin: 0 0 4px 0; text-transform: uppercase; }
          .store-name { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
          .store-info { font-size: 11px; color: #64748b; margin: 2px 0; }
          .divider { border-top: 1px dashed #94a3b8; margin: 12px 0; }
          .meta-grid { display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px; }
          .meta-label { color: #64748b; }
          .meta-val { font-weight: 600; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { text-align: left; font-size: 10.5px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          .total-row { display: flex; justify-content: space-between; margin-top: 5px; font-size: 12px; }
          .total-row.tax-detail { font-size: 11px; color: #64748b; }
          .grand-total {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 2px solid #0f172a;
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
          }
          .payment-badge {
            background-color: #f1f5f9;
            padding: 8px 12px;
            border-radius: 6px;
            margin-top: 12px;
            font-size: 11.5px;
          }
          .footer { text-align: center; margin-top: 18px; font-size: 11px; color: #64748b; }
          .barcode-container { text-align: center; margin-top: 14px; }
          .barcode-val { font-family: monospace; font-size: 11px; color: #475569; letter-spacing: 2px; }

          /* Print-specific CSS: Hide application navigation, show only clean bill */
          @media print {
            nav, header, footer, .no-print, .action-buttons, button {
              display: none !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            .receipt-box {
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              padding: 0 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div class="receipt-title">${receiptTitle}</div>
            <h1 class="store-name">${storeName}</h1>
            ${storeAddress ? `<p class="store-info">${storeAddress}</p>` : ''}
            ${storePhone ? `<p class="store-info">Phone: ${storePhone}</p>` : ''}
            ${gstin ? `<p class="store-info">GSTIN: ${gstin}</p>` : ''}
          </div>

          <div class="divider"></div>

          <div class="meta-grid">
            <div><span class="meta-label">Bill No:</span> <span class="meta-val">${billNo}</span></div>
            <div><span class="meta-label">Date:</span> <span class="meta-val">${dateStr}</span></div>
          </div>
          ${clientBillId ? `
          <div class="meta-grid">
            <div><span class="meta-label">Ref ID:</span> <span class="meta-val">${clientBillId}</span></div>
            <div><span class="meta-label">Status:</span> <span class="meta-val">${statusStr}</span></div>
          </div>` : ''}
          <div class="meta-grid">
            <div><span class="meta-label">Customer:</span> <span class="meta-val">${customerName}</span></div>
            <div><span class="meta-label">Time:</span> <span class="meta-val">${timeStr}</span></div>
          </div>
          <div class="meta-grid">
            <div><span class="meta-label">Phone:</span> <span class="meta-val">${customerPhone || 'Walk-in'}</span></div>
            <div><span class="meta-label">Staff:</span> <span class="meta-val">${staffName}</span></div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th style="width: 48%;">Item</th>
                <th style="width: 12%; text-align: center;">Qty</th>
                <th style="width: 20%; text-align: right;">Rate</th>
                <th style="width: 20%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
          ${discountVal > 0 ? `
          <div class="total-row" style="color: #16a34a;">
            <span>Discount Applied:</span>
            <span>-₹${discountVal.toFixed(2)}</span>
          </div>` : ''}
          ${taxableAmount > 0 && taxableAmount !== subtotal ? `
          <div class="total-row">
            <span>Taxable Amount:</span>
            <span>₹${taxableAmount.toFixed(2)}</span>
          </div>` : ''}
          ${cgstVal > 0 ? `
          <div class="total-row tax-detail">
            <span>CGST:</span>
            <span>₹${cgstVal.toFixed(2)}</span>
          </div>` : ''}
          ${sgstVal > 0 ? `
          <div class="total-row tax-detail">
            <span>SGST:</span>
            <span>₹${sgstVal.toFixed(2)}</span>
          </div>` : ''}
          ${igstVal > 0 ? `
          <div class="total-row tax-detail">
            <span>IGST:</span>
            <span>₹${igstVal.toFixed(2)}</span>
          </div>` : ''}
          <div class="total-row">
            <span>Total Tax:</span>
            <span>₹${taxTotal.toFixed(2)}</span>
          </div>
          ${roundingVal !== 0 ? `
          <div class="total-row">
            <span>Rounding:</span>
            <span>₹${roundingVal.toFixed(2)}</span>
          </div>` : ''}

          <div class="grand-total">
            <span>Grand Total:</span>
            <span>₹${grandTotal.toFixed(2)}</span>
          </div>

          <div class="payment-badge">
            <div style="display: flex; justify-content: space-between;">
              <span><strong>Payment Mode:</strong> ${paymentMethod}</span>
              <span><strong>Status:</strong> ${paymentStatus}</span>
            </div>
            ${paymentRef ? `<div style="font-size: 10px; color: #64748b; margin-top: 4px;">Ref: ${paymentRef}</div>` : ''}
          </div>

          <div class="footer">
            <p style="margin: 0; font-weight: 600; color: #0f172a;">${invoiceFooterNote}</p>
            <p style="margin: 3px 0;">${footerSubnote}</p>
          </div>

          ${barcodeValue ? `
          <div class="barcode-container">
            <div class="barcode-val">${barcodeValue}</div>
          </div>` : ''}
        </div>
      </body>
    </html>
  `;
};
