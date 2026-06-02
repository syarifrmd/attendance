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
            <aside className="hidden w-64 flex-shrink-0 flex-col text-white shadow-2xl md:flex dark:from-slate-900 dark:to-slate-950"
                style={{ background: 'linear-gradient(160deg, #5c42b5 0%, #3a257c 100%)' }}
            >
                {/* Brand Header */}
                <div className="border-b border-white/25 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/25 shadow-inner backdrop-blur-sm ring-1 ring-white/30">
                            <LayoutDashboard size={20} className="text-white drop-shadow-sm" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">Panel</p>
                            <p className="text-base font-extrabold tracking-tight text-white drop-shadow-sm">Manajemen</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-0.5 px-3 py-5">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                                item.active
                                    ? 'bg-gradient-to-r from-[#fcb6c0] to-[#b490f0] text-white shadow-md'
                                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <item.icon size={18} className={item.active ? 'text-white drop-shadow-sm' : 'text-white/50 group-hover:text-white/80'} />
                            {item.name}
                            {item.active && <ChevronRight size={14} className="ml-auto text-white/70" />}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-white/20 p-3">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/15 hover:text-white"
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
                    <div className="flex items-center gap-2 rounded-full bg-[#f3effd] px-4 py-1.5 text-xs font-medium text-[#a488ea] ring-1 ring-[#d4cafc] dark:bg-[#a488ea]/10 dark:text-[#b49ef5] dark:ring-[#a488ea]/20">
                        <LayoutDashboard size={13} />
                        Panel Manajemen
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:hidden dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#fcb6c0] to-[#b490f0]">
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
                                            ? 'bg-[#f3effd] text-[#a488ea] dark:bg-[#a488ea]/10 dark:text-[#b49ef5]'
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

