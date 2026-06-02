import { Head } from '@inertiajs/react';
import MobileLayout from '@/layouts/MobileLayout';
import { Clock, MapPin, Calendar, FileText } from 'lucide-react';

interface Attendance {
    id: string;
    status: string;
    created_at: string;
    reason?: string;
}

interface HistoryProps {
    attendances: {
        data: Attendance[];
        links: any[];
    };
}

export default function History({ attendances }: HistoryProps) {
    const records = attendances.data;

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
        <MobileLayout title="Riwayat Absensi">
            <div className="mb-6 mt-4">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Riwayat Absensi</h1>
                <p className="text-sm text-gray-500">Daftar semua riwayat kehadiran Anda.</p>
            </div>

            <div className="flex flex-col gap-3 pb-6">
                {records.length > 0 ? (
                    records.map((record) => (
                        <div
                            key={record.id}
                            className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                        >
                            <div className="mb-3 flex items-start justify-between border-b border-gray-50 pb-3">
                                <div className="flex items-center gap-2 text-gray-800">
                                    <Calendar size={16} className="text-indigo-500" />
                                    <span className="text-sm font-semibold">
                                        {new Date(record.created_at).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(record.status)}`}>
                                    {record.status}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-gray-400" />
                                    <span className="font-medium text-gray-700">
                                        {new Date(record.created_at).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                
                                {record.reason && (
                                    <div className="flex items-center gap-1.5 line-clamp-1">
                                        <FileText size={14} className="text-gray-400" />
                                        <span className="text-xs">{record.reason}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-gray-400">
                        <p className="text-sm">Belum ada riwayat absensi sama sekali.</p>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}

