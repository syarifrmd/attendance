import { Head, Link, usePage } from '@inertiajs/react';
import MentorLayout from '@/layouts/MentorLayout';

interface Division {
    id: string;
    name: string;
    description?: string | null;
    start_time: string;
    end_time: string;
    work_days: string[];
    internship_duration_days: number;
    mentor_name?: string | null;
}

const dayLabels: Record<string, string> = {
    mon: 'Senin',
    tue: 'Selasa',
    wed: 'Rabu',
    thu: 'Kamis',
    fri: 'Jumat',
    sat: 'Sabtu',
    sun: 'Minggu',
};

export default function DivisionIndex({ divisions }: { divisions: Division[] }) {
    const { url } = usePage();
    const prefix = url.startsWith('/admin') ? '/admin' : '/mentor';

    return (
        <MentorLayout title="Manajemen Divisi">
            <Head title="Manajemen Divisi" />

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Divisi dan Jam Kerja
                    </h2>
                    <p className="text-sm text-gray-500">
                        Atur aturan jam magang dan hari kerja per divisi.
                    </p>
                </div>
                <Link
                    href={`${prefix}/divisions/create`}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                    Tambah Divisi
                </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-4 text-left">Divisi</th>
                            <th className="px-6 py-4 text-left">Jadwal</th>
                            <th className="px-6 py-4 text-left">Durasi</th>
                            <th className="px-6 py-4 text-left">Mentor</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {divisions.length === 0 ? (
                            <tr>
                                <td
                                    className="px-6 py-6 text-center text-sm text-gray-400"
                                    colSpan={5}
                                >
                                    Belum ada divisi.
                                </td>
                            </tr>
                        ) : (
                            divisions.map((division) => (
                                <tr key={division.id} className="border-t border-gray-100">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">
                                            {division.name}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {division.description || 'Tanpa deskripsi'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-700">
                                            {division.start_time} - {division.end_time}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {(division.work_days ?? [])
                                                .map((day) => dayLabels[day] ?? day)
                                                .join(', ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {division.internship_duration_days} hari
                                    </td>
                                    <td className="px-6 py-4">
                                        {division.mentor_name || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`${prefix}/divisions/${division.id}/edit`}
                                                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={`${prefix}/divisions/${division.id}`}
                                                method="delete"
                                                as="button"
                                                className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                            >
                                                Hapus
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </MentorLayout>
    );
}
