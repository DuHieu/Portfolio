import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, FolderOpen, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { refineTextWithAI } from '../../lib/groq';
import { useEdit } from '../context/edit-context';
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
  const { updateDraft, isEditMode, setEditMode } = useEdit();
  
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  // AI States
  const [aiCallsRemaining, setAiCallsRemaining] = useState(3);
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    // Fetch all data for the dashboard
    Promise.all([
      fetch(`${API_BASE}/api/profile/${username}/`).then(res => res.json()),
      fetch(`${API_BASE}/api/experiences/?user=${username}`).then(res => res.json()),
      fetch(`${API_BASE}/api/projects/?user=${username}`).then(res => res.json()),
    ]).then(([profileData, expData, projData]) => {
      setProfile(profileData);
      setExperiences(expData);
      setProjects(projData);
    }).catch(err => console.error('Dashboard fetch error:', err));

    // Ensure edit mode is on when in dashboard
    if (!isEditMode) setEditMode(true);
  }, [username, isEditMode, setEditMode]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateDraft('profile:current', { [name]: value });
  };

  const handleExperienceChange = (id: number, field: string, value: any) => {
    updateDraft(`experience:${id}`, { [field]: value });
  };

  const handleProjectChange = (id: number, field: string, value: any) => {
    updateDraft(`project:${id}`, { [field]: value });
  };

  const handleAIRefine = async (currentText: string, type: 'bio' | 'project' | 'experience', targetId: string) => {
    if (aiCallsRemaining <= 0 || isRefining || !currentText) return;

    setIsRefining(true);
    try {
      const refined = await refineTextWithAI(currentText, type);
      updateDraft(targetId, { [type === 'bio' ? 'bio' : 'description']: refined });
      setAiCallsRemaining(prev => prev - 1);
      
      // We need to update the local state too so the textarea shows the change immediately
      if (type === 'bio') {
        const bioElement = document.getElementById('bio') as HTMLTextAreaElement;
        if (bioElement) bioElement.value = refined;
      }
    } catch (error) {
      alert("Lỗi khi gọi AI. Vui lòng kiểm tra API Key trong .env");
    } finally {
      setIsRefining(false);
    }
  };

  if (!profile) return <div className="min-h-screen flex items-center justify-center text-white/50">Loading dashboard data...</div>;

  return (
    <section className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#00D9FF] to-[#A855F7] bg-clip-text text-transparent">
          Personal Dashboard
        </h2>
        <p className="text-white/50">Manage your portfolio stations from a central command center.</p>
      </motion.div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-8 h-auto flex-wrap">
          <TabsTrigger value="profile" className="flex gap-2 data-[state=active]:bg-[#00D9FF] data-[state=active]:text-black py-2 px-6 rounded-xl transition-all">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex gap-2 data-[state=active]:bg-[#00D9FF] data-[state=active]:text-black py-2 px-6 rounded-xl transition-all">
            <Briefcase className="w-4 h-4" /> Experience
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex gap-2 data-[state=active]:bg-[#00D9FF] data-[state=active]:text-black py-2 px-6 rounded-xl transition-all">
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
                  <Label htmlFor="bio">Bio</Label>
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
                  defaultValue={profile.bio} 
                  onChange={handleProfileChange}
                  className="bg-white/5 border-white/10 focus:border-[#00D9FF]/50 min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input 
                    id="github_url" 
                    name="github_url" 
                    defaultValue={profile.github_url} 
                    onChange={handleProfileChange}
                    className="bg-white/5 border-white/10 focus:border-[#00D9FF]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input 
                    id="linkedin_url" 
                    name="linkedin_url" 
                    defaultValue={profile.linkedin_url} 
                    onChange={handleProfileChange}
                    className="bg-white/5 border-white/10 focus:border-[#00D9FF]/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience">
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
              <div>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription className="text-white/40">Stations you've docked at during your journey.</CardDescription>
              </div>
              <Button className="bg-[#00D9FF] text-black hover:bg-[#00D9FF]/80 rounded-2xl">
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
              <Button className="bg-[#A855F7] text-white hover:bg-[#A855F7]/80 rounded-2xl">
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
                          <Input 
                            defaultValue={project.demo_link} 
                            onChange={(e) => handleProjectChange(project.id, 'demo_link', e.target.value)}
                            className="bg-white/5 border-white/10 h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-white/30 uppercase">GitHub Link</Label>
                          <Input 
                            defaultValue={project.github_link} 
                            onChange={(e) => handleProjectChange(project.id, 'github_link', e.target.value)}
                            className="bg-white/5 border-white/10 h-8 text-xs"
                          />
                        </div>
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
