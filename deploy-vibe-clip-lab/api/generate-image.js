import Replicate from 'replicate';

function outputUrl(output) {
  if (!output) return null;
  if (typeof output.url === 'function') return output.url().toString();
  if (typeof output === 'string') return output;
  if (Array.isArray(output)) return outputUrl(output[0]);
  if (output.url) return output.url.toString();
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
    if (!token) {
      return res.status(500).json({ error: 'REPLICATE_API_TOKEN is not configured in Vercel' });
    }

    const { prompt, characterDescription = '' } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const replicate = new Replicate({ auth: token });
    const output = await replicate.run('ideogram-ai/ideogram-v3-turbo', {
      input: {
        prompt: `${characterDescription ? `${characterDescription}\n\n` : ''}${prompt}`,
        aspect_ratio: '3:2',
      },
    });

    const imageUrl = outputUrl(output);
    if (!imageUrl) {
      return res.status(500).json({ error: 'No image output received' });
    }

    return res.status(200).json({ success: true, imageUrl, model: 'ideogram-ai/ideogram-v3-turbo' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Image generation failed' });
  }
}
