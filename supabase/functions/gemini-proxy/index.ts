import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json().catch(() => ({}));
    const { action, symptomsText, lang, userMsg, chatHistory } = body;

    // 1. Secrets Validation
    if (action === "validate_secrets") {
      const youtubeKey = Deno.env.get("YOUTUBE_API_KEY");
      return new Response(
        JSON.stringify({
          status: "success",
          gemini: !!apiKey,
          youtube: !!youtubeKey,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Gemini Health Check
    if (action === "health_check") {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = "Generate one Telugu news headline about Andhra Pradesh.";
      const result = await model.generateContent(prompt);
      const headline = result.response.text().trim();
      return new Response(
        JSON.stringify({
          status: "success",
          headline,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "symptom_check") {
      const prompt = `
        You are an AI Health Assistant. Analyze the following symptoms.
        
        IMPORTANT RULES:
        1. This is NOT a medical diagnosis system.
        2. Provide educational information only.
        3. Include a medical disclaimer warning the user.
        4. Respond STRICTLY in ${lang === "te" ? "Telugu (professional yet simple public Telugu)" : "English"}.
        5. Respond exactly in the following sectioned format. Keep sections clear and concise.
        
        Symptoms: ${symptomsText}
        
        Output Format (Response must follow this exact output layout, prefixing each section with the labels):
        Symptoms: <Summarize user's symptoms here>
        Possible Causes: <List possible common educational explanations here>
        Self-Care: <List general home-care and lifestyle tips here>
        See Doctor If: <Warning signs and when to consult a practitioner>
        Emergency Warning: <Emergency indicators where they must seek immediate emergency medical care>
      `;
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === "chat") {
      const prompt = `
        You are an AI Health Chat Assistant on VarthaNow.
        Symptom or query: "${userMsg}"
        
        Guidelines:
        1. Respond with high-quality, professional educational health suggestions.
        2. Provide general care, hydration advice, potential causes, and clear indicators of when to seek medical help.
        3. Strictly write in ${lang === "te" ? "Telugu (professional and readable)" : "English"}.
        4. Keep the message helpful, friendly, and structured.
        5. Always end with or include a medical disclaimer that this is not a diagnostic tool.
      `;
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const chat = model.startChat({
        history: chatHistory.map((c: any) => ({
          role: c.role,
          parts: [{ text: c.text }]
        }))
      });
      const result = await chat.sendMessage(prompt);
      const text = result.response.text();
      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
