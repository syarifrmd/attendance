import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function VerifyNotice() {
    const { post, processing } = useForm();
    const [successMsg, setSuccessMsg] = useState('');

    const handleResend = () => {
        post('/intern/verify-notice/resend', {
            onSuccess: () => {
                setSuccessMsg('Email verifikasi berhasil dikirim ulang. Silakan cek Inbox atau folder Spam Anda.');
                setTimeout(() => setSuccessMsg(''), 10000);
            }
        });
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#fdfbfb] via-[#fad0c4] to-[#cba3f3] p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Head title="Cek Email Anda" />

            {/* Decorative blob */}
            <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#fcb6c0] opacity-20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-[#b490f0] opacity-20 blur-3xl" />

            <div className="relative z-10 w-full max-w-sm">
                {/* Icon + Header */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 scale-150 rounded-full bg-[#fcb6c0] opacity-30 blur-xl" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl shadow-pink-200/50">
                            <Mail className="h-9 w-9 text-[#a488ea]" />
                        </div>
                    </div>
                    <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white text-center">
                        Cek Email Anda
                    </h1>
                    <p className="max-w-[260px] text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        Kami telah mengirimkan link verifikasi ke email yang Anda gunakan untuk login.
                    </p>
                </div>

                {/* Card */}
                <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-pink-100/60 dark:bg-slate-900 dark:shadow-slate-950/60">
                    <div className="p-6">
                        {/* Success Message */}
                        {successMsg && (
                            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                <p className="text-sm leading-relaxed text-green-700">{successMsg}</p>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="mb-6 rounded-2xl border border-[#d4cafc] bg-[#f3effd] p-4 dark:border-[#a488ea]/20 dark:bg-[#a488ea]/10">
                            <p className="text-center text-sm leading-relaxed text-[#5c42b5] dark:text-[#b49ef5]">
                                Buka email Anda dan klik tombol{' '}
                                <span className="font-bold text-[#7c64d5] dark:text-[#d4cafc]">Verifikasi Akun</span>{' '}
                                untuk melanjutkan dan memasukkan NIM Anda.
                            </p>
                        </div>

                        {/* Resend Section */}
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Tidak menerima email?
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                <RefreshCw className={`h-4 w-4 text-slate-500 ${processing ? 'animate-spin' : ''}`} />
                                {processing ? 'Mengirim...' : 'Kirim Ulang Email'}
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                            <div className="flex-1 bg-slate-50 px-6 py-4 dark:bg-slate-900/50">
                                <p className="mb-2 text-center text-xs text-slate-400">Sudah klik link?</p>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#a488ea] transition-colors hover:text-[#8b6fe0] dark:text-[#b49ef5]"
                                >
                                    Cek Status
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="flex-1 bg-white px-6 py-4 dark:bg-slate-900">
                                <p className="mb-2 text-center text-xs text-slate-400">Salah akun?</p>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center justify-center gap-1.5 text-sm font-bold text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    Ganti Akun
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-6 px-4 text-center text-xs leading-relaxed text-slate-400">
                    Jika email tidak masuk, cek folder <span className="font-medium text-slate-500">Spam</span> atau hubungi admin.
                </p>
            </div>
        </div>
    );
}

