import { useForm, Head } from '@inertiajs/react';
import { storeNimClaim } from '@/actions/App/Http/Controllers/InternController';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import { FormEvent } from 'react';

type ClaimNimProps = {
    nim?: string | null;
    status?: string | null;
};

export default function ClaimNim({ nim, status }: ClaimNimProps) {
    const { data, setData, post, processing, errors } = useForm({
        nim: nim ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(storeNimClaim.url(), {
            onError: () => {
                toast.error('Gagal verifikasi NIM. Periksa kembali.');
            },
        });
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#fdfbfb] via-[#fad0c4] to-[#cba3f3] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Head title="Verifikasi NIM" />
            <Toaster position="top-center" />

            {/* Decorative Flower */}
            <div className="pointer-events-none absolute inset-0 flex -translate-y-24 items-center justify-center">
                <svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-30">
                    <path d="M50 10C50 10 30 40 50 80C70 40 50 10 50 10Z" fill="white" />
                    <path d="M50 80C50 80 15 65 15 35C15 15 50 80 50 80Z" fill="white" fillOpacity="0.8" />
                    <path d="M50 80C50 80 85 65 85 35C85 15 50 80 50 80Z" fill="white" fillOpacity="0.8" />
                    <path d="M50 80C50 80 5 80 5 55C5 40 50 80 50 80Z" fill="white" fillOpacity="0.6" />
                    <path d="M50 80C50 80 95 80 95 55C95 40 50 80 50 80Z" fill="white" fillOpacity="0.6" />
                </svg>
            </div>

            {/* Bottom Card */}
            <div className="relative z-10 mt-auto flex flex-col items-center rounded-t-[2.5rem] bg-white px-8 pb-10 pt-10 shadow-2xl dark:bg-slate-900">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#fcb6c0] to-[#b490f0]">
                    <ShieldCheck className="h-9 w-9 text-white" strokeWidth={2} />
                </div>

                <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Verifikasi NIM
                </h1>

                <p className="mb-8 max-w-[280px] text-center text-sm text-slate-500 dark:text-slate-400">
                    Masukkan NIM (Nomor Induk Mahasiswa) yang telah didaftarkan oleh mentor kamu.
                </p>

                <form onSubmit={submit} className="w-full max-w-sm space-y-6">
                    <div>
                        <input
                            type="text"
                            value={data.nim}
                            onChange={(e) => setData('nim', e.target.value)}
                            placeholder="Masukkan NIM kamu"
                            className="input-brand w-full py-4 px-6 text-center text-lg tracking-wider"
                            required
                        />
                        {errors.nim && (
                            <p className="mt-2 text-center text-sm text-rose-500">
                                {errors.nim}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-brand flex w-full items-center justify-center gap-2 py-4 text-base"
                    >
                        {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                        Verifikasi NIM
                    </button>

                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        NIM belum terdaftar?{' '}
                        <span className="cursor-pointer font-medium text-[#a488ea] dark:text-[#b49ef5]">
                            Hubungi mentor kamu
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}

