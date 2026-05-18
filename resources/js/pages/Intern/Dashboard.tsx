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
                return 'bg-emerald-100 text-emerald-700';
            case 'wfh':
            case 'wfa':
                return 'bg-amber-100 text-amber-700';
            case 'izin':
            case 'sakit':
                return 'bg-rose-100 text-rose-700';
            default:
                return 'bg-gray-100 text-gray-700';
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
                        <p className="text-xs text-gray-500">Welcome back,</p>
                        <h1 className="font-semibold text-gray-900">
                            {auth.user.name}
                        </h1>
                    </div>
                    <Link
                        href="/intern/announcements"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                        <Bell size={20} />
                    </Link>
                </div>

                {/* Announcements / News Section */}
                {announcements.length > 0 && (
                    <div className="mb-6">
                        <div className="mb-3 flex items-center gap-2">
                            <Bell size={16} className="text-indigo-500" />
                            <h2 className="text-sm font-semibold text-gray-900">
                                Pengumuman
                            </h2>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                            {announcements.slice(0, 5).map((item) => (
                                <div
                                    key={item.id}
                                    className="min-w-[240px] max-w-[280px] flex-shrink-0 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4"
                                >
                                    <h3 className="mb-1 text-sm font-semibold text-gray-900 line-clamp-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {item.content}
                                    </p>
                                    <p className="mt-2 text-[10px] text-gray-400">
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
                        <h2 className="text-lg font-semibold text-gray-900">
                            Riwayat Absensi
                        </h2>
                        <Link
                            href="/intern/attendance/history"
                            className="flex items-center gap-1 text-sm font-medium text-indigo-600"
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
                                    className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-gray-800 shadow-sm"
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
                                            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
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
                            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-6 text-center text-gray-400">
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
