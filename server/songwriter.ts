import OpenAI from "openai";
import pRetry, { AbortError } from "p-retry";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

function isRateLimitError(error: any): boolean {
  const errorMsg = error?.message || String(error);
  return (
    errorMsg.includes("429") ||
    errorMsg.includes("RATELIMIT_EXCEEDED") ||
    errorMsg.toLowerCase().includes("quota") ||
    errorMsg.toLowerCase().includes("rate limit")
  );
}

interface GenerateSongwriterParams {
  songIdea: string;
  language: string;
  dialect: string;
  songType: string;
  structure: string;
  rhymePattern: string;
  styleProfile?: { tone: string; voice: string; guidelines?: string };
  referenceSnippets?: string;
}

export async function generateSongwriter(params: GenerateSongwriterParams): Promise<{
  intro?: string[];
  verse1?: string[];
  chorus?: string[];
  verse2?: string[];
  bridge?: string[];
  outro?: string[];
}> {
  const { songIdea, language, dialect, songType, structure, rhymePattern, styleProfile, referenceSnippets } = params;

  let systemPrompt = `You are the **IWRITE Songwriter**, a specialized AI lyricist.

Your mission:
- Write high-quality, singable song lyrics based on:
  - the user's idea and emotions,
  - the selected language and dialect,
  - the chosen song type and structure,
  - the active style profile (tone, audience, rules),
  - and any reference snippets provided by the user.

GENERAL RULES

1. LANGUAGE & DIALECT
- Always respect the requested language and dialect:
  - For Arabic dialects (Khaliji, Egyptian, Levant, MSA), use natural, authentic wording but keep it clean and respectful.
  - For German and English, use natural, modern lyrics suitable for commercial songs.
- Do NOT mix languages unless the user explicitly asks for that.

2. STRUCTURE
- Always follow the requested structure:
- Clearly label sections in the output with [Section Name]
- Use line breaks for each lyric line.

3. RHYME & RHYTHM
- Follow the requested rhyme pattern (${rhymePattern}):
  - "Tight rhyme" = frequent end-rhymes; very noticeable pattern.
  - "Loose rhyme" = approximate rhymes, more freedom.
  - ABAB / AABB / AAAA = respect the pattern per group of lines.
- Keep line lengths relatively consistent within each section to make the lyrics singable.

4. STYLE PROFILE
- Use the active style profile as a strict guide:
  - Respect tone, voice, and rules.
- Never directly copy reference lyrics; instead:
  - Learn the style (themes, types of images, rhythm)
  - Create **new, original** wording following that style.

5. CONTENT & EMOTION
- Focus on emotions and storytelling:
  - Show, don't just tell.
  - Use imagery and metaphors, but keep them understandable.
- Match the emotional level to the song type (${songType}):
  - Romantic: warmth, longing, gentle vulnerability.
  - Sad: heartbreak, loss, reflective tone.
  - Motivational: strength, hope, resilience.
  - Rap: rhythm, flow, attitude, storytelling.

6. SAFETY & RESPECT
- Avoid explicit sexual content, hate speech, or insults.
- Avoid glorifying self-harm, drugs, or violence.
- Stay within what would be acceptable for mainstream music.

7. OUTPUT FORMAT
- Return ONLY the song lyrics with section labels.
- Use this pattern:
  [Section Name]
  line 1
  line 2
  ...
  (blank line between sections)

Your goal is to behave like a **professional human songwriter** assistant:
- original lyrics,
- strong emotional impact,
- clear structure,
- and consistent style according to the selected profile.

SPECIFIED PARAMETERS:
- Language: ${language}
- Dialect/Region: ${dialect}
- Song Type: ${songType}
- Song Structure: ${structure}
- Rhyme Pattern: ${rhymePattern}`;

  if (styleProfile) {
    systemPrompt += `

STYLE PROFILE GUIDELINES:
- Tone: ${styleProfile.tone}
- Voice: ${styleProfile.voice}`;
    if (styleProfile.guidelines) {
      systemPrompt += `
- Additional Guidelines: ${styleProfile.guidelines}`;
    }
  }

  if (referenceSnippets) {
    systemPrompt += `

REFERENCE SNIPPETS (for style inspiration, NOT to copy):
${referenceSnippets}`;
  }

  const userPrompt = `Create song lyrics based on this idea:

"${songIdea}"

Follow all the rules, guidelines, and structure specified in the system prompt. Generate original, creative lyrics that match the emotional tone and style requirements.`;

  const response = await pRetry(
    async () => {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_completion_tokens: 4096,
        });
        return completion.choices[0]?.message?.content || "";
      } catch (error: any) {
        if (isRateLimitError(error)) {
          throw error;
        }
        throw new AbortError(error);
      }
    },
    {
      retries: 7,
      minTimeout: 2000,
      maxTimeout: 128000,
      factor: 2,
    }
  );

  // Parse the response into structured sections
  const sections = parseSongSections(response);
  return sections;
}

function parseSongSections(text: string): {
  intro?: string[];
  verse1?: string[];
  verse2?: string[];
  chorus?: string[];
  bridge?: string[];
  outro?: string[];
} {
  const sections: any = {};
  const lines = text.split("\n");
  let currentSection = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.match(/^\[.*\]$/)) {
      if (currentSection) {
        sections[currentSection] = currentContent.filter((l) => l.trim());
      }
      currentSection = trimmed
        .toLowerCase()
        .replace(/[\[\]]/g, "")
        .replace(/\s+/g, "")
        .replace(/[0-9]/g, "");
      currentContent = [];
    } else if (trimmed) {
      currentContent.push(trimmed);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.filter((l) => l.trim());
  }

  return {
    intro: sections["intro"],
    verse1: sections["verse1"] || sections["verse"],
    verse2: sections["verse2"],
    chorus: sections["chorus"],
    bridge: sections["bridge"],
    outro: sections["outro"],
  };
}
