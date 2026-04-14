import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, siteName, companyType, industry, region, processName, taskName, imageBase64 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `너는 최고의 공작기계 제조업 안전 관리 전문가야. 첨부된 사진과 작업 내용을 분석해서 수시 위험성평가 결과를 도출해줘. 한국어로 아주 구체적이고 전문적으로 작성해줘.

반드시 아래 JSON 형식으로만 응답해. 다른 텍스트는 절대 포함하지 마:
[
  {
    "category": "기계적",
    "riskType": "추락",
    "hazardDescription": "위험요인 및 재해형태 상세 설명",
    "currentMeasure": "현재 안전 조치 설명",
    "currentFrequency": 2,
    "currentSeverity": 3,
    "improvementMeasure": "개선 대책 설명",
    "improvedFrequency": 1,
    "improvedSeverity": 3
  }
]

평가구분은 다음 중 선택: 기계적, 전기적, 화학적, 인적, 물질환경적, 관리적
유해위험요인(riskType)은 다음 중 선택 또는 조합: 추락, 낙하, 충돌, 전도, 협착, 감전, 화재, 폭발, 질식, 절단
빈도와 강도는 1~4 사이 정수로 평가해.
개선 후 빈도/강도는 현재보다 같거나 낮아야 해.
최소 5개 이상의 위험요인을 도출해줘.`;

    const userContent: any[] = [];

    if (imageBase64) {
      const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        userContent.push({
          type: "image_url",
          image_url: { url: imageBase64 },
        });
      }
    }

    userContent.push({
      type: "text",
      text: `현장 정보:
- 평가직: ${companyName || "미입력"}
- 평가대상: ${siteName || "미입력"}
- 실시유형: ${companyType || "미입력"}
- 공정구분: ${processName || "미입력"}
- 작업내용: ${taskName || "미입력"}

위 정보와 첨부된 현장 사진을 분석하여 위험요인을 JSON 배열로 도출해줘.`,
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다. 워크스페이스 설정에서 충전해주세요." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let results;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      results = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      console.error("Failed to parse AI response:", content);
      results = [];
    }

    return new Response(JSON.stringify({ results, raw: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-risk error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
