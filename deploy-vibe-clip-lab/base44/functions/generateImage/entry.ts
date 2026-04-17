import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Replicate from 'npm:replicate';

function getOutputUrl(output) {
  if (!output) return null;
  if (typeof output.url === 'function') return output.url().toString();
  if (typeof output === 'string') return output;
  if (Array.isArray(output)) return getOutputUrl(output[0]);
  if (typeof output[Symbol.asyncIterator] === 'function') return null;
  if (output.url) return output.url.toString();
  return null;
}

Deno.serve(async (req) => {
  try {
    createClientFromRequest(req);

    const { prompt, characterDescription } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const replicateKey = Deno.env.get('REPLICATE_API_TOKEN') || Deno.env.get('REPLICATE_API_KEY');
    if (!replicateKey) {
      return Response.json({ error: 'Replicate API token not configured' }, { status: 500 });
    }

    // Enhanced prompt with character consistency
    let enhancedPrompt = `Photorealistic, realistic human proportions, natural skin texture, professional lighting, sharp focus, cinematic color grade, no distorted hands, no extra fingers, no text artifacts. ${prompt}`;
    if (characterDescription) {
      enhancedPrompt = `${characterDescription}\n\n${enhancedPrompt}`;
    }

    const replicate = new Replicate({ auth: replicateKey });
    const output = await replicate.run('ideogram-ai/ideogram-v3-turbo', {
      input: {
        prompt: enhancedPrompt,
        aspect_ratio: '3:2',
      },
    });

    const imageUrl = getOutputUrl(output);
    if (!imageUrl) {
      return Response.json({ error: 'No image output received' }, { status: 500 });
    }

    return Response.json({
      success: true,
      imageUrl,
      model: 'ideogram-ai/ideogram-v3-turbo',
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
