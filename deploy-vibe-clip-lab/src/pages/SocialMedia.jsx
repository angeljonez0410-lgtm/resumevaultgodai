import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import {
  Wand2, Loader2, Copy, CheckCheck, Upload, Image as ImageIcon,
  Video, RefreshCw, BarChart2, Lightbulb, Trash2, Download, FileSpreadsheet,
  ExternalLink, Share2
} from 'lucide-react';
import { addPostLog, clearPostLogs, downloadCsv, getPostLogs } from '@/lib/post-log';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', emoji: '📸', color: 'from-pink-500 to-orange-400' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵', color: 'from-slate-800 to-black' },
  { id: 'youtube', label: 'YouTube', emoji: '▶️', color: 'from-red-500 to-red-600' },
  { id: 'twitter', label: 'Twitter/X', emoji: '𝕏', color: 'from-sky-500 to-blue-600' },
  { id: 'linkedin', label: 'LinkedIn', emoji: '💼', color: 'from-blue-600 to-blue-700' },
  { id: 'snapchat', label: 'Snapchat', emoji: '👻', color: 'from-yellow-400 to-yellow-500' },
  { id: 'threads', label: 'Threads', emoji: '🧵', color: 'from-slate-700 to-slate-900' },
  { id: 'pinterest', label: 'Pinterest', emoji: '📌', color: 'from-red-600 to-rose-600' },
  { id: 'facebook', label: 'Facebook', emoji: '👥', color: 'from-blue-700 to-indigo-700' },
  { id: 'reddit', label: 'Reddit', emoji: '🤖', color: 'from-orange-500 to-orange-600' },
  { id: 'discord', label: 'Discord', emoji: '🎮', color: 'from-indigo-500 to-violet-600' },
  { id: 'telegram', label: 'Telegram', emoji: '✈️', color: 'from-sky-400 to-cyan-500' },
];

const WEBSITE_URL = 'https://resumevaultgod.com';
const SOCIAL_CONNECTIONS_KEY = 'resumevault_social_connections_v1';

const SOCIAL_LOGIN_URLS = {
  instagram: 'https://www.instagram.com/accounts/login/',
  tiktok: 'https://www.tiktok.com/login',
  youtube: 'https://accounts.google.com/ServiceLogin?service=youtube',
  twitter: 'https://x.com/i/flow/login',
  linkedin: 'https://www.linkedin.com/login',
  snapchat: 'https://accounts.snapchat.com/',
  threads: 'https://www.threads.net/login',
  pinterest: 'https://www.pinterest.com/login/',
  facebook: 'https://www.facebook.com/login/',
  reddit: 'https://www.reddit.com/login/',
  discord: 'https://discord.com/login',
  telegram: 'https://web.telegram.org/',
};

const getPostUrl = (platformId, text) => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(WEBSITE_URL);

  switch (platformId) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}`;
    case 'linkedin':
      return `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    case 'pinterest':
      return `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`;
    case 'reddit':
      return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(text.slice(0, 280))}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    case 'tiktok':
      return 'https://www.tiktok.com/upload';
    case 'youtube':
      return 'https://studio.youtube.com/';
    case 'discord':
      return 'https://discord.com/channels/@me';
    case 'snapchat':
      return 'https://web.snapchat.com/';
    case 'instagram':
    case 'threads':
    default:
      return SOCIAL_LOGIN_URLS[platformId] || WEBSITE_URL;
  }
};

const getSavedConnections = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SOCIAL_CONNECTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const WEBSITE_BRAND_CONTEXT = `Website: ${WEBSITE_URL}
Brand: ResumeVaultGodAI / ResumeVaultGod.com
Positioning: an AI-powered job hunt command center for job seekers, career switchers, and professionals who want stronger applications faster.
Core promise: Beat the ATS in 60 seconds and go "God-Mode" on the job hunt.
Main tools to reference when relevant:
- AI Post Generation for social content
- ATS-focused resume and job analysis
- Cover letter generation
- Follow-up email writing
- Mock interview and interview coaching
- Salary negotiation scripts
- Career roadmap planning
- Portfolio ideas and portfolio builder
- Application tracker
- Free access in this app: no credits, subscriptions, or paywall language
Tone: confident, modern, practical, empowering, and direct. Avoid hype that sounds fake. Drive users to ${WEBSITE_URL}.`;

