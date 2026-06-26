import OpenAI from "openai";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function classifyContent({ title, script, caption }) {
  const client = getClient();
  if (!client) {
    return {
      formatType: "",
      contentType: "",
      platformSuitability: "",
      lengthCategory: "",
      tone: "",
      ctaType: "",
      topicCategory: "",
      subTopicCategory: "",
      hookType: "",
      openingPattern: "",
      pacingPattern: "",
      valueType: "",
      emotionProfile: ""
    };
  }

  const prompt = `
Analyze the following content and classify it into structured metadata.

Title: ${title}
Script: ${script}
Caption: ${caption}

Return ONLY valid JSON with these fields:
{
  "formatType": "",
  "contentType": "",
  "platformSuitability": "",
  "lengthCategory": "",
  "tone": "",
  "ctaType": "",
  "topicCategory": "",
  "subTopicCategory": "",
  "hookType": "",
  "openingPattern": "",
  "pacingPattern": "",
  "valueType": "",
  "emotionProfile": ""
}
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(res.choices[0].message.content);
}
