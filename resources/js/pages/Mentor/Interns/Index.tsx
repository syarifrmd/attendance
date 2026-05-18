import { Head, Link, router } from '@inertiajs/react';
import ManagerLayout from '@/layouts/ManagerLayout';
import { useState } from 'react';
import {
    Search, ChevronRight, CheckCircle2, XCircle, Clock,
    AlertTriangle, LogOut, SlidersHorizontal, CalendarDays, ChevronLeft, Pencil, Trash2,
} from 'lucide-react';

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
    profile: { nama_lengkap: string; asal_kampus: string; foto: string | null; division: Division | null; divisi: string | null; } | null;
    today_attendance: TodayAttendance | null;
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

export default function MentorInternsIndex({ interns, divisions, filters, selected_date }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [divisionId, setDivisionId] = useState(filters.division_id ?? '');
    const [todayStatus, setTodayStatus] = useState(filters.today_status ?? '');
    const [date, setDate] = useState(selected_date);
    const [editModal, setEditModal] = useState<TodayAttendance | null>(null);
    const [editForm, setEditForm] = useState({ status: '', check_in_at: '', check_out_at: '', reason: '' });

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

    const todayPresent = interns.data.filter(i => i.today_attendance && ['wfo','wfh','wfa'].includes(i.today_attendance.status)).length;
    const todayAbsent  = interns.data.filter(i => i.today_attendance && ['izin','sakit'].includes(i.today_attendance.status)).length;
    const notYet       = interns.data.filter(i => !i.today_attendance).length;

    return (
        <ManagerLayout title="Daftar Intern">
            <Head title="Daftar Intern" />

            <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">Daftar Intern</h2>
                <p className="mt-0.5 text-sm text-slate-500">Pantau kehadiran seluruh intern.</p>
            </div>

            {/* Date Navigator */}
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <button onClick={() => { const d = shiftDate(date, -1); setDate(d); navigate(d); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <ChevronLeft size={16} />
                </button>
                <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-indigo-500" />
                        <p className="text-sm font-semibold text-slate-800">{formatDateID(date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isToday(date) && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Hari Ini</span>}
                        <input type="date" value={date} onChange={e => { setDate(e.target.value); navigate(e.target.value); }} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs focus:outline-none focus:border-indigo-300" />
                    </div>
                </div>
                <button onClick={() => { const d = shiftDate(date, 1); setDate(d); navigate(d); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Stats */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Total Intern', value: interns.total, color: 'text-slate-800', bg: 'bg-white', ring: 'ring-slate-100' },
                    { label: 'Hadir', value: todayPresent, color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
                    { label: 'Izin/Sakit', value: todayAbsent, color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-100' },
                    { label: 'Belum Absen', value: notYet, color: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-100' },
                ].map(s => (
                    <div key={s.label} className={`rounded-2xl ${s.bg} px-4 py-3.5 ring-1 ${s.ring} shadow-sm`}>
                        <p className="text-xs font-medium text-slate-500">{s.label}</p>
                        <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm focus:border-indigo-300 focus:outline-none" />
                </div>
                <div className="flex gap-2">
                    <select value={divisionId} onChange={e => setDivisionId(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none sm:flex-none">
                        <option value="">Semua Divisi</option>
                        {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <select value={todayStatus} onChange={e => setTodayStatus(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none sm:flex-none">
                        {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <button onClick={applyFilters} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
                        <SlidersHorizontal size={14} />
                    </button>
                    {(search || divisionId || todayStatus) && <button onClick={resetFilters} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50">Reset</button>}
                </div>
            </div>

            {/* Cards (mobile) / Table (desktop) */}
            <div className="space-y-2 md:hidden">
                {interns.data.length === 0
                    ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-slate-400 text-sm">Tidak ada intern ditemukan.</div>
                    : interns.data.map(intern => {
                        const att = intern.today_attendance;
                        const displayName = intern.profile?.nama_lengkap || intern.name;
                        const avatarSrc = intern.profile?.foto ? `/storage/${intern.profile.foto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;
                        return (
                            <div key={intern.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <img src={avatarSrc} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 truncate">{displayName}</p>
                                        <p className="text-xs text-slate-400 truncate">{intern.profile?.division?.name || intern.profile?.divisi || '-'}</p>
                                    </div>
                                    {att
                                        ? <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${statusBadge(att.status)}`}>{att.status}</span>
                                        : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Belum</span>
                                    }
                                </div>
                                {att && (
                                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-50 pt-3">
                                        {att.check_in_at && <span className="flex items-center gap-1 text-xs text-slate-500"><Clock size={11} /> {fmtTime(att.check_in_at)}</span>}
                                        {att.check_out_at && <span className="flex items-center gap-1 text-xs text-slate-500"><LogOut size={11} /> {fmtTime(att.check_out_at)}</span>}
                                        {att.is_late && lateBadge(att.late_level, att.late_minutes)}
                                        {att.no_checkout && <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700"><XCircle size={10} /> Belum Pulang</span>}
                                        {!att.is_late && !att.no_checkout && ['wfo','wfh','wfa'].includes(att.status) && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle2 size={10} /> Tepat Waktu</span>}
                                    </div>
                                )}
                                <div className="mt-3 flex items-center justify-between">
                                    <p className="text-xs text-slate-400">Hadir: {intern.total_checkins}x · Izin: {intern.total_absent}x</p>
                                    <div className="flex items-center gap-2">
                                        {att && <>
                                            <button onClick={() => openEdit(att)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"><Pencil size={11} /></button>
                                            <button onClick={() => handleDelete(att.id)} className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"><Trash2 size={11} /></button>
                                        </>}
                                        <Link href={`/mentor/interns/${intern.id}`} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">Detail <ChevronRight size={11} /></Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>

            {/* Table (desktop) */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                <table className="w-full text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-400">
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
                                const displayName = intern.profile?.nama_lengkap || intern.name;
                                const avatarSrc = intern.profile?.foto ? `/storage/${intern.profile.foto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;
                                return (
                                    <tr key={intern.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={avatarSrc} alt={displayName} className="h-9 w-9 rounded-full object-cover" />
                                                <div>
                                                    <p className="font-semibold text-slate-900">{displayName}</p>
                                                    <p className="text-xs text-slate-400">{intern.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-700">{intern.profile?.division?.name || intern.profile?.divisi || '-'}</p>
                                            <p className="text-xs text-slate-400">{intern.profile?.asal_kampus || '-'}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            {att
                                                ? <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${statusBadge(att.status)}`}>{att.status}</span>
                                                : <span className="flex items-center gap-1 text-xs text-slate-400"><XCircle size={11} /> Belum Absen</span>
                                            }
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-600">
                                            {att?.check_in_at && <div className="flex items-center gap-1"><Clock size={11} className="text-slate-400" /> {fmtTime(att.check_in_at)}</div>}
                                            {att?.check_out_at && <div className="flex items-center gap-1 mt-0.5"><LogOut size={11} className="text-slate-400" /> {fmtTime(att.check_out_at)}</div>}
                                            {!att?.check_in_at && <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {att?.is_late && lateBadge(att.late_level, att.late_minutes)}
                                                {att?.no_checkout && <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700"><XCircle size={10} /> Belum Pulang</span>}
                                                {att && !att.is_late && !att.no_checkout && ['wfo','wfh','wfa'].includes(att.status) && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle2 size={10} /> Tepat Waktu</span>}
                                                {!att && <span className="text-xs text-slate-300">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {att && <>
                                                    <button onClick={() => openEdit(att)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"><Pencil size={13} /></button>
                                                    <button onClick={() => handleDelete(att.id)} className="rounded-lg border border-rose-200 p-1.5 text-rose-500 hover:bg-rose-50"><Trash2 size={13} /></button>
                                                </>}
                                                <Link href={`/mentor/interns/${intern.id}`} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">Detail <ChevronRight size={11} /></Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
                {interns.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                        <p className="text-sm text-slate-400">Halaman {interns.current_page} dari {interns.last_page} · {interns.total} intern</p>
                        <div className="flex gap-1">
                            {interns.links.map((link, i) => link.url
                                ? <Link key={i} href={link.url} className={`rounded-lg px-3 py-1.5 text-sm transition ${link.active ? 'bg-indigo-600 font-semibold text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                : <span key={i} className="rounded-lg px-3 py-1.5 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
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
        </ManagerLayout>
    );
}
