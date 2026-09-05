import { Linking, Share } from 'react-native';
import { BillItem } from '@app/types';
import { StorePrintInfo } from '../printer/EscPosBuilder';

export const DEFAULT_STORE_INFO: StorePrintInfo = {
  storeName: 'RC BILLING CORP',
  storeAddress: '123 Business Avenue, Tech Park',
  storePhone: '+1 (555) 812-3456',
  gstin: '22AAAAA0000A1Z5',
};

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
 * Formats a clean, readable, professional receipt text for WhatsApp with emojis.
 */
export const formatBillForWhatsApp = (
  bill: BillItem,
  storeInfo: StorePrintInfo = DEFAULT_STORE_INFO
): string => {
  const isDollar = bill.billNumber === '#0001';
  const sym = isDollar ? '$' : '₹';

  const itemsList = bill.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}*\n   ${item.qty} x ${sym}${item.price.toFixed(2)} = *${sym}${(item.qty * item.price).toFixed(2)}*`
    )
    .join('\n');

  return (
    `🧾 *${(storeInfo.storeName || 'RC BILLING CORP').toUpperCase()}*\n` +
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
    `Please visit us again soon.`
  );
};

/**
 * Sends the bill text directly to the customer's WhatsApp number.
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
  } catch (error) {
    // Fallback to standard share sheet
    await Share.share({
      message,
      title: 'Bill Receipt',
    });
    return true;
  }
};

/**
 * Standard system share sheet for sharing to other apps (Email, Telegram, SMS, etc.)
 */
export const shareBillGeneral = async (
  bill: BillItem,
  storeInfo: StorePrintInfo = DEFAULT_STORE_INFO
): Promise<void> => {
  const message = formatBillForWhatsApp(bill, storeInfo);
  await Share.share({
    message,
    title: `Bill ${bill.billNumber} Receipt`,
  });
};
