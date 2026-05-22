import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { useState } from 'react';
import {
    Search,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    LogOut,
    SlidersHorizontal,
    CalendarDays,
    ChevronLeft,
    UserPlus,
    X,
    Users,
    Trash2,
} from 'lucide-react';

interface Division {
    id: string;
    name: string;
}

interface TodayAttendance {
    id: string;
    status: string;
    check_in_at: string | null;
    check_out_at: string | null;
    is_late: boolean;
    no_checkout: boolean;
    reason: string | null;
}

interface Intern {
    id: string;
    name: string;
    email: string;
    total_checkins: number;
    total_absent: number;
    late_count: number;
    profile: {
        nama_lengkap: string;
        asal_kampus: string;
        foto: string | null;
        division: Division | null;
        divisi: string | null;
    } | null;
    today_attendance: TodayAttendance | null;
}

interface InternDraft {
    id: number; nim: string; nama_lengkap: string;
    division: Division | null; internship_duration_days: number;
    is_claimed: boolean; created_at: string;
}

interface PaginatedInterns {
    data: Intern[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    interns: PaginatedInterns;
    divisions: Division[];
    filters: { search?: string; division_id?: string; today_status?: string; date?: string };
    selected_date: string;
    drafts?: InternDraft[];
}

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'wfo', label: 'WFO' },
    { value: 'wfh', label: 'WFH' },
    { value: 'wfa', label: 'WFA' },
    { value: 'izin', label: 'Izin' },
    { value: 'sakit', label: 'Sakit' },
    { value: 'not_yet', label: 'Belum Absen' },
];

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        wfo: 'bg-emerald-100 text-emerald-800',
        wfh: 'bg-sky-100 text-sky-800',
        wfa: 'bg-violet-100 text-violet-800',
        izin: 'bg-amber-100 text-amber-800',
        sakit: 'bg-rose-100 text-rose-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
};

const statusLabels: Record<string, string> = {
    wfo: 'WFO', wfh: 'WFH', wfa: 'WFA', izin: 'Izin', sakit: 'Sakit',
};

// Shift a date by days
const shiftDate = (dateStr: string, days: number) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

const formatDateID = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const isToday = (dateStr: string) => dateStr === new Date().toISOString().split('T')[0];

