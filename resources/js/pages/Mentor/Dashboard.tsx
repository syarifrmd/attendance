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
        nama_lengkap: string;
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
        wfo: 'bg-emerald-100 text-emerald-800',
        wfh: 'bg-sky-100 text-sky-800',
        wfa: 'bg-violet-100 text-violet-800',
        izin: 'bg-amber-100 text-amber-800',
        sakit: 'bg-rose-100 text-rose-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
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
                    { label: 'Total Intern', value: interns.length, color: 'text-gray-800', bg: 'bg-gray-50' },
                    { label: 'Hadir Hari Ini', value: todayPresent, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                    { label: 'Izin / Sakit', value: todayAbsent, color: 'text-amber-700', bg: 'bg-amber-50' },
                    { label: 'Belum Absen', value: notYet, color: 'text-rose-700', bg: 'bg-rose-50' },
                ].map((stat) => (
                    <div key={stat.label} className={`rounded-xl border border-gray-100 ${stat.bg} px-5 py-4`}>
                        <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                        <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="mb-5 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau email intern..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKey}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm focus:border-indigo-400 focus:outline-none"
                    />
                </div>
                <button
                    onClick={applySearch}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                    Cari
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
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
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                        Tidak ada data intern ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                interns.map((intern) => {
                                    const att = intern.today_attendance;
                                    const displayName = intern.profile?.nama_lengkap || intern.name;
                                    const avatarSrc = intern.profile?.foto
                                        ? `/storage/${intern.profile.foto}`
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

                                    return (
                                        <tr key={intern.id} className="border-t border-gray-100 transition-colors hover:bg-gray-50/60">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={avatarSrc}
                                                        alt={displayName}
                                                        className="h-9 w-9 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{displayName}</div>
                                                        <div className="text-xs text-gray-400">{intern.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-700">
                                                    {intern.profile?.division?.name || intern.profile?.divisi || '-'}
                                                </div>
                                                <div className="text-xs text-gray-400">{intern.profile?.asal_kampus || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {att ? (
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${getStatusBadge(att.status)}`}>
                                                        {att.status}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                                                        <XCircle size={11} /> Belum Absen
                                                    </span>
                                                )}
                                                {att?.check_in_at && (
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                                        <Clock size={11} />
                                                        Masuk: {new Date(att.check_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                                {att?.check_out_at && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        <LogOut size={11} />
                                                        Pulang: {new Date(att.check_out_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
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
                                                    {att && !att.is_late && !att.no_checkout && ['wfo', 'wfh', 'wfa'].includes(att.status) && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                            <CheckCircle2 size={11} /> Tepat Waktu
                                                        </span>
                                                    )}
                                                    {!att && <span className="text-xs text-gray-400">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-800">{intern.total_checkins}x</div>
                                                <div className="text-xs text-gray-400">Izin/Sakit: {intern.total_absent}x</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={`/mentor/interns/${intern.id}/detail`}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
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
