import { useForm, Link } from '@inertiajs/react';
import MobileLayout from '@/layouts/MobileLayout';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

interface ProfileData {
    foto?: string;
    nama_lengkap: string;
    asal_kampus?: string;
    divisi?: string;
    division_id?: string;
    internship_duration_days?: number;
    division?: {
        id: string;
        name: string;
    };
}

interface UserData {
    name: string;
    email: string;
    profile?: ProfileData;
}

export default function EditProfile({ user, divisions = [] }: { user: UserData, divisions?: { id: string; name: string }[] }) {
    const profile = user.profile;

    const { data, setData, patch, processing, errors } = useForm({
        nama_lengkap: profile?.nama_lengkap || user.name,
        asal_kampus: profile?.asal_kampus || '',
        division_id: profile?.division_id || profile?.division?.id || '',
        internship_duration_days: profile?.internship_duration_days || 90,
    });

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();

        patch('/intern/profile', {
            onSuccess: () => {
                toast.success('Profil berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui profil. Periksa data Anda.');
            }
        });
    };

    return (
        <MobileLayout title="Edit Profil" showBottomNav={false}>
            <Toaster position="top-center" />
            <div className="mb-6 flex items-center gap-3">
                <Link href="/intern/profile" className="rounded-full bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Edit Profil
                    </h1>
                    <p className="text-sm text-gray-500">
                        Perbarui informasi pribadi Anda.
                    </p>
                </div>
            </div>

            <div className="mb-6 flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-indigo-100 bg-gray-50">
                    <img
                        src={
                            profile?.foto
                                ? `/storage/${profile.foto}`
                                : `https://ui-avatars.com/api/?name=${user.name}&background=random`
                        }
                        alt="Foto Wajah"
                        className="h-full w-full object-cover"
                    />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-gray-900">Data Pemindaian Wajah</h3>
                <p className="mb-4 text-center text-xs text-gray-500">Foto digunakan untuk verifikasi kehadiran</p>
                <Link
                    href="/intern/setup-profile"
                    className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
                >
                    Perbarui Foto Wajah (Opsional)
                </Link>
            </div>

            <form onSubmit={submitProfile} className="space-y-5 pb-8">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Nama Lengkap (Wajib)
                    </label>
                    <input
                        type="text"
                        value={data.nama_lengkap}
                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Masukkan nama lengkap Anda"
                    />
                    {errors.nama_lengkap && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.nama_lengkap}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Asal Kampus / Sekolah
                    </label>
                    <input
                        type="text"
                        value={data.asal_kampus}
                        onChange={(e) => setData('asal_kampus', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Universitas / SMK asal"
                    />
                    {errors.asal_kampus && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.asal_kampus}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Divisi Penempatan (Opsional / Jika Diizinkan)
                    </label>
                    <select
                        value={data.division_id}
                        onChange={(e) => setData('division_id', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">Pilih Divisi...</option>
                        {divisions.map((d) => (
                            <option key={d.id} value={d.id}>
                                Divisi {d.name}
                            </option>
                        ))}
                    </select>
                    {errors.division_id && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.division_id}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Durasi Magang (Hari)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="365"
                        value={data.internship_duration_days}
                        onChange={(e) => setData('internship_duration_days', parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-gray-300 bg-white p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Contoh: 90"
                    />
                    {errors.internship_duration_days && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.internship_duration_days}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-semibold text-white shadow-lg shadow-indigo-200 transition-transform active:scale-[0.98]"
                >
                    {processing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : null}
                    Simpan Perubahan
                </button>
            </form>
        </MobileLayout>
    );
}
