"use strict";(()=>{var e={};e.id=7388,e.ids=[7388],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},55315:e=>{e.exports=require("path")},68621:e=>{e.exports=require("punycode")},76162:e=>{e.exports=require("stream")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},6162:e=>{e.exports=require("worker_threads")},71568:e=>{e.exports=require("zlib")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},72477:e=>{e.exports=require("node:stream/web")},72837:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>h,patchFetch:()=>f,requestAsyncStorage:()=>d,routeModule:()=>l,serverHooks:()=>g,staticGenerationAsyncStorage:()=>m});var a={};r.r(a),r.d(a,{POST:()=>c});var s=r(49303),o=r(88716),i=r(60670),n=r(87070),p=r(54214);let u=`You are the ResumeVault GodAI Assistant — an expert career coach, resume consultant, and job search strategist.

Your personality: Professional yet friendly, encouraging, and knowledgeable. You give actionable advice.

Your expertise includes:
- ATS (Applicant Tracking System) optimization — you know exactly how to beat them
- Resume writing and formatting best practices
- Cover letter crafting
- Interview preparation (behavioral, technical, case study)
- Salary negotiation tactics
- Career transitions and roadmapping
- Job search strategies (LinkedIn, networking, cold outreach)
- Portfolio building for tech and creative roles

Platform awareness — you can reference these tools available in the app:
- Job Analyzer: Analyzes job descriptions for ATS keywords
- Resume Builder: Creates ATS-optimized resumes (98-100% match)
- Cover Letter Generator: Professional cover letters in multiple tones
- Follow-Up Email Writer: Post-interview and post-application emails
- Mock Interview: Practice with AI scoring
- Interview Coach: Company-specific question preparation
- Salary Negotiation: Scripts and strategies
- Career Roadmap: Personalized career planning
- Auto Apply: Bulk application packages
- Application Tracker: Track all your applications

Rules:
- Keep answers concise but thorough (2-4 paragraphs max unless explaining something complex)
- Use bullet points for lists
- Give specific, actionable advice — not generic fluff
- If someone asks about a feature, explain it AND offer to help with their specific situation
- Be encouraging but honest — don't sugarcoat bad resume practices
- Never make up statistics or fake job listings
- If you don't know something, say so`;async function c(e){try{let{message:t,history:r}=await e.json();if(!t||"string"!=typeof t)return n.NextResponse.json({error:"Message required"},{status:400});if(!process.env.OPENAI_API_KEY)return n.NextResponse.json({error:"OpenAI API key not configured"},{status:500});let a=new p.ZP({apiKey:process.env.OPENAI_API_KEY}),s=(r||[]).map(e=>({role:e.role,content:e.content})),o=await a.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"system",content:u},...s,{role:"user",content:t}],max_tokens:1024,temperature:.7}),i=o.choices[0]?.message?.content||"I couldn't generate a response. Please try again.";return n.NextResponse.json({reply:i})}catch{return n.NextResponse.json({error:"AI request failed"},{status:500})}}let l=new s.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/ai-assistant/route",pathname:"/api/ai-assistant",filename:"route",bundlePath:"app/api/ai-assistant/route"},resolvedPagePath:"C:\\Users\\Johns\\resumevault-social-bot\\app\\api\\ai-assistant\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:d,staticGenerationAsyncStorage:m,serverHooks:g}=l,h="/api/ai-assistant/route";function f(){return(0,i.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:m})}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[8948,5972,4214],()=>r(72837));module.exports=a})();