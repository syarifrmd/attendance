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
    const hasNim = Boolean(nim);
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Head title="Verifikasi NIM" />
            <Toaster position="top-center" />
            
            <div className="w-full max-w-md bg-white rounded-4xl shadow-sm p-8 text-center border border-slate-100">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#E8E6FC]">
                    <ShieldCheck className="h-10 w-10 text-[#7D76F0]" strokeWidth={2} />
                </div>
                
                <h1 className="mb-2 text-2xl font-bold text-slate-900">
                    Verification
                </h1>

                {status === 'nim-verification-link-sent' && (
                    <div className="mb-4 rounded-full bg-green-100 px-4 py-2 text-xs font-medium text-green-700">
                        Link verifikasi NIM sudah dikirim ke email Anda.
                    </div>
                )}

                <p className="mb-8 text-sm text-slate-500 px-4">
                    Enter the NIM (Nomor Induk Mahasiswa) that your mentor has registered.
                </p>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={data.nim}
                            onChange={(e) => setData('nim', e.target.value)}
                            placeholder="Enter your NIM"
                            className="w-full text-center text-lg tracking-wider rounded-full border border-slate-200 py-4 px-6 focus:border-[#7D76F0] focus:ring-[#7D76F0] outline-none shadow-sm"
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
                        {hasNim ? 'Resend Verification Link' : 'Send Verification Link'}
                    </button>
                    
                    <p className="text-sm text-slate-500 mt-6">
                        Can't find your NIM? <span className="text-[#7D76F0] font-medium cursor-pointer">Ask your mentor</span>
                    </p>
                </form>
            </div>
        </div>
    );
}
