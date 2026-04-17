import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Fullscreen, Download, Copy, CheckCircle2, Captions, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import AIBadge from '../ai/AIBadge';

export default function VideoPlayer({ videoUrl, projectTitle, onCaptioned }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [captioning, setCaptioning] = useState(false);
  const videoRef = React.useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${projectTitle || 'video'}.mp4`;
    a.click();
  };

  const handleCaptionVideo = async () => {
    if (!videoUrl) {
      toast.error('No video URL to caption');
      return;
    }

    setCaptioning(true);
    try {
      const response = await base44.functions.invoke('captionVideo', {
        video: videoUrl,
        caption_size: 100,
      });
      const data = response?.data || response || {};
      const captionedUrl = data.videoUrl || data.url || data.output;

      if (!data.success || !captionedUrl) {
        throw new Error(data.error || 'Captioned video did not return a usable file');
      }

      onCaptioned?.(captionedUrl);
      toast.success('Captioned video ready!');
    } catch (error) {
      console.error('Caption video error:', error);
      toast.error(error.message || 'Captioning failed. Please try again.');
    } finally {
      setCaptioning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden bg-black border border-white/10"
    >
      {/* Video Container */}
      <div className="relative group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video object-cover"
          onEnded={() => setIsPlaying(false)}
        />

        <AIBadge position="top-right" size="md" />

        {/* Controls Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <Button
            onClick={togglePlay}
            size="icon"
            className="w-16 h-16 rounded-full bg-violet-500 hover:bg-violet-600 text-white shadow-lg"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="w-8 h-8 text-white hover:bg-white/10"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <span className="text-xs text-white">{isMuted ? 'Muted' : 'Sound'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCaptionVideo}
                disabled={captioning}
                className="w-8 h-8 text-white hover:bg-white/10"
              >
                {captioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Captions className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopyUrl}
                className="w-8 h-8 text-white hover:bg-white/10"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDownload}
                className="w-8 h-8 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleFullscreen}
                className="w-8 h-8 text-white hover:bg-white/10"
              >
                <Fullscreen className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
