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
            <aside className="hidden w-64 flex-col bg-indigo-900 text-white md:flex">
                <div className="border-b border-indigo-800 p-6 text-xl font-bold tracking-tight">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard size={22} />
                        <span>Mentor</span>
                    </div>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${
                                item.active
                                    ? 'bg-indigo-800 text-indigo-50'
                                    : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-indigo-50'
                            }`}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="border-t border-indigo-800 p-4">
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

            {/* Main Content Area */}
            <main className="flex min-w-0 flex-1 flex-col">
                {/* Desktop Header */}
                <header className="sticky top-0 z-10 hidden items-center justify-between border-b border-gray-200 bg-white px-8 py-5 md:flex">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {title}
                    </h1>
                    <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1 text-sm text-gray-600">
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
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-50'
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
