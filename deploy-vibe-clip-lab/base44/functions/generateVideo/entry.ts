import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    createClientFromRequest(req);

    const { prompt, characterDescription = '', duration = '10s' } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const replicateKey = Deno.env.get('REPLICATE_API_TOKEN') || Deno.env.get('REPLICATE_API_KEY');
    if (!replicateKey) {
      return Response.json({ error: 'Replicate API token not configured' }, { status: 500 });
    }

    // Enhanced prompt for video generation
    const enhancedPrompt = `${characterDescription ? `${characterDescription}. ` : ''}${prompt}. Realistic cinematic short video, natural human movement, stable camera, professional lighting, detailed environment, high quality production, no warping, no extra limbs, no text artifacts.`;

    // Map duration to frame count for Runway Video
    const durationMap = { '5s': 25, '10s': 50, '15s': 75, '30s': 150 };
    const frames = durationMap[duration] || 50;

    // Use Runway Video Generation v3
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'e377f792ef25d41eef45b7f49a87c1d3e22efd72f762a3a48963b7fbf3e5c651',
        input: {
          prompt: enhancedPrompt,
          num_inference_steps: 50,
          seed: Math.floor(Math.random() * 1000000),
        },
      }),
    });

    let prediction = await createResponse.json();

    if (!createResponse.ok) {
      console.error('Replicate creation error:', prediction);
      return Response.json({ error: 'Failed to create video generation request' }, { status: 500 });
    }

    // Poll for completion (video generation takes longer - up to 15 minutes)
    let attempts = 0;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 360) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateKey}`,
        },
      });

      prediction = await statusResponse.json();
      attempts++;
    }

    if (prediction.status === 'failed') {
      console.error('Video generation failed:', prediction.error);
      return Response.json({ error: 'Video generation failed. Please try again.' }, { status: 500 });
    }

    const videoUrl = prediction.output;
    if (!videoUrl) {
      return Response.json({ error: 'No video output received' }, { status: 500 });
    }

    return Response.json({
      success: true,
      videoUrl: videoUrl,
      predictionId: prediction.id,
      duration: duration,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
