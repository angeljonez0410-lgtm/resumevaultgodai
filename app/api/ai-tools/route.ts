import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { invokeLLM, invokeLLMPremium } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const { action, ...params } = await req.json();

  try {
  switch (action) {
    case "analyze-job": {
      const analysis = await invokeLLM(`Analyze this job description and provide:

1. Key required skills
2. ATS keywords
3. Recommended resume improvements
4. Estimated ATS match score
5. Missing skills to add

Job Description:
Title: ${params.jobTitle}
Company: ${params.company}
Description:
${params.jobDescription}

Provide a detailed analysis in markdown format with clear sections.`);

      const keywords = await invokeLLM(
        `Extract ATS keywords from this job description and return as JSON with keys: hard_skills, soft_skills, tools, qualifications, industry_terms. Each value should be an array of strings.\n\n${params.jobDescription}`,
        { jsonSchema: {} }
      );

      return NextResponse.json({ analysis, keywords });
    }


    case "cover-letter": {
      const letter = await invokeLLM(`Write a professional cover letter.

Job Title: ${params.jobTitle}
Company: ${params.company}
Job Description: ${params.jobDescription}

Applicant Info:
Name: ${params.fullName || "Applicant"}
Skills: ${params.skills || ""}
Experience: ${params.experience || ""}

Tone: ${params.tone || "professional"}

Write a compelling cover letter that:
- Addresses the specific job requirements
- Highlights relevant skills and experience
- Shows enthusiasm for the company
- Is ATS-friendly with relevant keywords
- Is between 250-400 words

Output ONLY the cover letter text.`);

      return NextResponse.json({ letter });
    }

    case "resume-builder": {
      const resume = await invokeLLM(`Create an ATS-optimized resume draft.

Target Role: ${params.jobTitle}
Company: ${params.company || "Target company"}
Job Description:
${params.jobDescription}

Candidate Profile:
Name: ${params.fullName || "Candidate"}
Current Role: ${params.currentRole || ""}
Skills: ${params.skills || ""}
Experience:
${params.experience || ""}
Achievements:
${params.achievements || ""}

Build a professional resume in markdown with:
- Strong headline and summary
- ATS keyword skills section
- Experience bullets with measurable impact
- Projects or highlights when useful
- Missing keyword recommendations at the end

Keep it concise, polished, and tailored to the job.`);

      return NextResponse.json({ resume });
    }

    case "follow-up-email": {
      const email = await invokeLLM(`Write a professional follow-up email.

Type: ${params.type || "after-application"}
Job Title: ${params.jobTitle}
Company: ${params.company}
Applicant Name: ${params.fullName || "Applicant"}
Additional Context: ${params.context || ""}

Write a concise, professional follow-up email. Output ONLY the email text with subject line.`);

      return NextResponse.json({ email });
    }

    case "interview-prep": {
      const questions = await invokeLLMPremium(`You are an expert interview coach. Generate 8 interview questions for:

Job Title: ${params.jobTitle}
Company: ${params.company}
Job Description: ${params.jobDescription}

For each question provide:
1. The question
2. Why it's asked
3. A strong sample answer
4. Tips for delivery

Format as numbered list with clear sections.`);

      return NextResponse.json({ questions });
    }

    case "salary-negotiation": {
      const strategy = await invokeLLMPremium(`You are an expert salary negotiation coach. Create a comprehensive negotiation strategy.

Job Title: ${params.jobTitle}
Company: ${params.company}
Current Salary: ${params.currentSalary || "Not provided"}
Target Salary: ${params.targetSalary || "Not provided"}
Location: ${params.location || "Not provided"}
Experience Level: ${params.experienceLevel || "Not provided"}

Provide:
1. Market salary range for this role
2. Negotiation talking points
3. Counter-offer scripts
4. Benefits to negotiate beyond salary
5. Red flags to watch for
6. Step-by-step negotiation plan`);

      return NextResponse.json({ strategy });
    }

    case "career-roadmap": {
      const roadmap = await invokeLLMPremium(`Create a detailed career roadmap.

Current Role: ${params.currentRole || "Not provided"}
Target Role: ${params.targetRole}
Industry: ${params.industry || "Not specified"}
Experience Years: ${params.experienceYears || "Not provided"}
Skills: ${params.skills || ""}

Provide:
1. 3-month, 6-month, 1-year, 2-year milestones
2. Skills to develop
3. Certifications to pursue
4. Networking strategies
5. Job search timeline
6. Salary progression expectations

Format with clear sections and actionable steps.`);

      return NextResponse.json({ roadmap });
    }

    case "portfolio-ideas": {
      const ideas = await invokeLLMPremium(`Generate 6 portfolio project ideas for:

Target Role: ${params.targetRole}
Skills: ${params.skills || ""}
Industry: ${params.industry || ""}

For each project provide:
1. Project name
2. Description (2-3 sentences)
3. Technologies to use
4. Estimated time to complete
5. How it demonstrates relevant skills
6. Complexity level (beginner/intermediate/advanced)

Output as a numbered list with clear sections.`);

      return NextResponse.json({ ideas });
    }

    case "mock-interview": {
      const result = await invokeLLMPremium(`You are conducting a mock interview. Evaluate this answer.

Question: ${params.question}
Answer: ${params.answer}
Job Title: ${params.jobTitle}

Provide:
1. Score (1-10)
2. Strengths of the answer
3. Areas for improvement
4. A better sample answer
5. Delivery tips

Be encouraging but honest.`);

      return NextResponse.json({ feedback: result });
    }

    case "executive-resume": {
      const resume = await invokeLLMPremium(`Create a C-suite/executive level resume.

Name: ${params.fullName || "Executive"}
Target Role: ${params.targetRole}
Industry: ${params.industry || ""}
Experience: ${params.experience || ""}
Achievements: ${params.achievements || ""}

Create an executive resume that:
- Leads with a powerful executive summary
- Emphasizes leadership and strategic impact
- Quantifies business results (revenue, growth, team size)
- Uses senior-level language
- Highlights board/advisory positions
- Includes industry recognition

Output in clean markdown format.`);

      return NextResponse.json({ resume });
    }

    case "portfolio-builder": {
      const html = await invokeLLM(`Generate a clean, modern HTML portfolio page.

Name: ${params.fullName || "Developer"}
Title: ${params.title || "Full Stack Developer"}
Bio: ${params.bio || ""}
Skills: ${params.skills || ""}
Projects: ${params.projects || ""}

Generate a single complete HTML file with embedded CSS. Make it:
- Modern and professional
- Responsive with mobile support
- Clean typography
- Subtle animations
- Navy (#1e2d42) and gold (#f4c542) color scheme

Output ONLY the HTML code.`);

      return NextResponse.json({ html });
    }

    case "interview-mastery": {
      const questions = await invokeLLMPremium(`Generate 20 company-specific interview questions.

Company: ${params.company}
Job Title: ${params.jobTitle}
Job Description: ${params.jobDescription || ""}

For each question provide:
1. The question
2. Why ${params.company} asks this
3. Key points to include in your answer
4. Sample strong answer

Group by category: Behavioral, Technical, Company-Specific, Case Study.`);

      return NextResponse.json({ questions });
    }

    case "auto-apply": {
      const searchResults = await invokeLLM(
        `You are a job search assistant. Based on these criteria, generate 5 realistic job listings in JSON format.

Target Role: ${params.targetRole}
Location: ${params.location || "Remote"}
Experience Level: ${params.experienceLevel || "Mid-level"}
Skills: ${params.skills || ""}

Return JSON array with objects containing: title, company, location, salary_range, match_score (0-100), description (2 sentences), requirements (array of 3-4 items).`,
        { jsonSchema: {} }
      );

      return NextResponse.json({ jobs: searchResults });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  } catch {
    return NextResponse.json({ error: "AI request failed. Please try again." }, { status: 500 });
  }
}
