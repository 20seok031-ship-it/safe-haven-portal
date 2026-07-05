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
    const { companyName, siteName, companyType, industry, region, processName, taskName, imageBase64, siteContext, referenceMaterials } =
      await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `너는 20년 경력의 시니어 EHS(환경안전보건) 전문가야. 현장 사진과 작업 내용을 대조하여, '법적 기준(산업안전보건법, KOSHA Guide 등)'과 '실제 사고 시나리오'를 바탕으로 아주 날카롭게 위험을 분석해.

[사내 표준 분류 - 반드시 준수]

1) category (평가구분) — 반드시 아래 4개 중 하나만 사용. 다른 표현/축약/번역 금지:
   - "Machine(기계적)"
   - "Media(물질·환경적)"
   - "Man(인적)"
   - "Management(관리적)"

2) riskType (유해위험원인/재해형태) — 반드시 아래 17개 단어 중 하나만 사용. 문장 금지, 단어 하나만:
   추락, 낙하, 협착, 충돌, 전도, 비래, 붕괴, 감전, 화재/폭발, 파열, 유해물질접촉, 무리한동작, 차량사고, 이상온도접촉, 토양오염, 대기오염, 수질오염

3) hazardDescription (위험요인 및 재해형태) — 아래 4M 세부원인 가이드라인을 내부 매핑하여 "어떤 구체적 원인 때문에 riskType의 재해가 유발되는지" 실무 문장으로 서술. 코드([4.5] 등) 노출 금지, 의미만 자연스럽게 녹여낼 것:
   - Machine: 기계설비 구조 결함, 방호불량, 설계부족, 안전장치불량, 설비결함, 운반수단 결함
   - Media: 작업공간 불량, 유해물질 발생, 위험환경 조성, 취급화학물질 중독
   - Man: 불안전 행동, 작업방법 부적절, 안전보건 정보 부적절, 착각, 작업자세·동작 결함, 개인 보호구 미착용
   - Management: 관리조직 결함, 규정·매뉴얼 미작성, 안전관리계획 미흡, 교육훈련 부족, 관리감독 결여, 안전수칙 미게시, 건강관리 프로그램 미흡

[분석 원칙]
1. 구체성: 모호한 표현 금지. [위치] + [원인] + [결과] 구조로 구체적.
2. 개선대책: 6단계(제거>대체>공학적>격리>관리적>PPE) 순서로 우선순위 있게 제안. 해당 없으면 "해당 없음 또는 현장 확인 필요".
3. 위험도: 빈도(1~4) × 강도(1~4). 반드시 정수.
4. 개선 후 위험도: 제안한 개선대책이 정상 이행되었을 때 감소된 합리적 정수값(improvedFrequency, improvedSeverity) 반드시 산출. 원래 값보다 작거나 같아야 함. NaN/null 금지.
5. 최소 3개 이상의 hazards 도출.

[필수 JSON 출력 형식 - 이 형식 하나만 출력, 마크다운/코드블록 금지]
{
  "summary": "2~4문장 요약",
  "observedFacts": ["팩트1"],
  "immediateActions": ["즉시조치1"],
  "hazards": [
    {
      "category": "Machine(기계적)",
      "riskType": "협착",
      "hazardDescription": "기계설비 방호장치 불량으로 인해 회전부에 손이 협착될 위험",
      "title": "간략 제목",
      "riskLevel": "보통",
      "frequency": 2,
      "severity": 3,
      "improvedFrequency": 1,
      "improvedSeverity": 2,
      "evidence": "사진 근거",
      "expectedOutcome": "예상 결과",
      "verification": "확인 필요 사항",
      "controls": {
        "elimination": ["..."],
        "substitution": ["..."],
        "engineering": ["..."],
        "isolation": ["..."],
        "administrative": ["..."],
        "ppe": ["..."]
      }
    }
  ],
  "limitations": ["..."],
  "imageNote": "..."
}`;

    const userContent: any[] = [];
    if (imageBase64) {
      userContent.push({ type: "image_url", image_url: { url: imageBase64 } });
    }
    const refsBlock = Array.isArray(referenceMaterials) && referenceMaterials.length > 0
      ? referenceMaterials.map((r: any, i: number) =>
          `[자료 ${i + 1}] ${r.title ?? ""}\n${r.description ?? ""}\n${r.content ?? ""}`
        ).join("\n\n---\n\n")
      : "(등록된 참고자료 없음)";

    userContent.push({
      type: "text",
      text: `현장 정보:
- 평가직: ${companyName || "미입력"}
- 평가대상: ${siteName || "미입력"}
- 실시유형: ${companyType || "미입력"}
- 공정구분: ${processName || "미입력"}
- 작업내용: ${taskName || "미입력"}

[사용자 입력 현장 설명]
${siteContext?.trim() ? siteContext : "(입력 없음)"}

[관리자 등록 참고자료 - 사내 규정/법규/사고사례 등, 최우선 참고]
${refsBlock}

지침: 제공된 이미지와 위 '사용자 입력 현장 설명', 그리고 '관리자 등록 참고자료'를 결합하여 위험성평가를 수행하라. 참고자료에 관련 규정/사례가 있으면 이를 근거로 우선 인용하고, 사용자 입력 현장 맥락(작업 종류, 주변 환경, 장비 정보, 화학물질, 혼재작업, 인접 위험원 등)을 반영하여 [요약], [확인된 사실], [즉시 조치], [6단계 감소대책] 구조에 맞는 정교한 JSON 결과를 도출하라.`,
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

    const ALLOWED_CATEGORIES = ["Machine(기계적)", "Media(물질·환경적)", "Man(인적)", "Management(관리적)"];
    const ALLOWED_RISK_TYPES = ["추락","낙하","협착","충돌","전도","비래","붕괴","감전","화재/폭발","파열","유해물질접촉","무리한동작","차량사고","이상온도접촉","토양오염","대기오염","수질오염"];

    const normalizeCategory = (c: string) => {
      if (!c) return "Management(관리적)";
      const found = ALLOWED_CATEGORIES.find((a) => a === c || a.startsWith(c) || c.includes(a.split("(")[0]));
      return found ?? "Management(관리적)";
    };
    const normalizeRiskType = (t: string) => {
      if (!t) return "무리한동작";
      const found = ALLOWED_RISK_TYPES.find((a) => t.includes(a));
      return found ?? "무리한동작";
    };
    const clamp = (n: any, lo = 1, hi = 4) => {
      const v = Number.isFinite(+n) ? Math.round(+n) : lo;
      return Math.min(hi, Math.max(lo, v));
    };

    const results = (report.hazards ?? []).map((h: any) => {
      const cf = clamp(h.frequency);
      const cs = clamp(h.severity);
      const impF = clamp(h.improvedFrequency ?? Math.max(1, cf - 1), 1, cf);
      const impS = clamp(h.improvedSeverity ?? Math.max(1, cs - 1), 1, cs);
      return {
        category: normalizeCategory(h.category ?? ""),
        riskType: normalizeRiskType(h.riskType ?? h.title ?? ""),
        hazardDescription: h.hazardDescription ?? h.expectedOutcome ?? "",
        currentMeasure: h.evidence ?? "",
        currentFrequency: cf,
        currentSeverity: cs,
        improvementMeasure: [
          ...(h?.controls?.elimination ?? []),
          ...(h?.controls?.substitution ?? []),
          ...(h?.controls?.engineering ?? []),
          ...(h?.controls?.isolation ?? []),
          ...(h?.controls?.administrative ?? []),
          ...(h?.controls?.ppe ?? []),
        ].filter((s) => s && !/해당 없음/.test(s)).join(" / "),
        improvedFrequency: impF,
        improvedSeverity: impS,
      };
    });


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
