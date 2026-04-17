"use strict";(()=>{var e={};e.id=848,e.ids=[848],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},55315:e=>{e.exports=require("path")},68621:e=>{e.exports=require("punycode")},76162:e=>{e.exports=require("stream")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},6162:e=>{e.exports=require("worker_threads")},71568:e=>{e.exports=require("zlib")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},72477:e=>{e.exports=require("node:stream/web")},47e3:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>g,patchFetch:()=>h,requestAsyncStorage:()=>m,routeModule:()=>d,serverHooks:()=>v,staticGenerationAsyncStorage:()=>l});var o={};r.r(o),r.d(o,{POST:()=>c});var s=r(49303),i=r(88716),a=r(60670),n=r(87070),p=r(54214),u=r(37532);async function c(e){try{let{topic:t,visualStyle:r}=await e.json();if(!t)return n.NextResponse.json({error:"Topic is required"},{status:400});if(!process.env.OPENAI_API_KEY)return n.NextResponse.json({error:"OpenAI API key not configured"},{status:500});let o=new p.ZP({apiKey:process.env.OPENAI_API_KEY}),s=(0,u.t)(),{data:i}=await s.from("social_settings").select("*").order("created_at",{ascending:!1}).limit(1).maybeSingle(),a=i?.brand_voice||"Professional, empowering, premium",c=i?.target_audience||"job seekers, career changers, and ambitious professionals",d=`
You are a premium video ad creative strategist.

Generate one photorealistic short-form vertical video prompt for ResumeVaultGod.com.

Brand: ResumeVaultGod.com
Website: https://resumevaultgod.com/
Topic: ${t}
Visual style preset: ${r||"ResumeVaultGod AI Career Brand"}
Brand voice: ${a}
Target audience: ${c}

Requirements:
- 9:16 vertical
- 15 to 30 seconds
- premium SaaS ad feel
- photorealistic
- cinematic
- realistic people and settings
- no animation unless necessary
- no cheesy stock footage look

The concept should include:
- hook scene
- subject
- setting
- motion/action
- camera movement
- lighting
- product/app usage moment if relevant
- ending CTA visual
- clear tie-in to AI resumes, ATS optimization, interview prep, cover letters, or application tracking
- CTA to visit ResumeVaultGod.com

Output in this exact format:

VIDEO_PROMPT:
[final detailed video prompt]

SHOT_LIST:
- [shot 1]
- [shot 2]
- [shot 3]

STYLE_NOTES:
[style notes]
`,m=await o.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"user",content:d}],temperature:.9}),l=m.choices[0]?.message?.content?.trim()||"";return await s.from("social_logs").insert({action:"Generated realistic video prompt",result:`Video prompt generated for topic: ${t}`}),n.NextResponse.json({prompt:l})}catch{return n.NextResponse.json({error:"Failed to generate video prompt"},{status:500})}}let d=new s.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/generate-video-prompt/route",pathname:"/api/generate-video-prompt",filename:"route",bundlePath:"app/api/generate-video-prompt/route"},resolvedPagePath:"C:\\Users\\Johns\\resumevault-social-bot\\app\\api\\generate-video-prompt\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:m,staticGenerationAsyncStorage:l,serverHooks:v}=d,g="/api/generate-video-prompt/route";function h(){return(0,a.patchFetch)({serverHooks:v,staticGenerationAsyncStorage:l})}},37532:(e,t,r)=>{r.d(t,{t:()=>s});var o=r(88336);function s(){let e="https://pldnkhadhewaxyukzdqz.supabase.co",t=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!t)throw Error("Missing Supabase admin environment variables");return(0,o.eI)(e,t,{auth:{persistSession:!1,autoRefreshToken:!1}})}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[8948,5972,8336,4214],()=>r(47e3));module.exports=o})();