export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
    if (!token) {
      return res.status(500).json({ error: 'REPLICATE_API_TOKEN is not configured in Vercel' });
    }

    const { prompt, characterDescription = '', duration = '10s' } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'e377f792ef25d41eef45b7f49a87c1d3e22efd72f762a3a48963b7fbf3e5c651',
        input: {
          prompt: `${characterDescription ? `${characterDescription}. ` : ''}${prompt}. Realistic cinematic short video, natural human movement, stable camera, professional lighting, detailed environment, high quality production, no warping, no extra limbs, no text artifacts.`,
          num_inference_steps: 50,
          seed: Math.floor(Math.random() * 1000000),
        },
      }),
    });

    let prediction = await createResponse.json();
    if (!createResponse.ok) {
      return res.status(500).json({ error: prediction?.detail || 'Failed to create video generation request' });
    }

    let attempts = 0;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 180) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${token}` },
      });
      prediction = await statusResponse.json();
      attempts++;
    }

    if (prediction.status !== 'succeeded') {
      return res.status(500).json({ error: prediction.error || 'Video generation timed out or failed' });
    }

    const videoUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!videoUrl) {
      return res.status(500).json({ error: 'No video output received' });
    }

    return res.status(200).json({ success: true, videoUrl, duration, predictionId: prediction.id });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Video generation failed' });
  }
}
