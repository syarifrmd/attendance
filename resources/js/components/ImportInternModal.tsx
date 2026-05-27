import { useState, useRef } from 'react';
import { X, UploadCloud, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { router } from '@inertiajs/react';

interface Division {
    id: string;
    name: string;
}

interface ImportInternModalProps {
    divisions: Division[];
    onClose: () => void;
}

export default function ImportInternModal({ divisions, onClose }: ImportInternModalProps) {
    const [step, setStep] = useState(1);
    
    // File upload state
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rawData, setRawData] = useState<any[][]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mapping state
    const [mapping, setMapping] = useState({
        nim: '',
        name: '',
        division: '',
        duration: '',
        is_active: ''
    });

    // Preview state
    const [previewData, setPreviewData] = useState<any[]>([]);

    // Import state
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                
                const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
                if (data.length > 0) {
                    // Extract headers (first row) and ensure they are strings
                    const parsedHeaders = (data[0] as any[]).map(String);
                    setHeaders(parsedHeaders);
                    
                    // Extract data rows
                    const dataRows = data.slice(1).filter(row => row.length > 0);
                    setRawData(dataRows);

                    // Auto-detect columns based on common names
                    const newMapping = { nim: '', name: '', division: '', duration: '', is_active: '' };
                    parsedHeaders.forEach(h => {
                        const hLower = h.toLowerCase();
                        if (hLower.includes('nim') || hLower.includes('induk')) newMapping.nim = h;
                        if (hLower.includes('nama')) newMapping.name = h;
                        if (hLower.includes('divisi')) newMapping.division = h;
                        if (hLower.includes('durasi') || hLower.includes('waktu')) newMapping.duration = h;
                        if (hLower.includes('aktif') || hLower.includes('status')) newMapping.is_active = h;
                    });
                    setMapping(newMapping);
                    setStep(2);
                }
            } catch (err) {
                console.error("Error parsing file", err);
                alert("Gagal membaca file. Pastikan formatnya .xlsx atau .csv");
            }
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleMappingSubmit = () => {
        if (!mapping.nim || !mapping.name) {
            alert("Kolom NIM dan Nama Lengkap wajib dipetakan!");
            return;
        }

        // Generate preview data
        const mapped = rawData.map(row => {
            const getColValue = (colName: string) => {
                const idx = headers.indexOf(colName);
                return idx >= 0 ? row[idx] : null;
            };

            const divName = getColValue(mapping.division);
            // Try to find division ID by name
            const divObj = divName ? divisions.find(d => d.name.toLowerCase() === String(divName).toLowerCase()) : null;

            // Resolve active status
            const statusVal = String(getColValue(mapping.is_active) || '').toLowerCase().trim();
            const isActive = statusVal === '' || statusVal === 'ya' || statusVal === 'aktif' || statusVal === 'active' || statusVal === '1' || statusVal === 'true';

            return {
                nim: String(getColValue(mapping.nim) || ''),
                name: String(getColValue(mapping.name) || ''),
                division_id: divObj?.id || null,
                division_name: divName || '-',
                internship_duration_days: parseInt(getColValue(mapping.duration) || '90') || 90,
                is_active: isActive
            };
        }).filter(item => item.nim && item.name);

        setPreviewData(mapped);
        setStep(3);
    };

    const handleImport = () => {
        setIsImporting(true);
        router.post('/mentor/intern-drafts/import', {
            drafts: previewData.map(p => ({
                nim: p.nim,
                name: p.name,
                division_id: p.division_id,
                internship_duration_days: p.internship_duration_days,
                is_active: p.is_active
            }))
        }, {
            onSuccess: () => {
                setImportResult({ success: previewData.length, errors: 0 });
                setStep(4);
                setIsImporting(false);
            },
            onError: (err) => {
                console.error(err);
                alert("Terjadi kesalahan saat menyimpan data.");
                setIsImporting(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] dark:bg-slate-900" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Import Data User</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Upload file Excel atau CSV, cocokkan kolom, lalu import data.</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between px-10 py-6 border-b border-slate-50 dark:border-slate-800">
                    {[1, 2, 3, 4].map(num => (
                        <div key={num} className="flex items-center">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= num ? 'bg-indigo-600 text-white dark:bg-indigo-500' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                                {num}
                            </div>
                            <span className={`ml-2 hidden sm:block text-sm font-medium ${step >= num ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                                {num === 1 ? 'Upload File' : num === 2 ? 'Mapping Kolom' : num === 3 ? 'Preview Data' : 'Hasil Import'}
                            </span>
                            {num < 4 && <div className={`mx-4 h-0.5 w-12 sm:w-24 ${step > num ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800'}`} />}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 dark:border-slate-700 dark:bg-slate-800/50">
                            <UploadCloud size={48} className="mb-4 text-slate-400 dark:text-slate-500" />
                            <h4 className="mb-1 text-lg font-bold text-slate-700 dark:text-slate-200">Klik atau drag & drop file di sini</h4>
                            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Format yang didukung: .xlsx, .xls, .csv</p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                accept=".xlsx, .xls, .csv" 
                                className="hidden" 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()} 
                                className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
                            >
                                Pilih File
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="mx-auto max-w-2xl space-y-5">
                            <div className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300">
                                Cocokkan kolom dari file Excel Anda dengan format database kami.
                            </div>
                            
                            <div className="grid gap-4">
                                {[
                                    { id: 'nim', label: 'NIM (Nomor Induk) *', req: true },
                                    { id: 'name', label: 'Nama Lengkap *', req: true },
                                    { id: 'division', label: 'Divisi (Opsional)', req: false },
                                    { id: 'duration', label: 'Durasi Magang (Hari) (Opsional)', req: false },
                                    { id: 'is_active', label: 'Status Aktif (Opsional)', req: false },
                                ].map(field => (
                                    <div key={field.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
                                        <div className="sm:w-1/3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {field.label}
                                        </div>
                                        <div className="sm:w-2/3">
                                            <select 
                                                value={mapping[field.id as keyof typeof mapping]} 
                                                onChange={e => setMapping({ ...mapping, [field.id]: e.target.value })}
                                                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200"
                                            >
                                                <option value="">-- Abaikan (Tidak dipetakan) --</option>
                                                {headers.map((h, i) => <option key={i} value={h}>{h}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button onClick={() => setStep(1)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">Kembali</button>
                                <button onClick={handleMappingSubmit} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                                    Lanjut Preview <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Menampilkan {Math.min(previewData.length, 5)} baris pertama dari total {previewData.length} baris yang akan diimpor.</p>
                            </div>
                            
                            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/60">
                                <table className="w-full text-sm text-slate-600 dark:text-slate-300">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left">NIM</th>
                                            <th className="px-4 py-3 text-left">Nama Lengkap</th>
                                            <th className="px-4 py-3 text-left">Divisi (Di Excel)</th>
                                            <th className="px-4 py-3 text-left">Status Divisi</th>
                                            <th className="px-4 py-3 text-left">Durasi</th>
                                            <th className="px-4 py-3 text-left">Status Akun</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {previewData.slice(0, 5).map((row, i) => (
                                            <tr key={i} className="bg-white dark:bg-slate-800">
                                                <td className="px-4 py-3 font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400">{row.nim}</td>
                                                <td className="px-4 py-3">{row.name}</td>
                                                <td className="px-4 py-3">{row.division_name}</td>
                                                <td className="px-4 py-3">
                                                    {row.division_id ? (
                                                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Cocok</span>
                                                    ) : row.division_name !== '-' ? (
                                                        <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">Tidak Ditemukan</span>
                                                    ) : (
                                                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">Kosong</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">{row.internship_duration_days} hari</td>
                                                <td className="px-4 py-3">
                                                    {row.is_active ? (
                                                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Aktif (Tambah)</span>
                                                    ) : (
                                                        <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">Tidak Aktif (Hapus)</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button onClick={() => setStep(2)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">Kembali</button>
                                <button onClick={handleImport} disabled={isImporting} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                                    {isImporting ? <><Loader2 size={16} className="animate-spin" /> Mengimpor...</> : <><CheckCircle2 size={16} /> Import {previewData.length} Data</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && importResult && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Import Selesai!</h3>
                            <p className="mb-8 text-slate-500 dark:text-slate-400">Proses import data selesai. Cek tabel untuk memastikan data sudah benar.</p>
                            <button onClick={onClose} className="rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white hover:bg-slate-800 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600">
                                Selesai
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
