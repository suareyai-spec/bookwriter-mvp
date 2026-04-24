'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect, useCallback } from 'react';

type Step = 'upload' | 'mapping' | 'results' | 'history';

interface UploadHistory {
  id: string;
  fileName: string;
  createdAt: string;
  status: string;
  recordsParsed: number;
  recordsFailed: number;
}

interface PreviewData {
  columns: string[];
  sampleRows: Record<string, any>[];
  autoMapping: Record<string, string>;
  uploadId: string;
}

interface ProcessResult {
  recordsParsed: number;
  recordsFailed: number;
  errors: string[];
}

const REQUIRED_FIELDS = [
  { key: 'patientName', label: 'Patient Name', required: true },
  { key: 'patientId', label: 'Patient ID', required: true },
  { key: 'claimDate', label: 'Claim Date', required: true },
  { key: 'amount', label: 'Amount', required: true },
  { key: 'claimType', label: 'Claim Type', required: false },
  { key: 'providerName', label: 'Provider', required: false },
  { key: 'payer', label: 'Payer', required: false },
  { key: 'diagnosisCode', label: 'Diagnosis Code', required: false },
  { key: 'procedureCode', label: 'Procedure Code', required: false },
  { key: 'status', label: 'Status', required: false },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function UploadPage() {
  const [step, setStep] = useState<Step>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [history, setHistory] = useState<UploadHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/upload', { credentials: 'include' });
      if (res.status === 401) { window.location.href = '/auth/login?expired=1'; return; }
      const data = await res.json();
      setHistory(data.uploads || []);
    } catch {} finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => { if (step === 'history') fetchHistory(); }, [step, fetchHistory]);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setResult(null);
    setPreview(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const handleBrowse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = (e: any) => {
      const f = e.target.files?.[0];
      if (f) handleFileSelect(f);
    };
    input.click();
  };

  const handleUploadAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/preview', { method: 'POST', body: formData, credentials: 'include' });
      if (res.status === 401) { window.location.href = '/auth/login?expired=1'; return; }
      const data = await res.json();
      setPreview(data);
      setMapping(data.autoMapping || {});
      setStep('mapping');
    } catch {} finally { setUploading(false); }
  };

  const handleProcess = async () => {
    if (!preview) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/upload/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: preview.uploadId, mapping }),
        credentials: 'include',
      });
      if (res.status === 401) { window.location.href = '/auth/login?expired=1'; return; }
      const data = await res.json();
      setResult(data);
      setStep('results');
    } catch {} finally { setProcessing(false); }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setMapping({});
    setResult(null);
    setStep('upload');
  };

  const tabs: { key: Step; label: string }[] = [
    { key: 'upload', label: '1. Upload' },
    { key: 'mapping', label: '2. Mapping' },
    { key: 'results', label: '3. Results' },
    { key: 'history', label: '4. History' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Claims Upload</h1>
        <p className="text-base text-[#86868b] mt-1">Upload and map payer claims data</p>
      </div>

      {/* Step Tabs */}
      <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 border border-gray-200/60 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setStep(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              step === t.key ? 'bg-[#0071e3] text-white' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
            disabled={(t.key === 'mapping' && !preview) || (t.key === 'results' && !result)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Step 1: File Upload */}
      {step === 'upload' && (
        <div>
          <div
            className={`glass-card p-16 text-center border-2 border-dashed transition-all cursor-pointer ${
              dragOver ? 'border-[#0071e3] bg-[#0071e3]/3' : 'border-gray-200'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={handleBrowse}
          >
            <div className="text-5xl mb-5 opacity-40">⬆</div>
            <p className="text-lg font-semibold text-[#1d1d1f] mb-2">Drop claims file here</p>
            <p className="text-sm text-[#86868b]">Supports CSV, Excel (.xlsx, .xls)</p>
            <p className="text-xs text-[#86868b] mt-2">or click to browse</p>
          </div>

          {file && (
            <div className="glass-card p-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0071e3]/8 flex items-center justify-center">
                    <span className="text-lg">📄</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1d1d1f]">{file.name}</p>
                    <p className="text-sm text-[#86868b]">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setFile(null)} className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] px-4 py-2 rounded-full border border-gray-200">
                    Remove
                  </button>
                  <button onClick={handleUploadAnalyze} disabled={uploading} className="btn-primary disabled:opacity-50 flex items-center gap-2">
                    {uploading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                    ) : 'Upload & Analyze'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === 'mapping' && preview && (
        <div>
          <div className="glass-card p-7 mb-6">
            <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider mb-5">Column Mapping</h3>
            <p className="text-sm text-[#86868b] mb-6">Map your file columns to KOSIQ fields. Required fields are marked with *</p>
            <div className="grid md:grid-cols-2 gap-4">
              {REQUIRED_FIELDS.map(field => (
                <div key={field.key} className="flex items-center gap-3">
                  <label className={`text-sm w-40 flex-shrink-0 ${field.required ? 'font-medium text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>
                    {field.label}{field.required && <span className="text-[#ff3b30]"> *</span>}
                  </label>
                  <select
                    value={mapping[field.key] || ''}
                    onChange={e => setMapping({ ...mapping, [field.key]: e.target.value })}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0071e3] text-[#1d1d1f]"
                  >
                    <option value="">— Select column —</option>
                    {preview.columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Data Preview */}
          <div className="glass-card overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">Sample Data Preview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    {preview.columns.map(col => <th key={col}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.sampleRows.slice(0, 3).map((row, i) => (
                    <tr key={i}>
                      {preview.columns.map(col => (
                        <td key={col} className="text-xs text-[#424245]">{String(row[col] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button onClick={handleProcess} disabled={processing} className="btn-primary disabled:opacity-50 flex items-center gap-2">
            {processing ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
            ) : 'Process Data'}
          </button>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 'results' && result && (
        <div>
          <div className="glass-card p-7">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">✅</span>
              <h3 className="text-lg font-semibold text-[#34c759]">Processing Complete</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="kpi-card">
                <p className="text-xs text-[#86868b] uppercase tracking-wider mb-1 font-medium">Records Parsed</p>
                <p className="text-2xl font-mono font-semibold text-[#0071e3]">{result.recordsParsed}</p>
              </div>
              <div className="kpi-card">
                <p className="text-xs text-[#86868b] uppercase tracking-wider mb-1 font-medium">Records Failed</p>
                <p className="text-2xl font-mono font-semibold text-[#ff3b30]">{result.recordsFailed}</p>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider mb-3">Errors</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <div key={i} className="text-sm text-[#ff3b30] bg-[#ff3b30]/5 rounded-lg px-4 py-2">{err}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <a href="/patients" className="btn-primary">View Patients</a>
              <button onClick={resetUpload} className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-[#6e6e73] hover:bg-gray-50">
                Upload Another File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Upload History */}
      {step === 'history' && (
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">Upload History</h3>
          </div>
          {historyLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Filename</th><th>Status</th><th>Parsed</th><th>Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-[#86868b] py-8">No uploads yet</td></tr>
                  ) : history.map(h => (
                    <tr key={h.id}>
                      <td className="text-xs text-[#424245]">{new Date(h.createdAt).toLocaleString()}</td>
                      <td className="font-medium text-[#1d1d1f]">{h.fileName}</td>
                      <td>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          h.status === 'completed' ? 'bg-[#34c759]/10 text-[#34c759]' :
                          h.status === 'failed' ? 'bg-[#ff3b30]/10 text-[#ff3b30]' :
                          'bg-[#ff9f0a]/10 text-[#ff9f0a]'
                        }`}>{h.status}</span>
                      </td>
                      <td className="font-mono text-[#1d1d1f]">{h.recordsParsed}</td>
                      <td className="font-mono text-[#ff3b30]">{h.recordsFailed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
