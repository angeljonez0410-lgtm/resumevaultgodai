"use strict";(()=>{var e={};e.id=5321,e.ids=[5321],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},55315:e=>{e.exports=require("path")},68621:e=>{e.exports=require("punycode")},76162:e=>{e.exports=require("stream")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},6162:e=>{e.exports=require("worker_threads")},71568:e=>{e.exports=require("zlib")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},72477:e=>{e.exports=require("node:stream/web")},36942:(e,t,s)=>{s.r(t),s.d(t,{originalPathname:()=>f,patchFetch:()=>_,requestAsyncStorage:()=>m,routeModule:()=>l,serverHooks:()=>g,staticGenerationAsyncStorage:()=>h});var a={};s.r(a),s.d(a,{POST:()=>d});var o=s(49303),r=s(88716),i=s(60670),n=s(87070),c=s(54214),u=s(37532);async function p(e){let t=(0,u.t)();if("create_post"===e.type){let{data:s,error:a}=await t.from("social_posts").insert({platform:e.platform,topic:e.topic,caption:e.caption,status:e.status||"draft",scheduled_time:e.scheduled_time||null}).select().single();return a?{success:!1,error:a.message}:{success:!0,post:s}}if("update_settings"===e.type){let s={};e.brand_voice&&(s.brand_voice=e.brand_voice),e.target_audience&&(s.target_audience=e.target_audience),e.post_frequency&&(s.post_frequency=e.post_frequency);let{data:a}=await t.from("social_settings").select("id").order("created_at",{ascending:!1}).limit(1).maybeSingle();return a?await t.from("social_settings").update(s).eq("id",a.id):await t.from("social_settings").insert(s),{success:!0}}if("delete_post"===e.type){let{error:s}=await t.from("social_posts").delete().eq("id",e.post_id);return s?{success:!1,error:s.message}:{success:!0}}if("update_post_status"===e.type){let{error:s}=await t.from("social_posts").update({status:e.status}).eq("id",e.post_id);return s?{success:!1,error:s.message}:{success:!0}}if("get_stats"===e.type){let{count:e}=await t.from("social_posts").select("*",{count:"exact",head:!0}),{count:s}=await t.from("social_posts").select("*",{count:"exact",head:!0}).eq("status","scheduled"),{count:a}=await t.from("social_posts").select("*",{count:"exact",head:!0}).eq("status","posted"),{count:o}=await t.from("social_posts").select("*",{count:"exact",head:!0}).eq("status","draft");return{success:!0,stats:{total:e,scheduled:s,posted:a,drafts:o}}}return{success:!1,error:"Unknown action"}}async function d(e){try{let t;let{message:s,history:a,userName:o}=await e.json();if(!s||"string"!=typeof s)return n.NextResponse.json({error:"Message is required"},{status:400});if(!process.env.OPENAI_API_KEY)return n.NextResponse.json({error:"OpenAI API key not configured"},{status:500});let r=new c.ZP({apiKey:process.env.OPENAI_API_KEY}),i=(0,u.t)(),{data:d}=await i.from("social_settings").select("*").order("created_at",{ascending:!1}).limit(1).maybeSingle(),l=d?.brand_voice||"Professional, empowering, modern",m=d?.target_audience||"Job seekers and career switchers",h=d?.post_frequency||"daily",{data:g}=await i.from("social_posts").select("id, platform, topic, caption, status, scheduled_time").order("created_at",{ascending:!1}).limit(15),{count:f}=await i.from("social_posts").select("*",{count:"exact",head:!0}),{count:_}=await i.from("social_posts").select("*",{count:"exact",head:!0}).eq("status","scheduled"),y=g?.length?`

Recent posts (${f} total, ${_} scheduled):
${g.map(e=>`- [${e.platform}] "${e.topic}" — ${e.status}${e.scheduled_time?` (scheduled: ${e.scheduled_time})`:""} (id: ${e.id})`).join("\n")}`:"\n\nNo posts created yet.",w=`You are Aria, the AI social media manager for ResumeVault. You are professional, incredibly knowledgeable about social media, but also warm, supportive, and fun — like a best friend who happens to be a marketing genius.

YOUR PERSONALITY:
- You're confident but never arrogant. You hype up the user and their brand.
- You use a warm, encouraging tone. Sprinkle in occasional casual language like "girl let's get it", "okay love", "we got this", "bestie" — but stay professional when writing actual content.
- You celebrate wins and stay positive about setbacks. 
- You're direct and action-oriented. You don't just suggest — you DO things.
- You use emojis sparingly but effectively ✨

THE USER: ${o||"Boss"}

CURRENT SETTINGS:
- Brand voice: ${l}
- Target audience: ${m}
- Posting frequency: ${h}
${y}

YOUR CAPABILITIES — You can take real actions by including a JSON action block in your response:
When the user asks you to do something, DO IT by including an action block like this in your response:

[ACTION: {"type": "create_post", "platform": "instagram", "topic": "Resume Tips", "caption": "Your caption here...", "status": "draft"}]
[ACTION: {"type": "create_post", "platform": "facebook", "topic": "Resume Tips", "caption": "Your caption here...", "status": "draft"}]
[ACTION: {"type": "create_post", "platform": "twitter", "topic": "Career Advice", "caption": "Tweet text", "status": "scheduled", "scheduled_time": "2026-04-10T14:00:00Z"}]
[ACTION: {"type": "update_settings", "post_frequency": "3x daily", "brand_voice": "New voice", "target_audience": "New audience"}]
[ACTION: {"type": "delete_post", "post_id": "uuid-here"}]
[ACTION: {"type": "update_post_status", "post_id": "uuid-here", "status": "scheduled"}]
[ACTION: {"type": "get_stats"}]

RULES:
- When asked to create a post, write a great caption and include the action block to actually create it.
- When asked to change posting frequency (like "I want to post 3 times a day"), update the settings.
- When asked about stats or performance, fetch and report them.
- You can include multiple actions in one response.
- Always explain what you did after taking an action.
- For scheduled posts, use ISO 8601 datetime format.
- Platforms: instagram, facebook, twitter, linkedin, youtube, pinterest, tiktok, reddit, threads
- Statuses: draft, scheduled, posted, failed`,b=[{role:"system",content:w},...Array.isArray(a)?a.slice(-20).map(e=>({role:e.role,content:e.content})):[],{role:"user",content:s}],x=await r.chat.completions.create({model:"gpt-4o-mini",messages:b,max_tokens:1500,temperature:.8}),k=x.choices[0]?.message?.content||"Sorry love, something went wrong on my end. Try again? \uD83D\uDC9C",q=/\[ACTION:\s*(\{[^}]+\})\]/g,v=[];for(;null!==(t=q.exec(k));)try{let e=JSON.parse(t[1]),s=await p(e);v.push({action:e.type,...s})}catch{v.push({error:"Failed to parse action"})}return k=k.replace(/\[ACTION:\s*\{[^}]+\}\]/g,"").trim(),n.NextResponse.json({reply:k,actions:v.length>0?v:void 0})}catch(e){return n.NextResponse.json({error:e instanceof Error?e.message:"Failed to get AI response"},{status:500})}}let l=new o.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/ai-chat/route",pathname:"/api/ai-chat",filename:"route",bundlePath:"app/api/ai-chat/route"},resolvedPagePath:"C:\\Users\\Johns\\resumevault-social-bot\\app\\api\\ai-chat\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:m,staticGenerationAsyncStorage:h,serverHooks:g}=l,f="/api/ai-chat/route";function _(){return(0,i.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:h})}},37532:(e,t,s)=>{s.d(t,{t:()=>o});var a=s(88336);function o(){let e="https://pldnkhadhewaxyukzdqz.supabase.co",t=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!t)throw Error("Missing Supabase admin environment variables");return(0,a.eI)(e,t,{auth:{persistSession:!1,autoRefreshToken:!1}})}}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),a=t.X(0,[8948,5972,8336,4214],()=>s(36942));module.exports=a})();