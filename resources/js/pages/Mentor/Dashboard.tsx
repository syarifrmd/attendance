import { router } from '@inertiajs/react';
import { useState } from 'react';
import MentorLayout from '@/layouts/MentorLayout';
import {
    Search,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    LogOut,
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
}

interface Intern {
    id: string;
    name: string;
    email: string;
    total_checkins: number;
    total_absent: number;
    profile: {
        name: string;
        asal_kampus: string | null;
        foto: string | null;
        division: Division | null;
        divisi: string | null;
    } | null;
    today_attendance: TodayAttendance | null;
}

interface Props {
    interns: Intern[];
    filters: { search?: string };
}

const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
        wfo: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
        wfh: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300',
        wfa: 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300',
        izin: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
        sakit: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300';
};

export default function MentorDashboard({ interns = [], filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applySearch = () => {
        router.get('/mentor/dashboard', { search: search || undefined }, { preserveState: true, replace: true });
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') applySearch();
    };

    const todayPresent = interns.filter(
        (i) => i.today_attendance && ['wfo', 'wfh', 'wfa'].includes(i.today_attendance.status),
    ).length;
    const todayAbsent = interns.filter(
        (i) => i.today_attendance && ['izin', 'sakit'].includes(i.today_attendance.status),
    ).length;
    const notYet = interns.filter((i) => !i.today_attendance).length;

    return (
        <MentorLayout title="Pantauan Intern">

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: 'Total Intern', value: interns.length, color: 'text-gray-800 dark:text-slate-100', bg: 'bg-gray-50 dark:bg-slate-800' },
                    { label: 'Hadir Hari Ini', value: todayPresent, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Izin / Sakit', value: todayAbsent, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Belum Absen', value: notYet, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                ].map((stat) => (
                    <div key={stat.label} className={`rounded-xl border border-gray-100 dark:border-slate-700/60 ${stat.bg} px-5 py-4`}>
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{stat.label}</p>
                        <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="mb-5 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Cari nama atau email intern..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKey}
                        className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm focus:border-[#a488ea] focus:outline-none dark:text-slate-200 dark:placeholder-slate-500"
                    />
                </div>
                <button
                    onClick={applySearch}
                    className="rounded-xl bg-[#a488ea] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8b6fe0] dark:bg-[#a488ea] dark:hover:bg-[#a488ea]"
                >
                    Cari
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-600 dark:text-slate-300">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase text-gray-500 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-4 text-left">Intern</th>
                                <th className="px-6 py-4 text-left">Divisi</th>
                                <th className="px-6 py-4 text-left">Status Hari Ini</th>
                                <th className="px-6 py-4 text-left">Keterangan</th>
                                <th className="px-6 py-4 text-left">Total Hadir</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 dark:text-slate-500">
                                        Tidak ada data intern ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                interns.map((intern) => {
                                    const att = intern.today_attendance;
                                    const displayName = intern.name;
                                    const avatarSrc = intern.profile?.foto
                                        ? `/storage/${intern.profile.foto}`
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

                                    return (
                                        <tr key={intern.id} className="border-t border-gray-100 dark:border-slate-700/50 transition-colors hover:bg-gray-50/60 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={avatarSrc}
                                                        alt={displayName}
                                                        className="h-9 w-9 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-slate-200">{displayName}</div>
                                                        <div className="text-xs text-gray-400 dark:text-slate-500">{intern.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-700 dark:text-slate-300">
                                                    {intern.profile?.division?.name || intern.profile?.divisi || '-'}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-slate-500">{intern.profile?.asal_kampus || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {att ? (
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${getStatusBadge(att.status)}`}>
                                                        {att.status}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:text-slate-400">
                                                        <XCircle size={11} /> Belum Absen
                                                    </span>
                                                )}
                                                {att?.check_in_at && (
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                                        <Clock size={11} />
                                                        Masuk: {new Date(att.check_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                                {att?.check_out_at && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                                        <LogOut size={11} />
                                                        Pulang: {new Date(att.check_out_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {att?.is_late && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                                            <AlertTriangle size={11} /> Terlambat
                                                        </span>
                                                    )}
                                                    {att?.no_checkout && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400">
                                                            <XCircle size={11} /> Belum Pulang
                                                        </span>
                                                    )}
                                                    {att && !att.is_late && !att.no_checkout && ['wfo', 'wfh', 'wfa'].includes(att.status) && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                            <CheckCircle2 size={11} /> Tepat Waktu
                                                        </span>
                                                    )}
                                                    {!att && <span className="text-xs text-gray-400 dark:text-slate-500">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-800 dark:text-slate-200">{intern.total_checkins}x</div>
                                                <div className="text-xs text-gray-400 dark:text-slate-500">Izin/Sakit: {intern.total_absent}x</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={`/mentor/interns/${intern.id}/detail`}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-700"
                                                >
                                                    Detail <ChevronRight size={13} />
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MentorLayout>
    );
}

