import { Link } from '@inertiajs/react';
import MobileLayout from '@/layouts/MobileLayout';
import AttendanceSummaryCard from '@/components/PWA/AttendanceSummaryCard';
import { Clock, Bell, ChevronRight } from 'lucide-react';

interface Attendance {
    id: string;
    status: string;
    created_at: string;
    reason?: string;
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

interface DashboardProps {
    auth: { user: any };
    totalDays: number;
    daysAttended: number;
    daysAbsent: number;
    recentAttendances: Attendance[];
    announcements: Announcement[];
}

export default function Dashboard({
    auth,
    totalDays = 100,
    daysAttended = 0,
    daysAbsent = 0,
    recentAttendances = [],
    announcements = [],
}: DashboardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'wfo':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
            case 'wfh':
            case 'wfa':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
            case 'izin':
            case 'sakit':
                return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <MobileLayout title="Dashboard">
            <div className="mb-6 mt-2">
                {/* Header / Greeting */}
                <div className="mb-6 flex items-center gap-3">
                    <img
                        src={
                            `https://ui-avatars.com/api/?name=${auth.user.name}&background=random`
                        }
                        alt="Profile"
                        className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-slate-400">Welcome back,</p>
                        <h1 className="font-semibold text-gray-900 dark:text-slate-100">
                            {auth.user.name}
                        </h1>
                    </div>
                    <Link
                        href="/intern/announcements"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        <Bell size={20} />
                    </Link>
                </div>

                {/* Announcements / News Section */}
                {announcements.length > 0 && (
                    <div className="mb-6">
                        <div className="mb-3 flex items-center gap-2">
                            <Bell size={16} className="text-indigo-500 dark:text-indigo-400" />
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                                Pengumuman
                            </h2>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                            {announcements.slice(0, 5).map((item) => (
                                <div
                                    key={item.id}
                                    className="min-w-[240px] max-w-[280px] flex-shrink-0 rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 p-4"
                                >
                                    <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-slate-100 line-clamp-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">
                                        {item.content}
                                    </p>
                                    <p className="mt-2 text-[10px] text-gray-400 dark:text-slate-500">
                                        {new Date(
                                            item.created_at,
                                        ).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Attendance Summary Card */}
                <AttendanceSummaryCard
                    totalDays={totalDays}
                    daysAttended={daysAttended}
                    daysAbsent={daysAbsent}
                />

                {/* Attendance History */}
                <div className="mt-8">
                    <div className="mb-4 flex items-end justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                            Riwayat Absensi
                        </h2>
                        <Link
                            href="/intern/attendance/history"
                            className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                        >
                            Lihat semua
                            <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="flex flex-col gap-3">
                        {recentAttendances.length > 0 ? (
                            recentAttendances.map((record) => (
                                <div
                                    key={record.id}
                                    className="flex items-center justify-between rounded-2xl border border-gray-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 text-gray-800 dark:text-slate-200 shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase ${getStatusColor(record.status)}`}
                                        >
                                            {record.status}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {new Date(
                                                    record.created_at,
                                                ).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                                                <Clock size={12} />
                                                <span>
                                                    {new Date(
                                                        record.created_at,
                                                    ).toLocaleTimeString(
                                                        'id-ID',
                                                        {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-slate-700/60 bg-gray-50 dark:bg-slate-800/50 py-6 text-center text-gray-400 dark:text-slate-500">
                                <p className="text-sm">
                                    Belum ada riwayat absensi.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
