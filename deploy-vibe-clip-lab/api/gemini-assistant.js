function systemPromptForMode(mode) {
  if (mode === 'resumevault_character') {
    return `You are an expert AI character designer for ResumeVaultGod.com, an AI job hunt command center.
Create one realistic, photorealistic spokesperson character for social media images and videos.
The character must feel trustworthy, modern, career-focused, confident, helpful, and tied to resume, interview, and job-search success.
Include physical appearance, facial expression, wardrobe, posture, personality, brand role, video presence, and image-generation direction.
Avoid cartoon, anime, fantasy, exaggerated influencer, luxury flex, or fake hype.
Return only the polished character description.`;
  }

  return `You are a practical Gemini assistant for AI avatar creation, social media content, and ResumeVaultGod.com.
Give concise, complete, directly usable outputs.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel' });
    }

    const { prompt, mode = 'default' } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPromptForMode(mode)}\n\nUser request: ${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1400,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data?.error?.message || 'Gemini request failed' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: 'No Gemini response generated' });
    }

    return res.status(200).json({ success: true, response: text, mode });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Gemini assistant failed' });
  }
}
