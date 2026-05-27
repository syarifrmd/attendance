import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store as loginStore } from '@/actions/Laravel/Fortify/Http/Controllers/AuthenticatedSessionController';
import { google as googleAuth } from '@/routes/auth';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Login({
    status,
    canRegister,
}: {
    status?: string;
    canRegister: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(loginStore.url(), {
            onFinish: () => setData('password', ''),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <Head title="Welcome Back" />
            
            {/* Background Decorations */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#e0f7fa] dark:bg-slate-800 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#effcc8] dark:bg-indigo-900/30 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm p-8 pb-10 border border-slate-100 dark:border-slate-800 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-[26px] font-bold text-slate-900 dark:text-white mb-1">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Login to access your account
                    </p>
                </div>

                <div className="flex bg-[#F8F9FA] dark:bg-slate-800 rounded-full p-1.5 mb-8 border border-slate-100 dark:border-slate-700">
                    <Link href={register()} className="flex-1 bg-transparent py-2.5 text-center text-sm font-semibold text-slate-400 dark:text-slate-500 rounded-full hover:text-slate-600 dark:hover:text-slate-300 transition">
                        Sign Up
                    </Link>
                    <button className="flex-1 bg-[#C7F25E] py-2.5 text-sm font-bold text-slate-900 rounded-full shadow-sm">
                        Log In
                    </button>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 px-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-3.5 px-5 focus:border-[#7D76F0] focus:ring-[#7D76F0] outline-none shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white text-[15px]"
                                    placeholder="Enter your email"
                                />
                                <InputError message={errors.email} className="mt-1 ml-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 px-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-3.5 pl-5 pr-12 focus:border-[#7D76F0] focus:ring-[#7D76F0] outline-none shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white text-[15px] font-mono tracking-widest"
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1 ml-2" />
                            </div>

                            <div className="flex items-center justify-between px-1 mt-1 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-950 text-[#7D76F0] focus:ring-[#7D76F0] h-4 w-4"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Remember me</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-full bg-[#C7F25E] py-4 text-[15px] font-bold text-slate-900 transition hover:bg-[#b5e04c] active:scale-95 shadow-sm flex items-center justify-center gap-2"
                            >
                                {processing && <Spinner className="h-4 w-4 border-slate-900" />}
                                Log In
                            </button>
                            
                            <div className="relative my-6 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                                </div>
                                <div className="relative bg-white dark:bg-slate-900 px-4 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    Or Sign In With
                                </div>
                            </div>

                                <a 
                                    href={googleAuth.url()} 
                                    className="col-span-2 flex items-center justify-center gap-2 rounded-full border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 py-3 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                        <path d="M1 1h22v22H1z" fill="none"/>
                                    </svg>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
                                </a>

                            {canRegister && (
                                <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mt-6">
                                    Don't have an account?{' '}
                                    <Link href={register()} className="text-[#7D76F0] font-bold hover:underline">
                                        Sign Up
                                    </Link>
                                </p>
                            )}
                </form>

                {status && (
                    <div className="absolute top-4 left-0 right-0 mx-auto w-max rounded-full bg-green-100 px-4 py-2 text-xs font-medium text-green-700 shadow-sm">
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
