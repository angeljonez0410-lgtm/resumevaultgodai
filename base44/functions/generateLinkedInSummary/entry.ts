import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeText, targetRole, useCache, streamResponse } = await req.json();

    if (!resumeText) {
      return Response.json({ error: 'Resume text required' }, { status: 400 });
    }

    const resumeHash = hashResume(resumeText + (targetRole || ''));

    // Check cache first (instant results for repeated generations)
    if (useCache) {
      try {
        const cached = await base44.asServiceRole.entities.LinkedInSummaryCache.filter({
          created_by: user.email,
          resume_hash: resumeHash
        });
        
        if (cached.length > 0) {
          return Response.json({
            summary: cached[0].cached_summary,
            generated_at: cached[0].created_date,
            fromCache: true,
            processingTimeMs: 0
          });
        }
      } catch (e) {
        // Cache entity doesn't exist yet, continue
      }
    }

    const startTime = Date.now();

    // Use Gemini 3 Flash for speed (1-3 mins) with fast config
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this resume, create a compelling LinkedIn profile summary (150-200 words) optimized for ATS and recruiter attention.

${targetRole ? `Target Role: ${targetRole}` : ''}

RESUME:
${resumeText}

Generate ONLY the summary text, no introductions or explanations. Make it professional, compelling, and include key achievements and skills.`,
      model: 'gemini_3_flash'
    });

    const processingTime = Date.now() - startTime;

    // Cache the result
    try {
      await base44.asServiceRole.entities.LinkedInSummaryCache.create({
        resume_hash: resumeHash,
        cached_summary: result,
        target_role: targetRole || '',
        created_by: user.email
      });
    } catch (e) {
      // Cache creation failed, but generation succeeded
      console.error('Cache save failed:', e);
    }

    return Response.json({
      summary: result,
      generated_at: new Date().toISOString(),
      fromCache: false,
      processingTimeMs: processingTime,
      streamReady: true
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function hashResume(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}