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
            className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 border-t border-gray-100 bg-white/95 backdrop-blur-lg"
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
                                    className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 ${
                                        item.active
                                            ? 'bg-indigo-600 shadow-indigo-300'
                                            : 'bg-indigo-500 shadow-indigo-200'
                                    } ring-4 ring-white`}
                                >
                                    <Icon size={26} className="text-white" />
                                </div>
                                <span className="mt-0.5 text-[10px] font-semibold text-indigo-600">
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
                                    ? 'text-indigo-600'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <Icon
                                size={22}
                                className={
                                    item.active
                                        ? 'stroke-[2.5px]'
                                        : 'stroke-[1.5px]'
                                }
                            />
                            <span
                                className={`text-[10px] ${item.active ? 'font-semibold' : 'font-medium'}`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
