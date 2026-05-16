'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  GripVertical, 
  Play, 
  Clock, 
  Tag, 
  FileUp, 
  Plus,
  Save,
  X,
  Loader2,
  ExternalLink,
  Pencil,
  Trash2,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from '@/components/SortableItem';
import { Program, Session } from '@/types';

export default function ProgramDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  
  const [program, setProgram] = useState<Program | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modals
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [isUpdatingProgram, setIsUpdatingProgram] = useState(false);
  const [editProgramData, setEditProgramData] = useState({ title: '', description: '', thumbnailUrl: '' });
  
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({
    title: '',
    duration: 300,
    instructorName: '',
    tags: '',
    mediaUrl: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
       activationConstraint: {
         distance: 8,
       },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (token && id) {
      fetchProgramData();
    }
  }, [token, id]);

  const fetchProgramData = async () => {
    try {
      const progRes = await fetch(`http://localhost:3001/programs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const progs: Program[] = await progRes.json();
      const currentProg = progs.find((p) => p.id === id);
      setProgram(currentProg || null);
      fetchSessions();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const sessRes = await fetch(`http://localhost:3001/sessions/program/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sessData = await sessRes.json();
      setSessions(sessData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSessions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const sessionIds = sessions.map((s) => s.id);
      const res = await fetch(`http://localhost:3001/sessions/program/${id}/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionIds }),
      });
      if (res.ok) alert('Order saved successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingSession(true);
    try {
      const url = editingSessionId 
        ? `http://localhost:3001/sessions/${editingSessionId}`
        : `http://localhost:3001/sessions/program/${id}`;
      
      const method = editingSessionId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...sessionFormData,
          position: editingSessionId ? undefined : sessions.length,
          tags: typeof sessionFormData.tags === 'string' 
            ? sessionFormData.tags.split(',').map(t => t.trim()).filter(t => t)
            : sessionFormData.tags,
          duration: Number(sessionFormData.duration)
        }),
      });
      if (res.ok) {
        setShowSessionModal(false);
        setEditingSessionId(null);
        setSessionFormData({ title: '', duration: 300, instructorName: '', tags: '', mediaUrl: '' });
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const res = await fetch(`http://localhost:3001/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditSessionModal = (e: React.MouseEvent, sess: Session) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSessionId(sess.id);
    setSessionFormData({
      title: sess.title,
      duration: sess.duration,
      instructorName: sess.instructorName,
      tags: Array.isArray(sess.tags) ? sess.tags.join(', ') : '',
      mediaUrl: sess.mediaUrl || ''
    });
    setShowSessionModal(true);
  };

  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      // 1. Get signed URL
      const res = await fetch(`http://localhost:3001/sessions/signed-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { uploadUrl, publicUrl } = await res.json();

      // 2. Perform the upload (Mocked as per requirements)
      console.log(`Mocking upload to: ${uploadUrl}`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      // 3. Update form
      setSessionFormData({ ...sessionFormData, mediaUrl: publicUrl });
      alert('Media uploaded successfully (Mocked S3 Flow)');
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProgram(true);
    try {
      const res = await fetch(`http://localhost:3001/programs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editProgramData),
      });
      if (res.ok) {
        setShowProgramModal(false);
        fetchProgramData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingProgram(false);
    }
  };

  const openEditProgramModal = () => {
    if (!program) return;
    setEditProgramData({
      title: program.title,
      description: program.description || '',
      thumbnailUrl: program.thumbnailUrl || ''
    });
    setShowProgramModal(true);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (!program) return <div className="text-white text-center py-20">Program not found</div>;

  return (
    <div className="pb-20 relative">
      <Link href="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors w-fit">
        <ArrowLeft size={20} />
        <span>Back to Programs</span>
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/3">
          <div className="glass-card rounded-2xl overflow-hidden shadow-2xl sticky top-8">
            <div className="relative h-64 bg-white/5">
              <img
                src={program.thumbnailUrl || 'https://picsum.photos/400/300'}
                alt={program.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300'; }}
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-white">{program.title}</h1>
                <button 
                  onClick={openEditProgramModal}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                >
                  <Pencil size={16} />
                </button>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{program.description}</p>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sessions</span>
                  <span className="text-white font-medium">{sessions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Duration</span>
                  <span className="text-white font-medium">
                    {Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60)} mins
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Program Content</h2>
            <div className="flex space-x-3">
              <Link href={`/programs/${id}/import`} className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10">
                <FileUp size={18} />
                <span>Bulk Import</span>
              </Link>
              <button 
                onClick={() => setShowSessionModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all border border-indigo-500/20"
              >
                <Plus size={18} />
                <span>Add Session</span>
              </button>
              <button onClick={saveOrder} disabled={saving} className="btn-primary flex items-center space-x-2">
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Order'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sessions.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {sessions.map((session) => (
                  <SortableItem key={session.id} id={session.id}>
                    {({ attributes, listeners }) => (
                      <div className="glass flex items-center p-4 rounded-xl group hover:border-indigo-500/50 transition-all cursor-default">
                        <div 
                          className="text-gray-500 mr-4 cursor-grab active:cursor-grabbing hover:text-white transition-colors p-2 -m-2"
                          {...attributes}
                          {...listeners}
                        >
                          <GripVertical size={20} />
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (session.mediaUrl) {
                              setActiveVideo(session.mediaUrl);
                            }
                          }}
                          className="bg-indigo-500/10 hover:bg-indigo-500/30 p-3 rounded-lg mr-4 transition-all group/play relative z-10"
                          disabled={!session.mediaUrl}
                        >
                          <Play size={18} className={`${session.mediaUrl ? 'text-indigo-400 group-hover/play:scale-110' : 'text-gray-600'} transition-all`} />
                        </button>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{session.title}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-gray-500 text-xs flex items-center">
                              <Clock size={12} className="mr-1" />
                              {Math.floor(session.duration / 60)}:{String(session.duration % 60).padStart(2, '0')}
                            </span>
                            <span className="text-gray-500 text-xs flex items-center">
                              <Tag size={12} className="mr-1" />
                              {session.instructorName}
                            </span>
                            {session.mediaUrl && (
                               <span className="text-indigo-500/50 text-[10px] uppercase font-bold tracking-tighter">Media Attached</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => openEditSessionModal(e, session)}
                            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteSession(e, session.id)}
                            className="p-2 bg-red-500/5 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
            
            {sessions.length === 0 && (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-gray-500">No sessions in this program yet.</p>
                <button onClick={() => setShowSessionModal(true)} className="text-indigo-400 hover:text-indigo-300 mt-2 font-medium">Add first session</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setActiveVideo(null)}></div>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            
            {activeVideo.includes('youtube.com') || activeVideo.includes('youtu.be') ? (
              <iframe
                src={getEmbedUrl(activeVideo) + '?autoplay=1'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                <Play size={64} className="text-indigo-500 mb-6 opacity-20" />
                <h3 className="text-xl font-bold text-white mb-2">Non-YouTube Media</h3>
                <p className="text-gray-400 mb-8 max-w-md">This session uses an external resource that cannot be embedded directly.</p>
                <a 
                  href={activeVideo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center space-x-2"
                >
                   <ExternalLink size={18} />
                   <span>Open Content in New Tab</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save/Edit Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
            setShowSessionModal(false);
            setEditingSessionId(null);
          }}></div>
          <div className="relative glass-card p-8 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingSessionId ? 'Edit Session' : 'Add New Session'}
              </h2>
              <button onClick={() => {
                setShowSessionModal(false);
                setEditingSessionId(null);
              }} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Session Title</label>
                <input
                  type="text"
                  required
                  value={sessionFormData.title}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Morning Flow"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration (seconds)</label>
                  <input
                    type="number"
                    required
                    value={sessionFormData.duration}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, duration: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instructor Name</label>
                  <input
                    type="text"
                    required
                    value={sessionFormData.instructorName}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, instructorName: e.target.value })}
                    className="input-field"
                    placeholder="Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={sessionFormData.tags}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, tags: e.target.value })}
                  className="input-field"
                  placeholder="yoga, fitness, morning"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Media URL</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={sessionFormData.mediaUrl}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, mediaUrl: e.target.value })}
                    className="input-field flex-1"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleUploadMedia}
                      className="hidden"
                      id="media-upload"
                      accept="video/*,audio/*"
                    />
                    <label 
                      htmlFor="media-upload" 
                      className={`flex items-center justify-center p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer ${isUploadingMedia ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {isUploadingMedia ? <Loader2 size={20} className="animate-spin text-indigo-400" /> : <Upload size={20} className="text-gray-400" />}
                    </label>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 italic">Paste a YouTube link or upload a file for secure S3 hosting.</p>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => {
                  setShowSessionModal(false);
                  setEditingSessionId(null);
                }} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all font-semibold">Cancel</button>
                <button type="submit" disabled={isCreatingSession} className="flex-1 btn-primary flex items-center justify-center space-x-2 font-semibold disabled:opacity-50">
                  {isCreatingSession ? <Loader2 size={20} className="animate-spin" /> : <span>{editingSessionId ? 'Save Changes' : 'Add Session'}</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProgramModal(false)}></div>
          <div className="relative glass-card p-8 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Program</h2>
              <button onClick={() => setShowProgramModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProgram} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Program Title</label>
                <input
                  type="text"
                  required
                  value={editProgramData.title}
                  onChange={(e) => setEditProgramData({ ...editProgramData, title: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={editProgramData.description}
                  onChange={(e) => setEditProgramData({ ...editProgramData, description: e.target.value })}
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={editProgramData.thumbnailUrl}
                  onChange={(e) => setEditProgramData({ ...editProgramData, thumbnailUrl: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setShowProgramModal(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all font-semibold">Cancel</button>
                <button type="submit" disabled={isUpdatingProgram} className="flex-1 btn-primary flex items-center justify-center space-x-2 font-semibold disabled:opacity-50">
                  {isUpdatingProgram ? <Loader2 size={20} className="animate-spin" /> : <span>Update Program</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
