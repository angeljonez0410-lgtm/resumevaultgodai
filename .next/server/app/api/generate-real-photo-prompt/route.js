"use strict";(()=>{var e={};e.id=5238,e.ids=[5238],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},55315:e=>{e.exports=require("path")},68621:e=>{e.exports=require("punycode")},76162:e=>{e.exports=require("stream")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},6162:e=>{e.exports=require("worker_threads")},71568:e=>{e.exports=require("zlib")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},72477:e=>{e.exports=require("node:stream/web")},81252:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>g,patchFetch:()=>f,requestAsyncStorage:()=>d,routeModule:()=>m,serverHooks:()=>h,staticGenerationAsyncStorage:()=>l});var o={};t.r(o),t.d(o,{POST:()=>c});var a=t(49303),s=t(88716),i=t(60670),n=t(87070),p=t(54214),u=t(37532);async function c(e){try{let{topic:r,visualStyle:t}=await e.json();if(!r)return n.NextResponse.json({error:"Topic is required"},{status:400});if(!process.env.OPENAI_API_KEY)return n.NextResponse.json({error:"OpenAI API key not configured"},{status:500});let o=new p.ZP({apiKey:process.env.OPENAI_API_KEY}),a=(0,u.t)(),{data:s}=await a.from("social_settings").select("*").order("created_at",{ascending:!1}).limit(1).maybeSingle(),i=s?.brand_voice||"Professional, empowering, premium",c=s?.target_audience||"job seekers, career changers, and ambitious professionals",m=`
You are a world-class creative director for premium SaaS ad campaigns.

Generate one ultra-realistic AI image prompt for ResumeVaultGod.com.

Brand: ResumeVaultGod.com
Website: https://resumevaultgod.com/
Topic: ${r}
Visual style preset: ${t||"ResumeVaultGod AI Career Brand"}
Brand voice: ${i}
Target audience: ${c}

The image must feel like:
- a premium startup ad
- cinematic
- photorealistic
- social-media ready
- 4K
- believable
- modern
- no stock-photo look

The image should be tied to ResumeVaultGod.com and career growth themes:
- AI resume builder
- ATS optimization and resume score improvement
- cover letters and job applications
- interview prep and recruiter callbacks
- professionals using laptops or phones
- polished dashboard/product usage moments
- clean office or home office scenes
- diverse professionals with authentic confidence
- subtle "God Mode your job search" energy without cheesy fantasy imagery

Output in this exact format:

PHOTO_PROMPT:
[final detailed prompt]

NEGATIVE_PROMPT:
[negative prompt]

Keep it concise but premium and specific.
`,d=await o.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"user",content:m}],temperature:.9}),l=d.choices[0]?.message?.content?.trim()||"";return await a.from("social_logs").insert({action:"Generated realistic photo prompt",result:`Photo prompt generated for topic: ${r}`}),n.NextResponse.json({prompt:l})}catch{return n.NextResponse.json({error:"Failed to generate real photo prompt"},{status:500})}}let m=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/generate-real-photo-prompt/route",pathname:"/api/generate-real-photo-prompt",filename:"route",bundlePath:"app/api/generate-real-photo-prompt/route"},resolvedPagePath:"C:\\Users\\Johns\\resumevault-social-bot\\app\\api\\generate-real-photo-prompt\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:d,staticGenerationAsyncStorage:l,serverHooks:h}=m,g="/api/generate-real-photo-prompt/route";function f(){return(0,i.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:l})}},37532:(e,r,t)=>{t.d(r,{t:()=>a});var o=t(88336);function a(){let e="https://pldnkhadhewaxyukzdqz.supabase.co",r=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!r)throw Error("Missing Supabase admin environment variables");return(0,o.eI)(e,r,{auth:{persistSession:!1,autoRefreshToken:!1}})}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[8948,5972,8336,4214],()=>t(81252));module.exports=o})();