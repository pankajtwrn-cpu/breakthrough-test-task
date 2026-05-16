'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  FileUp, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Download,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { ImportResult } from '@/types';

export default function BulkImportPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvContent(event.target?.result as string);
      };
      reader.readAsText(selectedFile);
    }
  };

  const startImport = async () => {
    if (!csvContent) return;
    setImporting(true);
    setResult(null);
    setError('');

    try {
      const res = await fetch(`http://localhost:3001/sessions/program/${id}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          csvData: csvContent,
          clientBatchId: uuidv4(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setResult(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const content = "title,duration,position,instructor_name,tags,media_url\nExample Session,300,1,John Doe,\"tag1,tag2\",https://example.com/audio.mp3";
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sessions_template.csv';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={`/programs/${id}`} className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors w-fit">
        <ArrowLeft size={20} />
        <span>Back to Program</span>
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Bulk Session Import</h1>
        <p className="text-gray-400 mt-1">Upload a CSV file to add multiple sessions at once.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-2xl border-dashed border-2 border-white/20 flex flex-col items-center justify-center text-center">
            <div className="bg-indigo-500/10 p-4 rounded-full mb-4">
              <FileUp className="text-indigo-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {file ? file.name : 'Choose a CSV file'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Drag and drop your file here or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn-primary cursor-pointer">
              Select File
            </label>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h4 className="text-white font-medium mb-4 flex items-center">
              <AlertCircle size={18} className="text-indigo-400 mr-2" />
              CSV Requirements
            </h4>
            <ul className="text-sm text-gray-400 space-y-2 list-disc pl-5">
              <li>Must be a valid CSV file</li>
              <li>Columns: title, duration, position, instructor_name</li>
              <li>Optional columns: tags, media_url</li>
              <li>Tags should be comma-separated</li>
              <li>Position should be a unique number for sorting</li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="mt-6 flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            >
              <Download size={16} />
              <span>Download CSV Template</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {importing && (
            <div className="glass-card p-12 flex flex-col items-center justify-center rounded-2xl text-center">
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
              <p className="text-white font-medium">Processing Import...</p>
              <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
              <div className="flex items-center text-red-500 mb-2">
                <XCircle size={20} className="mr-2" />
                <span className="font-bold">Import Error</span>
              </div>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-center mb-6">
                <CheckCircle2 size={24} className="text-green-500 mr-3" />
                <h3 className="text-xl font-bold text-white">Import Complete</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-xl">
                  <span className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Total Rows</span>
                  <span className="text-2xl font-bold text-white">{result.total}</span>
                </div>
                <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                  <span className="block text-green-500/80 text-xs uppercase font-bold tracking-wider mb-1">Imported</span>
                  <span className="text-2xl font-bold text-white">{result.imported}</span>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3">Validation Failures</h4>
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl overflow-hidden">
                    {result.errors.map((err, i) => (
                      <div key={i} className="p-3 border-b border-red-500/10 last:border-0 flex text-xs">
                        <span className="text-red-500 font-bold mr-2">Row {err.row}:</span>
                        <span className="text-gray-400">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push(`/programs/${id}`)}
                className="btn-primary w-full mt-8"
              >
                Back to Program
              </button>
            </div>
          )}

          {!importing && !result && csvContent && (
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Ready to Import</h3>
              <p className="text-gray-400 text-sm mb-8">
                Your file "{file?.name}" is ready to be processed. We will validate each row and import all valid sessions.
              </p>
              <button onClick={startImport} className="btn-primary w-full py-4 text-lg font-bold">
                Start Import
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
