import { Link, router } from '@inertiajs/react';
import MobileLayout from '@/layouts/MobileLayout';
import AttendanceSummaryCard from '@/components/PWA/AttendanceSummaryCard';
import { Clock, Bell, ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

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
    auth: {
        user: any;
        unread_notifications_count?: number;
    };
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
    useEffect(() => {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                        new Notification('Attendance App', {
                            body: 'Izin notifikasi aktif! Anda akan menerima pengumuman terbaru di sini.',
                        });
                    }
                });
            } else if (Notification.permission === 'granted') {
                const lastNotified = sessionStorage.getItem('pwa_welcome_notified');
                if (!lastNotified) {
                    new Notification('Attendance App', {
                        body: `Halo, ${auth.user.name}! Selamat bekerja dan beraktivitas hari ini.`,
                    });
                    sessionStorage.setItem('pwa_welcome_notified', 'true');
                }
            }
        }
    }, [auth.user.name]);

    // Real-time unread notification count & announcements AJAX poller
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['auth', 'announcements'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, []);

    // Monitor unread count changes to trigger instant native browser notifications
    const prevUnreadRef = useRef<number>(auth.unread_notifications_count || 0);
    useEffect(() => {
        const currentUnread = auth.unread_notifications_count || 0;
        if (currentUnread > prevUnreadRef.current) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Pengumuman Baru!', {
                    body: 'Ada pengumuman penting baru untuk Anda. Silakan klik ikon lonceng untuk membaca.',
                });
            }
        }
        prevUnreadRef.current = currentUnread;
    }, [auth.unread_notifications_count]);

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
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
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
                        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#a488ea] dark:hover:text-[#b49ef5] transition-colors"
                    >
                        <Bell size={20} />
                        {auth.unread_notifications_count !== undefined && auth.unread_notifications_count > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-[#fcb6c0] to-[#b490f0] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                                {auth.unread_notifications_count}
                            </span>
                        )}
                    </Link>
                </div>



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
                            className="flex items-center gap-1 text-sm font-medium text-[#a488ea] dark:text-[#b49ef5]"
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

