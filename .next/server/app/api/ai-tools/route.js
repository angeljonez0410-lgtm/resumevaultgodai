"use strict";(()=>{var e={};e.id=6416,e.ids=[6416],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},55315:e=>{e.exports=require("path")},68621:e=>{e.exports=require("punycode")},76162:e=>{e.exports=require("stream")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},6162:e=>{e.exports=require("worker_threads")},71568:e=>{e.exports=require("zlib")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},72477:e=>{e.exports=require("node:stream/web")},59256:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>g,patchFetch:()=>w,requestAsyncStorage:()=>h,routeModule:()=>d,serverHooks:()=>v,staticGenerationAsyncStorage:()=>y});var r={};o.r(r),o.d(r,{POST:()=>m});var s=o(49303),a=o(88716),i=o(60670),n=o(87070),l=o(54214);function p(){if(!process.env.OPENAI_API_KEY)throw Error("OpenAI API key not configured");return new l.ZP({apiKey:process.env.OPENAI_API_KEY})}async function c(e,t){let o=p();if(t?.jsonSchema){let t=await o.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"user",content:e}],response_format:{type:"json_object"},temperature:.7,max_tokens:4096});return JSON.parse(t.choices[0]?.message?.content||"{}")}let r=await o.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"user",content:e}],temperature:.7,max_tokens:4096});return r.choices[0]?.message?.content||""}async function u(e){let t=p(),o=await t.chat.completions.create({model:"gpt-4o",messages:[{role:"user",content:e}],temperature:.7,max_tokens:8192});return o.choices[0]?.message?.content||""}async function m(e){let{action:t,...o}=await e.json();try{switch(t){case"analyze-job":{let e=await c(`Analyze this job description and provide:

1. Key required skills
2. ATS keywords
3. Recommended resume improvements
4. Estimated ATS match score
5. Missing skills to add

Job Description:
Title: ${o.jobTitle}
Company: ${o.company}
Description:
${o.jobDescription}

Provide a detailed analysis in markdown format with clear sections.`),t=await c(`Extract ATS keywords from this job description and return as JSON with keys: hard_skills, soft_skills, tools, qualifications, industry_terms. Each value should be an array of strings.

${o.jobDescription}`,{jsonSchema:{}});return n.NextResponse.json({analysis:e,keywords:t})}case"cover-letter":{let e=await c(`Write a professional cover letter.

Job Title: ${o.jobTitle}
Company: ${o.company}
Job Description: ${o.jobDescription}

Applicant Info:
Name: ${o.fullName||"Applicant"}
Skills: ${o.skills||""}
Experience: ${o.experience||""}

Tone: ${o.tone||"professional"}

Write a compelling cover letter that:
- Addresses the specific job requirements
- Highlights relevant skills and experience
- Shows enthusiasm for the company
- Is ATS-friendly with relevant keywords
- Is between 250-400 words

Output ONLY the cover letter text.`);return n.NextResponse.json({letter:e})}case"follow-up-email":{let e=await c(`Write a professional follow-up email.

Type: ${o.type||"after-application"}
Job Title: ${o.jobTitle}
Company: ${o.company}
Applicant Name: ${o.fullName||"Applicant"}
Additional Context: ${o.context||""}

Write a concise, professional follow-up email. Output ONLY the email text with subject line.`);return n.NextResponse.json({email:e})}case"interview-prep":{let e=await u(`You are an expert interview coach. Generate 8 interview questions for:

Job Title: ${o.jobTitle}
Company: ${o.company}
Job Description: ${o.jobDescription}

For each question provide:
1. The question
2. Why it's asked
3. A strong sample answer
4. Tips for delivery

Format as numbered list with clear sections.`);return n.NextResponse.json({questions:e})}case"salary-negotiation":{let e=await u(`You are an expert salary negotiation coach. Create a comprehensive negotiation strategy.

Job Title: ${o.jobTitle}
Company: ${o.company}
Current Salary: ${o.currentSalary||"Not provided"}
Target Salary: ${o.targetSalary||"Not provided"}
Location: ${o.location||"Not provided"}
Experience Level: ${o.experienceLevel||"Not provided"}

Provide:
1. Market salary range for this role
2. Negotiation talking points
3. Counter-offer scripts
4. Benefits to negotiate beyond salary
5. Red flags to watch for
6. Step-by-step negotiation plan`);return n.NextResponse.json({strategy:e})}case"career-roadmap":{let e=await u(`Create a detailed career roadmap.

Current Role: ${o.currentRole||"Not provided"}
Target Role: ${o.targetRole}
Industry: ${o.industry||"Not specified"}
Experience Years: ${o.experienceYears||"Not provided"}
Skills: ${o.skills||""}

Provide:
1. 3-month, 6-month, 1-year, 2-year milestones
2. Skills to develop
3. Certifications to pursue
4. Networking strategies
5. Job search timeline
6. Salary progression expectations

Format with clear sections and actionable steps.`);return n.NextResponse.json({roadmap:e})}case"portfolio-ideas":{let e=await u(`Generate 6 portfolio project ideas for:

Target Role: ${o.targetRole}
Skills: ${o.skills||""}
Industry: ${o.industry||""}

For each project provide:
1. Project name
2. Description (2-3 sentences)
3. Technologies to use
4. Estimated time to complete
5. How it demonstrates relevant skills
6. Complexity level (beginner/intermediate/advanced)

Output as a numbered list with clear sections.`);return n.NextResponse.json({ideas:e})}case"mock-interview":{let e=await u(`You are conducting a mock interview. Evaluate this answer.

Question: ${o.question}
Answer: ${o.answer}
Job Title: ${o.jobTitle}

Provide:
1. Score (1-10)
2. Strengths of the answer
3. Areas for improvement
4. A better sample answer
5. Delivery tips

Be encouraging but honest.`);return n.NextResponse.json({feedback:e})}case"executive-resume":{let e=await u(`Create a C-suite/executive level resume.

Name: ${o.fullName||"Executive"}
Target Role: ${o.targetRole}
Industry: ${o.industry||""}
Experience: ${o.experience||""}
Achievements: ${o.achievements||""}

Create an executive resume that:
- Leads with a powerful executive summary
- Emphasizes leadership and strategic impact
- Quantifies business results (revenue, growth, team size)
- Uses senior-level language
- Highlights board/advisory positions
- Includes industry recognition

Output in clean markdown format.`);return n.NextResponse.json({resume:e})}case"portfolio-builder":{let e=await c(`Generate a clean, modern HTML portfolio page.

Name: ${o.fullName||"Developer"}
Title: ${o.title||"Full Stack Developer"}
Bio: ${o.bio||""}
Skills: ${o.skills||""}
Projects: ${o.projects||""}

Generate a single complete HTML file with embedded CSS. Make it:
- Modern and professional
- Responsive with mobile support
- Clean typography
- Subtle animations
- Navy (#1e2d42) and gold (#f4c542) color scheme

Output ONLY the HTML code.`);return n.NextResponse.json({html:e})}case"interview-mastery":{let e=await u(`Generate 20 company-specific interview questions.

Company: ${o.company}
Job Title: ${o.jobTitle}
Job Description: ${o.jobDescription||""}

For each question provide:
1. The question
2. Why ${o.company} asks this
3. Key points to include in your answer
4. Sample strong answer

Group by category: Behavioral, Technical, Company-Specific, Case Study.`);return n.NextResponse.json({questions:e})}case"auto-apply":{let e=await c(`You are a job search assistant. Based on these criteria, generate 5 realistic job listings in JSON format.

Target Role: ${o.targetRole}
Location: ${o.location||"Remote"}
Experience Level: ${o.experienceLevel||"Mid-level"}
Skills: ${o.skills||""}

Return JSON array with objects containing: title, company, location, salary_range, match_score (0-100), description (2 sentences), requirements (array of 3-4 items).`,{jsonSchema:{}});return n.NextResponse.json({jobs:e})}default:return n.NextResponse.json({error:"Unknown action"},{status:400})}}catch{return n.NextResponse.json({error:"AI request failed. Please try again."},{status:500})}}let d=new s.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/ai-tools/route",pathname:"/api/ai-tools",filename:"route",bundlePath:"app/api/ai-tools/route"},resolvedPagePath:"C:\\Users\\Johns\\resumevault-social-bot\\app\\api\\ai-tools\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:h,staticGenerationAsyncStorage:y,serverHooks:v}=d,g="/api/ai-tools/route";function w(){return(0,i.patchFetch)({serverHooks:v,staticGenerationAsyncStorage:y})}}};var t=require("../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[8948,5972,4214],()=>o(59256));module.exports=r})();