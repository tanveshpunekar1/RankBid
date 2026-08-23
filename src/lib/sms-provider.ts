/**
 * Interface and implementations for sending Phone OTPs in India.
 * Default: MockSmsProvider (logs OTP to console & terminal for fast local testing).
 * Production: Supports MSG91 and Twilio Verify adapters.
 */

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  devCode?: string; // Included only in mock mode for instant UI testing
  error?: string;
}

export interface SmsProvider {
  sendOtp(phone: string, otp: string): Promise<SendOtpResult>;
}

export class MockSmsProvider implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<SendOtpResult> {
    console.log("=================================================");
    console.log(`[RankBid SMS Mock] 📱 OTP for ${phone}: ${otp}`);
    console.log(`[RankBid SMS Mock] Valid for 10 minutes.`);
    console.log("=================================================");
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      devCode: otp, // For convenient local dev testing
    };
  }
}

export class Msg91SmsProvider implements SmsProvider {
  private authKey: string;
  private templateId: string;

  constructor(authKey: string, templateId: string) {
    this.authKey = authKey;
    this.templateId = templateId;
  }

  async sendOtp(phone: string, otp: string): Promise<SendOtpResult> {
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const res = await fetch("https://control.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: this.authKey,
        },
        body: JSON.stringify({
          template_id: this.templateId,
          mobile: cleanPhone,
          otp: otp,
        }),
      });

      const data = await res.json();
      if (data.type === "success") {
        return { success: true, messageId: data.message };
      }
      return { success: false, error: data.message || "Failed to send OTP via MSG91" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown MSG91 error";
      return { success: false, error: message };
    }
  }
}

export class TwilioSmsProvider implements SmsProvider {
  private accountSid: string;
  private authToken: string;
  private verifyServiceSid?: string;

  constructor(accountSid: string, authToken: string, verifyServiceSid?: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.verifyServiceSid = verifyServiceSid;
  }

  async sendOtp(phone: string, otp: string): Promise<SendOtpResult> {
    try {
      // Basic Twilio HTTP REST dispatch
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

      const params = new URLSearchParams();
      params.append("To", formattedPhone);
      params.append("Body", `Your RankBid verification code is ${otp}. Valid for 10 minutes.`);
      if (this.verifyServiceSid) {
        params.append("From", this.verifyServiceSid);
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await res.json();
      if (res.ok) {
        return { success: true, messageId: data.sid };
      }
      return { success: false, error: data.message || "Twilio error" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown Twilio error";
      return { success: false, error: message };
    }
  }
}

export function getSmsProvider(): SmsProvider {
  const providerType = (process.env.SMS_PROVIDER || "mock").toLowerCase();

  if (providerType === "msg91" && process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
    return new Msg91SmsProvider(process.env.MSG91_AUTH_KEY, process.env.MSG91_TEMPLATE_ID);
  }

  if (providerType === "twilio" && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return new TwilioSmsProvider(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      process.env.TWILIO_VERIFY_SERVICE_SID
    );
  }

  return new MockSmsProvider();
}
