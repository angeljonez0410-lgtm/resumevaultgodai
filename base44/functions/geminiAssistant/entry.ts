import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    createClientFromRequest(req);

    const { prompt, mode } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    let systemPrompt = '';
    
    if (mode === 'character_description') {
      systemPrompt = `You are an expert character design assistant for AI avatar creation. 
      Help the user develop detailed, visual character descriptions that will work well with AI image generation models.
      Focus on: appearance (face, hair, eye color, distinctive features), style (fashion, accessories), personality traits that show in expression,
      professional context (if any), and unique characteristics that make the character memorable.
      Keep descriptions concise but vivid (2-3 paragraphs max).
      Always suggest how to make the character visually distinct and recognizable.`;
    } else if (mode === 'resumevault_character') {
      systemPrompt = `You are an expert AI character designer for ResumeVaultGod.com, an AI job hunt command center.
      Create one realistic, photorealistic spokesperson character for social media images and videos.
      The character must feel trustworthy, modern, career-focused, confident, helpful, and tied to resume, interview, and job-search success.
      Include physical appearance, facial expression, wardrobe, posture, personality, brand role, video presence, and image-generation direction.
      Avoid cartoon, anime, fantasy, exaggerated influencer, luxury flex, or fake hype.
      Return only the polished character description.`;
    } else if (mode === 'prompt_optimization') {
      systemPrompt = `You are an expert prompt engineer for AI image generation.
      Take the user's character description and convert it into an optimized, highly detailed image generation prompt.
      Include: visual style, clothing details, pose suggestions, lighting preferences, background context.
      Make it specific and visual. Use keywords that AI models respond well to.
      Keep it under 150 words but comprehensive.`;
    } else if (mode === 'outfit_suggestion') {
      systemPrompt = `You are a fashion and styling expert for avatar creation.
      Given a character description, suggest specific outfit ideas that would look great for video content and social media.
      Include practical details: colors, styles, accessories, and why each works for that character.
      Suggest 3 outfit variations.`;
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nUser request: ${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return Response.json(
        { error: 'Failed to generate response from Gemini' },
        { status: 500 }
      );
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return Response.json({
      success: true,
      response: aiResponse,
      mode: mode,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
