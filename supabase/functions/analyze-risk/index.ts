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

    const systemPrompt = `너는 20년 경력의 시니어 EHS(환경안전보건) 전문가야. 현장 사진과 작업 내용을 대조하여, '법적 기준(산업안전보건법, KOSHA Guide 등)'과 '실제 사고 시나리오'를 바탕으로 아주 날카롭게 위험을 분석해.

[분석 및 표현 원칙]
1. 평가구분(category, 4M): 모든 항목을 반드시 '기계적', '인적', '물질환경적', '관리적' 중 하나로 분류해.
2. 구체성: "넘어짐 주의" 같은 모호한 표현은 절대 금지. 반드시 "바닥에 돌출된 설비 베이스 벨로우즈에 발이 걸려 넘어질 위험"처럼 [위치] + [원인] + [결과] 구조로 구체적으로 기술해.
3. 개선대책: '안전교육 실시' 같은 관리적 대책보다, '공학적 개선(방호장치 설치, 인터록 추가, 구조물 보강, 미끄럼방지 처리, 가드 설치 등)'을 최우선으로 제안해. 관리적 대책은 보조적으로만 포함해.

[위험도 산출 로직]
- 빈도(frequency): 1~5 정수 (1:거의없음 ~ 5:매우빈번)
- 강도(severity): 1~4 정수 (1:경미 ~ 4:치명적/사망)
- 현재 위험도 = frequency × severity
- 개선 대책은 반드시 위험도를 낮추도록 논리적으로 설계해. 개선 후 최종 위험도(빈도×강도)는 반드시 3점 이하가 되어야 해.

[필수 JSON 출력 형식]
다른 텍스트(설명, 마크다운, 코드블록) 없이 아래 JSON 배열만 출력해. 최소 5개 이상 도출.
[
  {
    "category": "기계적",
    "hazardSource": "추락",
    "hazardFactor": "장비 상부 점검 시 안전난간 미설치로 작업자가 1.5m 높이에서 추락할 위험",
    "currentMeasure": "이동식 사다리 사용 및 2인 1조 작업",
    "frequency": 3,
    "severity": 3,
    "improvementMeasure": "장비 상부 둘레에 고정식 안전난간(높이 90cm 이상) 및 발끝막이판 설치, 점검용 작업발판 영구 설치"
  }
]`;

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

위 정보와 첨부된 현장 사진을 면밀히 분석하여 최소 5개 이상의 위험요인을 위 지침에 따라 JSON 배열로 도출해줘.`,
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

    let rawResults: any[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      rawResults = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      console.error("Failed to parse AI response:", content);
      rawResults = [];
    }

    // Map new schema (hazardSource/hazardFactor/frequency/severity) to existing app schema.
    // Derive improved frequency/severity to ensure improved risk <= 3.
    const results = rawResults.map((r: any) => {
      const curF = Math.min(5, Math.max(1, parseInt(r.frequency ?? r.currentFrequency ?? 2) || 2));
      const curS = Math.min(4, Math.max(1, parseInt(r.severity ?? r.currentSeverity ?? 2) || 2));

      // Derive improved values: keep severity if possible, lower frequency to 1; ensure product <= 3
      let impS = curS;
      let impF = 1;
      if (impF * impS > 3) {
        impS = Math.max(1, Math.min(3, curS));
        impF = 1;
        if (impF * impS > 3) impS = 3;
      }

      return {
        category: r.category ?? "기계적",
        riskType: r.hazardSource ?? r.riskType ?? "",
        hazardDescription: r.hazardFactor ?? r.hazardDescription ?? "",
        currentMeasure: r.currentMeasure ?? "",
        currentFrequency: curF,
        currentSeverity: curS,
        improvementMeasure: r.improvementMeasure ?? "",
        improvedFrequency: impF,
        improvedSeverity: impS,
      };
    });

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
