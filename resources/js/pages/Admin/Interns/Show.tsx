import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { useState } from 'react';
import {
    ArrowLeft,
    AlertTriangle,
    CheckCircle2,
    Clock,
    LogOut,
    XCircle,
    Image,
    X,
    SlidersHorizontal,
    CalendarDays,
} from 'lucide-react';

interface Division {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
}

interface AttendanceRecord {
    id: string;
    status: string;
    check_in_at: string | null;
    check_out_at: string | null;
    reason: string | null;
    proof_image_url: string | null;
    is_late: boolean;
    no_checkout: boolean;
    created_at: string;
}

interface PaginatedAttendances {
    data: AttendanceRecord[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Intern {
    id: string;
    name: string;
    email: string;
    profile: {
        asal_kampus: string | null;
        foto: string | null;
        division: Division | null;
        divisi: string | null;
        internship_duration_days: number | null;
    } | null;
}

interface Props {
    intern: Intern;
    attendances: PaginatedAttendances;
    division: Division | null;
    filters: { from?: string; to?: string; status?: string };
    stats: { total_checkin: number; total_absent: number; total_late: number };
}

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'wfo', label: 'WFO' },
    { value: 'wfh', label: 'WFH' },
    { value: 'wfa', label: 'WFA' },
    { value: 'izin', label: 'Izin' },
    { value: 'sakit', label: 'Sakit' },
];

const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
        wfo: 'bg-emerald-100 text-emerald-800',
        wfh: 'bg-sky-100 text-sky-800',
        wfa: 'bg-violet-100 text-violet-800',
        izin: 'bg-amber-100 text-amber-800',
        sakit: 'bg-rose-100 text-rose-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
};

export default function AdminInternShow({ intern, attendances, division, filters, stats }: Props) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    const displayName = intern.name;
    const avatarSrc = intern.profile?.foto
        ? `/storage/${intern.profile.foto}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

    const applyFilters = () => {
        router.get(
            `/admin/interns/${intern.id}`,
            { from: from || undefined, to: to || undefined, status: status || undefined },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setFrom('');
        setTo('');
        setStatus('');
        router.get(`/admin/interns/${intern.id}`, {}, { preserveState: false, replace: true });
    };

    return (
        <AdminLayout title={`Detail Intern: ${displayName}`}>
            <Head title={`Detail Intern: ${displayName}`} />

            {/* Back */}
            <div className="mb-5">
                <Link
                    href="/admin/interns"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
                >
                    <ArrowLeft size={16} /> Kembali ke Daftar Intern
                </Link>
            </div>

            {/* Intern Profile Card */}
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
                <img
                    src={avatarSrc}
                    alt={displayName}
                    className="h-20 w-20 rounded-2xl object-cover shadow-sm"
                />
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                    <p className="text-sm text-slate-500">{intern.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
                            {intern.profile?.division?.name || intern.profile?.divisi || 'Divisi tidak diketahui'}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
                            {intern.profile?.asal_kampus || '-'}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
                            Durasi: {intern.profile?.internship_duration_days || 0} Hari
                        </span>
                    </div>
                    {division && (
                        <p className="mt-1.5 text-xs text-slate-400">
                            Jadwal kerja: <strong>{division.start_time}</strong> – <strong>{division.end_time}</strong>
                        </p>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
                        <p className="text-xs text-emerald-600">Total Hadir</p>
                        <p className="text-xl font-bold text-emerald-800">{stats.total_checkin}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 px-4 py-3 text-center">
                        <p className="text-xs text-amber-600">Izin/Sakit</p>
                        <p className="text-xl font-bold text-amber-800">{stats.total_absent}</p>
                    </div>
                    <div className="rounded-xl bg-rose-50 px-4 py-3 text-center">
                        <p className="text-xs text-rose-600">Terlambat</p>
                        <p className="text-xl font-bold text-rose-800">{stats.total_late}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Dari Tanggal</label>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Sampai Tanggal</label>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    >
                        {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={applyFilters}
                    className="flex items-center gap-2 self-end rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    <SlidersHorizontal size={14} /> Terapkan
                </button>
                {(from || to || status) && (
                    <button
                        onClick={resetFilters}
                        className="self-end rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Attendance History Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                    <h3 className="font-semibold text-slate-800">Riwayat Absensi</h3>
                    <p className="text-xs text-slate-400">{attendances.total} total record</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-left">Tanggal</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Jam Masuk</th>
                                <th className="px-6 py-3 text-left">Jam Pulang</th>
                                <th className="px-6 py-3 text-left">Keterangan</th>
                                <th className="px-6 py-3 text-left">Alasan / Bukti</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendances.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                                        Tidak ada riwayat absensi.
                                    </td>
                                </tr>
                            ) : (
                                attendances.data.map((att) => (
                                    <tr key={att.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays size={14} className="text-slate-400" />
                                                <div>
                                                    <div className="font-medium text-slate-800">
                                                        {new Date(att.created_at).toLocaleDateString('id-ID', {
                                                            weekday: 'short',
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${getStatusBadge(att.status)}`}>
                                                {att.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {att.check_in_at ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={13} className="text-slate-400" />
                                                    <span>{new Date(att.check_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {att.check_out_at ? (
                                                <div className="flex items-center gap-1.5">
                                                    <LogOut size={13} className="text-slate-400" />
                                                    <span>{new Date(att.check_out_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {att.is_late && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                        <AlertTriangle size={11} /> Terlambat
                                                    </span>
                                                )}
                                                {att.no_checkout && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                                                        <XCircle size={11} /> Tidak Absen Pulang
                                                    </span>
                                                )}
                                                {!att.is_late && !att.no_checkout && ['wfo', 'wfh', 'wfa'].includes(att.status) && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                        <CheckCircle2 size={11} /> Lengkap
                                                    </span>
                                                )}
                                                {['izin', 'sakit'].includes(att.status) && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                        {att.status === 'izin' ? 'Izin' : 'Sakit'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {att.reason && (
                                                <p className="mb-1 max-w-[200px] text-xs text-slate-500 line-clamp-2" title={att.reason}>
                                                    {att.reason}
                                                </p>
                                            )}
                                            {att.proof_image_url && (
                                                <button
                                                    onClick={() => setLightboxUrl(att.proof_image_url)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-2 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                                                >
                                                    <Image size={12} /> Lihat Bukti
                                                </button>
                                            )}
                                            {!att.reason && !att.proof_image_url && (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {attendances.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                        <p className="text-sm text-slate-500">
                            Halaman {attendances.current_page} dari {attendances.last_page}
                        </p>
                        <div className="flex gap-1">
                            {attendances.links.map((link, i) => (
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`rounded-lg px-3 py-1.5 text-sm transition ${link.active ? 'bg-slate-900 font-semibold text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="rounded-lg px-3 py-1.5 text-sm text-slate-300"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox for proof images */}
            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={() => setLightboxUrl(null)}
                >
                    <div className="relative max-h-[90vh] max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setLightboxUrl(null)}
                            className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg text-slate-700 hover:bg-slate-100"
                        >
                            <X size={16} />
                        </button>
                        <img
                            src={lightboxUrl}
                            alt="Bukti Izin"
                            className="w-full rounded-2xl object-contain shadow-xl max-h-[90vh]"
                        />
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