const WEBSITE_LAUNCH_TOPIC = `Promote ResumeVaultGod.com as an AI job hunt command center that helps job seekers beat ATS filters, improve resumes, write cover letters, practice interviews, track applications, and move faster from applying to interviewing.`;

const RESUME_TOPICS = [
  WEBSITE_LAUNCH_TOPIC,
  'Why ResumeVaultGod.com is built for job seekers who are tired of applying into silence',
  'How ResumeVaultGod.com helps turn one job description into a stronger resume, cover letter, and interview plan',
  'A day-in-the-life post showing how a job seeker uses ResumeVaultGod.com from resume scan to application tracker',
  'How to write a resume that beats ATS in 2025',
  'Top 5 mistakes killing your job applications',
  'AI vs human resume: which gets more callbacks?',
  'Resume tips for career changers',
  'How to get hired with no experience',
  'LinkedIn profile optimization secrets',
  'Salary negotiation scripts that work',
  'Cover letter that actually gets read',
  'Interview preparation with AI tools',
  'Personal branding for job seekers',
  'Remote job hunting strategy',
  'Tech resume vs traditional resume',
];

const CONTENT_TYPES = [
  'Educational Tips', 'Before/After', 'Myth vs Fact', 'Tutorial',
  'Success Story', 'Quick Hack', 'Controversial Take', 'Q&A'
];

// Minimal analytics state stored locally
const MOCK_ANALYTICS = [
  { platform: 'Instagram', posts: 24, reach: '12.4K', engagement: '4.2%', trend: '+12%' },
  { platform: 'TikTok', posts: 18, reach: '89.1K', engagement: '7.8%', trend: '+34%' },
  { platform: 'LinkedIn', posts: 31, reach: '8.2K', engagement: '5.1%', trend: '+8%' },
  { platform: 'Twitter/X', posts: 42, reach: '15.6K', engagement: '2.9%', trend: '+5%' },
  { platform: 'YouTube', posts: 6, reach: '4.1K', engagement: '9.2%', trend: '+21%' },
  { platform: 'Threads', posts: 15, reach: '3.8K', engagement: '3.4%', trend: '+18%' },
];

