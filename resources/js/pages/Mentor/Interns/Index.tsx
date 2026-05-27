import { Head, Link, router, usePage } from '@inertiajs/react';
import ManagerLayout from '@/layouts/ManagerLayout';
import { useState } from 'react';
import {
    Search, ChevronRight, CheckCircle2, XCircle, Clock,
    AlertTriangle, LogOut, SlidersHorizontal, CalendarDays, ChevronLeft, Pencil, Trash2,
    UserPlus, X, Users, UploadCloud,
} from 'lucide-react';
import ImportInternModal from '@/components/ImportInternModal';

interface Division { id: string; name: string; }

interface TodayAttendance {
    id: string; status: string;
    check_in_at: string | null; check_out_at: string | null;
    is_late: boolean; late_minutes: number; late_level: 'green' | 'yellow' | 'red';
    no_checkout: boolean; reason: string | null;
}

interface Intern {
    id: string; name: string; email: string;
    total_checkins: number; total_absent: number; late_count: number;
    profile: { asal_kampus: string; foto: string | null; division: Division | null; divisi: string | null; } | null;
    today_attendance: TodayAttendance | null;
}

interface InternDraft {
    id: number; nim: string; name: string;
    division: Division | null; internship_duration_days: number;
    is_claimed: boolean; created_at: string;
}

interface PaginatedInterns {
    data: Intern[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number; last_page: number; total: number;
}

interface Props {
    interns: PaginatedInterns; divisions: Division[];
    filters: { search?: string; division_id?: string; today_status?: string; date?: string };
    selected_date: string;
    drafts?: InternDraft[];
}

const statusOptions = [
    { value: '', label: 'Semua Status' }, { value: 'wfo', label: 'WFO' },
    { value: 'wfh', label: 'WFH' }, { value: 'wfa', label: 'WFA' },
    { value: 'izin', label: 'Izin' }, { value: 'sakit', label: 'Sakit' },
    { value: 'not_yet', label: 'Belum Absen' },
];

const statusBadge = (status: string) => ({
    wfo: 'bg-emerald-100 text-emerald-800', wfh: 'bg-sky-100 text-sky-800',
    wfa: 'bg-violet-100 text-violet-800', izin: 'bg-amber-100 text-amber-800',
    sakit: 'bg-rose-100 text-rose-800',
}[status] ?? 'bg-gray-100 text-gray-700');

const lateBadge = (level: string, minutes: number) => {
    if (level === 'yellow') return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
            <AlertTriangle size={10} /> {minutes} mnt
        </span>
    );
    if (level === 'red') return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
            <AlertTriangle size={10} /> {minutes} mnt
        </span>
    );
    return null;
};

