import { Head, Link } from '@inertiajs/react';
import { login, register } from '@/routes';

export default function Welcome() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#fdfbfb] via-[#fad0c4] to-[#cba3f3]">
            <Head title="Welcome" />

            {/* Decorative Flower / Lotus SVG */}
            <div className="absolute inset-0 flex items-center justify-center -translate-y-24 pointer-events-none">
                <svg
                    width="240"
                    height="240"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-40"
                >
                    {/* Center Petal */}
                    <path
                        d="M50 10C50 10 30 40 50 80C70 40 50 10 50 10Z"
                        fill="white"
                    />
                    {/* Left Petal 1 */}
                    <path
                        d="M50 80C50 80 15 65 15 35C15 15 50 80 50 80Z"
                        fill="white"
                        fillOpacity="0.8"
                    />
                    {/* Right Petal 1 */}
                    <path
                        d="M50 80C50 80 85 65 85 35C85 15 50 80 50 80Z"
                        fill="white"
                        fillOpacity="0.8"
                    />
                    {/* Left Petal 2 */}
                    <path
                        d="M50 80C50 80 5 80 5 55C5 40 50 80 50 80Z"
                        fill="white"
                        fillOpacity="0.6"
                    />
                    {/* Right Petal 2 */}
                    <path
                        d="M50 80C50 80 95 80 95 55C95 40 50 80 50 80Z"
                        fill="white"
                        fillOpacity="0.6"
                    />
                </svg>
            </div>

            {/* Bottom Card */}
            <div className="mt-auto flex flex-col items-center rounded-t-[2.5rem] bg-white px-8 pb-10 pt-12 shadow-2xl z-10 relative">
                <h1 className="mb-4 text-3xl font-bold text-slate-900 tracking-tight">
                    Welcome Back!
                </h1>

                <div className="mb-10 text-center text-[15px] font-medium text-slate-500 leading-relaxed max-w-[280px]">
                    <p className="mb-1">Hi there!</p>
                    <p>We're here to help you learn new skills.</p>
                    <p>The choice is yours; Log in or create account.</p>
                </div>

                <div className="flex w-full max-w-sm flex-col gap-4">
                    <Link
                        href={register()}
                        className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#fcb6c0] to-[#b490f0] py-4 text-[16px] font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95"
                    >
                        Create Account
                    </Link>

                    <Link
                        href={login()}
                        className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white py-4 text-[16px] font-semibold text-slate-700 shadow-sm transition-transform hover:bg-slate-50 hover:border-purple-200 active:scale-95"
                    >
                        Log In
                    </Link>
                </div>

                <p className="mt-8 text-sm font-medium text-slate-500">
                    Don't have an account?{' '}
                    <Link href={register()} className="text-[#a488ea] font-semibold hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
