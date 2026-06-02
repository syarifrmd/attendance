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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-6">
            <Head title="Cek Email Anda" />

            {/* Card Container */}
            <div className="w-full max-w-sm">

                {/* Icon + Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 scale-150"></div>
                        <div className="relative bg-white rounded-full p-5 shadow-lg border border-blue-100">
                            <Mail className="h-10 w-10 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="mt-6 text-2xl font-extrabold text-gray-900 tracking-tight text-center">
                        Cek Email Anda
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed px-2">
                        Kami telah mengirimkan link verifikasi ke email yang Anda gunakan untuk login.
                    </p>
                </div>

                {/* Card Body */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6">

                        {/* Success Message */}
                        {successMsg && (
                            <div className="mb-5 rounded-2xl bg-green-50 border border-green-100 p-4 flex gap-3 items-start">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-green-700 leading-relaxed">{successMsg}</p>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 mb-6">
                            <p className="text-sm text-blue-800 text-center leading-relaxed">
                                Buka email Anda dan klik tombol{' '}
                                <span className="font-semibold text-blue-900">Verifikasi Akun</span>{' '}
                                untuk melanjutkan dan memasukkan NIM Anda.
                            </p>
                        </div>

                        {/* Resend Section */}
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                Tidak menerima email?
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-300 active:scale-95 disabled:opacity-50 transition-all duration-200"
                            >
                                <RefreshCw className={`h-4 w-4 text-gray-500 ${processing ? 'animate-spin' : ''}`} />
                                {processing ? 'Mengirim...' : 'Kirim Ulang Email'}
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100"></div>

                    {/* Footer Link */}
                    <div className="px-6 py-4 bg-gray-50">
                        <p className="text-xs text-center text-gray-400 mb-3">Sudah klik link?</p>
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            Kembali ke Dashboard
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* Bottom hint */}
                <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed px-4">
                    Jika email tidak masuk, cek folder <span className="font-medium text-gray-500">Spam</span> atau hubungi admin.
                </p>
            </div>
        </div>
    );
}
