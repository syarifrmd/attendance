import { Head, Link, router } from '@inertiajs/react';
import ManagerLayout from '@/layouts/ManagerLayout';
import { useState } from 'react';
import {
    ArrowLeft, AlertTriangle, CheckCircle2, Clock, LogOut, XCircle,
    Image, X, GraduationCap, Calendar, UserCog, Trash2,
} from 'lucide-react';

interface Division { id: string; name: string; start_time: string; end_time: string; }

interface AttendanceRecord {
    id: string; status: string;
    check_in_at: string | null; check_out_at: string | null;
    reason: string | null; proof_image_url: string | null;
    is_late: boolean; late_minutes: number; late_level: 'green' | 'yellow' | 'red';
    no_checkout: boolean; created_at: string;
}

interface PaginatedAttendances {
    data: AttendanceRecord[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number; last_page: number; total: number;
}

interface Intern {
    id: string; name: string; email: string;
    profile: { nama_lengkap: string; asal_kampus: string | null; foto: string | null; division: Division | null; divisi: string | null; periode_magang: string | null; internship_duration_days: number | null; division_id: string | null; } | null;
}

interface Props {
    intern: Intern; attendances: PaginatedAttendances;
    division: Division | null;
    filters: { from?: string; to?: string; status?: string };
    stats: { total_checkin: number; total_absent: number; total_late: number };
    divisions?: { id: string; name: string }[];
}

const statusBadge = (s: string) => ({
    wfo: 'bg-emerald-100 text-emerald-800', wfh: 'bg-sky-100 text-sky-800',
    wfa: 'bg-violet-100 text-violet-800', izin: 'bg-amber-100 text-amber-800', sakit: 'bg-rose-100 text-rose-800',
}[s] ?? 'bg-gray-100 text-gray-700');

const fmtTime = (s: string | null) => s ? new Date(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';

const formatDateID = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const LateBadge = ({ level, minutes }: { level: string; minutes: number }) => {
    if (level === 'yellow') return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200"><AlertTriangle size={10} /> {minutes} mnt</span>;
    if (level === 'red') return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200"><AlertTriangle size={10} /> {minutes} mnt</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle2 size={10} /> Tepat Waktu</span>;
};

export default function MentorInternShow({ intern, attendances, division, filters, stats, divisions = [] }: Props) {
    const [fromDate, setFromDate] = useState(filters.from ?? '');
    const [toDate, setToDate] = useState(filters.to ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    // Edit user modal
    const [editModal, setEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        nama_lengkap: intern.profile?.nama_lengkap ?? '',
        asal_kampus: intern.profile?.asal_kampus ?? '',
        division_id: intern.profile?.division?.id ?? intern.profile?.division_id ?? '',
        periode_magang: intern.profile?.periode_magang ?? '',
        internship_duration_days: String(intern.profile?.internship_duration_days ?? 90),
        email: intern.email,
    });
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
    const [editLoading, setEditLoading] = useState(false);

    // Confirm delete user
    const [confirmDelete, setConfirmDelete] = useState(false);

    const internName = intern.profile?.nama_lengkap || intern.name;
    const displayName = internName;
    const avatarSrc = intern.profile?.foto ? `/storage/${intern.profile.foto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;
    const targetDays = intern.profile?.internship_duration_days ?? 90;
    const progressPercent = Math.min(100, Math.round((stats.total_checkin / targetDays) * 100));

    const applyFilters = () => router.get(`/mentor/interns/${intern.id}`, { from: fromDate || undefined, to: toDate || undefined, status: status || undefined }, { preserveState: true, replace: true });
    const resetFilters = () => { setFromDate(''); setToDate(''); setStatus(''); router.get(`/mentor/interns/${intern.id}`, {}, { preserveState: false, replace: true }); };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setEditLoading(true);
        setEditErrors({});
        router.patch(`/mentor/interns/${intern.id}`, {
            nama_lengkap: editForm.nama_lengkap,
            asal_kampus: editForm.asal_kampus || undefined,
            division_id: editForm.division_id || undefined,
            periode_magang: editForm.periode_magang || undefined,
            internship_duration_days: parseInt(editForm.internship_duration_days) || undefined,
            email: editForm.email,
        }, {
            onSuccess: () => { setEditModal(false); setEditLoading(false); },
            onError: (errs) => { setEditErrors(errs); setEditLoading(false); },
        });
    };

    const handleDeleteUser = () => {
        router.delete(`/mentor/interns/${intern.id}`, {
            onSuccess: () => setConfirmDelete(false),
        });
    };

    const handleDeleteIntern = () => {
        setConfirmDelete(true);
        setEditModal(false);
    };

    return (
        <ManagerLayout title={`Detail: ${internName}`}>
            <Head title={`Detail Intern: ${internName}`} />

            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link href="/mentor/interns" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:text-slate-200">
                        <ArrowLeft size={16} /> Kembali
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Detail Intern</h2>
                </div>
                <button
                    onClick={() => setEditModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                >
                    <UserCog size={16} /> Edit Data Intern
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
                        <div className="flex flex-col items-center text-center">
                            <img src={avatarSrc} alt={internName} className="mb-4 h-24 w-24 rounded-full object-cover ring-4 ring-slate-50 dark:ring-slate-700" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{internName}</h3>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{intern.profile?.division?.name || intern.profile?.divisi || 'Belum ada divisi'}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{intern.email}</p>
                        </div>
                        <div className="mt-6 space-y-4 border-t border-slate-100 pt-6 dark:border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"><GraduationCap size={20} /></div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-slate-400">Asal Kampus / Sekolah</p>
                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{intern.profile?.asal_kampus || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"><Calendar size={20} /></div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-slate-400">Periode Magang</p>
                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{intern.profile?.periode_magang || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"><Clock size={20} /></div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-slate-400">Target Durasi</p>
                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{targetDays} hari kerja</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
                        <h4 className="mb-4 font-bold text-slate-900 dark:text-slate-100">Statistik Absensi</h4>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-700/30">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hadir</p>
                                <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.total_checkin}x</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-700/30">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Izin / Sakit</p>
                                <p className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">{stats.total_absent}x</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-700/30">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Terlambat</p>
                                <p className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">{stats.total_late}x</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-700/30">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sisa Target</p>
                                <p className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">{Math.max(0, targetDays - stats.total_checkin)}x</p>
                            </div>
                        </div>
                        <div className="mt-5">
                            <div className="mb-2 flex justify-between text-xs font-medium">
                                <span className="text-slate-500 dark:text-slate-400">Progres Magang</span>
                                <span className="text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                <div className="h-full rounded-full bg-indigo-500 transition-all duration-500 dark:bg-indigo-400" style={{ width: `${progressPercent}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60 dark:bg-slate-800">
                        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200" />
                            <span className="text-center text-xs text-slate-400 sm:text-left">sampai</span>
                            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200" />
                            <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200">
                                <option value="">Semua Status</option>
                                <option value="wfo">WFO</option>
                                <option value="wfh">WFH</option>
                                <option value="wfa">WFA</option>
                                <option value="izin">Izin</option>
                                <option value="sakit">Sakit</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={applyFilters} className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors sm:flex-none dark:bg-indigo-500 dark:hover:bg-indigo-600">Filter</button>
                            {(fromDate || toDate || status) && (
                                <button onClick={resetFilters} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 sm:flex-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"><X size={20} /></button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {attendances.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <div className="mb-3 rounded-full bg-slate-50 p-3 text-slate-400 dark:bg-slate-700/50 dark:text-slate-500"><Calendar size={24} /></div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Belum ada riwayat</h3>
                            </div>
                        ) : (
                            attendances.data.map(att => (
                                <div key={att.id} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${statusBadge(att.status)}`}>{att.status}</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatDateID(att.created_at)}</span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                                                {['wfo','wfh','wfa'].includes(att.status) ? (
                                                    <>
                                                        {att.check_in_at && <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> Masuk: <span className="font-medium text-slate-800 dark:text-slate-200">{fmtTime(att.check_in_at)}</span></div>}
                                                        {att.check_out_at && <div className="flex items-center gap-1.5"><LogOut size={14} className="text-slate-400" /> Pulang: <span className="font-medium text-slate-800 dark:text-slate-200">{fmtTime(att.check_out_at)}</span></div>}
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-1.5"><XCircle size={14} className="text-slate-400" /> Tidak ada jam masuk/pulang</div>
                                                )}
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                {att.is_late && <LateBadge level={att.late_level} minutes={att.late_minutes} />}
                                                {att.no_checkout && <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"><XCircle size={12} /> Belum Pulang</span>}
                                            </div>
                                        </div>
                                        {att.proof_image_url && (
                                            <a href={att.proof_image_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20">
                                                <Image size={14} /> Lihat Bukti
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {attendances.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
                            <p className="text-sm text-slate-400">Hal {attendances.current_page} dari {attendances.last_page}</p>
                            <div className="flex gap-1">
                                {attendances.links.map((link, i) => link.url
                                    ? <Link key={i} href={link.url} className={`rounded-lg px-3 py-1.5 text-sm transition ${link.active ? 'bg-indigo-600 font-semibold text-white dark:bg-indigo-500' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    : <span key={i} className="rounded-lg px-3 py-1.5 text-sm text-slate-300 dark:text-slate-600" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {lightboxUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setLightboxUrl(null)}>
                    <div className="relative max-h-[90vh] max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setLightboxUrl(null)} className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg text-slate-700 hover:bg-slate-100"><X size={16} /></button>
                        <img src={lightboxUrl} alt="Bukti" className="w-full rounded-2xl object-contain shadow-xl max-h-[90vh]" />
                    </div>
                </div>
            )}

            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setEditModal(false)}>
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit Data Intern</h3>
                            <button onClick={() => setEditModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Nama Lengkap *</label>
                                    <input type="text" value={editForm.nama_lengkap} onChange={e => setEditForm({...editForm, nama_lengkap: e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" required />
                                    {editErrors.nama_lengkap && <p className="mt-1 text-xs text-rose-500">{editErrors.nama_lengkap}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Email Utama *</label>
                                    <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" required />
                                    {editErrors.email && <p className="mt-1 text-xs text-rose-500">{editErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Asal Kampus</label>
                                    <input type="text" value={editForm.asal_kampus} onChange={e => setEditForm({...editForm, asal_kampus: e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Divisi</label>
                                    <select value={editForm.division_id} onChange={e => setEditForm({...editForm, division_id: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                        <option value="">Pilih Divisi</option>
                                        {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    {editErrors.division_id && <p className="mt-1 text-xs text-rose-500">{editErrors.division_id}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Periode Magang</label>
                                        <input type="text" value={editForm.periode_magang} onChange={e => setEditForm({...editForm, periode_magang: e.target.value})} placeholder="Jan - Mar 2024" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Durasi (Hari) *</label>
                                        <input type="number" min="1" max="730" value={editForm.internship_duration_days} onChange={e => setEditForm({...editForm, internship_duration_days: e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" required />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
                                <button type="button" onClick={handleDeleteIntern} className="rounded-xl px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">Hapus Intern</button>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setEditModal(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">Batal</button>
                                    <button type="submit" disabled={editLoading} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70 dark:bg-indigo-500 dark:hover:bg-indigo-600">{editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete User Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(false)}>
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={e => e.stopPropagation()}>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-500/20">
                            <Trash2 size={22} className="text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-slate-100">Hapus Intern</h3>
                        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                            Apakah kamu yakin ingin menghapus <strong>{displayName}</strong>? Seluruh data absensi dan profil akan ikut terhapus secara permanen.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                                Batal
                            </button>
                            <button onClick={handleDeleteUser} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ManagerLayout>
    );
}