export default function AdminInternsIndex({ interns, divisions, filters, selected_date, drafts = [] }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [divisionId, setDivisionId] = useState(filters.division_id ?? '');
    const [todayStatus, setTodayStatus] = useState(filters.today_status ?? '');
    const [date, setDate] = useState(selected_date);

    // Edit attendance modal state
    const [editModal, setEditModal] = useState<TodayAttendance | null>(null);
    const [editForm, setEditForm] = useState({ status: '', check_in_at: '', check_out_at: '', reason: '' });

    // Add draft modal
    const [addModal, setAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ nim: '', nama_lengkap: '', division_id: '', internship_duration_days: '90' });
    const [addErrors, setAddErrors] = useState<Record<string, string>>({});
    const [addLoading, setAddLoading] = useState(false);

    // Draft list panel
    const [showDrafts, setShowDrafts] = useState(false);

    const navigate = (newDate: string, extras?: Record<string, string>) => {
        router.get('/mentor/interns', {
            date: newDate,
            search: search || undefined,
            division_id: divisionId || undefined,
            today_status: todayStatus || undefined,
            ...extras,
        }, { preserveState: true, replace: true });
    };

    const applyFilters = () => navigate(date);

    const resetFilters = () => {
        const today = new Date().toISOString().split('T')[0];
        setSearch(''); setDivisionId(''); setTodayStatus(''); setDate(today);
        router.get('/mentor/interns', {}, { replace: true });
    };

    const openEdit = (att: TodayAttendance) => {
        setEditForm({
            status: att.status,
            check_in_at: att.check_in_at ? new Date(att.check_in_at).toISOString().slice(0, 16) : '',
            check_out_at: att.check_out_at ? new Date(att.check_out_at).toISOString().slice(0, 16) : '',
            reason: att.reason ?? '',
        });
        setEditModal(att);
    };

    const submitEdit = () => {
        if (!editModal) return;
        router.patch(`/mentor/attendances/${editModal.id}`, editForm, {
            onSuccess: () => setEditModal(null),
        });
    };

    const handleDelete = (attId: string) => {
        if (!confirm('Hapus data absensi ini?')) return;
        router.delete(`/mentor/attendances/${attId}`);
    };

    const submitAddDraft = () => {
        setAddLoading(true);
        setAddErrors({});
        router.post('/mentor/intern-drafts', {
            nim: addForm.nim,
            nama_lengkap: addForm.nama_lengkap,
            division_id: addForm.division_id || undefined,
            internship_duration_days: parseInt(addForm.internship_duration_days) || 90,
        }, {
            onSuccess: () => { setAddModal(false); setAddForm({ nim: '', nama_lengkap: '', division_id: '', internship_duration_days: '90' }); setAddLoading(false); },
            onError: (errs) => { setAddErrors(errs); setAddLoading(false); },
        });
    };

    const handleDeleteDraft = (id: number) => {
        if (!confirm('Hapus data pre-registrasi ini?')) return;
        router.delete(`/mentor/intern-drafts/${id}`);
    };

    const todayPresent = interns.data.filter((i) => i.today_attendance && ['wfo','wfh','wfa'].includes(i.today_attendance.status)).length;
    const todayAbsent  = interns.data.filter((i) => i.today_attendance && ['izin','sakit'].includes(i.today_attendance.status)).length;
    const notYet       = interns.data.filter((i) => !i.today_attendance).length;

    return (
        <AdminLayout title="Daftar Intern">
            <Head title="Daftar Intern" />

            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Daftar Intern</h2>
                    <p className="mt-1 text-sm text-slate-500">Pantau status kehadiran dan detail absensi seluruh intern.</p>
                </div>
                <div className="flex items-center gap-2">
                    {drafts.length > 0 && (
                        <button
                            onClick={() => setShowDrafts(true)}
                            className="relative flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                            <Users size={14} />
                            Pre-registrasi
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">{drafts.length}</span>
                        </button>
                    )}
                    <button
                        onClick={() => setAddModal(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                        <UserPlus size={15} /> Tambah Intern
                    </button>
                </div>
            </div>

            {/* Date Navigator */}
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                <button
                    onClick={() => { const d = shiftDate(date, -1); setDate(d); navigate(d); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-3">
                    <CalendarDays size={18} className="text-slate-500" />
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900">{formatDateID(date)}</p>
                        {isToday(date) && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Hari Ini</span>
                        )}
                    </div>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => { setDate(e.target.value); navigate(e.target.value); }}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:border-slate-400 focus:outline-none"
                    />
                </div>

                <button
                    onClick={() => { const d = shiftDate(date, 1); setDate(d); navigate(d); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: 'Total Intern', value: interns.total, color: 'text-slate-800', bg: 'bg-slate-50' },
                    { label: 'Hadir', value: todayPresent, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                    { label: 'Izin/Sakit', value: todayAbsent, color: 'text-amber-700', bg: 'bg-amber-50' },
                    { label: 'Belum Absen', value: notYet, color: 'text-rose-700', bg: 'bg-rose-50' },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl border border-slate-100 ${s.bg} px-5 py-4`}>
                        <p className="text-xs font-medium text-slate-500">{s.label}</p>
                        <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm focus:border-slate-400 focus:outline-none"
                    />
                </div>
                <select value={divisionId} onChange={(e) => setDivisionId(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none">
                    <option value="">Semua Divisi</option>
                    {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select value={todayStatus} onChange={(e) => setTodayStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none">
                    {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <button onClick={applyFilters} className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                    <SlidersHorizontal size={15} /> Filter
                </button>
                {(search || divisionId || todayStatus) && (
                    <button onClick={resetFilters} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Reset</button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4 text-left">Intern</th>
                                <th className="px-6 py-4 text-left">Divisi</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Jam Masuk / Pulang</th>
                                <th className="px-6 py-4 text-left">Keterangan</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interns.data.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Tidak ada data intern ditemukan.</td></tr>
                            ) : interns.data.map((intern) => {
                                const att = intern.today_attendance;
                                const displayName = intern.profile?.nama_lengkap || intern.name;
                                const avatarSrc = intern.profile?.foto
                                    ? `/storage/${intern.profile.foto}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

                                return (
                                    <tr key={intern.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/60">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={avatarSrc} alt={displayName} className="h-9 w-9 rounded-full object-cover" />
                                                <div>
                                                    <div className="font-semibold text-slate-900">{displayName}</div>
                                                    <div className="text-xs text-slate-400">{intern.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-700">{intern.profile?.division?.name || intern.profile?.divisi || '-'}</div>
                                            <div className="text-xs text-slate-400">{intern.profile?.asal_kampus || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {att ? (
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${statusBadge(att.status)}`}>
                                                    {statusLabels[att.status] ?? att.status}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                                                    <XCircle size={11} /> Belum Absen
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {att?.check_in_at ? (
                                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                                    <Clock size={11} className="text-slate-400" />
                                                    {new Date(att.check_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            ) : <span className="text-slate-300 text-xs">-</span>}
                                            {att?.check_out_at ? (
                                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                                    <LogOut size={11} className="text-slate-400" />
                                                    {new Date(att.check_out_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            ) : att && ['wfo','wfh','wfa'].includes(att.status) ? (
                                                <div className="text-xs text-rose-500">Belum pulang</div>
                                            ) : null}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {att?.is_late && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                        <AlertTriangle size={11} /> Terlambat
                                                    </span>
                                                )}
                                                {att?.no_checkout && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                                                        <XCircle size={11} /> Belum Pulang
                                                    </span>
                                                )}
                                                {att && !att.is_late && !att.no_checkout && ['wfo','wfh','wfa'].includes(att.status) && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                        <CheckCircle2 size={11} /> Tepat Waktu
                                                    </span>
                                                )}
                                                {!att && <span className="text-xs text-slate-400">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {att ? (
                                                    <>
                                                        <button
                                                            onClick={() => openEdit(att)}
                                                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(att.id)}
                                                            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </>
                                                ) : null}
                                                <Link
                                                    href={`/mentor/interns/${intern.id}`}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
                                                >
                                                    Detail <ChevronRight size={12} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {interns.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                        <p className="text-sm text-slate-500">Halaman {interns.current_page} dari {interns.last_page} &middot; {interns.total} intern</p>
                        <div className="flex gap-1">
                            {interns.links.map((link, i) =>
                                link.url ? (
                                    <Link key={i} href={link.url} className={`rounded-lg px-3 py-1.5 text-sm transition ${link.active ? 'bg-slate-900 font-semibold text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span key={i} className="rounded-lg px-3 py-1.5 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Attendance Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setEditModal(null)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-4 text-lg font-bold text-slate-900">Edit Data Absensi</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                                >
                                    {['wfo','wfh','wfa','izin','sakit'].map((s) => (
                                        <option key={s} value={s}>{s.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Jam Masuk</label>
                                <input type="datetime-local" value={editForm.check_in_at} onChange={(e) => setEditForm({ ...editForm, check_in_at: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Jam Pulang</label>
                                <input type="datetime-local" value={editForm.check_out_at} onChange={(e) => setEditForm({ ...editForm, check_out_at: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Alasan</label>
                                <textarea value={editForm.reason} onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                                    rows={3} placeholder="Opsional" />
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-3">
                            <button onClick={() => setEditModal(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                Batal
                            </button>
                            <button onClick={submitEdit} className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Intern Draft Modal */}
            {addModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onClick={() => setAddModal(false)}>
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                                    <UserPlus size={18} className="text-slate-700" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Tambah Intern Baru</h3>
                                    <p className="text-xs text-slate-400">Pre-registrasi sebelum intern mendaftar</p>
                                </div>
                            </div>
                            <button onClick={() => setAddModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
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
                                        onChange={(e) => setAddForm({ ...addForm, nim: e.target.value })}
                                        placeholder="Nomor Induk Mahasiswa"
                                        className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none ${addErrors.nim ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
                                    />
                                    {addErrors.nim && <p className="mt-1 text-xs text-rose-500">{addErrors.nim}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Divisi</label>
                                    <select
                                        value={addForm.division_id}
                                        onChange={(e) => setAddForm({ ...addForm, division_id: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none"
                                    >
                                        <option value="">Pilih Divisi (Opsional)</option>
                                        {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
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
                                        value={addForm.nama_lengkap}
                                        onChange={(e) => setAddForm({ ...addForm, nama_lengkap: e.target.value })}
                                        placeholder="Nama lengkap intern"
                                        className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none ${addErrors.nama_lengkap ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
                                    />
                                    {addErrors.nama_lengkap && <p className="mt-1 text-xs text-rose-500">{addErrors.nama_lengkap}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Durasi Magang (Hari)</label>
                                    <input
                                        type="number"
                                        value={addForm.internship_duration_days}
                                        onChange={(e) => setAddForm({ ...addForm, internship_duration_days: e.target.value })}
                                        min="1" max="730"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                            <button onClick={() => setAddModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                Batal
                            </button>
                            <button
                                onClick={submitAddDraft}
                                disabled={addLoading || !addForm.nim || !addForm.nama_lengkap}
                                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                                        {drafts.map((d) => (
                                            <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                                                <td className="px-5 py-3 font-mono text-xs font-medium text-slate-700">{d.nim}</td>
                                                <td className="px-5 py-3 font-medium text-slate-800">{d.nama_lengkap}</td>
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
        </AdminLayout>
    );
}
