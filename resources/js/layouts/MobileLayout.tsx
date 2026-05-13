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
        <div className="min-h-[100dvh] bg-gray-50">
            <Head title={title} />
            <main className="mx-auto w-full max-w-lg bg-white min-h-[100dvh] shadow-sm px-4 pt-4 pb-24">
                {children}
            </main>

            {showBottomNav && <BottomNav />}
        </div>
    );
}
