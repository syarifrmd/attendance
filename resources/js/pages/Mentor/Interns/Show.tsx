import { Head, Link, router } from '@inertiajs/react';
import ManagerLayout from '@/layouts/ManagerLayout';
import { useState } from 'react';
import {
    ArrowLeft, AlertTriangle, CheckCircle2, Clock, LogOut, XCircle,
    Image, X, SlidersHorizontal, CalendarDays,
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
    profile: { nama_lengkap: string; asal_kampus: string | null; foto: string | null; division: Division | null; divisi: string | null; periode_magang: string | null; } | null;
}

interface Props {
    intern: Intern; attendances: PaginatedAttendances;
    division: Division | null;
    filters: { from?: string; to?: string; status?: string };
    stats: { total_checkin: number; total_absent: number; total_late: number };
}

const statusOptions = [
    { value: '', label: 'Semua' }, { value: 'wfo', label: 'WFO' }, { value: 'wfh', label: 'WFH' },
    { value: 'wfa', label: 'WFA' }, { value: 'izin', label: 'Izin' }, { value: 'sakit', label: 'Sakit' },
];

const statusBadge = (s: string) => ({
    wfo: 'bg-emerald-100 text-emerald-800', wfh: 'bg-sky-100 text-sky-800',
    wfa: 'bg-violet-100 text-violet-800', izin: 'bg-amber-100 text-amber-800', sakit: 'bg-rose-100 text-rose-800',
}[s] ?? 'bg-gray-100 text-gray-700');

