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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-200">
            <Head title="Verifikasi NIM" />
            <Toaster position="top-center" />
            
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-4xl shadow-sm p-8 text-center border border-slate-100 dark:border-slate-800 transition-colors duration-200">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#E8E6FC] dark:bg-[#7D76F0]/20">
                    <ShieldCheck className="h-10 w-10 text-[#7D76F0] dark:text-[#9A95F5]" strokeWidth={2} />
                </div>
                
                <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Verification
                </h1>

                <p className="mb-8 text-sm text-slate-500 dark:text-slate-400 px-4">
                    Enter the NIM (Nomor Induk Mahasiswa) that your mentor has registered.
                </p>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={data.nim}
                            onChange={(e) => setData('nim', e.target.value)}
                            placeholder="Enter your NIM"
                            className="w-full text-center text-lg tracking-wider rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 py-4 px-6 focus:border-[#7D76F0] focus:ring-[#7D76F0] outline-none shadow-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-200"
                            required
                        />
                        {errors.nim && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.nim}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-full bg-[#C7F25E] py-4 text-base font-bold text-slate-900 transition hover:bg-[#b5e04c] active:scale-95 flex items-center justify-center gap-2"
                    >
                        {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                        Verifikasi NIM
                    </button>
                    
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
                        Can't find your NIM? <span className="text-[#7D76F0] dark:text-[#9A95F5] font-medium cursor-pointer">Ask your mentor</span>
                    </p>
                </form>
            </div>
        </div>
    );
}
