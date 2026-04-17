import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import GenerationBar from '../components/generate/GenerationBar';
import VideoPlayer from '../components/media/VideoPlayer';
import AIBadge from '../components/ai/AIBadge';

export default function Generate() {
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const queryClient = useQueryClient();

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list(),
  });

  const handleImageGenerated = async (result) => {
    const newImage = {
      id: Date.now(),
      url: result.imageUrl,
      timestamp: new Date(),
      character: selectedCharacter,
    };
    setGeneratedImages(prev => [newImage, ...prev]);
    
    // Save to project if we want
    if (selectedCharacter) {
      const character = characters.find(c => c.id === selectedCharacter);
      await base44.entities.Project.create({
        title: `Generated Image - ${character?.name || 'Unknown'}`,
        character_id: selectedCharacter,
        character_name: character?.name,
        scene_template: 'custom',
        status: 'completed',
        thumbnail_url: result.imageUrl,
        credits_used: 5,
      });
    }
  };

  const handleVideoGenerated = async (result) => {
    const newVideo = {
      id: Date.now(),
      url: result.videoUrl,
      timestamp: new Date(),
      character: selectedCharacter,
      duration: result.duration,
    };
    setGeneratedVideos(prev => [newVideo, ...prev]);

    // Save to project
    if (selectedCharacter) {
      const character = characters.find(c => c.id === selectedCharacter);
      await base44.entities.Project.create({
        title: `Generated Video - ${character?.name || 'Unknown'}`,
        character_id: selectedCharacter,
        character_name: character?.name,
        scene_template: 'custom',
        status: 'completed',
        video_url: result.videoUrl,
        duration: result.duration,
        credits_used: 15,
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  };

  const selectedCharacterObj = characters.find(c => c.id === selectedCharacter);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">Quick Generate</h1>
        <p className="text-slate-400 mt-1 text-sm">Create AI images and videos instantly</p>
      </motion.div>

      {/* Character Selection */}
      <div className="mb-6 max-w-xs">
        <label className="text-sm font-medium text-slate-300 mb-2 block">Select Character</label>
        <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
          <SelectTrigger className="bg-slate-900 border-white/10 text-white">
            <SelectValue placeholder="Choose a character..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            {characters.map(char => (
              <SelectItem key={char.id} value={char.id}>
                {char.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Generation Tabs */}
      <Tabs defaultValue="image" className="mb-10">
        <TabsList className="bg-slate-900/50 border border-white/5">
          <TabsTrigger value="image" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
            <ImageIcon className="w-4 h-4" /> Images
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
            <Video className="w-4 h-4" /> Videos
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="image">
            <GenerationBar
              type="image"
              onGenerated={handleImageGenerated}
              disabled={!selectedCharacter}
              characterDescription={selectedCharacterObj?.description}
            />

            {generatedImages.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-white mb-4">Generated Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {generatedImages.map((img, idx) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative rounded-xl overflow-hidden border border-white/5 hover:border-violet-500/20 transition-all group"
                    >
                      <img src={img.url} alt="" className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                      <AIBadge position="top-right" size="sm" />
                      <a
                        href={img.url}
                        download
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <span className="text-white text-sm font-medium">Download</span>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="video">
            <GenerationBar
              type="video"
              onGenerated={handleVideoGenerated}
              disabled={!selectedCharacter}
              characterDescription={selectedCharacterObj?.description}
            />

            {generatedVideos.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-white mb-4">Generated Videos</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {generatedVideos.map((vid, idx) => (
                    <motion.div
                      key={vid.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <VideoPlayer
                        videoUrl={vid.url}
                        projectTitle={selectedCharacterObj?.name}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}