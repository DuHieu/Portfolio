import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, FolderOpen, Plus, Trash2, Sparkles, Loader2, GraduationCap, Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { refineTextWithAI } from '../../lib/groq';
import { useEdit } from '../context/edit-context';
import { useAuth } from '../context/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface DashboardSectionProps {
  username: string;
}

export function DashboardSection({ username }: DashboardSectionProps) {
  const { updateDraft, publishAll, discardAll, hasChanges, isPublishing } = useEdit();
  const { session } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  
  // AI States
  const [aiCallsRemaining, setAiCallsRemaining] = useState(3);
  const [isRefining, setIsRefining] = useState(false);

  // CV Import States
  const [showCVImport, setShowCVImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [importError, setImportError] = useState('');
  const [cvText, setCvText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/profile/${username}/`).then(res => res.json()),
      fetch(`${API_BASE}/api/experiences/?user=${username}`).then(res => res.json()),
      fetch(`${API_BASE}/api/projects/?user=${username}`).then(res => res.json()),
      fetch(`${API_BASE}/api/education/?user=${username}`).then(res => res.json()),
      fetch(`${API_BASE}/api/skills/?user=${username}`).then(res => res.json()),
    ]).then(([profileData, expData, projData, eduData, skillData]) => {
      setProfile(profileData);
      setExperiences(expData);
      setProjects(projData);
      setEducation(Array.isArray(eduData) ? eduData : []);
      setSkills(Array.isArray(skillData) ? skillData : []);
    }).catch(err => console.error('Dashboard fetch error:', err));
  }, [username]);

  // ───── handlers ─────
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateDraft('profile:current', { [name]: value });
  };

  const handleExperienceChange = (id: string | number, field: string, value: any) => {
    updateDraft(`experience:${id}`, { [field]: value });
  };

  const handleProjectChange = (id: string | number, field: string, value: any) => {
    updateDraft(`project:${id}`, { [field]: value });
  };

  const handleEducationChange = (id: string | number, field: string, value: any) => {
    updateDraft(`education:${id}`, { [field]: value });
  };

  const handleAddExperience = () => {
    const newId = `new-${Date.now()}`;
    setExperiences([{ id: newId, title: '', company: '', period: '', description: '', skills: [] }, ...experiences]);
    updateDraft(`experience:${newId}`, { title: 'New Role', is_active: true });
  };

  const handleAddProject = () => {
    const newId = `new-${Date.now()}`;
    setProjects([{ id: newId, title: '', description: '', url: '', github_url: '', tags: [] }, ...projects]);
    updateDraft(`project:${newId}`, { title: 'New Project' });
  };

  const handleSkillChange = (id: string, field: string, value: string | number) => {
    updateDraft(`skill:${id}`, { [field]: value });
    setSkills(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddSkill = () => {
    const newId = `new-${Date.now()}`;
    const newSkill = {
      id: newId, name: '', category: 'other', level: 80, icon: '🚀', order: skills.length
    };
    updateDraft(`skill:${newId}`, newSkill);
    setSkills([newSkill, ...skills]);
  };

  const handleAddEducation = () => {
    const newId = `new-${Date.now()}`;
    setEducation([{ id: newId, degree: '', school: '', period: '', description: '' }, ...education]);
    updateDraft(`education:${newId}`, { degree: 'New Degree' });
  };

  const handleAIRefine = async (currentText: string, type: 'bio' | 'project' | 'experience', targetId: string) => {
    if (aiCallsRemaining <= 0 || isRefining || !currentText) return;
    setIsRefining(true);
    try {
      const token = session?.access_token;
      const refined = await refineTextWithAI(currentText, type, token);
      updateDraft(targetId, { [type === 'bio' ? 'bio' : 'description']: refined });
      setAiCallsRemaining(prev => prev - 1);
      if (type === 'bio') {
        const el = document.getElementById('bio') as HTMLTextAreaElement;
        if (el) el.value = refined;
      }
    } catch {
      alert("Lỗi khi gọi AI. Vui lòng kiểm tra API Key trong .env");
    } finally {
      setIsRefining(false);
    }
  };

  // ───── CV Import ─────
  const handleCVImport = async (file?: File) => {
    if (isImporting) return;
    setImportError('');
    setImportDone(false);
    setIsImporting(true);

    if (!session?.access_token) {
      setImportError('Bạn cần đăng nhập để sử dụng tính năng này.');
      setIsImporting(false);
      return;
    }

    try {
      let body: FormData | string;
      let headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
      };

      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        body = fd;
        // Don't set Content-Type for FormData (browser sets it with boundary automatically)
      } else {
        if (!cvText.trim()) {
          setImportError('Vui lòng nhập text CV hoặc upload file PDF.');
          setIsImporting(false);
          return;
        }
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ text: cvText });
      }

      const res = await fetch(`${API_BASE}/api/cv-import/`, {
        method: 'POST',
        headers,
        body: body as BodyInit,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Lỗi khi phân tích CV.');
      }

      const data = await res.json();

      // Auto-fill drafts from AI response
      if (data.profile) {
        if (data.profile.full_name) updateDraft('profile:current', { full_name: data.profile.full_name });
        if (data.profile.bio) updateDraft('profile:current', { bio: data.profile.bio });

        // Re-set local profile state so UI shows updated values
        setProfile((prev: any) => ({ ...prev, ...data.profile }));
      }

      if (Array.isArray(data.education) && data.education.length > 0) {
        const newEdu = data.education.map((e: any, i: number) => {
          const newId = `new-${Date.now()}-edu-${i}`;
          updateDraft(`education:${newId}`, { ...e });
          return { id: newId, ...e };
        });
        setEducation(newEdu);
      }

      if (Array.isArray(data.experiences) && data.experiences.length > 0) {
        const newExp = data.experiences.map((e: any, i: number) => {
          const newId = `new-${Date.now()}-exp-${i}`;
          updateDraft(`experience:${newId}`, { ...e, is_active: true });
          return { id: newId, ...e };
        });
        setExperiences(newExp);
      }

      if (Array.isArray(data.skills) && data.skills.length > 0) {
        const newSkills = data.skills.map((s: any, i: number) => {
          const newId = `new-${Date.now()}-skill-${i}`;
          updateDraft(`skill:${newId}`, { ...s });
          return { id: newId, ...s };
        });
        setSkills(newSkills);
      }

      if (Array.isArray(data.projects) && data.projects.length > 0) {
        const newProj = data.projects.map((p: any, i: number) => {
          const newId = `new-${Date.now()}-proj-${i}`;
          updateDraft(`project:${newId}`, { ...p });
          return { id: newId, ...p };
        });
        setProjects(newProj);
      }

      setImportDone(true);
    } catch (e: any) {
      setImportError(e.message || 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center text-white/50">
      Loading dashboard data...
    </div>
  );

  return (
    <section className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#00D9FF] to-[#A855F7] bg-clip-text text-transparent">
            Personal Dashboard
          </h2>
          <p className="text-white/50">Manage your portfolio stations from a central command center.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Magic Import Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowCVImport(v => !v); setImportDone(false); setImportError(''); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#A855F7]/40 bg-[#A855F7]/10 text-[#A855F7] hover:bg-[#A855F7]/20 font-semibold text-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            ✨ Magic Import từ CV
          </motion.button>

          {hasChanges && (
            <>
              <Button
                variant="outline"
                onClick={() => { discardAll(); window.location.reload(); }}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-full"
              >
                Discard
              </Button>
              <Button
                onClick={publishAll}
                disabled={isPublishing}
                className="bg-gradient-to-r from-[#00D9FF] to-[#A855F7] text-white font-bold shadow-lg shadow-[#00D9FF]/20 rounded-full"
              >
                {isPublishing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
                ) : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* CV Import Panel */}
      <AnimatePresence>
        {showCVImport && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="mb-8 relative rounded-3xl border border-[#A855F7]/30 bg-gradient-to-br from-[#A855F7]/10 to-[#00D9FF]/5 backdrop-blur-xl p-8 overflow-hidden"
          >
            {/* Decorative glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#A855F7]/20 blur-3xl pointer-events-none" />

            <button
              onClick={() => setShowCVImport(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#A855F7]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#A855F7]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Magic Import từ CV</h3>
                <p className="text-white/40 text-sm">Groq AI sẽ tự động phân tích và điền dữ liệu vào tất cả các tab</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload PDF */}
              <div
                className="group flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#A855F7]/50 hover:bg-[#A855F7]/5 transition-all"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f?.type === 'application/pdf') handleCVImport(f);
                }}
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#A855F7]/20 transition-all">
                  <Upload className="w-7 h-7 text-white/30 group-hover:text-[#A855F7] transition-colors" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white/70 group-hover:text-white transition-colors">Upload file PDF</p>
                  <p className="text-xs text-white/30 mt-1">Kéo thả hoặc click để chọn file</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleCVImport(f);
                  }}
                />
              </div>

              {/* Paste Text */}
              <div className="flex flex-col gap-3">
                <Label className="text-white/60 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Hoặc dán text CV vào đây
                </Label>
                <Textarea
                  value={cvText}
                  onChange={e => setCvText(e.target.value)}
                  placeholder="Paste nội dung CV (plain text) tại đây..."
                  className="bg-white/5 border-white/10 focus:border-[#A855F7]/50 min-h-[120px] text-sm"
                />
                <Button
                  onClick={() => handleCVImport()}
                  disabled={isImporting || !cvText.trim()}
                  className="bg-[#A855F7]/80 hover:bg-[#A855F7] text-white rounded-xl"
                >
                  {isImporting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang phân tích...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Phân tích với AI</>
                  )}
                </Button>
              </div>
            </div>

            {/* Loading state */}
            {isImporting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-[#A855F7]/10 border border-[#A855F7]/20"
              >
                <Loader2 className="w-5 h-5 text-[#A855F7] animate-spin shrink-0" />
                <p className="text-white/70 text-sm">Groq AI đang phân tích CV... thường mất 10-20 giây</p>
              </motion.div>
            )}

            {/* Success state */}
            {importDone && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="text-green-400 font-semibold text-sm">Phân tích thành công!</p>
                  <p className="text-white/50 text-xs mt-0.5">Dữ liệu đã được điền vào các tab. Vui lòng kiểm tra và nhấn <strong>Save Changes</strong> để lưu.</p>
                </div>
              </motion.div>
            )}

            {/* Error state */}
            {importError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
              >
                <X className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{importError}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-8 h-auto flex-wrap gap-1">
          <TabsTrigger value="profile" className="flex gap-2 data-[state=active]:bg-[#00D9FF] data-[state=active]:text-black py-2 px-5 rounded-xl transition-all">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="education" className="flex gap-2 data-[state=active]:bg-[#00D9FF] data-[state=active]:text-black py-2 px-5 rounded-xl transition-all">
            <GraduationCap className="w-4 h-4" /> Education
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex gap-2 data-[state=active]:bg-[#00D9FF] data-[state=active]:text-black py-2 px-5 rounded-xl transition-all">
            <User className="w-4 h-4" /> Skills
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex gap-2 data-[state=active]:bg-[#00D9FF] data-[state=active]:text-black py-2 px-5 rounded-xl transition-all">
            <Briefcase className="w-4 h-4" /> Experience
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex gap-2 data-[state=active]:bg-[#00D9FF] data-[state=active]:text-black py-2 px-5 rounded-xl transition-all">
            <FolderOpen className="w-4 h-4" /> Projects
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="bg-white/5 border-white/10 text-white backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription className="text-white/40">Update your public identity and bio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    defaultValue={profile.full_name}
                    key={`fn-${profile.full_name}`}
                    onChange={handleProfileChange}
                    className="bg-white/5 border-white/10 focus:border-[#00D9FF]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    name="avatar_url"
                    defaultValue={profile.avatar_url}
                    onChange={handleProfileChange}
                    className="bg-white/5 border-white/10 focus:border-[#00D9FF]/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio">Bio / Summary</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAIRefine((document.getElementById('bio') as HTMLTextAreaElement)?.value || profile.bio, 'bio', 'profile:current')}
                    disabled={isRefining || aiCallsRemaining <= 0}
                    className="h-8 text-[#00D9FF] hover:text-[#00D9FF] hover:bg-[#00D9FF]/10 gap-2"
                  >
                    {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {aiCallsRemaining > 0 ? `Refine with AI (${aiCallsRemaining})` : "Limit reached"}
                  </Button>
                </div>
                <Textarea
                  id="bio"
                  name="bio"
                  key={`bio-${profile.bio}`}
                  defaultValue={profile.bio}
                  onChange={handleProfileChange}
                  className="bg-white/5 border-white/10 focus:border-[#00D9FF]/50 min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input id="github_url" name="github_url" defaultValue={profile.github_url} onChange={handleProfileChange} className="bg-white/5 border-white/10 focus:border-[#00D9FF]/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input id="linkedin_url" name="linkedin_url" defaultValue={profile.linkedin_url} onChange={handleProfileChange} className="bg-white/5 border-white/10 focus:border-[#00D9FF]/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
              <div>
                <CardTitle>Education</CardTitle>
                <CardDescription className="text-white/40">Your academic background and qualifications.</CardDescription>
              </div>
              <Button onClick={handleAddEducation} className="bg-[#00D9FF] text-black hover:bg-[#00D9FF]/80 rounded-2xl">
                <Plus className="w-4 h-4 mr-2" /> Add New
              </Button>
            </div>

            {education.length === 0 && (
              <div className="text-center text-white/30 py-16 border border-dashed border-white/10 rounded-3xl">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No education entries yet. Add one or use Magic Import from CV.</p>
              </div>
            )}

            {education.map((edu) => (
              <Card key={edu.id} className="bg-white/5 border-white/10 text-white backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-row justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      defaultValue={edu.degree}
                      onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                      className="bg-transparent border-none text-xl font-bold p-0 focus:ring-0 placeholder:text-white/20"
                      placeholder="Degree / Certificate"
                    />
                    <Input
                      defaultValue={edu.school}
                      onChange={(e) => handleEducationChange(edu.id, 'school', e.target.value)}
                      className="bg-transparent border-none text-white/60 p-0 focus:ring-0 placeholder:text-white/20"
                      placeholder="School / University"
                    />
                  </div>
                  <Button size="icon" variant="ghost" className="text-white/20 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    defaultValue={edu.period}
                    onChange={(e) => handleEducationChange(edu.id, 'period', e.target.value)}
                    className="bg-white/5 border-white/10 h-8 text-xs w-56"
                    placeholder="Period (e.g. 2018 - 2022)"
                  />
                  <Textarea
                    defaultValue={edu.description}
                    onChange={(e) => handleEducationChange(edu.id, 'description', e.target.value)}
                    className="bg-white/5 border-white/10 min-h-[80px]"
                    placeholder="Additional details, GPA, honours..."
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience">
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
              <div>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription className="text-white/40">Stations you've docked at during your journey.</CardDescription>
              </div>
              <Button onClick={handleAddExperience} className="bg-[#00D9FF] text-black hover:bg-[#00D9FF]/80 rounded-2xl">
                <Plus className="w-4 h-4 mr-2" /> Add New
              </Button>
            </div>

            {experiences.map((exp) => (
              <Card key={exp.id} className="bg-white/5 border-white/10 text-white backdrop-blur-xl rounded-3xl overflow-hidden group">
                <CardHeader className="flex flex-row justify-between items-start">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        defaultValue={exp.title}
                        onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)}
                        className="bg-transparent border-none text-xl font-bold p-0 focus:ring-0 placeholder:text-white/20"
                        placeholder="Job Title"
                      />
                      <Input
                        defaultValue={exp.company}
                        onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                        className="bg-transparent border-none text-white/60 p-0 focus:ring-0 placeholder:text-white/20"
                        placeholder="Company Name"
                      />
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="text-white/20 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    defaultValue={exp.period}
                    onChange={(e) => handleExperienceChange(exp.id, 'period', e.target.value)}
                    className="bg-white/5 border-white/10 h-8 text-xs w-48"
                    placeholder="Period (e.g. 2021 - Present)"
                  />
                  <Textarea
                    defaultValue={exp.description}
                    onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                    className="bg-white/5 border-white/10 min-h-[100px]"
                    placeholder="Describe your role and achievements..."
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
              <div>
                <CardTitle>Project Showcase</CardTitle>
                <CardDescription className="text-white/40">Constellations created within your reach.</CardDescription>
              </div>
              <Button onClick={handleAddProject} className="bg-[#A855F7] text-white hover:bg-[#A855F7]/80 rounded-2xl">
                <Plus className="w-4 h-4 mr-2" /> Add Project
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="bg-white/5 border-white/10 text-white backdrop-blur-xl rounded-3xl overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                      <img src={project.image || `https://picsum.photos/seed/${project.id}/400/250`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <Input
                        defaultValue={project.title}
                        onChange={(e) => handleProjectChange(project.id, 'title', e.target.value)}
                        className="bg-transparent border-none text-2xl font-bold p-0 focus:ring-0"
                        placeholder="Project Title"
                      />
                      <Textarea
                        defaultValue={project.description}
                        onChange={(e) => handleProjectChange(project.id, 'description', e.target.value)}
                        className="bg-white/5 border-white/10"
                        placeholder="What is this project about?"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-white/30 uppercase">Demo Link</Label>
                          <Input defaultValue={project.url} onChange={(e) => handleProjectChange(project.id, 'url', e.target.value)} className="bg-white/5 border-white/10 h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-white/30 uppercase">GitHub Link</Label>
                          <Input defaultValue={project.github_url} onChange={(e) => handleProjectChange(project.id, 'github_url', e.target.value)} className="bg-white/5 border-white/10 h-8 text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        {/* Skills Tab */}
        <TabsContent value="skills">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <CardTitle>Tech Stack</CardTitle>
                <CardDescription className="text-white/40">Tools and technologies in your arsenal.</CardDescription>
              </div>
              <Button onClick={handleAddSkill} className="bg-[#A855F7] text-white hover:bg-[#A855F7]/80 rounded-2xl">
                <Plus className="w-4 h-4 mr-2" /> Add Skill
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => (
                <Card key={skill.id} className="bg-white/5 border-white/10 text-white backdrop-blur-xl rounded-3xl overflow-hidden p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                       <Button variant="ghost" size="icon" onClick={() => updateDraft(`skill:${skill.id}`, { _delete: true })} className="text-red-400 hover:bg-red-400/10 hover:text-red-300 w-8 h-8 rounded-xl ml-auto">
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        defaultValue={skill.icon}
                        onChange={(e) => handleSkillChange(skill.id, 'icon', e.target.value)}
                        className="bg-white/10 border-white/10 w-12 text-center text-xl"
                        placeholder="Icon"
                      />
                      <Input
                        defaultValue={skill.name}
                        onChange={(e) => handleSkillChange(skill.id, 'name', e.target.value)}
                        className="bg-transparent border-none text-xl font-bold p-0 focus:ring-0 flex-1"
                        placeholder="Skill Name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-white/30 uppercase">Category</Label>
                        <select
                          value={skill.category}
                          onChange={(e) => handleSkillChange(skill.id, 'category', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-md h-9 text-xs text-white px-2 outline-none focus:border-[#A855F7] [&>option]:bg-zinc-900"
                        >
                          <option value="frontend">Frontend</option>
                          <option value="backend">Backend</option>
                          <option value="devops">DevOps</option>
                          <option value="tools">Tools</option>
                          <option value="language">Language</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-white/30 uppercase">Level (%)</Label>
                        <Input 
                          type="number"
                          defaultValue={skill.level} 
                          onChange={(e) => handleSkillChange(skill.id, 'level', parseInt(e.target.value))} 
                          className="bg-white/5 border-white/10 h-9 text-xs" 
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
