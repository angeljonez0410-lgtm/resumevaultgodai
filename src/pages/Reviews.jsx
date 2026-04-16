import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui-custom/PageHeader';
import { useSimpleMode } from '../components/settings/SimpleMode';

export default function Reviews() {
  const [form, setForm] = useState({ rating: 5, title: '', comment: '', reviewer_name: '' });
  const queryClient = useQueryClient();
  const { isSimpleMode } = useSimpleMode();

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => base44.entities.Review.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Thank you for your review!');
      setForm({ rating: 5, title: '', comment: '', reviewer_name: '' });
    }
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const btnClass = isSimpleMode ? "h-16 text-xl px-8" : "";
  const textClass = isSimpleMode ? "text-xl" : "text-base";
  const cardPadding = isSimpleMode ? "p-8" : "p-6";

  return (
    <div>
      <PageHeader
        title="User Reviews"
        subtitle="See what others are saying about ApplyAI"
        icon={MessageSquare}
      />

      {/* Summary */}
      <Card className={`${cardPadding} mb-6 text-center`}>
        <div className={`${isSimpleMode ? 'text-6xl' : 'text-4xl'} font-bold text-slate-900 mb-2`}>{avgRating}</div>
        <div className="flex items-center justify-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`${isSimpleMode ? 'w-8 h-8' : 'w-5 h-5'} ${
                i < Math.round(parseFloat(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
              }`}
            />
          ))}
        </div>
        <p className={`${isSimpleMode ? 'text-lg' : 'text-sm'} text-slate-500`}>
          Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </p>
      </Card>

      {/* Submit Review */}
      <Card className={`${cardPadding} mb-8`}>
        <h3 className={`${isSimpleMode ? 'text-2xl' : 'text-lg'} font-semibold text-slate-900 mb-4`}>Write a Review</h3>
        <div className="space-y-4">
          <div>
            <Label className={textClass}>Rating</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setForm({ ...form, rating: star })}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`${isSimpleMode ? 'w-12 h-12' : 'w-8 h-8'} ${
                      star <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className={textClass}>Your Name (optional)</Label>
            <Input
              value={form.reviewer_name}
              onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })}
              placeholder="Anonymous"
              className={isSimpleMode ? "h-16 text-xl mt-2" : "mt-1"}
            />
          </div>
          <div>
            <Label className={textClass}>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Great experience!"
              className={isSimpleMode ? "h-16 text-xl mt-2" : "mt-1"}
            />
          </div>
          <div>
            <Label className={textClass}>Your Review</Label>
            <Textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Tell us about your experience..."
              className={isSimpleMode ? "min-h-[150px] text-xl mt-2" : "min-h-[100px] mt-1"}
            />
          </div>
          <Button
            onClick={() => createMutation.mutate(form)}
            disabled={!form.comment.trim()}
            className={btnClass}
          >
            <Send className={isSimpleMode ? "w-6 h-6 mr-3" : "w-4 h-4 mr-2"} />
            Submit Review
          </Button>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={cardPadding}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`${isSimpleMode ? 'w-6 h-6' : 'w-4 h-4'} ${
                          i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  {review.title && (
                    <h4 className={`${isSimpleMode ? 'text-xl' : 'text-base'} font-semibold text-slate-900`}>
                      {review.title}
                    </h4>
                  )}
                </div>
                <p className={`${isSimpleMode ? 'text-base' : 'text-xs'} text-slate-400`}>
                  {new Date(review.created_date).toLocaleDateString()}
                </p>
              </div>
              <p className={`${isSimpleMode ? 'text-lg' : 'text-sm'} text-slate-600 leading-relaxed mb-2`}>
                {review.comment}
              </p>
              <p className={`${isSimpleMode ? 'text-base' : 'text-xs'} text-slate-400`}>
                — {review.reviewer_name || 'Anonymous'}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}