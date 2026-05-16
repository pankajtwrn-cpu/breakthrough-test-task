'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, BookOpen, Clock, Users, X, Loader2, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Program } from '@/types';

export default function DashboardPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [newProgram, setNewProgram] = useState({ title: '', description: '', thumbnailUrl: '' });
  const [isCreating, setIsCreating] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      fetchPrograms();
    }
  }, [token]);

  const fetchPrograms = async () => {
    try {
      const res = await fetch('http://localhost:3001/programs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const url = editingProgramId 
        ? `http://localhost:3001/programs/${editingProgramId}`
        : 'http://localhost:3001/programs';
      
      const method = editingProgramId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProgram),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingProgramId(null);
        setNewProgram({ title: '', description: '', thumbnailUrl: '' });
        fetchPrograms();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProgram = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this program? All sessions will be lost.')) return;

    try {
      const res = await fetch(`http://localhost:3001/programs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchPrograms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (e: React.MouseEvent, program: Program) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProgramId(program.id);
    setNewProgram({
      title: program.title,
      description: program.description || '',
      thumbnailUrl: program.thumbnailUrl || '',
    });
    setShowModal(true);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Programs</h1>
          <p className="text-gray-400 mt-1">Manage your wellness programs and sessions</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Program</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : programs.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <div className="bg-indigo-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-indigo-400" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-white">No programs yet</h2>
          <p className="text-gray-400 mt-2 max-w-sm mx-auto">
            Get started by creating your first wellness program.
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary mt-6"
          >
            Create First Program
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Link key={program.id} href={`/programs/${program.id}`}>
              <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group">
                <div className="relative h-48 w-full overflow-hidden bg-white/5">
                  <img
                    src={program.thumbnailUrl || `https://picsum.photos/seed/${program.id}/400/300`}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${program.id}/400/300`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                      onClick={(e) => openEditModal(e, program)}
                      className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteProgram(e, program.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md rounded-full text-red-500 transition-all border border-red-500/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded">
                      ACTIVE
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">
                    {program.description}
                  </p>
                  <div className="flex items-center justify-between text-gray-500 text-xs pt-4 border-t border-white/5">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>Updated {new Date(program.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 font-mono">
                      <Users size={14} />
                      <span>{program.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Program Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative glass-card p-8 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingProgramId ? 'Edit Program' : 'Create New Program'}
              </h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingProgramId(null);
                  setNewProgram({ title: '', description: '', thumbnailUrl: '' });
                }}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProgram} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Program Title</label>
                <input
                  type="text"
                  required
                  value={newProgram.title}
                  onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 30 Day Yoga Journey"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  className="input-field resize-none"
                  placeholder="What is this program about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL (Optional)</label>
                <input
                  type="url"
                  value={newProgram.thumbnailUrl}
                  onChange={(e) => setNewProgram({ ...newProgram, thumbnailUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProgramId(null);
                    setNewProgram({ title: '', description: '', thumbnailUrl: '' });
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2 font-semibold disabled:opacity-50"
                >
                  {isCreating ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <span>{editingProgramId ? 'Save Changes' : 'Create Program'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
