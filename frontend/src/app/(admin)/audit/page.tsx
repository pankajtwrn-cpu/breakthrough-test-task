'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  History, 
  Search, 
  Calendar, 
  User, 
  Activity,
  ChevronRight,
  Filter,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { CustomSelect } from '@/components/CustomSelect';
import { AuditLog } from '@/types';

export default function AuditLogPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filterOptions = [
    { value: '', label: 'All Actions' },
    { value: 'CREATE', label: 'Create' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'DELETE', label: 'Delete' },
    { value: 'REORDER', label: 'Reorder' },
    { value: 'IMPORT', label: 'Import' },
  ];

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token, actionFilter, startDate, endDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (actionFilter) query.append('action', actionFilter);
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);

      const res = await fetch(`http://localhost:3001/audit?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-400 bg-green-400/10';
      case 'UPDATE': return 'text-blue-400 bg-blue-400/10';
      case 'DELETE': return 'text-red-400 bg-red-400/10';
      case 'REORDER': return 'text-purple-400 bg-purple-400/10';
      case 'IMPORT': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="pb-20">
      <Link href="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors w-fit">
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Log</h1>
          <p className="text-gray-400 mt-1">Track all administrative actions across your account</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Action Type</label>
          <CustomSelect
            options={filterOptions}
            value={actionFilter}
            onChange={setActionFilter}
            icon={<Filter size={18} />}
          />
        </div>
        
        <div className="w-48">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="w-48">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
          />
        </div>

        <button 
          onClick={() => { setActionFilter(''); setStartDate(''); setEndDate(''); }}
          className="px-4 py-2 text-gray-500 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <p className="text-gray-500">No logs found matching your filters.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">{log.entityType}</span>
                        <span className="text-gray-500 text-[10px] font-mono">{log.entityId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-300 text-sm">
                        <User size={14} className="mr-2 text-gray-500" />
                        {log.actorId.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-xs italic">
                        {log.details ? JSON.stringify(log.details).slice(0, 50) + '...' : 'No details'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
