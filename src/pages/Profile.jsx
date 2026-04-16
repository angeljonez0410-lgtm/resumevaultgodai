import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, GraduationCap, Plus, Trash2, CreditCard, Zap, Crown, Sparkles, ArrowUpRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import DeleteAccountDialog from '@/components/DeleteAccountDialog';
import ProfileAISuggestions from '@/components/profile/ProfileAISuggestions';
import LinkedInSummaryGenerator from '@/components/resume/LinkedInSummaryGenerator';

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: subscription } = useQuery({
    queryKey: ['userSubscription'],
    queryFn: async () => {
      const subs = await base44.entities.UserSubscription.filter({ created_by: user?.email }, '-created_date', 1);
      return subs[0] || null;
    },
    enabled: !!user,
    staleTime: 5 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: creditTransactions } = useQuery({
    queryKey: ['creditTransactions'],
    queryFn: async () => {
      return await base44.entities.CreditTransaction.filter(
        { created_by: user?.email },
        '-created_date',
        10
      );
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [activeTab, setActiveTab] = useState('personal');

  const [formData, setFormData] = useState({
    full_name: '',
    email_address: '',
    phone: '',
    location: '',
    linkedin_url: '',
    portfolio_url: '',
    professional_summary: '',
    experiences: [],
    education: [],
    skills: '',
    certifications: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email_address: profile.email_address || '',
        phone: profile.phone || '',
        location: profile.location || '',
        linkedin_url: profile.linkedin_url || '',
        portfolio_url: profile.portfolio_url || '',
        professional_summary: profile.professional_summary || '',
        experiences: profile.experiences || [],
        education: profile.education || [],
        skills: profile.skills || '',
        certifications: profile.certifications || '',
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return await base44.entities.UserProfile.update(profile.id, data);
      } else {
        return await base44.entities.UserProfile.create({ ...data, created_by: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile saved successfully');
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experiences: [...formData.experiences, { title: '', company: '', start_date: '', end_date: '', description: '', achievements: '' }],
    });
  };

  const removeExperience = (index) => {
    const updated = formData.experiences.filter((_, i) => i !== index);
    setFormData({ ...formData, experiences: updated });
  };

  const updateExperience = (index, field, value) => {
    const updated = [...formData.experiences];
    updated[index][field] = value;
    setFormData({ ...formData, experiences: updated });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', institution: '', year: '', details: '' }],
    });
  };

  const removeEducation = (index) => {
    const updated = formData.education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: updated });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData({ ...formData, education: updated });
  };

  const TIER_CONFIG = {
    free:  { name: 'Free Plan',  Icon: Sparkles, color: 'bg-gray-100 text-gray-700',   gradient: 'from-gray-500 to-slate-600',   price: '$0/mo',   features: ['2 AI tasks/month', 'Basic resume builder', 'Limited job analysis'] },
    pro:   { name: 'Pro Plan',   Icon: Zap,      color: 'bg-blue-100 text-blue-800',   gradient: 'from-blue-500 to-indigo-600',  price: '$19/mo',  features: ['Unlimited AI tasks', 'Advanced resume builder', 'Full job analysis', 'Cover letter generator'] },
    elite: { name: 'Elite Plan', Icon: Crown,    color: 'bg-amber-100 text-amber-800', gradient: 'from-amber-500 to-orange-600', price: '$49/mo',  features: ['Everything in Pro', 'Interview coaching', 'Salary negotiation', 'Career roadmap', 'Priority support'] },
  };

  const currentTier = subscription?.subscription_status || 'free';
  const currentPlanConfig = TIER_CONFIG[currentTier];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and billing information</p>
        </div>
      </div>

      <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn Summary</TabsTrigger>
          <TabsTrigger value="billing">Billing & Account</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <ProfileAISuggestions profile={profile} formData={formData} onApplySuggestion={(suggestions) => {
            if (suggestions?.professional_summary) setFormData(f => ({ ...f, professional_summary: suggestions.professional_summary }));
            if (suggestions?.skills) setFormData(f => ({ ...f, skills: suggestions.skills }));
          }} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    value={formData.email_address}
                    onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div>
                  <Label>Portfolio URL</Label>
                  <Input
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    placeholder="https://johndoe.com"
                  />
                </div>
              </div>
              <div>
                <Label>Professional Summary</Label>
                <Textarea
                  value={formData.professional_summary}
                  onChange={(e) => setFormData({ ...formData, professional_summary: e.target.value })}
                  placeholder="Brief professional summary..."
                  rows={4}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="JavaScript, React, Node.js"
                  />
                </div>
                <div>
                  <Label>Certifications (comma-separated)</Label>
                  <Input
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    placeholder="AWS Certified, PMP"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Work Experience
              </CardTitle>
              <CardDescription>Add your work history and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.experiences.map((exp, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">Experience #{index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeExperience(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                    <Input
                      placeholder="Start Date"
                      value={exp.start_date}
                      onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                    />
                    <Input
                      placeholder="End Date (or Present)"
                      value={exp.end_date}
                      onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                    />
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={2}
                  />
                  <Textarea
                    placeholder="Key Achievements"
                    value={exp.achievements}
                    onChange={(e) => updateExperience(index, 'achievements', e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
              <Button onClick={addExperience} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-slate-800 hover:bg-slate-900 text-white">
                  {saveMutation.isPending ? 'Saving...' : '💾 Save Experience'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-4">
          <LinkedInSummaryGenerator 
            resumeText={formData.professional_summary}
            onSummaryGenerated={(summary) => {
              setFormData({ ...formData, professional_summary: summary });
            }}
          />
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </CardTitle>
              <CardDescription>Add your educational background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.education.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">Education #{index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    />
                    <Input
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    />
                    <Input
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                    />
                  </div>
                  <Textarea
                    placeholder="Additional Details"
                    value={edu.details}
                    onChange={(e) => updateEducation(index, 'details', e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
              <Button onClick={addEducation} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-slate-800 hover:bg-slate-900 text-white">
                  {saveMutation.isPending ? 'Saving...' : '💾 Save Education'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-5">
          {/* User Info + Current Plan Hero */}
          <Card className="border-2" style={{ borderColor: currentTier === 'elite' ? '#f59e0b' : currentTier === 'pro' ? '#3b82f6' : '#e2e8f0' }}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentPlanConfig.gradient} flex items-center justify-center shadow-md`}>
                    <currentPlanConfig.Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{user?.email}</p>
                    <h3 className="text-xl font-bold text-slate-900">{currentPlanConfig.name}</h3>
                    <p className="text-sm text-slate-500">{currentPlanConfig.price} · {subscription?.subscription_id ? 'Active' : currentTier === 'free' ? 'Free tier' : 'Active'}</p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-4xl font-bold text-slate-900">{subscription?.credits_balance ?? 0}</p>
                  <p className="text-xs text-slate-500">AI Credits remaining</p>
                  {currentTier !== 'free' && <p className="text-xs text-green-600 font-medium mt-1">+ Unlimited AI tasks</p>}
                </div>
              </div>

              {/* Features list */}
              <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {currentPlanConfig.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {/* Addons */}
              {subscription?.premium_addons && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">Premium Add-ons Active:</p>
                  <div className="flex flex-wrap gap-2">
                    {subscription.premium_addons.split(',').filter(Boolean).map(a => (
                      <Badge key={a} className="bg-purple-100 text-purple-700 border-purple-200">{a.replace(/_/g, ' ')}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upgrade / Plan Cards */}
          {currentTier !== 'elite' && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Upgrade Your Plan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(TIER_CONFIG).filter(([k]) => k !== 'free' && k !== currentTier).map(([key, cfg]) => (
                  <Card key={key} className={`border-2 ${key === 'elite' ? 'border-amber-300 bg-amber-50/30' : 'border-blue-200 bg-blue-50/20'}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
                          <cfg.Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{cfg.name}</p>
                          <p className="text-sm text-slate-500">{cfg.price}</p>
                        </div>
                      </div>
                      <ul className="space-y-1.5 mb-4">
                        {cfg.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Link to="/Pricing">
                        <button className={`w-full py-2 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r ${cfg.gradient} hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5`}>
                          <ArrowUpRight className="w-4 h-4" /> Upgrade Now
                        </button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Buy Credits */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Need More Credits?</p>
                  <p className="text-xs text-slate-500">Buy pay-as-you-go AI credits — never expire</p>
                </div>
              </div>
              <Link to="/Pricing">
                <button className="py-2 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 transition-opacity whitespace-nowrap">
                  Buy Credits
                </button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          {creditTransactions && creditTransactions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-600" /> Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {creditTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center py-2.5 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                        <p className="text-xs text-slate-400">{new Date(tx.created_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-sm ${tx.credits_amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.credits_amount > 0 ? '+' : ''}{tx.credits_amount}
                        </span>
                        <p className="text-xs text-slate-400">bal: {tx.balance_after}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account & Danger Zone */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Account Email</Label>
                <p className="mt-1 text-gray-900 font-medium">{user?.email}</p>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-red-600">Danger Zone</Label>
                <p className="text-xs text-gray-500 mb-3 mt-1">Permanently delete your account and all data</p>
                <DeleteAccountDialog />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
              </Tabs>

              {activeTab !== 'billing' && activeTab !== 'linkedin' && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleSave} disabled={saveMutation.isPending} size="lg" className="bg-slate-800 hover:bg-slate-900 text-white">
            {saveMutation.isPending ? 'Saving...' : '💾 Save Profile'}
          </Button>
        </div>
      )}
              </div>
              );
              }