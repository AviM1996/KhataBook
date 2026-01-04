/**
 * SMS Service
 * Sends SMS through mobile SMS gateway
 * Deducts balance from mobile SMS balance
 */

/**
 * Send SMS to customer
 * @param {string} phoneNumber - Customer phone number
 * @param {string} message - SMS message
 * @returns {Promise<{success: boolean, messageId?: string, balance?: number}>}
 */
export async function sendSMS(phoneNumber, message) {
  try {
    // Format phone number (remove spaces, ensure country code)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!formattedPhone) {
      throw new Error("Invalid phone number");
    }

    // Check SMS balance (this would be stored in localStorage or backend)
    const smsBalance = getSMSBalance();
    if (smsBalance <= 0) {
      throw new Error("Insufficient SMS balance. Please recharge.");
    }

    // Send SMS using Web SMS API or mobile gateway
    // For web apps, you can use:
    // 1. Twilio API
    // 2. AWS SNS
    // 3. Local SMS gateway (if running on mobile device)
    // 4. Browser SMS API (if available)
    
    const result = await sendSMSViaGateway(formattedPhone, message);
    
    // Deduct SMS balance (1 SMS = 1 unit)
    deductSMSBalance(1);
    
    return {
      success: true,
      messageId: result.messageId,
      balance: getSMSBalance(),
    };
  } catch (error) {
    console.error("SMS Error:", error);
    throw error;
  }
}

/**
 * Format phone number to include country code
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // If starts with 0, remove it
  const withoutZero = cleaned.startsWith("0") ? cleaned.slice(1) : cleaned;
  
  // If doesn't start with country code, add +91 (India)
  if (withoutZero.length === 10) {
    return `+91${withoutZero}`;
  } else if (withoutZero.startsWith("91") && withoutZero.length === 12) {
    return `+${withoutZero}`;
  } else if (withoutZero.startsWith("+91")) {
    return withoutZero;
  }
  
  return `+91${withoutZero}`;
}

/**
 * Send SMS via gateway
 * This is a placeholder - integrate with your SMS provider
 */
async function sendSMSViaGateway(phoneNumber, message) {
  // Remove + from phone number for SMS link
  const cleanPhone = phoneNumber.replace(/^\+/, "");
  
  // Option 1: Use SMS link (works on mobile and desktop)
  // This opens the native SMS app with pre-filled number and message
  const smsLink = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
  
  // Try to open SMS link
  // On mobile devices, this will open the native SMS app
  // On desktop, it may open a default SMS client or do nothing
  try {
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = smsLink;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Return success after a short delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return { messageId: `sms_${Date.now()}` };
  } catch (err) {
    console.error("SMS link error:", err);
    // Fallback: try window.location
    try {
      window.location.href = smsLink;
      await new Promise(resolve => setTimeout(resolve, 100));
      return { messageId: `sms_${Date.now()}` };
    } catch (err2) {
      console.error("SMS fallback error:", err2);
      throw new Error("Unable to open SMS app. Please send SMS manually.");
    }
  }
}

/**
 * Get SMS balance from localStorage
 */
export function getSMSBalance() {
  const balance = localStorage.getItem("sms_balance");
  return balance ? parseInt(balance, 10) : 100;
}

/**
 * Deduct SMS balance
 */
function deductSMSBalance(count = 1) {
  const current = getSMSBalance();
  const newBalance = Math.max(0, current - count);
  localStorage.setItem("sms_balance", newBalance.toString());
  return newBalance;
}

/**
 * Set SMS balance (for admin/recharge)
 */
export function setSMSBalance(balance) {
  localStorage.setItem("sms_balance", balance.toString());
}

/**
 * Generate SMS template for transaction
 */
export function generateTransactionSMS(customerName, type, amount, balance, note = "") {
  const transactionType = type === "CREDIT" ? "received" : "paid";
  const balanceText = balance >= 0 ? `Your balance: ₹${balance.toLocaleString("en-IN")}` : `You owe: ₹${Math.abs(balance).toLocaleString("en-IN")}`;
  
  let message = `Dear ${customerName},\n\n`;
  message += `You have ${transactionType} ₹${amount.toLocaleString("en-IN")}.\n`;
  if (note) {
    message += `Note: ${note}\n`;
  }
  message += `${balanceText}\n\n`;
  message += `Thank you,\nLedgerFlow`;
  
  return message;
}

/**
 * Generate reminder SMS
 */
export function generateReminderSMS(customerName, balance, reminderDate) {
  const balanceText = balance >= 0 
    ? `Your balance: ₹${balance.toLocaleString("en-IN")}` 
    : `You owe: ₹${Math.abs(balance).toLocaleString("en-IN")}`;
  
  let message = `Dear ${customerName},\n\n`;
  message += `This is a reminder about your account.\n`;
  message += `${balanceText}\n`;
  if (reminderDate) {
    message += `Reminder Date: ${reminderDate}\n`;
  }
  message += `\nPlease clear your dues at the earliest.\n\n`;
  message += `Thank you,\nLedgerFlow`;
  
  return message;
}

