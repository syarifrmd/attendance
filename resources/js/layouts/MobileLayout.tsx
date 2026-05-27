import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import BottomNav from '@/components/PWA/BottomNav';

interface MobileLayoutProps {
    title: string;
    children: ReactNode;
    showBottomNav?: boolean;
}

export default function MobileLayout({
    title,
    children,
    showBottomNav = true,
}: MobileLayoutProps) {
    return (
        <div className="min-h-[100dvh] bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
            <Head title={title} />
            <main className="mx-auto w-full max-w-lg bg-white dark:bg-slate-900 min-h-[100dvh] shadow-sm px-4 pt-4 pb-24 text-gray-900 dark:text-slate-100 transition-colors duration-200">
                {children}
            </main>

            {showBottomNav && <BottomNav />}
        </div>
    );
}

