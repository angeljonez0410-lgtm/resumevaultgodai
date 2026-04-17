import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Replicate from 'npm:replicate';

function getOutputUrl(output) {
  if (!output) return null;
  if (typeof output.url === 'function') return output.url().toString();
  if (typeof output === 'string') return output;
  if (Array.isArray(output)) return getOutputUrl(output[0]);
  if (output.url) return output.url.toString();
  return null;
}

Deno.serve(async (req) => {
  try {
    createClientFromRequest(req);

    const { video, caption_size = 100 } = await req.json();

    if (!video) {
      return Response.json({ error: 'Video URL is required' }, { status: 400 });
    }

    const replicateKey = Deno.env.get('REPLICATE_API_TOKEN') || Deno.env.get('REPLICATE_API_KEY');
    if (!replicateKey) {
      return Response.json({ error: 'Replicate API token not configured' }, { status: 500 });
    }

    const replicate = new Replicate({ auth: replicateKey });
    const output = await replicate.run(
      'shreejalmaharjan-27/tiktok-short-captions:46bf1c12c77ad1782d6f87828d4d8ba4d48646b8e1271b490cb9e95ccdbc4504',
      {
        input: {
          video,
          caption_size,
        },
      }
    );

    const videoUrl = getOutputUrl(output);
    if (!videoUrl) {
      return Response.json({ error: 'No captioned video output received' }, { status: 500 });
    }

    return Response.json({
      success: true,
      videoUrl,
      model: 'shreejalmaharjan-27/tiktok-short-captions',
    });
  } catch (error) {
    console.error('Caption video error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
