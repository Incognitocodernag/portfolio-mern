import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../config';
import ThemeToggle from '../components/ThemeToggle';
import { 
  FolderLock, 
  MessageSquare, 
  Briefcase, 
  Calendar, 
  Trash2, 
  Edit, 
  LogOut, 
  Plus, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
  Clock,
  TrendingUp,
  Inbox
} from 'lucide-react';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [timelineList, setTimelineList] = useState([]);
  
  const [alert, setAlert] = useState({ type: '', text: '' });
  
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', tags: '', repoLink: '', liveLink: '' });
  
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({ type: 'Education', title: '', organization: '', duration: '', bullets: '' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert({ type: '', text: '' }), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login', { replace: true });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [msgRes, projRes, timeRes] = await Promise.all([
        API.get('/api/messages'),
        API.get('/api/portfolio/projects'),
        API.get('/api/portfolio/timeline')
      ]);
      setMessageList(msgRes.data);
      setProjectList(projRes.data);
      setTimelineList(timeRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        showAlert('error', 'Error loading database information.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...projectForm,
      tags: projectForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
      if (editingProject) {
        await API.put(`/api/portfolio/projects/${editingProject._id}`, payload);
        showAlert('success', 'Project updated successfully.');
      } else {
        await API.post('/api/portfolio/projects', payload);
        showAlert('success', 'Project created successfully.');
      }
      setProjectForm({ title: '', description: '', tags: '', repoLink: '', liveLink: '' });
      setEditingProject(null);
      fetchData();
    } catch (err) {
      showAlert('error', 'Failed to save project records.');
    }
  };

  const handleEditProjectClick = (proj) => {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title,
      description: proj.description,
      tags: proj.tags.join(', '),
      repoLink: proj.repoLink,
      liveLink: proj.liveLink
    });
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project permanently?')) return;
    try {
      await API.delete(`/api/portfolio/projects/${id}`);
      showAlert('success', 'Project deleted successfully.');
      fetchData();
    } catch (err) {
      showAlert('error', 'Failed to delete project.');
    }
  };

  const handleMilestoneSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...milestoneForm,
      bullets: milestoneForm.bullets.split('\n').map(bullet => bullet.trim()).filter(Boolean)
    };

    try {
      if (editingMilestone) {
        await API.put(`/api/portfolio/timeline/${editingMilestone._id}`, payload);
        showAlert('success', 'Milestone updated successfully.');
      } else {
        await API.post('/api/portfolio/timeline', payload);
        showAlert('success', 'Milestone created successfully.');
      }
      setMilestoneForm({ type: 'Education', title: '', organization: '', duration: '', bullets: '' });
      setEditingMilestone(null);
      fetchData();
    } catch (err) {
      showAlert('error', 'Failed to save milestone records.');
    }
  };

  const handleEditMilestoneClick = (ms) => {
    setEditingMilestone(ms);
    setMilestoneForm({
      type: ms.type,
      title: ms.title,
      organization: ms.organization,
      duration: ms.duration,
      bullets: ms.bullets.join('\n')
    });
  };

  const handleDeleteMilestone = async (id) => {
    if (!window.confirm('Delete this timeline milestone permanently?')) return;
    try {
      await API.delete(`/api/portfolio/timeline/${id}`);
      showAlert('success', 'Timeline milestone deleted.');
      fetchData();
    } catch (err) {
      showAlert('error', 'Failed to delete milestone.');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await API.delete(`/api/messages/${id}`);
      showAlert('success', 'Contact message deleted.');
      fetchData();
    } catch (err) {
      showAlert('error', 'Failed to delete message.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#02050E] flex flex-col transition-colors duration-300">
      
      {/* Top Banner Navbar */}
      <header className="h-[4.5rem] bg-white dark:bg-[#050914] border-b border-slate-200 dark:border-white/5 px-6 md:px-12 lg:px-24 flex justify-between items-center shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <FolderLock className="w-6 h-6 text-orange-500" />
          <span className="text-slate-900 dark:text-white text-lg font-bold uppercase tracking-widest">
            ARUNABHA <span className="text-orange-500">ADMIN</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-colors flex items-center gap-1 mr-2">
            <span>View Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          
          {/* Theme Switcher */}
          <ThemeToggle />

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-sm font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Workspace Wrapper */}
      <div className="flex-1 w-full max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24 py-12 grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12">
        
        {/* Left Sidebar Tabs */}
        <aside className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'overview' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5" />
              <span>Overview</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'messages' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <span>Messages</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'projects' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5" />
              <span>Projects</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setActiveTab('timeline')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'timeline' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <span>Timeline</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </aside>

        {/* Right Tab Content */}
        <main className="flex flex-col gap-8">
          
          {alert.text && (
            <div className={`p-4 rounded-xl border text-sm font-semibold ${
              alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {alert.text}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12 gap-3 text-orange-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading workspace info...</span>
            </div>
          )}

          {/* Overview Dashboard Tab */}
          {!loading && activeTab === 'overview' && (
            <div className="flex flex-col gap-10">
              
              {/* Header Title */}
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Workspace Overview</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">At-a-glance metrics and activity logs for your portfolio.</p>
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Messages */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#050914] p-6 flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Inbox Submissions</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{messageList.length}</span>
                  </div>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl">
                    <Inbox className="w-6 h-6" />
                  </div>
                </div>

                {/* Messages Today */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#050914] p-6 flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Received Today</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {messageList.filter(msg => new Date(msg.createdAt).toDateString() === new Date().toDateString()).length}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                {/* Projects Showcase */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#050914] p-6 flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Showcased Works</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{projectList.length}</span>
                  </div>
                  <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-500 rounded-xl">
                    <Briefcase className="w-6 h-6" />
                  </div>
                </div>

                {/* Growth Milestones */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#050914] p-6 flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Timeline Cards</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{timelineList.length}</span>
                  </div>
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Chart & Quick Activity Container */}
              <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-8">
                
                {/* Custom SVG Message Chart Card */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#050914] p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        <span>Inquiry Frequency</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Total form submissions over the last 7 days.</p>
                    </div>
                  </div>
                  
                  {/* SVG Bar Chart */}
                  <div className="relative py-4 pr-2 pl-4 border border-slate-100 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-[#02050E]/40 overflow-hidden">
                    {(() => {
                      const getChartData = () => {
                        const data = [];
                        const today = new Date();
                        for (let i = 6; i >= 0; i--) {
                          const date = new Date(today);
                          date.setDate(today.getDate() - i);
                          const dateStr = date.toDateString();
                          const count = messageList.filter(msg => new Date(msg.createdAt).toDateString() === dateStr).length;
                          const label = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
                          data.push({ label, count });
                        }
                        return data;
                      };
                      const chartData = getChartData();
                      const maxCount = Math.max(...chartData.map(d => d.count), 1);
                      
                      return (
                        <svg viewBox="0 0 500 200" className="w-full h-48 sm:h-60 text-slate-300 dark:text-white/5">
                          {/* Horizontal Grid lines */}
                          <line x1="40" y1="20" x2="480" y2="20" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                          <line x1="40" y1="70" x2="480" y2="70" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                          <line x1="40" y1="120" x2="480" y2="120" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                          <line x1="40" y1="170" x2="480" y2="170" stroke="currentColor" strokeOpacity="0.2" />
                          
                          {/* Y-Axis labels */}
                          <text x="30" y="24" textAnchor="end" className="text-[9px] fill-slate-400 font-semibold">{maxCount}</text>
                          <text x="30" y="98" textAnchor="end" className="text-[9px] fill-slate-400 font-semibold">{Math.round(maxCount / 2)}</text>
                          <text x="30" y="174" textAnchor="end" className="text-[9px] fill-slate-400 font-semibold">0</text>
                          
                          {chartData.map((d, idx) => {
                            const barWidth = 32;
                            const spacing = (440 - barWidth * 7) / 6;
                            const x = 50 + idx * (barWidth + spacing);
                            const barHeight = (d.count / maxCount) * 140;
                            const y = 170 - barHeight;
                            
                            return (
                              <g key={idx} className="group cursor-pointer">
                                {/* Invisible interactive hover background */}
                                <rect x={x - 4} y="10" width={barWidth + 8} height="165" fill="transparent" />
                                {/* Glowing backdrop on hover */}
                                <rect 
                                  x={x - 2} 
                                  y={y - 2} 
                                  width={barWidth + 4} 
                                  height={barHeight + 2} 
                                  rx="5" 
                                  className="fill-orange-500/0 group-hover:fill-orange-500/10 transition-all duration-200"
                                />
                                {/* Bar */}
                                <rect 
                                  x={x} 
                                  y={y} 
                                  width={barWidth} 
                                  height={Math.max(barHeight, 4)} 
                                  rx="3" 
                                  className={`${d.count > 0 ? 'fill-orange-500 shadow-lg' : 'fill-slate-200 dark:fill-white/10'} transition-all duration-300`}
                                />
                                {/* Label */}
                                <text 
                                  x={x + barWidth / 2} 
                                  y="188" 
                                  textAnchor="middle" 
                                  className="text-[9px] fill-slate-400 dark:fill-slate-500 font-semibold"
                                >
                                  {d.label}
                                </text>
                                {/* Tooltip count */}
                                <text 
                                  x={x + barWidth / 2} 
                                  y={y - 8} 
                                  textAnchor="middle" 
                                  className="text-[10px] font-extrabold fill-slate-800 dark:fill-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  {d.count}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#050914] p-6 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Recent Inquiries</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Latest form submissions from your website.</p>
                  </div>

                  <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[260px]">
                    {messageList.length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">No messages received yet.</p>
                    ) : (
                      messageList.slice(0, 3).map((msg) => (
                        <div key={msg._id} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#02050E]/40 flex flex-col gap-1.5 hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{msg.name}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                              {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">({msg.email})</span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {messageList.length > 0 && (
                    <button 
                      onClick={() => setActiveTab('messages')}
                      className="w-full py-2 rounded-xl text-xs font-semibold text-center border border-orange-500/20 text-orange-500 hover:bg-orange-500/10 transition-all mt-2"
                    >
                      View All Messages ({messageList.length})
                    </button>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Messages Tab */}
          {!loading && activeTab === 'messages' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Contact Form Inquiries ({messageList.length})</h2>
              {messageList.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">No contact messages received yet.</p>
              ) : (
                messageList.map((msg) => (
                  <div key={msg._id} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#050914] p-6 flex justify-between items-start hover:border-slate-300 dark:hover:border-white/15 shadow-sm dark:shadow-none transition-all">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-slate-900 dark:text-white font-bold">{msg.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">({msg.email})</span>
                        <span className="text-[11px] text-orange-500 font-semibold">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0 transition-colors"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Projects Tab */}
          {!loading && activeTab === 'projects' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
              
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Manage Projects ({projectList.length})</h2>
                {projectList.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">No projects found. Seed or create one.</p>
                ) : (
                  projectList.map((proj) => (
                    <div key={proj._id} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#050914] p-6 flex justify-between items-start gap-4 shadow-sm dark:shadow-none">
                      <div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1">{proj.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">{proj.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-white/5">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleEditProjectClick(proj)}
                          className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(proj._id)}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050914]/40 p-6 shadow-lg backdrop-blur-md">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-500" />
                  <span>{editingProject ? 'Edit Project' : 'Add New Project'}</span>
                </h3>
                <form onSubmit={handleProjectSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Project Title</label>
                    <input 
                      type="text" 
                      required
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                      placeholder="WealthifyMe"
                      className="px-3 py-2 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                    <textarea 
                      required
                      rows="3"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                      placeholder="MERN stack finance manager..."
                      className="px-3 py-2 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-all resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
                    <input 
                      type="text"
                      value={projectForm.tags}
                      onChange={(e) => setProjectForm({...projectForm, tags: e.target.value})}
                      placeholder="React.js, Node.js, Express.js, MongoDB"
                      className="px-3 py-2 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">GitHub Repository Link</label>
                    <input 
                      type="url"
                      value={projectForm.repoLink}
                      onChange={(e) => setProjectForm({...projectForm, repoLink: e.target.value})}
                      placeholder="https://github.com/..."
                      className="px-3 py-2 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Live Project Demo Link</label>
                    <input 
                      type="url"
                      value={projectForm.liveLink}
                      onChange={(e) => setProjectForm({...projectForm, liveLink: e.target.value})}
                      placeholder="https://..."
                      className="px-3 py-2 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button 
                      type="submit" 
                      className="flex-1 py-2.5 rounded-lg bg-orange-500 text-black font-bold hover:bg-orange-600 transition-colors text-sm"
                    >
                      {editingProject ? 'Save Edits' : 'Create Project'}
                    </button>
                    {editingProject && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingProject(null);
                          setProjectForm({ title: '', description: '', tags: '', repoLink: '', liveLink: '' });
                        }}
                        className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs text-slate-700 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* Timeline Tab */}
          {!loading && activeTab === 'timeline' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
              
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Manage Growth Roadmap ({timelineList.length})</h2>
                {timelineList.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">No milestones registered yet.</p>
                ) : (
                  timelineList.map((ms) => (
                    <div key={ms._id} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#050914] p-6 flex justify-between items-start gap-4 shadow-sm dark:shadow-none">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded">{ms.type}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{ms.duration}</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">{ms.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{ms.organization}</p>
                        <ul className="space-y-1 bg-slate-50 dark:bg-white/5 rounded-lg p-3">
                          {ms.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc list-inside">{b}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleEditMilestoneClick(ms)}
                          className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMilestone(ms._id)}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050914]/40 p-6 shadow-lg backdrop-blur-md">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-500" />
                  <span>{editingMilestone ? 'Edit Roadmap Card' : 'Add Roadmap Card'}</span>
                </h3>
                <form onSubmit={handleMilestoneSubmit} className="flex flex-col gap-4">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Timeline Tag/Type</label>
                    <select 
                      value={milestoneForm.type}
                      onChange={(e) => setMilestoneForm({...milestoneForm, type: e.target.value})}
                      className="px-3 py-2 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
                    >
                      <option value="Education">Education</option>
                      <option value="Specialization">Specialization</option>
                      <option value="Project Milestone">Project Milestone</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Milestone Title</label>
                    <input 
                      type="text" 
                      required
                      value={milestoneForm.title}
                      onChange={(e) => setMilestoneForm({...milestoneForm, title: e.target.value})}
                      placeholder="B.Tech in Computer Science"
                      className="px-3 py-2 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Organization / Issuer</label>
                    <input 
                      type="text" 
                      required
                      value={milestoneForm.organization}
                      onChange={(e) => setMilestoneForm({...milestoneForm, organization: e.target.value})}
                      placeholder="HNBGU University"
                      className="px-3 py-2 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Duration / Date Range</label>
                    <input 
                      type="text" 
                      required
                      value={milestoneForm.duration}
                      onChange={(e) => setMilestoneForm({...milestoneForm, duration: e.target.value})}
                      placeholder="2023 - 2027"
                      className="px-3 py-2 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bullet Details (One per line)</label>
                    <textarea 
                      required
                      rows="4"
                      value={milestoneForm.bullets}
                      onChange={(e) => setMilestoneForm({...milestoneForm, bullets: e.target.value})}
                      placeholder="Built MERN wealth dashboard.&#10;Maintained 9.0 CGPA."
                      className="px-3 py-2 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button 
                      type="submit" 
                      className="flex-1 py-2.5 rounded-lg bg-orange-500 text-black font-bold hover:bg-orange-600 transition-colors text-sm"
                    >
                      {editingMilestone ? 'Save Edits' : 'Create Milestone'}
                    </button>
                    {editingMilestone && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingMilestone(null);
                          setMilestoneForm({ type: 'Education', title: '', organization: '', duration: '', bullets: '' });
                        }}
                        className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs text-slate-700 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default Dashboard;
