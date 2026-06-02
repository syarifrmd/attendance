import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    ListChecks,
} from 'lucide-react';

interface MentorLayoutProps {
    title: string;
    children: ReactNode;
}

export default function MentorLayout({ title, children }: MentorLayoutProps) {
    const { url } = usePage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        {
            name: 'Daftar Intern',
            href: '/mentor/dashboard',
            icon: Users,
            active: url.startsWith('/mentor/dashboard'),
        },
        {
            name: 'Divisi',
            href: '/mentor/divisions',
            icon: ListChecks,
            active: url.startsWith('/mentor/divisions'),
        },
        {
            name: 'Export Laporan',
            href: '/mentor/reports',
            icon: FileText,
            active: url.startsWith('/mentor/reports'),
        },
        {
            name: 'Pengaturan',
            href: '/mentor/settings',
            icon: Settings,
            active: url.startsWith('/mentor/settings'),
        },
    ];

    return (
        <div className="flex min-h-[100dvh] bg-gray-50">
            <Head title={title} />

            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col text-white shadow-2xl md:flex dark:from-slate-900 dark:to-slate-950"
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
                            <p className="text-base font-extrabold tracking-tight text-white drop-shadow-sm">Mentor</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-0.5 px-3 py-5">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all ${
                                item.active
                                    ? 'bg-gradient-to-r from-[#fcb6c0] to-[#b490f0] text-white shadow-md'
                                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} className={item.active ? 'text-white drop-shadow-sm' : 'text-white/50 group-hover:text-white/80'} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-white/20 p-4">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                    >
                        <LogOut size={20} />
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex min-w-0 flex-1 flex-col">
                {/* Desktop Header */}
                <header className="sticky top-0 z-10 hidden items-center justify-between border-b border-gray-200 bg-white px-8 py-5 md:flex">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {title}
                    </h1>
                    <div className="flex items-center gap-2 rounded-full bg-[#f3effd] px-4 py-1 text-sm font-medium text-[#a488ea] ring-1 ring-[#d4cafc]">
                        <span>Role: Mentor</span>
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
                    <h1 className="text-lg font-bold text-gray-900">
                        {title}
                    </h1>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                    >
                        {mobileMenuOpen ? (
                            <X size={22} />
                        ) : (
                            <Menu size={22} />
                        )}
                    </button>
                </header>

                {/* Mobile Slide-Down Menu */}
                {mobileMenuOpen && (
                    <div className="border-b border-gray-200 bg-white px-4 py-3 shadow-md md:hidden">
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                        item.active
                                            ? 'bg-[#f3effd] text-[#a488ea]'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <item.icon size={18} />
                                    {item.name}
                                </Link>
                            ))}
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50"
                            >
                                <LogOut size={18} />
                                Logout
                            </Link>
                        </nav>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

