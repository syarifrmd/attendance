import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
    Users,
    ListChecks,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    ChevronRight,
    Megaphone,
} from 'lucide-react';

interface ManagerLayoutProps {
    title: string;
    children: ReactNode;
}

export default function ManagerLayout({ title, children }: ManagerLayoutProps) {
    const { url } = usePage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        {
            name: 'Daftar Intern',
            href: '/mentor/interns',
            icon: Users,
            active: url.startsWith('/mentor/interns'),
        },
        {
            name: 'Divisi',
            href: '/mentor/divisions',
            icon: ListChecks,
            active: url.startsWith('/mentor/divisions'),
        },
        {
            name: 'Pengumuman',
            href: '/mentor/announcements',
            icon: Megaphone,
            active: url.startsWith('/mentor/announcements'),
        },
    ];

    return (
        <div className="flex min-h-[100dvh] bg-slate-50/60 dark:bg-slate-900">
            <Head title={title} />

            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-shrink-0 flex-col bg-gradient-to-b from-indigo-900 to-indigo-950 text-white shadow-xl md:flex dark:from-indigo-950 dark:to-slate-950">
                <div className="border-b border-indigo-800/60 p-6 dark:border-indigo-900/40">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/30 backdrop-blur">
                            <LayoutDashboard size={20} className="text-indigo-200" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-indigo-400">Panel</p>
                            <p className="text-base font-bold text-white tracking-tight">Manajemen</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-5">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                item.active
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-indigo-300 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <item.icon size={18} className={item.active ? 'text-indigo-200' : 'text-indigo-400 group-hover:text-indigo-200'} />
                            {item.name}
                            {item.active && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-indigo-800/60 p-3 dark:border-indigo-900/40">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
                    >
                        <LogOut size={18} />
                        Keluar
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex min-w-0 flex-1 flex-col">
                {/* Desktop Header */}
                <header className="sticky top-0 z-10 hidden items-center justify-between border-b border-slate-200/80 bg-white/80 px-8 py-4 backdrop-blur-md md:flex dark:border-slate-800/80 dark:bg-slate-900/80">
                    <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h1>
                    <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20">
                        <LayoutDashboard size={13} />
                        Panel Manajemen
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:hidden dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                            <LayoutDashboard size={14} className="text-white" />
                        </div>
                        <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h1>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </header>

                {/* Mobile Slide-Down Menu */}
                {mobileMenuOpen && (
                    <div className="border-b border-slate-100 bg-white px-4 py-3 shadow-sm md:hidden dark:border-slate-800 dark:bg-slate-900">
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                        item.active
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <item.icon size={17} />
                                    {item.name}
                                </Link>
                            ))}
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                            >
                                <LogOut size={17} />
                                Keluar
                            </Link>
                        </nav>
                    </div>
                )}

                <div className="flex-1 p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
