"use strict";(()=>{var e={};e.id=8168,e.ids=[8168],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},21417:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>f,patchFetch:()=>h,requestAsyncStorage:()=>l,routeModule:()=>p,serverHooks:()=>d,staticGenerationAsyncStorage:()=>m});var o={};r.r(o),r.d(o,{POST:()=>c});var a=r(49303),n=r(88716),i=r(60670),s=r(87070),u=r(91198);async function c(e){try{let{platform:t,topic:r,caption:o}=await e.json();if(!t||!r)return s.NextResponse.json({error:"platform and topic are required"},{status:400});let a=(0,u.nE)({platform:t,topic:r,caption:o});return s.NextResponse.json({formattedCaption:a})}catch{return s.NextResponse.json({error:"Failed to format caption"},{status:500})}}let p=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/format-caption/route",pathname:"/api/format-caption",filename:"route",bundlePath:"app/api/format-caption/route"},resolvedPagePath:"C:\\Users\\Johns\\resumevault-social-bot\\app\\api\\format-caption\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:l,staticGenerationAsyncStorage:m,serverHooks:d}=p,f="/api/format-caption/route";function h(){return(0,i.patchFetch)({serverHooks:d,staticGenerationAsyncStorage:m})}},91198:(e,t,r)=>{r.d(t,{nE:()=>o});function o(e){switch(e.platform){case"instagram":return function({topic:e,caption:t}){let r=t?.trim()||e;return`${r}

Save this for later and follow ResumeVault for more career growth content.

#ResumeTips #JobSearch #CareerGrowth #ResumeVault #InterviewTips #LinkedInTips`}(e);case"facebook":return function({topic:e,caption:t}){let r=t?.trim()||e;return`${r}

Save this if you're actively building your next career move.

#ResumeTips #JobSearch #CareerGrowth #ResumeVault`}(e);case"twitter":return function({topic:e,caption:t}){let r=t?.trim()||e,o=r.length>220?`${r.slice(0,220)}...`:r;return`${o}

#ResumeVault #JobSearch #CareerTips`}(e);case"linkedin":return function({topic:e,caption:t}){let r=t?.trim()||e;return`${r}

What's one thing job seekers should stop doing immediately?

Follow ResumeVault for practical AI-powered career tools and advice.

#Careers #JobSearch #ResumeWriting #ProfessionalDevelopment`}(e);case"tiktok":return function({topic:e,caption:t}){let r=t?.trim()||e,o=r.length>140?`${r.slice(0,140)}...`:r;return`${o}

#ResumeVault #CareerTok #JobSearch #ResumeTips`}(e);default:return e.caption?.trim()||e.topic}}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[8948,5972],()=>r(21417));module.exports=o})();