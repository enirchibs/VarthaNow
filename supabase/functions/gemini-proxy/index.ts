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
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    const body = await req.json().catch(() => ({}));
    const { action, symptomsText, lang, userMsg, chatHistory, prompt, systemInstruction, agent, preferredModel } = body;

    // 1. Secrets Validation
    if (action === "validate_secrets") {
      const youtubeKey = Deno.env.get("YOUTUBE_API_KEY");
      return new Response(
        JSON.stringify({
          status: "success",
          gemini: !!geminiKey,
          openrouter: !!openrouterKey,
          youtube: !!youtubeKey,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. AI ORCHESTRATOR ENDPOINT (Multi-Provider: Gemini ➔ OpenRouter)
    if (action === "ai_orchestrator") {
      const fullPrompt = systemInstruction ? `${systemInstruction}\n\nTask:\n${prompt}` : prompt;

      // 1st Priority: Gemini API
      if (geminiKey) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const modelName = preferredModel || (agent === "lesson" ? "gemini-3.5-flash-lite" : "gemini-3.5-flash");
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(fullPrompt);
          const text = result.response.text();
          if (text) {
            return new Response(
              JSON.stringify({ text, provider: "gemini", model: modelName }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch (geminiErr: any) {
          console.warn("Gemini Orchestrator fallback triggered:", geminiErr.message);
        }
      }

      // 2nd Priority: OpenRouter API
      try {
        const orModel = preferredModel || "openrouter/free";
        const orHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          "HTTP-Referer": "https://varthanow.com",
          "X-Title": "VarthaNow Maatlaadu AI"
        };
        if (openrouterKey) {
          orHeaders["Authorization"] = `Bearer ${openrouterKey}`;
        }

        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: orHeaders,
          body: JSON.stringify({
            model: orModel,
            messages: [
              { role: "system", content: systemInstruction || "You are a language tutor for Telugu speakers." },
              { role: "user", content: prompt }
            ],
            temperature: 0.7
          })
        });

        if (orRes.ok) {
          const orData = await orRes.json();
          const text = orData?.choices?.[0]?.message?.content;
          if (text) {
            return new Response(
              JSON.stringify({ text, provider: "openrouter", model: orModel }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (orErr: any) {
        console.warn("OpenRouter Orchestrator fallback triggered:", orErr.message);
      }

      return new Response(
        JSON.stringify({ error: "All AI providers unavailable", provider: "none" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Existing Health / Chat Legacy Endpoints
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      if (action === "chat") {
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
        const chat = model.startChat({
          history: (chatHistory || []).map((c: any) => ({
            role: c.role,
            parts: [{ text: c.text }]
          }))
        });
        const result = await chat.sendMessage(userMsg || prompt);
        const text = result.response.text();
        return new Response(JSON.stringify({ text }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
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