const countHashtags = (text) => (text.match(/#[\w-]+/g) || []).length;

const extractCaption = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const captionIndex = lines.findIndex(line => /caption/i.test(line));
  if (captionIndex >= 0 && lines[captionIndex + 1]) return lines[captionIndex + 1].replace(/^[-*: ]+/, '');
  return lines[0] || '';
};

export default function SocialMedia() {
  const [activeTab, setActiveTab] = useState('generate');
  const [platform, setPlatform] = useState('instagram');
  const [contentType, setContentType] = useState('Educational Tips');
  const [topic, setTopic] = useState(WEBSITE_LAUNCH_TOPIC);
  const [manualPost, setManualPost] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [aiTopics, setAiTopics] = useState([]);
  const [postLogs, setPostLogs] = useState(() => getPostLogs());
  const [connections, setConnections] = useState(() => getSavedConnections());
  const fileInputRef = useRef(null);

  const saveConnections = (nextConnections) => {
    setConnections(nextConnections);
    window.localStorage.setItem(SOCIAL_CONNECTIONS_KEY, JSON.stringify(nextConnections));
  };

  const toggleConnected = (platformId) => {
    saveConnections({
      ...connections,
      [platformId]: {
        connected: !connections[platformId]?.connected,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const markLoggedIn = (platformId) => {
    saveConnections({
      ...connections,
      [platformId]: {
        connected: true,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const generateContent = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    setLoading(true);
    setGeneratedContent(null);
    try {
      const sel = PLATFORMS.find(p => p.id === platform);
      const prompt = `You are a viral social media content creator for ResumeVaultGodAI.

Use this website and product context as your source of truth:
${WEBSITE_BRAND_CONTEXT}

Create complete ${sel?.label} content for this:
Platform: ${sel?.label}
Content Type: ${contentType}
Topic: ${topic}

Deliver:
1. **Caption** (${platform === 'twitter' ? 'under 280 chars' : platform === 'snapchat' ? 'short punchy 1-2 lines' : 'full engaging caption'})
2. **30 Hashtags** optimized for ${sel?.label}
3. **Hook** (scroll-stopping first line)
4. **Call to Action** (drive traffic to ${WEBSITE_URL})
5. **Best Posting Time** for maximum reach
6. **AI Image Prompt** (for FLUX/Stable Diffusion thumbnail)
${platform !== 'twitter' && platform !== 'snapchat' ? '7. **30-second Video Script**\n8. **Story/Reel Idea**' : ''}
9. **Cross-post Strategy** (how to repurpose on other platforms)

Make it website-specific. Mention ResumeVaultGod.com naturally in the hook, caption, or CTA. Do not write generic resume advice unless it clearly connects back to the website and its tools.`;

      const response = await base44.functions.invoke('ariaAssistant', {
        messages: [{ role: 'user', content: prompt }],
      });
      const aiText = response?.data?.response || response?.response || '';
      if (!aiText) throw new Error('No AI content returned');

      setGeneratedContent(aiText);
      const nextLogs = addPostLog({
        platform: sel?.label || platform,
        category: contentType,
        contentType,
        topic,
        website: WEBSITE_URL,
        characterCount: aiText.length,
        hashtagCount: countHashtags(aiText),
        caption: extractCaption(aiText),
        fullContent: aiText,
      });
      setPostLogs(nextLogs);
      toast.success('Post generated and logged!');
    } catch (err) {
      toast.error('Generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAITopics = async () => {
    setLoadingTopics(true);
    try {
      const sel = PLATFORMS.find(p => p.id === platform);
      const prompt = `Generate 12 viral content topic ideas for ${sel?.label} based on this website:
${WEBSITE_BRAND_CONTEXT}

Each topic should be highly shareable and directly connected to ResumeVaultGod.com. Mix launch posts, problem-aware posts, feature posts, objection-handling posts, and transformation posts.
Format as a numbered list, one topic per line. Just the topics, no explanations.`;

      const response = await base44.functions.invoke('ariaAssistant', {
        messages: [{ role: 'user', content: prompt }],
      });
      const aiText = response?.data?.response || response?.response || '';
      if (!aiText) throw new Error('No AI topics returned');
      const lines = aiText.split('\n').filter(l => l.trim()).map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
      setAiTopics(lines.slice(0, 12));
    } catch (err) {
      toast.error('Failed to generate topics');
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setUploadedMedia(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: file_url,
          name: file.name,
          type: file.type.startsWith('video') ? 'video' : 'image',
        }]);
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
    setUploading(false);
    toast.success('Media uploaded!');
  };

  const copyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied!');
  };

  const openLogin = () => {
    const loginUrl = SOCIAL_LOGIN_URLS[platform];
    if (loginUrl) window.open(loginUrl, '_blank', 'noopener,noreferrer');
    markLoggedIn(platform);
    toast.success(`${sel?.label} marked ready. Finish login in the new tab, then return here to post.`);
  };

  const postToPlatform = async () => {
    const contentToPost = generatedContent || manualPost;
    if (!contentToPost?.trim()) {
      toast.error('Generate content or write a manual post first');
      return;
    }

    const postText = extractCaption(contentToPost) || contentToPost;
    await navigator.clipboard.writeText(contentToPost);
    window.open(getPostUrl(platform, postText), '_blank', 'noopener,noreferrer');

    const nextLogs = addPostLog({
      platform: sel?.label || platform,
      category: contentType,
      contentType,
      topic,
      website: WEBSITE_URL,
      status: 'opened_composer',
      characterCount: contentToPost.length,
      hashtagCount: countHashtags(contentToPost),
      caption: extractCaption(contentToPost),
      fullContent: contentToPost,
    });
    setPostLogs(nextLogs);
    toast.success(`Copied content and opened ${sel?.label} to post`);
  };

  const sel = PLATFORMS.find(p => p.id === platform);
  const isSelectedConnected = Boolean(connections[platform]?.connected);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Social Media Hub</h1>
        <p className="text-slate-400 mt-1 text-sm">AI content for every platform · Powered by ResumeVaultGodAi</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/50 border border-white/5 mb-8">
          <TabsTrigger value="generate" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
            <Wand2 className="w-4 h-4" /> Generate
          </TabsTrigger>
          <TabsTrigger value="topics" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
            <Lightbulb className="w-4 h-4" /> AI Topics
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
            <Upload className="w-4 h-4" /> Media Library
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
            <BarChart2 className="w-4 h-4" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
            <FileSpreadsheet className="w-4 h-4" /> Post Logs
          </TabsTrigger>
        </TabsList>

        {/* GENERATE TAB */}
        <TabsContent value="generate">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              {/* Platform grid */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-3 block">Platform</label>
                <div className="grid grid-cols-6 gap-2">
                  {PLATFORMS.map((p) => (
                    <button key={p.id} onClick={() => setPlatform(p.id)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs transition-all ${
                        platform === p.id ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-white/5 bg-slate-900/50 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-base">{p.emoji}</span>
                      <span className="truncate w-full text-center">{p.label.split('/')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content type */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Content Type</label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((ct) => (
                    <button key={ct} onClick={() => setContentType(ct)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        contentType === ct ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-white/5 bg-slate-900/50 text-slate-400 hover:border-white/20'
                      }`}
                    >{ct}</button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Topic / Brief</label>
                <Textarea value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Promote ResumeVaultGod.com as the AI job hunt command center for resumes, interviews, and applications..."
                  rows={3} className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 resize-none"
                />
                {/* Quick topic suggestions */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button onClick={() => setTopic(WEBSITE_LAUNCH_TOPIC)}
                    className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 hover:text-white hover:bg-violet-500/20 transition-all border border-violet-500/20"
                  >Website launch post</button>
                  {RESUME_TOPICS.slice(1, 5).map((t) => (
                    <button key={t} onClick={() => setTopic(t)}
                      className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-white/5"
                    >{t.slice(0, 30)}...</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Manual Post Fallback</label>
                <Textarea
                  value={manualPost}
                  onChange={(e) => setManualPost(e.target.value)}
                  placeholder="Write or paste a post here if AI generation is unavailable, then click Post Now."
                  rows={4}
                  className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 resize-none"
                />
              </div>

              <Button onClick={generateContent} disabled={loading || !topic.trim()}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 h-12 gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate {sel?.label} Content</>}
              </Button>

              <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{sel?.label} account</p>
                    <p className={isSelectedConnected ? 'text-xs text-emerald-300' : 'text-xs text-slate-500'}>
                      {isSelectedConnected ? 'Marked ready for posting' : 'Login, then mark ready'}
                    </p>
                  </div>
                  <span className={isSelectedConnected ? 'text-xs rounded-full px-2 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'text-xs rounded-full px-2 py-1 bg-slate-800 text-slate-400 border border-white/5'}>
                    {isSelectedConnected ? 'Ready' : 'Not ready'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" onClick={openLogin} variant="outline" className="border-white/10 text-slate-200 hover:bg-white/5 gap-2">
                    <ExternalLink className="w-4 h-4" /> Login
                  </Button>
                  <Button type="button" onClick={() => toggleConnected(platform)} className={isSelectedConnected ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}>
                    {isSelectedConnected ? 'Disconnect' : 'Mark Ready'}
                  </Button>
                </div>
                <Button type="button" onClick={postToPlatform} className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 gap-2">
                  <Share2 className="w-4 h-4" /> Post Now
                </Button>
              </div>
            </div>

            {/* Output */}
            <div>
              {generatedContent ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sel?.emoji}</span>
                      <span className="text-sm font-semibold text-white">{sel?.label} Content</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setGeneratedContent(null)} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={copyContent}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy All'}
                      </button>
                      <button onClick={postToPlatform}
                        className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Post Now
                      </button>
                    </div>
                  </div>
                  <div className="p-4 overflow-y-auto max-h-[500px]">
                    <div className="prose prose-sm prose-invert max-w-none prose-headings:text-violet-300 prose-strong:text-white prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                      <ReactMarkdown>{generatedContent}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-center p-8">
                  <span className="text-5xl">{sel?.emoji}</span>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Ready to generate</h3>
                    <p className="text-slate-500 text-sm">Fill in the details and hit Generate to create viral {sel?.label} content for ResumeVaultGodAi</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* AI TOPICS TAB */}
        <TabsContent value="topics">
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">AI Topic Ideas</h2>
                <p className="text-slate-400 text-sm mt-1">Generated specifically for ResumeVaultGodAi audience</p>
              </div>
              <div className="flex items-center gap-3">
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-white text-sm rounded-xl px-3 py-2"
                >
                  {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
                </select>
                <Button onClick={generateAITopics} disabled={loadingTopics}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 gap-2"
                >
                  {loadingTopics ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Generate Topics
                </Button>
              </div>
            </div>

            {/* Built-in resume topics always visible */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Evergreen Topics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RESUME_TOPICS.map((t, idx) => (
                  <button key={idx}
                    onClick={() => { setTopic(t); setActiveTab('generate'); toast.success('Topic applied!'); }}
                    className="text-left px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
                  >
                    <span className="text-sm text-slate-300 group-hover:text-white">{t}</span>
                    <span className="text-xs text-slate-600 group-hover:text-violet-400 ml-2 hidden group-hover:inline">→ Use</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Generated Topics */}
            {aiTopics.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">AI Generated for {sel?.label}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiTopics.map((t, idx) => (
                    <motion.button key={idx}
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      onClick={() => { setTopic(t); setActiveTab('generate'); toast.success('Topic applied!'); }}
                      className="text-left px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/20 hover:border-violet-500/50 transition-all group"
                    >
                      <span className="text-sm text-slate-300 group-hover:text-white">{t}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* MEDIA LIBRARY TAB */}
        <TabsContent value="media">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Media Library</h2>
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 gap-2"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Media
              </Button>
            </div>

            <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />

            {uploadedMedia.length === 0 ? (
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="w-full border-2 border-dashed border-white/10 rounded-2xl py-16 flex flex-col items-center gap-3 hover:border-violet-500/30 transition-colors group"
              >
                <Upload className="w-10 h-10 text-slate-600 group-hover:text-violet-400 transition-colors" />
                <span className="text-slate-400 font-medium">Drop images & videos here or click to upload</span>
                <span className="text-slate-600 text-sm">JPG, PNG, GIF, MP4, MOV, WebM · Any size</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedMedia.map((media) => (
                  <motion.div key={media.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="relative group rounded-xl overflow-hidden border border-white/5 hover:border-violet-500/20 transition-all"
                  >
                    {media.type === 'image' ? (
                      <img src={media.url} alt="" className="w-full aspect-square object-cover" />
                    ) : (
                      <video src={media.url} className="w-full aspect-square object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <a href={media.url} download className="text-xs text-white bg-violet-500 px-3 py-1.5 rounded-full">Download</a>
                      <button onClick={() => setUploadedMedia(prev => prev.filter(m => m.id !== media.id))}
                        className="text-xs text-red-400 hover:text-red-300"
                      ><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 rounded-full px-2 py-0.5 flex items-center gap-1">
                      {media.type === 'video' ? <Video className="w-3 h-3 text-white" /> : <ImageIcon className="w-3 h-3 text-white" />}
                      <span className="text-white text-xs">{media.type}</span>
                    </div>
                  </motion.div>
                ))}
                <button onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/30 flex flex-col items-center justify-center gap-2 transition-colors group"
                >
                  <Upload className="w-6 h-6 text-slate-600 group-hover:text-violet-400 transition-colors" />
                  <span className="text-xs text-slate-600">Add more</span>
                </button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics">
          <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Platform Analytics</h2>
              <span className="text-xs text-slate-500 bg-slate-900 border border-white/5 px-3 py-1.5 rounded-full">Overview · All Time</span>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Reach', value: '133.2K', icon: '📡', trend: '+18%' },
                { label: 'Total Posts', value: '136', icon: '📝', trend: '+24%' },
                { label: 'Avg Engagement', value: '5.4%', icon: '💬', trend: '+7%' },
                { label: 'Active Platforms', value: '6', icon: '🌐', trend: '+2' },
              ].map((stat, idx) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className="rounded-2xl bg-slate-900/50 border border-white/5 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-xs text-emerald-400 font-medium">{stat.trend}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Platform breakdown */}
            <div className="rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="text-white font-semibold">Platform Breakdown</h3>
              </div>
              <div className="divide-y divide-white/5">
                {MOCK_ANALYTICS.map((row, idx) => (
                  <motion.div key={row.platform}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                    className="px-6 py-4 flex items-center justify-between hover:bg-white/2 transition-colors"
                  >
                    <div className="flex items-center gap-3 w-36">
                      <span className="text-lg">{PLATFORMS.find(p => p.label.startsWith(row.platform.split('/')[0]))?.emoji || '📱'}</span>
                      <span className="text-sm font-medium text-white">{row.platform}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-8 flex-1 justify-around">
                      <div className="text-center">
                        <p className="text-white font-semibold text-sm">{row.posts}</p>
                        <p className="text-slate-500 text-xs">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold text-sm">{row.reach}</p>
                        <p className="text-slate-500 text-xs">Reach</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold text-sm">{row.engagement}</p>
                        <p className="text-slate-500 text-xs">Engagement</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">{row.trend}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* POST LOGS TAB */}
        <TabsContent value="logs">
          <div className="max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Automatic Post Log</h2>
                <p className="text-slate-400 text-sm mt-1">Every generated post is saved locally with categories for Excel tracking.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => downloadCsv(postLogs)}
                  disabled={postLogs.length === 0}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 gap-2"
                >
                  <Download className="w-4 h-4" /> Download CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearPostLogs();
                    setPostLogs([]);
                    toast.success('Post log cleared');
                  }}
                  disabled={postLogs.length === 0}
                  className="border-white/10 text-slate-300 hover:bg-white/5 gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Clear
                </Button>
              </div>
            </div>

            {postLogs.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-10 text-center">
                <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-white font-semibold">No generated posts logged yet</p>
                <p className="text-slate-500 text-sm mt-1">Generate a post and it will appear here automatically.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-slate-900/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-950/60 text-slate-400">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Date</th>
                        <th className="text-left px-4 py-3 font-medium">Platform</th>
                        <th className="text-left px-4 py-3 font-medium">Category</th>
                        <th className="text-left px-4 py-3 font-medium">Topic</th>
                        <th className="text-left px-4 py-3 font-medium">Hashtags</th>
                        <th className="text-left px-4 py-3 font-medium">Caption</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {postLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/2">
                          <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3 text-white whitespace-nowrap">{log.platform}</td>
                          <td className="px-4 py-3 text-violet-300 whitespace-nowrap">{log.category}</td>
                          <td className="px-4 py-3 text-slate-300 min-w-[240px]">{log.topic}</td>
                          <td className="px-4 py-3 text-slate-300">{log.hashtagCount}</td>
                          <td className="px-4 py-3 text-slate-400 min-w-[320px]">{log.caption}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
