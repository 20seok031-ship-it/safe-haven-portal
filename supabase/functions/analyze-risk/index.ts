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
3. 위험도: 빈도(1~4) × 강도(1~4). riskLevel은 다음 기준으로 라벨링:
   - 낮음: 1~3, 보통: 4~6, 높음: 7~12, 매우높음: 13 이상
4. 최소 3개 이상의 개별 위험(hazards)을 도출.

[사내 표준 매핑 규칙 - 반드시 준수]
A. hazard.category(평가구분): 반드시 아래 4M 중 하나의 문자열만 사용.
   - "Machine(기계적)", "Media(물질·환경적)", "Man(인적)", "Management(관리적)"
B. hazard.riskCause(유해위험원인): 반드시 아래 17개 표준 재해형태 단어 중 사진/상황에 가장 부합하는 하나(또는 명확한 조합 예: "낙하/비래")만 사용. 임의 텍스트 금지.
   - 추락, 낙하, 협착, 충돌, 전도, 비래, 붕괴, 감전, 화재/폭발, 파열, 유해물질접촉, 무리한동작, 차량사고, 이상온도접촉, 토양오염, 대기오염, 수질오염
C. hazard.hazardNarrative(위험요인 및 재해형태 서술): 아래 4M 세부 원인의 '의미'를 현장 상황과 결합해 "어떤 구체적 원인 → 어떤 위험/재해" 형태의 실무형 문장으로 상세 서술.
   ★절대 금지: 문장 안에 [4.5], [2.1] 같은 코드 번호나 "근로자 관리감독 지도의 결여"처럼 표준 항목 명칭을 그대로 옮겨 쓰는 것. 대신 그 맥락(관리감독 부재, 정리정돈 불량, 안전장치 기능 상실, 개인보호구 미착용 등)을 문장에 자연스럽게 녹여 전문 보고서 톤으로 작성.
   - Machine(기계적): 기계설비 구조 결함 / 방호장치 불량 / 본질안전 설계 부족 / 비상 안전연동·경고장치 결함 / 전기·공압 등 유틸리티 결함 / 운반수단 결함
   - Media(물질·환경적): 작업공간 정리정돈·통로 불량 / 가스·분진·흄 등 유해물질 발생 / 산소결핍·소음·진동·고저온 등 위험환경 / 화학물질 취급 중독 위험
   - Man(인적): 불안전한 행동 / 부적절한 작업방법 / 안전보건 정보 미숙지 / 인적 오류 / 불안전한 작업자세 및 PPE 미착용
   - Management(관리적): 관리조직 결함 / 규정·매뉴얼 미비 / 안전관리계획 미흡 / 안전 교육훈련 부족 / 현장 관리감독 지도 결여 / 안전수칙·표지판 미게시 / 건강관리 프로그램 미흡
D. 여러 hazard가 같은 category를 갖는 경우, 동일 category의 항목들을 연속되게 배열에 배치.

[필수 JSON 출력 형식]
다른 텍스트/마크다운/코드블록 없이 아래 JSON 객체 하나만 출력.

{
  "summary": "현장 전반 상황과 유의사항을 2~4문장 줄글로 요약",
  "observedFacts": ["사진에서 육안으로 확인된 팩트 1", "팩트 2", "..."],
  "immediateActions": ["현장에서 즉시 조치해야 할 항목 1", "항목 2"],
  "hazards": [
    {
      "title": "덕트 연결 불량 및 이탈",
      "category": "Machine(기계적)",
      "riskCause": "낙하",
      "hazardNarrative": "환기 덕트 연결부가 임시 테이핑만으로 고정되어 방호·고정 상태가 불량하며, 지지대 부재로 처짐이 진행되고 있어 작업 중 덕트가 이탈·낙하할 경우 하부 작업자에게 타격을 줄 수 있음. 또한 연결부 기밀 파손으로 내부 오염 공기가 누출되어 호흡기 유해영향을 초래할 우려가 있음.",
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

[사용자 입력 현장 설명]
${siteContext?.trim() ? siteContext : "(입력 없음)"}

지침: 제공된 이미지 분석 결과와 위 '사용자 입력 현장 설명'을 결합하여 위험성평가를 수행하라. 특히 사용자가 텍스트로 지적하거나 설명한 현장 맥락(작업 종류, 주변 환경, 장비 정보, 화학물질, 혼재작업, 인접 위험원 등)이 있다면 이를 최우선으로 반영하여 [요약], [확인된 사실], [즉시 조치], [6단계 감소대책] 구조에 맞춰 정교한 JSON 결과를 도출하라.`,
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
