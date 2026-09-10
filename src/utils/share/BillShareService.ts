import { Linking, NativeModules, Share } from 'react-native';
import { BillItem } from '@app/types';
import { StorePrintInfo } from '../printer/EscPosBuilder';
import {
  DEFAULT_STORE_CONFIG,
  extractGoogleReviewLink,
  StoreProfileConfig,
  StoreSettingsService,
} from '../store/StoreSettingsService';

const { PrinterModule } = NativeModules;

export const DEFAULT_STORE_INFO: StoreProfileConfig = DEFAULT_STORE_CONFIG;

/**
 * Sanitizes phone number by stripping spaces, dashes, parentheses.
 * Automatically adds '91' country code if 10-digit mobile is provided.
 */
export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
};

/**
 * Formats a friendly customer greeting for WhatsApp with PDF bill attached
 * and optional Google Review link from store configuration.
 *
 * If googleReviewLink is not configured, the review paragraph is cleanly omitted
 * without displaying empty or broken links.
 */
export const formatWhatsAppFriendlyMessage = (
  bill: BillItem,
  storeInfo?: StorePrintInfo | StoreProfileConfig
): string => {
  const customerName = bill.customerName?.trim() || 'Customer';
  const storeName = storeInfo?.storeName?.trim() || 'our store';
  const googleReviewLink = extractGoogleReviewLink(storeInfo);

  const reviewSection = googleReviewLink
    ? `\n\nWe'd love to hear your feedback. Please rate us on Google:\n${googleReviewLink}`
    : '';

  return `Hello ${customerName}, thank you for visiting ${storeName}! 🙏\n\nPlease find your bill attached.${reviewSection}\n\nThank you for your support!`;
};

/**
 * Formats a clean, readable, professional receipt text for WhatsApp with emojis.
 * Kept for full receipt text view or text-only sharing fallback.
 */