const shiftDate = (d: string, n: number) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split('T')[0]; };
const formatDateID = (d: string) => new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const isToday = (d: string) => d === new Date().toISOString().split('T')[0];
const fmtTime = (s: string | null) => s ? new Date(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';

export default function MentorInternsIndex({ interns, divisions, filters, selected_date, drafts = [] }: Props) {
    const { props } = usePage<{ auth: { user: { role: string } } }>();
    const isAdmin = props.auth?.user?.role === 'admin';

    const [search, setSearch] = useState(filters.search ?? '');
    const [divisionId, setDivisionId] = useState(filters.division_id ?? '');
    const [todayStatus, setTodayStatus] = useState(filters.today_status ?? '');
    const [date, setDate] = useState(selected_date);

    // Edit attendance modal
    const [editModal, setEditModal] = useState<TodayAttendance | null>(null);
    const [editForm, setEditForm] = useState({ status: '', check_in_at: '', check_out_at: '', reason: '' });

    // Add draft modal
    const [addModal, setAddModal] = useState(false);
    const [importModal, setImportModal] = useState(false);
    const [addForm, setAddForm] = useState({ nim: '', name: '', division_id: '', internship_duration_days: '90', is_active: true });
    const [addErrors, setAddErrors] = useState<Record<string, string>>({});
    const [addLoading, setAddLoading] = useState(false);

    // Draft list panel
    const [showDrafts, setShowDrafts] = useState(false);

    const navigate = (newDate: string, extras?: Record<string, string>) =>
        router.get('/mentor/interns', {
            date: newDate, search: search || undefined,
            division_id: divisionId || undefined, today_status: todayStatus || undefined, ...extras,
        }, { preserveState: true, replace: true });

    const applyFilters = () => navigate(date);
    const resetFilters = () => { const today = new Date().toISOString().split('T')[0]; setSearch(''); setDivisionId(''); setTodayStatus(''); setDate(today); router.get('/mentor/interns', {}, { replace: true }); };

    const openEdit = (att: TodayAttendance) => {
        setEditForm({ status: att.status, check_in_at: att.check_in_at ? new Date(att.check_in_at).toISOString().slice(0, 16) : '', check_out_at: att.check_out_at ? new Date(att.check_out_at).toISOString().slice(0, 16) : '', reason: att.reason ?? '' });
        setEditModal(att);
    };
    const submitEdit = () => { if (!editModal) return; router.patch(`/mentor/attendances/${editModal.id}`, editForm, { onSuccess: () => setEditModal(null) }); };
    const handleDelete = (id: string) => { if (!confirm('Hapus data absensi ini?')) return; router.delete(`/mentor/attendances/${id}`); };

    const submitAddDraft = () => {
        setAddLoading(true);
        setAddErrors({});
        router.post('/mentor/intern-drafts', {
            nim: addForm.nim,
            name: addForm.name,
            division_id: addForm.division_id || undefined,
            internship_duration_days: parseInt(addForm.internship_duration_days) || 90,
            is_active: addForm.is_active,
        }, {
            onSuccess: () => { setAddModal(false); setAddForm({ nim: '', name: '', division_id: '', internship_duration_days: '90', is_active: true }); setAddLoading(false); },
            onError: (errs) => { setAddErrors(errs); setAddLoading(false); },
        });
    };

    const handleDeleteDraft = (id: number) => {
        if (!confirm('Hapus data pre-registrasi ini?')) return;
        router.delete(`/mentor/intern-drafts/${id}`);
    };

    const todayPresent = interns.data.filter(i => i.today_attendance && ['wfo','wfh','wfa'].includes(i.today_attendance.status)).length;
    const todayAbsent  = interns.data.filter(i => i.today_attendance && ['izin','sakit'].includes(i.today_attendance.status)).length;
    const notYet       = interns.data.filter(i => !i.today_attendance).length;

    return (
        <ManagerLayout title="Daftar Intern">
            <Head title="Daftar Intern" />

            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Daftar Intern</h2>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Pantau kehadiran seluruh intern.</p>
                </div>
                <div className="flex items-center gap-2">
                    {drafts.length > 0 && (
                        <button
                            onClick={() => setShowDrafts(true)}
                            className="relative flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                        >
                            <Users size={14} />
                            <span className="hidden sm:inline">Pre-registrasi</span>
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">{drafts.length}</span>
                        </button>
                    )}
                    <button
                        onClick={() => setImportModal(true)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <UploadCloud size={14} /> <span className="hidden sm:inline">Import</span>
                    </button>
                    <button
                        onClick={() => setAddModal(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                        <UserPlus size={14} /> <span className="hidden sm:inline">Tambah Intern</span>
                    </button>
                </div>
            </div>

            {/* Date Navigator */}
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
                <button onClick={() => { const d = shiftDate(date, -1); setDate(d); navigate(d); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                    <ChevronLeft size={16} />
                </button>
                <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-indigo-500 dark:text-indigo-400" />
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatDateID(date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isToday(date) && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">Hari Ini</span>}
                        <input type="date" value={date} onChange={e => { setDate(e.target.value); navigate(e.target.value); }} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs focus:outline-none focus:border-indigo-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200" />
                    </div>
                </div>
                <button onClick={() => { const d = shiftDate(date, 1); setDate(d); navigate(d); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Stats */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Total Intern', value: interns.total, color: 'text-slate-800 dark:text-slate-100', bg: 'bg-white dark:bg-slate-800', ring: 'ring-slate-100 dark:ring-slate-700/60' },
                    { label: 'Hadir', value: todayPresent, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', ring: 'ring-emerald-100 dark:ring-emerald-900/50' },
                    { label: 'Izin/Sakit', value: todayAbsent, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', ring: 'ring-amber-100 dark:ring-amber-900/50' },
                    { label: 'Belum Absen', value: notYet, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', ring: 'ring-rose-100 dark:ring-rose-900/50' },
                ].map(s => (
                    <div key={s.label} className={`rounded-2xl ${s.bg} px-4 py-3.5 ring-1 ${s.ring} shadow-sm`}>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                        <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center dark:border-slate-700/60 dark:bg-slate-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm focus:border-indigo-300 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200" />
                </div>
                <div className="flex gap-2">
                    <select value={divisionId} onChange={e => setDivisionId(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none sm:flex-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200">
                        <option value="">Semua Divisi</option>
                        {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <select value={todayStatus} onChange={e => setTodayStatus(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none sm:flex-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200">
                        {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <button onClick={applyFilters} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600">
                        <SlidersHorizontal size={14} />
                    </button>
                    {(search || divisionId || todayStatus) && <button onClick={resetFilters} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700">Reset</button>}
                </div>
            </div>

            {/* Cards (mobile) / Table (desktop) */}
            <div className="space-y-2 md:hidden">
                {interns.data.length === 0
                    ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-slate-400 text-sm dark:border-slate-700 dark:bg-slate-800">Tidak ada intern ditemukan.</div>
                    : interns.data.map(intern => {
                        const att = intern.today_attendance;
                        const displayName = intern.name;
                        const avatarSrc = intern.profile?.foto ? `/storage/${intern.profile.foto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;
                        return (
                            <div key={intern.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
                                <div className="flex items-center gap-3">
                                    <img src={avatarSrc} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 truncate dark:text-slate-100">{displayName}</p>
                                        <p className="text-xs text-slate-400 truncate">{intern.profile?.division?.name || intern.profile?.divisi || '-'}</p>
                                    </div>
                                    {att
                                        ? <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${statusBadge(att.status)}`}>{att.status}</span>
                                        : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-300">Belum</span>
                                    }
                                </div>
                                {att && (
                                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-50 pt-3 dark:border-slate-700/50">
                                        {att.check_in_at && <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Clock size={11} /> {fmtTime(att.check_in_at)}</span>}
                                        {att.check_out_at && <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><LogOut size={11} /> {fmtTime(att.check_out_at)}</span>}
                                        {att.is_late && lateBadge(att.late_level, att.late_minutes)}
                                        {att.no_checkout && <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"><XCircle size={10} /> Belum Pulang</span>}
                                        {!att.is_late && !att.no_checkout && ['wfo','wfh','wfa'].includes(att.status) && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"><CheckCircle2 size={10} /> Tepat Waktu</span>}
                                    </div>
                                )}
                                <div className="mt-3 flex items-center justify-between">
                                    <p className="text-xs text-slate-400">Hadir: {intern.total_checkins}x · Izin: {intern.total_absent}x</p>
                                    <div className="flex items-center gap-2">
                                        {att && <>
                                            <button onClick={() => openEdit(att)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"><Pencil size={11} /></button>
                                            <button onClick={() => handleDelete(att.id)} className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-900/30"><Trash2 size={11} /></button>
                                        </>}
                                        <Link href={`/mentor/interns/${intern.id}`} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20">Detail <ChevronRight size={11} /></Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>

            {/* Table (desktop) */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block dark:border-slate-700/60 dark:bg-slate-800">
                <table className="w-full text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-400 dark:bg-slate-800/50 dark:text-slate-400">
                        <tr>
                            <th className="px-5 py-4 text-left">Intern</th>
                            <th className="px-5 py-4 text-left">Divisi</th>
                            <th className="px-5 py-4 text-left">Status</th>
                            <th className="px-5 py-4 text-left">Jam Masuk / Pulang</th>
                            <th className="px-5 py-4 text-left">Keterangan</th>
                            <th className="px-5 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {interns.data.length === 0
                            ? <tr><td colSpan={6} className="py-10 text-center text-slate-400">Tidak ada data intern ditemukan.</td></tr>
                            : interns.data.map(intern => {
                                const att = intern.today_attendance;
                                const displayName = intern.name;
                                const avatarSrc = intern.profile?.foto ? `/storage/${intern.profile.foto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;
                                return (
                                    <tr key={intern.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors dark:border-slate-700/50 dark:hover:bg-slate-700/50">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={avatarSrc} alt={displayName} className="h-9 w-9 rounded-full object-cover" />
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{displayName}</p>
                                                    <p className="text-xs text-slate-400">{intern.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-700 dark:text-slate-200">{intern.profile?.division?.name || intern.profile?.divisi || '-'}</p>
                                            <p className="text-xs text-slate-400">{intern.profile?.asal_kampus || '-'}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            {att
                                                ? <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${statusBadge(att.status)}`}>{att.status}</span>
                                                : <span className="flex items-center gap-1 text-xs text-slate-400"><XCircle size={11} /> Belum Absen</span>
                                            }
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
                                            {att?.check_in_at && <div className="flex items-center gap-1"><Clock size={11} className="text-slate-400" /> {fmtTime(att.check_in_at)}</div>}
                                            {att?.check_out_at && <div className="flex items-center gap-1 mt-0.5"><LogOut size={11} className="text-slate-400" /> {fmtTime(att.check_out_at)}</div>}
                                            {!att?.check_in_at && <span className="text-slate-300 dark:text-slate-600">-</span>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {att?.is_late && lateBadge(att.late_level, att.late_minutes)}
                                                {att?.no_checkout && <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"><XCircle size={10} /> Belum Pulang</span>}
                                                {att && !att.is_late && !att.no_checkout && ['wfo','wfh','wfa'].includes(att.status) && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"><CheckCircle2 size={10} /> Tepat Waktu</span>}
                                                {!att && <span className="text-xs text-slate-300 dark:text-slate-600">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {att && <>
                                                    <button onClick={() => openEdit(att)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"><Pencil size={13} /></button>
                                                    <button onClick={() => handleDelete(att.id)} className="rounded-lg border border-rose-200 p-1.5 text-rose-500 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/30"><Trash2 size={13} /></button>
                                                </>}
                                                <Link href={`/mentor/interns/${intern.id}`} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/10">Detail <ChevronRight size={11} /></Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
                {interns.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 dark:border-slate-700/50">
                        <p className="text-sm text-slate-400">Halaman {interns.current_page} dari {interns.last_page} · {interns.total} intern</p>
                        <div className="flex gap-1">
                            {interns.links.map((link, i) => link.url
                                ? <Link key={i} href={link.url} className={`rounded-lg px-3 py-1.5 text-sm transition ${link.active ? 'bg-indigo-600 font-semibold text-white dark:bg-indigo-500' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                : <span key={i} className="rounded-lg px-3 py-1.5 text-sm text-slate-300 dark:text-slate-600" dangerouslySetInnerHTML={{ __html: link.label }} />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Attendance Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onClick={() => setEditModal(null)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="mb-4 text-base font-bold text-slate-900">Edit Data Absensi</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-300">
                                    {['wfo','wfh','wfa','izin','sakit'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-600">Jam Masuk</label>
                                    <input type="datetime-local" value={editForm.check_in_at} onChange={e => setEditForm({ ...editForm, check_in_at: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-600">Jam Pulang</label>
                                    <input type="datetime-local" value={editForm.check_out_at} onChange={e => setEditForm({ ...editForm, check_out_at: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Alasan</label>
                                <textarea value={editForm.reason} onChange={e => setEditForm({ ...editForm, reason: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none" rows={2} placeholder="Opsional" />
                            </div>
                        </div>
                        <div className="mt-5 flex gap-2">
                            <button onClick={() => setEditModal(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                            <button onClick={submitEdit} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {importModal && (
                <ImportInternModal
                    divisions={divisions}
                    onClose={() => {
                        setImportModal(false);
                        router.reload({ only: ['drafts'] });
                    }}
                />
            )}

            {/* Add Intern Draft Modal */}
            {addModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onClick={() => setAddModal(false)}>
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
                                    <UserPlus size={18} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Tambah Intern Baru</h3>
                                    <p className="text-xs text-slate-400">Pre-registrasi sebelum intern mendaftar</p>
                                </div>
                            </div>
                            <button onClick={() => setAddModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="rounded-xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
                                <strong>Cara kerja:</strong> Admin mendaftarkan NIM terlebih dahulu. Intern kemudian mendaftar via Google dan memasukkan NIM mereka untuk verifikasi akun.
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        NIM <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addForm.nim}
                                        onChange={e => setAddForm({ ...addForm, nim: e.target.value })}
                                        placeholder="Nomor Induk Mahasiswa"
                                        className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 ${addErrors.nim ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
                                    />
                                    {addErrors.nim && <p className="mt-1 text-xs text-rose-500">{addErrors.nim}</p>}
                                    <p className="mt-1 text-xs text-slate-400">Harus unik, digunakan saat verifikasi</p>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Divisi
                                    </label>
                                    <select
                                        value={addForm.division_id}
                                        onChange={e => setAddForm({ ...addForm, division_id: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                                    >
                                        <option value="">Pilih Divisi (Opsional)</option>
                                        {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Nama Lengkap <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addForm.name}
                                        onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                                        placeholder="Cth: Budi Santoso"
                                        className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 ${addErrors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
                                    />
                                    {addErrors.name && <p className="mt-1 text-xs text-rose-500">{addErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Durasi Magang (Hari)
                                    </label>
                                    <input
                                        type="number"
                                        value={addForm.internship_duration_days}
                                        onChange={e => setAddForm({ ...addForm, internship_duration_days: e.target.value })}
                                        min="1"
                                        max="730"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Status Akun
                                </label>
                                <select
                                    value={addForm.is_active ? '1' : '0'}
                                    onChange={e => setAddForm({ ...addForm, is_active: e.target.value === '1' })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                                >
                                    <option value="1">Aktif (Tambahkan)</option>
                                    <option value="0">Tidak Aktif (Hapus Intern)</option>
                                </select>
                                <p className="mt-1 text-xs text-slate-400">Jika "Tidak Aktif" dipilih, intern dengan NIM ini akan dihapus permanen.</p>
                            </div>
                        </div>

                        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                            <button onClick={() => setAddModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                Batal
                            </button>
                            <button
                                onClick={submitAddDraft}
                                disabled={addLoading || !addForm.nim || !addForm.name}
                                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addLoading ? 'Menyimpan...' : 'Simpan Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Draft List Panel */}
            {showDrafts && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onClick={() => setShowDrafts(false)}>
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Pre-registrasi Intern</h3>
                                <p className="text-xs text-slate-400">{drafts.length} intern belum mendaftar</p>
                            </div>
                            <button onClick={() => setShowDrafts(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {drafts.length === 0 ? (
                                <div className="py-10 text-center text-slate-400 text-sm">Tidak ada data pre-registrasi.</div>
                            ) : (
                                <table className="w-full text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-400 sticky top-0">
                                        <tr>
                                            <th className="px-5 py-3 text-left">NIM</th>
                                            <th className="px-5 py-3 text-left">Nama</th>
                                            <th className="px-5 py-3 text-left">Divisi</th>
                                            <th className="px-5 py-3 text-left">Durasi</th>
                                            <th className="px-5 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drafts.map(d => (
                                            <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                                                <td className="px-5 py-3 font-mono text-xs font-medium text-indigo-700">{d.nim}</td>
                                                <td className="px-5 py-3 font-medium text-slate-800">{d.name}</td>
                                                <td className="px-5 py-3 text-slate-500">{d.division?.name || '-'}</td>
                                                <td className="px-5 py-3 text-slate-500">{d.internship_duration_days} hari</td>
                                                <td className="px-5 py-3 text-center">
                                                    <button onClick={() => handleDeleteDraft(d.id)} className="rounded-lg border border-rose-200 p-1.5 text-rose-500 hover:bg-rose-50 transition-colors">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ManagerLayout>
    );
}
