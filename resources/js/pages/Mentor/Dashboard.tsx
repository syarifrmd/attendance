import React, { useState } from 'react';
import MentorLayout from '../../layouts/MentorLayout';
import { Search, Filter, Download } from 'lucide-react';

interface Profile {
    nama_lengkap: string;
    asal_kampus: string;
    divisi: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    profile: Profile | null;
    attendances: { status: string; created_at: string }[];
}

interface DashboardProps {
    interns: User[];
}

export default function MentorDashboard({ interns = [] }: DashboardProps) {
    const [search, setSearch] = useState('');

    const filteredInterns = interns.filter(intern => 
        (intern.profile?.nama_lengkap || intern.name).toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (status?: string) => {
        if (!status) return <span className="text-gray-400 text-sm">Belum ada absen</span>;
        
        const isPresensi = ['wfo', 'wfh', 'wfa'].includes(status);
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${isPresensi ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <MentorLayout title="Pantauan Anak Magang">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Cari nama intern..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl block w-full pl-10 p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 flex-1 md:flex-none">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 flex-1 md:flex-none">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nama Lengkap</th>
                                <th scope="col" className="px-6 py-4">Divisi & Kampus</th>
                                <th scope="col" className="px-6 py-4">Absen Terakhir</th>
                                <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInterns.length > 0 ? (
                                filteredInterns.map((intern) => {
                                    const latestAttendance = intern.attendances?.[0];
                                    return (
                                        <tr key={intern.id} className="bg-white border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                                                        {(intern.profile?.nama_lengkap || intern.name).charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{intern.profile?.nama_lengkap || intern.name}</div>
                                                        <div className="text-gray-400">{intern.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-700">{intern.profile?.divisi || '-'}</div>
                                                <div className="text-xs text-gray-400 mt-1">{intern.profile?.asal_kampus || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    {getStatusBadge(latestAttendance?.status)}
                                                    {latestAttendance ? (
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(latestAttendance.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <a href={`/mentor/interns/${intern.id}/reports`} className="font-medium text-indigo-600 hover:underline">Detail Data</a>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        Data anak magang tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </MentorLayout>
    );
}