const fmtTime = (s: string | null) => s ? new Date(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';

const LateBadge = ({ level, minutes }: { level: string; minutes: number }) => {
    if (level === 'yellow') return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200"><AlertTriangle size={10} /> {minutes} mnt</span>;
    if (level === 'red') return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200"><AlertTriangle size={10} /> {minutes} mnt</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle2 size={10} /> Tepat Waktu</span>;
};

export default function MentorInternShow({ intern, attendances, division, filters, stats }: Props) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    const displayName = intern.profile?.nama_lengkap || intern.name;
    const avatarSrc = intern.profile?.foto ? `/storage/${intern.profile.foto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

    const applyFilters = () => router.get(`/mentor/interns/${intern.id}`, { from: from || undefined, to: to || undefined, status: status || undefined }, { preserveState: true, replace: true });
    const resetFilters = () => { setFrom(''); setTo(''); setStatus(''); router.get(`/mentor/interns/${intern.id}`, {}, { preserveState: false, replace: true }); };

    return (
        <ManagerLayout title={`Detail: ${displayName}`}>
            <Head title={`Detail Intern: ${displayName}`} />

            <div className="mb-4">
                <Link href="/mentor/interns" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={15} /> Kembali ke Daftar
                </Link>
            </div>

            {/* Profile Card */}
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <img src={avatarSrc} alt={displayName} className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900">{displayName}</h2>
                        <p className="text-sm text-slate-500">{intern.email}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-medium text-indigo-700">{intern.profile?.division?.name || intern.profile?.divisi || '-'}</span>
                            {intern.profile?.asal_kampus && <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">{intern.profile.asal_kampus}</span>}
                            {intern.profile?.periode_magang && <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">Periode: {intern.profile.periode_magang}</span>}
                        </div>
                        {division && <p className="mt-1.5 text-xs text-slate-400">Jam kerja: <strong className="text-slate-600">{division.start_time}</strong> – <strong className="text-slate-600">{division.end_time}</strong></p>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                            { label: 'Hadir', value: stats.total_checkin, bg: 'bg-emerald-50', text: 'text-emerald-800', sub: 'text-emerald-600' },
                            { label: 'Izin/Sakit', value: stats.total_absent, bg: 'bg-amber-50', text: 'text-amber-800', sub: 'text-amber-600' },
                            { label: 'Terlambat', value: stats.total_late, bg: 'bg-rose-50', text: 'text-rose-800', sub: 'text-rose-600' },
                        ].map(s => (
                            <div key={s.label} className={`rounded-xl ${s.bg} px-3 py-3 text-center`}>
                                <p className={`text-xs ${s.sub}`}>{s.label}</p>
                                <p className={`mt-0.5 text-xl font-bold ${s.text}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">Dari</label>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">Sampai</label>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none">
                        {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                <div className="flex items-end gap-2">
                    <button onClick={applyFilters} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"><SlidersHorizontal size={13} /> Filter</button>
                    {(from || to || status) && <button onClick={resetFilters} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">Reset</button>}
                </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-2 md:hidden">
                {attendances.data.length === 0
                    ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-slate-400 text-sm">Tidak ada riwayat absensi.</div>
                    : attendances.data.map(att => (
                        <div key={att.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <CalendarDays size={13} className="text-slate-400" />
                                    <span className="text-sm font-medium text-slate-800">{new Date(att.created_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${statusBadge(att.status)}`}>{att.status}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                                {att.check_in_at && <span className="flex items-center gap-1"><Clock size={11} /> {fmtTime(att.check_in_at)}</span>}
                                {att.check_out_at && <span className="flex items-center gap-1"><LogOut size={11} /> {fmtTime(att.check_out_at)}</span>}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {['wfo','wfh','wfa'].includes(att.status) && <LateBadge level={att.late_level} minutes={att.late_minutes} />}
                                {att.no_checkout && <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700"><XCircle size={10} /> Belum Pulang</span>}
                                {att.reason && <span className="text-xs text-slate-400 truncate max-w-[200px]" title={att.reason}>{att.reason}</span>}
                                {att.proof_image_url && <button onClick={() => setLightboxUrl(att.proof_image_url)} className="flex items-center gap-1 rounded-lg border border-indigo-200 px-2 py-0.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"><Image size={11} /> Bukti</button>}
                            </div>
                        </div>
                    ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                <div className="border-b border-slate-100 px-6 py-4">
                    <h3 className="font-semibold text-slate-800">Riwayat Absensi</h3>
                    <p className="text-xs text-slate-400">{attendances.total} record</p>
                </div>
                <table className="w-full text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                        <tr>
                            <th className="px-5 py-3 text-left">Tanggal</th>
                            <th className="px-5 py-3 text-left">Status</th>
                            <th className="px-5 py-3 text-left">Jam Masuk</th>
                            <th className="px-5 py-3 text-left">Jam Pulang</th>
                            <th className="px-5 py-3 text-left">Keterangan</th>
                            <th className="px-5 py-3 text-left">Alasan / Bukti</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendances.data.length === 0
                            ? <tr><td colSpan={6} className="py-10 text-center text-slate-400">Tidak ada riwayat absensi.</td></tr>
                            : attendances.data.map(att => (
                                <tr key={att.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays size={13} className="text-slate-400" />
                                            <span className="font-medium text-slate-800">{new Date(att.created_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${statusBadge(att.status)}`}>{att.status}</span></td>
                                    <td className="px-5 py-4"><span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" />{fmtTime(att.check_in_at)}</span></td>
                                    <td className="px-5 py-4"><span className="flex items-center gap-1.5"><LogOut size={12} className="text-slate-400" />{fmtTime(att.check_out_at)}</span></td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1">
                                            {['wfo','wfh','wfa'].includes(att.status) && <LateBadge level={att.late_level} minutes={att.late_minutes} />}
                                            {att.no_checkout && <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 w-fit"><XCircle size={10} /> Belum Pulang</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {att.reason && <p className="mb-1 max-w-[200px] text-xs text-slate-500 line-clamp-2">{att.reason}</p>}
                                        {att.proof_image_url && <button onClick={() => setLightboxUrl(att.proof_image_url)} className="flex items-center gap-1 rounded-lg border border-indigo-200 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"><Image size={11} /> Lihat Bukti</button>}
                                        {!att.reason && !att.proof_image_url && <span className="text-slate-300">-</span>}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                {attendances.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                        <p className="text-sm text-slate-400">Halaman {attendances.current_page} dari {attendances.last_page}</p>
                        <div className="flex gap-1">
                            {attendances.links.map((link, i) => link.url
                                ? <Link key={i} href={link.url} className={`rounded-lg px-3 py-1.5 text-sm transition ${link.active ? 'bg-indigo-600 font-semibold text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                : <span key={i} className="rounded-lg px-3 py-1.5 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setLightboxUrl(null)}>
                    <div className="relative max-h-[90vh] max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setLightboxUrl(null)} className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg text-slate-700 hover:bg-slate-100"><X size={16} /></button>
                        <img src={lightboxUrl} alt="Bukti" className="w-full rounded-2xl object-contain shadow-xl max-h-[90vh]" />
                    </div>
                </div>
            )}
        </ManagerLayout>
    );
}
