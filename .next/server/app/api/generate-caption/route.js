"use strict";(()=>{var e={};e.id=5056,e.ids=[5056],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},55315:e=>{e.exports=require("path")},68621:e=>{e.exports=require("punycode")},76162:e=>{e.exports=require("stream")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},6162:e=>{e.exports=require("worker_threads")},71568:e=>{e.exports=require("zlib")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},72477:e=>{e.exports=require("node:stream/web")},14179:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>h,patchFetch:()=>f,requestAsyncStorage:()=>l,routeModule:()=>d,serverHooks:()=>g,staticGenerationAsyncStorage:()=>m});var o={};t.r(o),t.d(o,{POST:()=>c});var a=t(49303),s=t(88716),n=t(60670),i=t(87070),p=t(54214),u=t(37532);async function c(e){try{let{topic:r}=await e.json();if(!r)return i.NextResponse.json({error:"Topic is required"},{status:400});if(!process.env.OPENAI_API_KEY)return i.NextResponse.json({error:"OpenAI API key not configured"},{status:500});let t=new p.ZP({apiKey:process.env.OPENAI_API_KEY}),o=(0,u.t)(),{data:a}=await o.from("social_settings").select("*").order("created_at",{ascending:!1}).limit(1).maybeSingle(),s=a?.brand_voice||"Professional, helpful, empowering",n=a?.target_audience||"job seekers, career changers, and professionals who want better resumes",c=a?.post_frequency||"daily",d=`
You are writing a high-performing social media caption for ResumeVaultGod.com.

Topic: ${r}
Website: https://resumevaultgod.com/
Core offer: AI resume builder, ATS optimization, cover letters, interview prep, application tracking, and career-growth tools.
Brand voice: ${s}
Target audience: ${n}
Post frequency style: ${c}

Write one engaging caption with:
- a strong hook
- useful career advice tied to ResumeVaultGod.com
- short paragraphs
- a call to action
- relevant hashtags

Keep it platform-neutral and ready for Instagram, LinkedIn, TikTok, Threads, or Twitter/X.
Do not mention unrelated brands. Make the CTA point people to ResumeVaultGod.com.
`,l=await t.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"user",content:d}],temperature:.8}),m=l.choices[0]?.message?.content?.trim()||"No caption generated";return await o.from("social_logs").insert({action:"Generated AI caption",result:`Caption generated for topic: ${r}`}),i.NextResponse.json({caption:m})}catch{return i.NextResponse.json({error:"Failed to generate caption"},{status:500})}}let d=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/generate-caption/route",pathname:"/api/generate-caption",filename:"route",bundlePath:"app/api/generate-caption/route"},resolvedPagePath:"C:\\Users\\Johns\\resumevault-social-bot\\app\\api\\generate-caption\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:l,staticGenerationAsyncStorage:m,serverHooks:g}=d,h="/api/generate-caption/route";function f(){return(0,n.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:m})}},37532:(e,r,t)=>{t.d(r,{t:()=>a});var o=t(88336);function a(){let e="https://pldnkhadhewaxyukzdqz.supabase.co",r=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!r)throw Error("Missing Supabase admin environment variables");return(0,o.eI)(e,r,{auth:{persistSession:!1,autoRefreshToken:!1}})}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[8948,5972,8336,4214],()=>t(14179));module.exports=o})();