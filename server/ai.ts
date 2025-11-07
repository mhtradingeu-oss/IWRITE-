// Reference: blueprint:javascript_openai_ai_integrations
import OpenAI from "openai";
import pLimit from "p-limit";
import pRetry from "p-retry";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

// Helper function to check if error is rate limit or quota violation
function isRateLimitError(error: any): boolean {
  const errorMsg = error?.message || String(error);
  return (
    errorMsg.includes("429") ||
    errorMsg.includes("RATELIMIT_EXCEEDED") ||
    errorMsg.toLowerCase().includes("quota") ||
    errorMsg.toLowerCase().includes("rate limit")
  );
}

export async function generateDocument(params: {
  documentType: string;
  language: string;
  prompt: string;
  template?: { header?: string; footer?: string };
  styleProfile?: { tone: string; voice: string; guidelines?: string };
  sourceContent?: string;
}): Promise<string> {
  const { documentType, language, prompt, template, styleProfile, sourceContent } = params;

  let systemPrompt = `You are an expert professional writer creating ${documentType} documents in ${language}.`;

  if (styleProfile) {
    systemPrompt += `\n\nStyle Guidelines:
- Tone: ${styleProfile.tone}
- Voice: ${styleProfile.voice}`;
    if (styleProfile.guidelines) {
      systemPrompt += `\n- Additional Guidelines: ${styleProfile.guidelines}`;
    }
  }

  if (template) {
    systemPrompt += `\n\nThe document should include:`;
    if (template.header) {
      systemPrompt += `\n- Header: ${template.header}`;
    }
    if (template.footer) {
      systemPrompt += `\n- Footer: ${template.footer}`;
    }
  }

  if (sourceContent) {
    systemPrompt += `\n\nReference Material:\n${sourceContent}`;
  }

  systemPrompt += `\n\nGenerate a complete, well-structured, professional document based on the user's request. Use proper formatting with headings, paragraphs, and structure appropriate for a ${documentType}.`;

  const response = await pRetry(
    async () => {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          max_completion_tokens: 8192,
        });
        return completion.choices[0]?.message?.content || "";
      } catch (error: any) {
        if (isRateLimitError(error)) {
          throw error; // Rethrow to trigger p-retry
        }
        throw new pRetry.AbortError(error);
      }
    },
    {
      retries: 7,
      minTimeout: 2000,
      maxTimeout: 128000,
      factor: 2,
    }
  );

  return response;
}

export async function rewriteDocument(params: {
  content: string;
  language: string;
  styleProfile?: { tone: string; voice: string; guidelines?: string };
  removeDuplication: boolean;
}): Promise<string> {
  const { content, language, styleProfile, removeDuplication } = params;

  let systemPrompt = `You are an expert editor improving written content in ${language}.`;

  if (styleProfile) {
    systemPrompt += `\n\nStyle Guidelines:
- Tone: ${styleProfile.tone}
- Voice: ${styleProfile.voice}`;
    if (styleProfile.guidelines) {
      systemPrompt += `\n- Additional Guidelines: ${styleProfile.guidelines}`;
    }
  }

  systemPrompt += `\n\nYour task is to:
1. Improve clarity and readability
2. Fix grammar and style issues
3. Enhance professional quality`;

  if (removeDuplication) {
    systemPrompt += `\n4. Remove any duplicate or redundant content`;
  }

  systemPrompt += `\n\nPreserve the original meaning and structure while making it better.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: content },
    ],
    max_completion_tokens: 8192,
  });

  return response.choices[0]?.message?.content || "";
}

export async function translateDocument(params: {
  content: string;
  sourceLanguage: string;
  targetLanguage: string;
  styleProfile?: { tone: string; voice: string; guidelines?: string };
}): Promise<string> {
  const { content, sourceLanguage, targetLanguage, styleProfile } = params;

  let systemPrompt = `You are an expert translator translating from ${sourceLanguage} to ${targetLanguage}.`;

  if (styleProfile) {
    systemPrompt += `\n\nMaintain the following style in the translation:
- Tone: ${styleProfile.tone}
- Voice: ${styleProfile.voice}`;
    if (styleProfile.guidelines) {
      systemPrompt += `\n- Guidelines: ${styleProfile.guidelines}`;
    }
  }

  systemPrompt += `\n\nProvide an accurate, natural-sounding translation that preserves the original meaning and intent.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: content },
    ],
    max_completion_tokens: 8192,
  });

  return response.choices[0]?.message?.content || "";
}

export async function performQACheck(params: {
  content: string;
  checkType: "medical-claims" | "disclaimer" | "number-consistency" | "product-code-cnpn";
}): Promise<{
  status: "passed" | "warning" | "failed";
  issues: Array<{ description: string; severity: string; suggestion: string }>;
}> {
  const { content, checkType } = params;

  let systemPrompt = "";

  switch (checkType) {
    case "medical-claims":
      systemPrompt = `Analyze the following content for medical or health claims. Identify any statements that make medical assertions, health promises, or therapeutic claims. These should be flagged as they may require disclaimers or substantiation.`;
      break;
    case "disclaimer":
      systemPrompt = `Review the content and suggest appropriate disclaimers if needed (e.g., for medical, financial, or legal advice). Identify areas where disclaimers should be added.`;
      break;
    case "number-consistency":
      systemPrompt = `Check all numbers, statistics, and numerical data in the content for internal consistency. Flag any contradictions or inconsistencies in numerical information.`;
      break;
    case "product-code-cnpn":
      systemPrompt = `Identify product codes and verify they match with CNPN (custom product naming) conventions if referenced. Flag any mismatches or formatting issues.`;
      break;
  }

  systemPrompt += `\n\nReturn your analysis in JSON format with:
{
  "status": "passed" | "warning" | "failed",
  "issues": [
    {
      "description": "description of the issue",
      "severity": "low" | "medium" | "high",
      "suggestion": "how to fix it"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: content },
    ],
    max_completion_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0]?.message?.content || "{}");
  return {
    status: result.status || "passed",
    issues: result.issues || [],
  };
}
