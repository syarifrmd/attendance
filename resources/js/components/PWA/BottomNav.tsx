import { Link, usePage } from '@inertiajs/react';
import { Home, ScanFace, User } from 'lucide-react';

export default function BottomNav() {
    const { url } = usePage();

    const navItems = [
        {
            name: 'Home',
            icon: Home,
            href: '/intern/dashboard',
            active: url.startsWith('/intern/dashboard'),
        },
        {
            name: 'Absen',
            icon: ScanFace,
            href: '/intern/attendance/create',
            active: url.startsWith('/intern/attendance/create'),
            isPrimary: true,
        },
        {
            name: 'Profil',
            icon: User,
            href: '/intern/profile',
            active: url.startsWith('/intern/profile'),
        },
    ];

    return (
        <nav
            className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 border-t border-slate-100 bg-white/95 backdrop-blur-lg transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/95"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
        >
            <div className="flex items-center justify-around px-4 py-1">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    if (item.isPrimary) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative -top-5 flex flex-col items-center"
                            >
                                <div
                                    className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 ring-4 ring-white dark:ring-slate-900 ${
                                        item.active
                                            ? 'bg-gradient-to-br from-[#f9a0b0] to-[#9c76e8] shadow-purple-300 dark:shadow-purple-950/50'
                                            : 'bg-gradient-to-br from-[#fcb6c0] to-[#b490f0] shadow-pink-200 dark:shadow-purple-900/40'
                                    }`}
                                >
                                    <Icon size={26} className="text-white" />
                                </div>
                                <span className="mt-0.5 text-[10px] font-semibold text-[#a488ea] dark:text-[#b49ef5]">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 transition-colors ${
                                item.active
                                    ? 'text-[#a488ea] dark:text-[#b49ef5]'
                                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                            }`}
                        >
                            <Icon
                                size={22}
                                className={item.active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}
                            />
                            <span className={`text-[10px] ${item.active ? 'font-semibold' : 'font-medium'}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
