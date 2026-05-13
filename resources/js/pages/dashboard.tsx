import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <>
            <Head title="Redirecting..." />
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center text-gray-400">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                    <p className="text-sm">Redirecting to dashboard...</p>
                </div>
            </div>
        </>
    );
}
