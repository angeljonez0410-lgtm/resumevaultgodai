"use strict";(()=>{var e={};e.id=5806,e.ids=[5806],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},55315:e=>{e.exports=require("path")},68621:e=>{e.exports=require("punycode")},76162:e=>{e.exports=require("stream")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},6162:e=>{e.exports=require("worker_threads")},71568:e=>{e.exports=require("zlib")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},72477:e=>{e.exports=require("node:stream/web")},35111:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>h,patchFetch:()=>f,requestAsyncStorage:()=>l,routeModule:()=>d,serverHooks:()=>g,staticGenerationAsyncStorage:()=>m});var a={};r.r(a),r.d(a,{POST:()=>p});var s=r(49303),o=r(88716),n=r(60670),i=r(87070),u=r(54214),c=r(37532);async function p(e){try{if(!process.env.OPENAI_API_KEY)return i.NextResponse.json({error:"OpenAI API key not configured"},{status:500});let e=new u.ZP({apiKey:process.env.OPENAI_API_KEY}),t=(0,c.t)(),{data:r}=await t.from("social_settings").select("*").order("created_at",{ascending:!1}).limit(1).maybeSingle(),a=r?.brand_voice||"Professional, helpful, empowering",s=r?.target_audience||"job seekers, career changers, and professionals who want better resumes",o=r?.post_frequency||"daily",n=`
Create a 30-day social media content calendar for ResumeVaultGod.com.

Website: https://resumevaultgod.com/
Core offer: AI resume builder, ATS optimization, cover letters, interview prep, application tracking, and career-growth tools.
Brand voice: ${a}
Target audience: ${s}
Posting frequency: ${o}

Return exactly 30 items as a JSON array.
Each item must include:
- day_number
- platform
- topic
- caption

Rules:
- platforms should rotate between instagram, facebook, linkedin, twitter, youtube, pinterest, tiktok, threads, reddit
- content should help job seekers and career changers while pointing to ResumeVaultGod.com
- captions should be engaging and concise
- include CTAs that naturally reference ResumeVaultGod.com
- output valid JSON only
`,p=await e.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"user",content:n}],temperature:.8}),d=p.choices[0]?.message?.content?.trim()||"[]",l=[];try{l=JSON.parse(d)}catch{return i.NextResponse.json({error:"AI returned invalid JSON"},{status:500})}if(!Array.isArray(l)||!l.length)return i.NextResponse.json({error:"No calendar items generated"},{status:500});let m=new Date,g=l.slice(0,30).map((e,t)=>({platform:e.platform||"instagram",topic:e.topic||`Content Idea ${t+1}`,caption:e.caption||"",status:"scheduled",scheduled_time:(function(e,t){let r=new Date(e);return r.setDate(r.getDate()+t),r})(m,t+1).toISOString()})),{data:h,error:f}=await t.from("social_posts").insert(g).select("*");if(f)return i.NextResponse.json({error:f.message},{status:500});return await t.from("social_logs").insert({action:"Generated 30-day calendar",result:`Created ${g.length} scheduled posts`}),i.NextResponse.json({success:!0,count:g.length,posts:h||[]})}catch{return i.NextResponse.json({error:"Failed to generate content calendar"},{status:500})}}let d=new s.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/generate-calendar/route",pathname:"/api/generate-calendar",filename:"route",bundlePath:"app/api/generate-calendar/route"},resolvedPagePath:"C:\\Users\\Johns\\resumevault-social-bot\\app\\api\\generate-calendar\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:l,staticGenerationAsyncStorage:m,serverHooks:g}=d,h="/api/generate-calendar/route";function f(){return(0,n.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:m})}},37532:(e,t,r)=>{r.d(t,{t:()=>s});var a=r(88336);function s(){let e="https://pldnkhadhewaxyukzdqz.supabase.co",t=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!t)throw Error("Missing Supabase admin environment variables");return(0,a.eI)(e,t,{auth:{persistSession:!1,autoRefreshToken:!1}})}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[8948,5972,8336,4214],()=>r(35111));module.exports=a})();