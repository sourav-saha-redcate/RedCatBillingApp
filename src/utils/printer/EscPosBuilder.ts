import { BillItem } from '@app/types';

export interface StorePrintInfo {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  gstin?: string;
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
 * Builds an HTML receipt for Android System Print / PDF export
 */
export const buildBillHtml = (bill: BillItem, storeInfo: StorePrintInfo): string => {
  const itemsHtml = bill.items
    .map(
      item => `
      <tr>
        <td style="padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-weight: 500;">${item.name}</td>
        <td style="padding: 6px 0; text-align: center; border-bottom: 1px dashed #e2e8f0;">${item.qty}</td>
        <td style="padding: 6px 0; text-align: right; border-bottom: 1px dashed #e2e8f0; font-weight: 600;">₹${item.price.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt ${bill.billNumber}</title>
        <style>
          @page { size: auto; margin: 12mm 15mm; }
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 10px;
            font-size: 13px;
            line-height: 1.4;
          }
          .receipt-box {
            max-width: 380px;
            margin: 0 auto;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 18px;
          }
          .header { text-align: center; margin-bottom: 12px; }
          .store-name { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
          .store-info { font-size: 11px; color: #64748b; margin: 2px 0; }
          .divider { border-top: 1px dashed #94a3b8; margin: 12px 0; }
          .meta-grid { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
          .meta-label { color: #64748b; }
          .meta-val { font-weight: 600; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          .total-row { display: flex; justify-content: space-between; margin-top: 5px; font-size: 12px; }
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
          .footer { text-align: center; margin-top: 18px; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <h1 class="store-name">${storeInfo.storeName || 'REDCAT BILLING'}</h1>
            ${storeInfo.storeAddress ? `<p class="store-info">${storeInfo.storeAddress}</p>` : ''}
            ${storeInfo.storePhone ? `<p class="store-info">Phone: ${storeInfo.storePhone}</p>` : ''}
            ${storeInfo.gstin ? `<p class="store-info">GSTIN: ${storeInfo.gstin}</p>` : ''}
          </div>

          <div class="divider"></div>

          <div class="meta-grid">
            <div><span class="meta-label">Bill No:</span> <span class="meta-val">${bill.billNumber}</span></div>
            <div><span class="meta-label">Date:</span> <span class="meta-val">${bill.date}</span></div>
          </div>
          <div class="meta-grid">
            <div><span class="meta-label">Customer:</span> <span class="meta-val">${bill.customerName}</span></div>
            <div><span class="meta-label">Time:</span> <span class="meta-val">${bill.time}</span></div>
          </div>
          <div class="meta-grid">
            <div><span class="meta-label">Payment:</span> <span class="meta-val">${bill.paymentMethod}</span></div>
            <div><span class="meta-label">Staff:</span> <span class="meta-val">${bill.staff || 'Cashier'}</span></div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th style="width: 55%;">Item</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 30%; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${bill.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>GST (5%):</span>
            <span>₹${bill.gst.toFixed(2)}</span>
          </div>

          <div class="grand-total">
            <span>Grand Total:</span>
            <span>₹${bill.grandTotal.toFixed(2)}</span>
          </div>

          <div class="footer">
            <p style="margin: 0; font-weight: 600;">Thank you for shopping with us!</p>
            <p style="margin: 2px 0;">Please retain this receipt for any exchanges.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
