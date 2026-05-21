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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Cek Email Anda" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="rounded-full bg-blue-100 p-3">
                        <Mail className="h-10 w-10 text-blue-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
                    Cek Email Anda
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Kami telah mengirimkan link verifikasi ke email yang Anda gunakan untuk login.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        {successMsg && (
                            <div className="rounded-md bg-green-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">{successMsg}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="text-sm text-gray-700 text-center">
                            Silakan buka email Anda dan klik tombol <strong>Verifikasi Akun</strong> untuk melanjutkan dan memasukkan NIM Anda.
                        </p>
                        
                        <div className="mt-4 flex flex-col items-center gap-3">
                            <p className="text-xs text-gray-500">Tidak menerima email?</p>
                            <button
                                onClick={handleResend}
                                disabled={processing}
                                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                                {processing ? 'Mengirim...' : 'Kirim Ulang Email'}
                            </button>
                        </div>
                        
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-gray-500">
                                        Sudah klik link?
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center flex flex-col gap-2">
                            <Link
                                href="/dashboard"
                                className="inline-flex justify-center items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                Kembali ke Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
