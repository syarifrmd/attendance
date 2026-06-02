import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { LayoutDashboard, ListChecks, LogOut, Menu, Users, X } from 'lucide-react';

interface AdminLayoutProps {
    title: string;
    children: ReactNode;
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
    const { url } = usePage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        {
            name: 'Daftar Intern',
            href: '/admin/interns',
            icon: Users,
            active: url.startsWith('/admin/interns'),
        },
        {
            name: 'Divisi',
            href: '/admin/divisions',
            icon: ListChecks,
            active: url.startsWith('/admin/divisions'),
        },
    ];

    return (
        <div className="flex min-h-[100dvh] bg-slate-50">
            <Head title={title} />

            <aside className="hidden w-64 flex-col bg-slate-900 text-white md:flex">
                <div className="border-b border-slate-800 p-6 text-xl font-bold tracking-tight">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard size={22} />
                        <span>Admin</span>
                    </div>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${
                                item.active
                                    ? 'bg-slate-800 text-slate-50'
                                    : 'text-slate-200 hover:bg-slate-800/50 hover:text-slate-50'
                            }`}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="border-t border-slate-800 p-4">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-rose-300 transition-colors hover:bg-rose-500/20 hover:text-rose-200"
                    >
                        <LogOut size={20} />
                        Logout
                    </Link>
                </div>
            </aside>

            <main className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-10 hidden items-center justify-between border-b border-slate-200 bg-white px-8 py-5 md:flex">
                    <h1 className="text-xl font-semibold text-slate-800">
                        {title}
                    </h1>
                    <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1 text-sm text-slate-600">
                        <span>Role: Admin</span>
                    </div>
                </header>

                <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
                    <h1 className="text-lg font-bold text-slate-900">
                        {title}
                    </h1>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </header>

                {mobileMenuOpen && (
                    <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-md md:hidden">
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                        item.active
                                            ? 'bg-slate-100 text-slate-800'
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