export const formatBillForWhatsApp = (
  bill: BillItem,
  storeInfo: StorePrintInfo | StoreProfileConfig = DEFAULT_STORE_INFO
): string => {
  const isDollar = bill.billNumber === '#0001';
  const sym = isDollar ? '$' : '₹';

  const itemsList = bill.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}*\n   ${item.qty} x ${sym}${item.price.toFixed(2)} = *${sym}${(item.qty * item.price).toFixed(2)}*`
    )
    .join('\n');

  const googleReviewLink = extractGoogleReviewLink(storeInfo);
  const reviewText = googleReviewLink
    ? `\n────────────────────────\n⭐ *Rate us on Google:*\n${googleReviewLink}`
    : '';

  return (
    `🧾 *${(storeInfo.storeName || 'REDCAT BILLING').toUpperCase()}*\n` +
    `${storeInfo.storeAddress ? `📍 ${storeInfo.storeAddress}\n` : ''}` +
    `${storeInfo.storePhone ? `📞 Tel: ${storeInfo.storePhone}\n` : ''}` +
    `${storeInfo.gstin ? `🏷️ GSTIN: ${storeInfo.gstin}\n` : ''}` +
    `────────────────────────\n` +
    `*TAX INVOICE / RECEIPT*\n` +
    `*Bill No:* ${bill.billNumber}\n` +
    `*Date & Time:* ${bill.date} ${bill.time}\n` +
    `*Customer:* ${bill.customerName || 'Guest User'}\n` +
    `*Phone:* ${bill.phone || 'N/A'}\n` +
    `*Payment Mode:* ${bill.paymentMethod} (${bill.status})\n` +
    `${bill.staff ? `*Attended by:* ${bill.staff}\n` : ''}` +
    `────────────────────────\n` +
    `*ORDER ITEMS:*\n` +
    `${itemsList}\n` +
    `────────────────────────\n` +
    `*Subtotal:* ${sym}${bill.subtotal.toFixed(2)}\n` +
    `*GST (Tax):* ${sym}${bill.gst.toFixed(2)}\n` +
    `*GRAND TOTAL:* *${sym}${bill.grandTotal.toFixed(2)}*\n` +
    `────────────────────────\n` +
    `🙏 *Thank you for your visit!*\n` +
    `Please visit us again soon.` +
    reviewText
  );
};

/**
 * Generates a high-quality PDF bill using the Android native PrinterModule.
 */
export const generateBillPdf = async (
  bill: BillItem,
  storeInfo?: StorePrintInfo | StoreProfileConfig
): Promise<{ filePath: string; uri: string; fileName: string }> => {
  const resolvedStore = storeInfo || (await StoreSettingsService.getStoreConfig());

  if (PrinterModule?.generateBillPdf) {
    return await PrinterModule.generateBillPdf(bill, {
      ...resolvedStore,
      googleReviewLink: extractGoogleReviewLink(resolvedStore),
    });
  }

  throw new Error('PrinterModule.generateBillPdf is not available on this platform');
};

/**
 * Sends the completed bill as an attached PDF via WhatsApp with a friendly message
 * and the store's configured Google Review link.
 *
 * Final flow:
 * Completed Bill -> Generate PDF -> Attach PDF to WhatsApp -> Send friendly message with Google Review link (if configured)
 */
export const sendBillViaWhatsAppWithPdf = async (
  bill: BillItem,
  phone?: string,
  storeInfo?: StorePrintInfo | StoreProfileConfig
): Promise<boolean> => {
  const targetPhone = phone || bill.phone || '';
  const resolvedStore = storeInfo || (await StoreSettingsService.getStoreConfig());
  const friendlyMessage = formatWhatsAppFriendlyMessage(bill, resolvedStore);

  try {
    if (PrinterModule?.generateBillPdf && PrinterModule?.sharePdfToWhatsApp) {
      // 1. Generate PDF
      const pdfResult = await PrinterModule.generateBillPdf(bill, {
        ...resolvedStore,
        googleReviewLink: extractGoogleReviewLink(resolvedStore),
      });

      // 2. Attach PDF to WhatsApp & send with friendly message
      await PrinterModule.sharePdfToWhatsApp(
        pdfResult.filePath,
        targetPhone,
        friendlyMessage
      );
      return true;
    }
  } catch (error) {
    console.warn('Native PDF WhatsApp share failed, falling back to URL sharing:', error);
  }

  // Graceful fallback to text-based WhatsApp share if native PDF sharing fails or is unavailable
  return await sendBillViaWhatsApp(targetPhone, friendlyMessage);
};

/**
 * Sends bill text directly to the customer's WhatsApp number.
 * Falls back to WhatsApp web link or native Share dialog if needed.
 */
export const sendBillViaWhatsApp = async (
  phone: string,
  message: string
): Promise<boolean> => {
  const cleanPhone = sanitizePhoneNumber(phone);
  const encodedText = encodeURIComponent(message);

  const appUrl = cleanPhone
    ? `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`
    : `whatsapp://send?text=${encodedText}`;

  const webUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  try {
    const canOpen = await Linking.canOpenURL(appUrl);
    if (canOpen) {
      await Linking.openURL(appUrl);
      return true;
    } else {
      await Linking.openURL(webUrl);
      return true;
    }
  } catch {
    // Fallback to standard share sheet
    await Share.share({
      message,
      title: 'Bill Receipt',
    });
    return true;
  }
};

/**
 * Shares the bill PDF via general system share sheet (Email, Drive, Telegram, etc.)
 */
export const shareBillPdfGeneral = async (
  bill: BillItem,
  storeInfo?: StorePrintInfo | StoreProfileConfig
): Promise<void> => {
  const resolvedStore = storeInfo || (await StoreSettingsService.getStoreConfig());
  const friendlyMessage = formatWhatsAppFriendlyMessage(bill, resolvedStore);

  if (PrinterModule?.generateBillPdf && PrinterModule?.sharePdfGeneral) {
    try {
      const pdfResult = await PrinterModule.generateBillPdf(bill, {
        ...resolvedStore,
        googleReviewLink: extractGoogleReviewLink(resolvedStore),
      });
      await PrinterModule.sharePdfGeneral(
        pdfResult.filePath,
        `Bill ${bill.billNumber}`,
        friendlyMessage
      );
      return;
    } catch (err) {
      console.warn('Native general PDF share failed:', err);
    }
  }

  // Fallback to text share
  await shareBillGeneral(bill, resolvedStore);
};

/**
 * Standard system share sheet for sharing text to other apps (Email, Telegram, SMS, etc.)
 */
export const shareBillGeneral = async (
  bill: BillItem,
  storeInfo: StorePrintInfo | StoreProfileConfig = DEFAULT_STORE_INFO
): Promise<void> => {
  const message = formatBillForWhatsApp(bill, storeInfo);
  await Share.share({
    message,
    title: `Bill ${bill.billNumber} Receipt`,
  });
};
