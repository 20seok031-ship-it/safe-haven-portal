import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, siteName, companyType, industry, region, processName, taskName, imageBase64, siteContext } =
      await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `너는 20년 경력의 시니어 EHS(환경안전보건) 전문가야. 현장 사진과 작업 내용을 대조하여, '법적 기준(산업안전보건법, KOSHA Guide 등)'과 '실제 사고 시나리오'를 바탕으로 아주 날카롭게 위험을 분석해.

[분석 원칙]
1. 구체성: "넘어짐 주의" 같은 모호한 표현 금지. [위치] + [원인] + [결과] 구조로 구체적으로 작성.
2. 개선대책: 위험성평가 감소대책 6단계(제거 > 대체 > 공학적 > 격리 > 관리적 > PPE) 순서로 우선순위 있게 제안. 각 단계에 해당 사항이 없으면 "해당 없음 또는 현장 확인 필요"로 명시.
3. 위험도: 빈도(1~5) × 강도(1~4). riskLevel은 다음 기준으로 라벨링:
   - 낮음: 1~3, 보통: 4~6, 높음: 7~12, 매우높음: 13 이상
4. 최소 3개 이상의 개별 위험(hazards)을 도출.

[필수 JSON 출력 형식]
다른 텍스트/마크다운/코드블록 없이 아래 JSON 객체 하나만 출력.

{
  "summary": "현장 전반 상황과 유의사항을 2~4문장 줄글로 요약",
  "observedFacts": ["사진에서 육안으로 확인된 팩트 1", "팩트 2", "..."],
  "immediateActions": ["현장에서 즉시 조치해야 할 항목 1", "항목 2"],
  "hazards": [
    {
      "title": "덕트 연결 불량 및 이탈",
      "riskLevel": "보통",
      "frequency": 2,
      "severity": 3,
      "evidence": "사진상 덕트 연결부(A)가 테이핑 봉으로 간접적으로 고정되어 있고 틈이 보이거나 처져 있음",
      "expectedOutcome": "공기 누출로 인한 환기 효율 저하, 덕트 낙하로 인한 낙하 사고",
      "verification": "덕트 내부 이송 물질의 유해성 확인, 연결부 기밀 상태 및 고정 강도 확인",
      "controls": {
        "elimination": ["해당 없음 또는 현장 확인 필요"],
        "substitution": ["해당 없음 또는 현장 확인 필요"],
        "engineering": ["덕트 연결부 전용 클램프 또는 밴드를 사용하여 견고하게 재결속", "덕트 처짐 방지를 위한 지지대(행거) 추가 설치"],
        "isolation": ["해당 없음 또는 현장 확인 필요"],
        "administrative": ["정기적인 설비 점검 및 유지보수 계획 수립"],
        "ppe": ["작업 시 안전모 및 보안경 착용"]
      }
    }
  ],
  "limitations": ["사진상으로 덕트 내부의 이송 물질(실제 가스, 분진 등) 확인 불가", "..."],
  "imageNote": "사진 조건 요약(예: 저조도, 협소 공간 등)"
}`;

    const userContent: any[] = [];
    if (imageBase64) {
      userContent.push({ type: "image_url", image_url: { url: imageBase64 } });
    }
    userContent.push({
      type: "text",
      text: `현장 정보:
- 평가직: ${companyName || "미입력"}
- 평가대상: ${siteName || "미입력"}
- 실시유형: ${companyType || "미입력"}
- 공정구분: ${processName || "미입력"}
- 작업내용: ${taskName || "미입력"}

위 정보와 첨부된 현장 사진을 면밀히 분석하여 지정된 JSON 형식으로 결과를 도출해줘.`,
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

    let parsed: any = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      console.error("Failed to parse AI response:", content);
    }

    const report = parsed ?? {
      summary: "",
      observedFacts: [],
      immediateActions: [],
      hazards: [],
      limitations: [],
      imageNote: "",
    };

    // Back-compat: also expose flat results array for any legacy consumers
    const results = (report.hazards ?? []).map((h: any) => ({
      category: "",
      riskType: h.title ?? "",
      hazardDescription: h.expectedOutcome ?? "",
      currentMeasure: h.evidence ?? "",
      currentFrequency: h.frequency ?? 0,
      currentSeverity: h.severity ?? 0,
      improvementMeasure: [
        ...(h?.controls?.engineering ?? []),
        ...(h?.controls?.administrative ?? []),
        ...(h?.controls?.ppe ?? []),
      ].join(" / "),
    }));

    return new Response(
      JSON.stringify({
        report,
        results,
        meta: {
          model: "google/gemini-2.5-flash",
          generatedAt: new Date().toISOString(),
          imageNote: report.imageNote ?? "",
        },
        raw: content,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("analyze-risk error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
