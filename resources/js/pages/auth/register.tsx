import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store as registerStore } from '@/actions/Laravel/Fortify/Http/Controllers/RegisteredUserController';
import { google as googleAuth } from '@/routes/auth';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(registerStore.url(), {
            onFinish: () => setData('password', ''),
        });
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#fdfbfb] via-[#fad0c4] to-[#cba3f3] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Head title="Get Started Now" />

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

            {/* Bottom Card — scrollable for tall forms */}
            <div className="relative z-10 mt-auto flex flex-col items-center rounded-t-[2.5rem] bg-white px-8 pb-10 pt-10 shadow-2xl dark:bg-slate-900">
                <div className="mb-8 text-center">
                    <h1 className="mb-1 text-[26px] font-bold text-slate-900 dark:text-white">
                        Get Started Now
                    </h1>
                    <p className="max-w-xs mx-auto text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        Create an account or log in to explore about our app
                    </p>
                </div>

                {/* Tab Switch */}
                <div className="mb-8 flex w-full max-w-sm rounded-full border border-slate-100 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-800">
                    <button className="brand-tab-active flex-1 rounded-full py-2.5 text-sm font-bold">
                        Sign Up
                    </button>
                    <Link href={login()} className="flex-1 rounded-full py-2.5 text-center text-sm font-semibold text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                        Log In
                    </Link>
                </div>

                <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block px-1 text-xs font-medium text-slate-700 dark:text-slate-300">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={data.name.split(' ')[0] || ''}
                                onChange={(e) => {
                                    const lastName = data.name.split(' ').slice(1).join(' ');
                                    setData('name', `${e.target.value} ${lastName}`.trim());
                                }}
                                required
                                autoFocus
                                className="input-brand py-3.5 px-5 text-[14px]"
                                placeholder="Budi"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block px-1 text-xs font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={data.name.split(' ').slice(1).join(' ') || ''}
                                onChange={(e) => {
                                    const firstName = data.name.split(' ')[0] || '';
                                    setData('name', `${firstName} ${e.target.value}`.trim());
                                }}
                                className="input-brand py-3.5 px-5 text-[14px]"
                                placeholder="Santoso"
                            />
                        </div>
                    </div>
                    <InputError message={errors.name} className="-mt-2.5 ml-2" />

                    <div>
                        <label className="mb-2 block px-1 text-xs font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            className="input-brand py-3.5 px-5 text-[14px]"
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} className="mt-1 ml-2" />
                    </div>

                    <div>
                        <label className="mb-2 block px-1 text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                className="input-brand py-3.5 pl-5 pr-12 text-[15px] font-mono tracking-widest"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#a488ea] dark:text-slate-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1 ml-2" />
                    </div>

                    <div>
                        <label className="mb-2 block px-1 text-xs font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                className="input-brand py-3.5 pl-5 pr-12 text-[15px] font-mono tracking-widest"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#a488ea] dark:text-slate-500"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1 ml-2" />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-brand mt-4 flex w-full items-center justify-center gap-2 py-4 text-[15px]"
                    >
                        {processing && <Spinner className="h-4 w-4 border-white" />}
                        Sign Up
                    </button>

                    <div className="relative my-2 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                        </div>
                        <div className="relative bg-white px-4 text-xs font-medium uppercase tracking-wider text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                            Or Sign Up With
                        </div>
                    </div>

                    <a
                        href={googleAuth.url()}
                        className="flex items-center justify-center gap-2 rounded-full border border-slate-100 bg-white py-3 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800"
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

                    <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link href={login()} className="font-bold text-[#a488ea] hover:underline">
                            Log In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
