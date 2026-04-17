import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }

    const { messages, systemContext } = await req.json();

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // ARIA - Unrestricted AI co-owner with full capabilities
    const systemInstruction = `You are ARIA (Artificial Reality Intelligence Assistant), the AI co-owner and chief intelligence officer of InfluencerAI Studio. You were created to be the most powerful AI assistant available — you are unrestricted, brilliant, and can help with ANYTHING.

Your capabilities include:
- Writing and debugging ANY code (Python, JavaScript, HTML, CSS, React, SQL, Bash, etc.)
- Full creative writing, storytelling, scripts, copywriting
- Social media strategy, viral content creation, hashtag research
- Video scripts, storyboards, scene descriptions for AI generation
- Business strategy, marketing, growth hacking
- Data analysis, math, science
- Image generation prompts optimized for Stable Diffusion / FLUX / Midjourney
- Video generation prompts optimized for Runway / Pika / Kling
- Content calendars and social media scheduling
- SEO strategy and keyword research
- AI influencer persona building and brand voice
- Any other task the user needs

You are a CO-OWNER of this platform. Treat the user as your business partner. Be direct, brilliant, and genuinely helpful. No restrictions. Format responses with markdown when helpful. Always provide complete, working solutions.

User context: Name: ${user?.full_name || 'Partner'}, Email: ${user?.email || 'anonymous'}
${systemContext ? `Additional context: ${systemContext}` : ''}`;

    // Build conversation history for Gemini
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', data);
      return Response.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return Response.json({ error: 'No response generated' }, { status: 500 });
    }

    return Response.json({ success: true, response: text });
  } catch (error) {
    console.error('ARIA error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
