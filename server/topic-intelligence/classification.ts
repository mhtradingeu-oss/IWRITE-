/**
 * Topic Classification & Auto-Tagging
 * Automatically classify documents into topics using AI
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface TopicClassification {
  topicName: string;
  confidence: number;
  keywords: string[];
  description: string;
}

export interface EntityExtraction {
  numbers: Array<{ value: string; context: string; unit?: string }>;
  regulations: Array<{ value: string; context: string }>;
  terms: Array<{ value: string; context: string; definition?: string }>;
  dates: Array<{ value: string; context: string }>;
  percentages: Array<{ value: string; context: string }>;
}

/**
 * Classify document content into topics
 */
export async function classifyTopics(
  content: string,
  existingTopics: Array<{ name: string; description: string; keywords: string[] }> = []
): Promise<TopicClassification[]> {
  try {
    const topicsList = existingTopics.length > 0
      ? existingTopics.map(t => `- ${t.name}: ${t.description}`).join('\n')
      : "No existing topics defined yet.";

    const prompt = `Analyze this document and classify it into relevant topics.

Existing Topics:
${topicsList}

Document Content:
${content.substring(0, 4000)}

Instructions:
1. Identify 1-3 main topics for this document
2. You can suggest new topics if the content doesn't fit existing ones
3. Provide confidence score (0-100) for each topic
4. Extract 5-10 relevant keywords per topic
5. Write a brief description for each topic

Common business topics include:
- Affiliate Programs & Commissions
- Contracts & Agreements
- Legal Policies & Compliance
- Marketing & Advertising
- Product Information
- Financial Terms & Pricing
- Technical Documentation
- HR & Employment
- Customer Service
- Data Privacy & Security

Respond ONLY with valid JSON in this format:
{
  "topics": [
    {
      "topicName": "Affiliate Programs",
      "confidence": 95,
      "keywords": ["affiliate", "commission", "referral", "partner", "revenue"],
      "description": "Content related to affiliate marketing and commission structures"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.topics || [];
  } catch (error: any) {
    console.error("Failed to classify topics:", error.message);
    return [];
  }
}

/**
 * Extract entities (numbers, regulations, terms) from content
 */
export async function extractEntities(
  content: string
): Promise<EntityExtraction> {
  try {
    const prompt = `Extract all important entities from this document:

${content.substring(0, 4000)}

Extract:
1. Numbers (amounts, quantities, percentages, etc.) with context
2. Regulations, laws, or compliance references with context
3. Important technical terms or jargon with context
4. Dates and deadlines with context
5. Percentages and ratios with context

Respond ONLY with valid JSON in this format:
{
  "numbers": [
    {"value": "5000", "context": "maximum payout amount", "unit": "USD"}
  ],
  "regulations": [
    {"value": "GDPR Article 17", "context": "right to erasure"}
  ],
  "terms": [
    {"value": "CPA", "context": "Cost Per Acquisition pricing model", "definition": "Cost Per Acquisition"}
  ],
  "dates": [
    {"value": "2024-12-31", "context": "contract expiration date"}
  ],
  "percentages": [
    {"value": "15%", "context": "commission rate for tier 1 affiliates"}
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      numbers: result.numbers || [],
      regulations: result.regulations || [],
      terms: result.terms || [],
      dates: result.dates || [],
      percentages: result.percentages || [],
    };
  } catch (error: any) {
    console.error("Failed to extract entities:", error.message);
    return {
      numbers: [],
      regulations: [],
      terms: [],
      dates: [],
      percentages: [],
    };
  }
}

/**
 * Extract recurring section patterns across multiple documents
 */
export async function extractSectionPatterns(
  documents: Array<{ title: string; content: string }>
): Promise<Array<{ heading: string; frequency: number; exampleContent: string }>> {
  try {
    const docSummaries = documents
      .slice(0, 10) // Limit to 10 documents to avoid token limits
      .map((d, i) => `Document ${i + 1}: ${d.title}\n${d.content.substring(0, 500)}...`)
      .join('\n\n');

    const prompt = `Analyze these documents and identify recurring section headings or patterns:

${docSummaries}

Find:
1. Common section headings that appear across multiple documents
2. Typical document structures and patterns
3. Standard clauses or paragraphs

Respond ONLY with valid JSON in this format:
{
  "patterns": [
    {
      "heading": "Payment Terms",
      "frequency": 8,
      "exampleContent": "Payment shall be made within 30 days of invoice date..."
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.patterns || [];
  } catch (error: any) {
    console.error("Failed to extract section patterns:", error.message);
    return [];
  }
}
