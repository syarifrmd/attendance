import { Head, Link } from '@inertiajs/react';
import MobileLayout from '@/layouts/MobileLayout';
import { User, Briefcase, GraduationCap, Mail, Edit3, LogOut } from 'lucide-react';

interface ProfileData {
    foto?: string;
    name: string;
    asal_kampus?: string;
    divisi?: string;
    internship_duration_days?: number;
    division?: {
        name: string;
    };
}

interface UserData {
    name: string;
    email: string;
    profile?: ProfileData;
}

export default function Profile({ user }: { user: UserData }) {
    const profile = user.profile;

    return (
        <MobileLayout title="Profil Saya">
            <div className="mb-6 mt-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Profil Saya</h1>
            </div>

            <div className="mb-8 flex flex-col items-center">
                <div className="relative mb-4 h-24 w-24">
                    <img
                        src={
                            profile?.foto 
                                ? `/storage/${profile.foto}` 
                                : `https://ui-avatars.com/api/?name=${user.name}&background=random`
                        }
                        alt="Profile"
                        className="h-full w-full rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-md"
                    />
                    <Link href="/intern/profile/edit" className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-gradient-to-br from-[#fcb6c0] to-[#b490f0] p-1.5 text-white shadow-sm transition-transform hover:opacity-90 active:scale-95">
                        <Edit3 size={14} />
                    </Link>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    {user.name}
                </h2>
                <p className="text-sm font-medium text-[#a488ea] dark:text-[#b49ef5]">
                    {profile?.division?.name || profile?.divisi || 'Intern'}
                </p>
            </div>

            <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-sm">
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                        Informasi Personal
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3effd] dark:bg-[#a488ea]/10 text-[#a488ea] dark:text-[#b49ef5]">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Nama Lengkap</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-200">
                                    {user.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3effd] dark:bg-[#a488ea]/10 text-[#a488ea] dark:text-[#b49ef5]">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Email</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-200">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3effd] dark:bg-[#a488ea]/10 text-[#a488ea] dark:text-[#b49ef5]">
                                <GraduationCap size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Asal Kampus / Sekolah</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-200">
                                    {profile?.asal_kampus || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3effd] dark:bg-[#a488ea]/10 text-[#a488ea] dark:text-[#b49ef5]">
                                <Briefcase size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Divisi Penempatan</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-200">
                                    {profile?.division?.name || profile?.divisi || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3effd] dark:bg-[#a488ea]/10 text-[#a488ea] dark:text-[#b49ef5]">
                                <div className="font-bold text-xs">90</div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Durasi Magang (Hari)</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-200">
                                    {profile?.internship_duration_days || '-'} Hari
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 py-3.5 text-sm font-semibold text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-100 dark:hover:bg-rose-500/20"
                >
                    <LogOut size={18} />
                    Keluar Akun
                </Link>
            </div>
        </MobileLayout>
    );
}

