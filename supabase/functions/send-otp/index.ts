import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, otp, name } = await req.json().catch(() => ({}));

    if (!phone || !otp) {
      return new Response(JSON.stringify({ error: "Missing phone or otp parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91${cleanPhone.slice(-10)}`;

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID") || Deno.env.get("TWILIO_PHONE_NUMBER");

    let twilioSent = false;
    let twilioMessageSid = "";

    if (accountSid && authToken && messagingServiceSid) {
      try {
        const bodyText = `Your VaartaNow Classifieds verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        const params = new URLSearchParams();
        params.append("To", formattedPhone);
        if (messagingServiceSid.startsWith("MG")) {
          params.append("MessagingServiceSid", messagingServiceSid);
        } else {
          params.append("From", messagingServiceSid);
        }
        params.append("Body", bodyText);

        const authHeader = "Basic " + btoa(`${accountSid}:${authToken}`);

        const twilioRes = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": authHeader
          },
          body: params.toString()
        });

        if (twilioRes.ok) {
          const resData = await twilioRes.json();
          twilioSent = true;
          twilioMessageSid = resData.sid;
          console.log(`✅ Twilio SMS sent to ${formattedPhone}, SID: ${resData.sid}`);
        } else {
          const errText = await twilioRes.text();
          console.warn("Twilio SMS send error:", twilioRes.status, errText);
        }
      } catch (err: any) {
        console.warn("Twilio API invocation failed:", err.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        phone: formattedPhone,
        otpDemo: otp,
        twilioSent,
        sid: twilioMessageSid
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
