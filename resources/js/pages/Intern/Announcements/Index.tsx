import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileLayout from '@/layouts/MobileLayout';
import { ArrowLeft, Megaphone, Download, FileText, CheckCheck, Clock, User } from 'lucide-react';

interface Division {
    id: string;
    name: string;
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    division_id: string | null;
    created_at: string;
    attachment_path: string | null;
    attachment_name: string | null;
    attachment_url: string | null;
    division?: Division;
    author?: { name: string };
}

interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: string;
    data: {
        announcement_id: string;
        title: string;
        excerpt: string;
        author_name: string;
        division_id: string | null;
        created_at: string;
    };
    read_at: string | null;
    created_at: string;
}

interface PageProps {
    announcements: Announcement[];
    notifications: Notification[];
}

export default function AnnouncementsIndex({ announcements = [], notifications = [] }: PageProps) {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    // Filter unread notifications
    const unreadNotifications = notifications.filter((n) => !n.read_at);
    const unreadCount = unreadNotifications.length;

    // Helper to find notification associated with an announcement
    const getNotificationForAnnouncement = (announcementId: string) => {
        return notifications.find((n) => n.data.announcement_id === announcementId);
    };

    const handleMarkAllRead = () => {
        router.post('/intern/notifications/mark-all-read', {}, {
            preserveScroll: true,
        });
    };

    const handleAnnouncementClick = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);

        // Find if there is an unread notification for this announcement
        const notif = getNotificationForAnnouncement(announcement.id);
        if (notif && !notif.read_at) {
            router.post(`/intern/notifications/${notif.id}/mark-read`, {}, {
                preserveScroll: true,
            });
        }
    };

    // Helper to strip HTML tags for card preview
    const getExcerpt = (html: string) => {
        if (!html) return '';
        const plain = html.replace(/<[^>]*>?/gm, '');
        return plain.length > 120 ? plain.substring(0, 120) + '...' : plain;
    };

    // Helper to check if file is image
    const isImageFile = (filename: string | null) => {
        if (!filename) return false;
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
    };

    return (
        <MobileLayout title="Pengumuman" showBottomNav={true}>
            <Head title="Pengumuman" />

            {/* Sticky Header */}
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                <Link
                    href="/intern/dashboard"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-base font-bold text-gray-900 dark:text-slate-100">
                    Pengumuman
                </h1>
                <div className="w-9" /> {/* Spacer */}
            </div>

            {/* Sub-header / Actions */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Megaphone className="text-indigo-500 dark:text-[#b49ef5]" size={18} />
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                        {announcements.length} Pengumuman Tersedia
                    </span>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1 rounded-lg bg-[#f3effd] px-2.5 py-1.5 text-[10px] font-bold text-[#a488ea] hover:bg-[#e8e0fc] dark:bg-[#f3effd]0/10 dark:text-[#b49ef5] dark:hover:bg-[#f3effd]0/20 transition-colors"
                    >
                        <CheckCheck size={12} />
                        Tandai semua dibaca
                    </button>
                )}
            </div>

            {/* Unified Announcements Feed */}
            <div className="space-y-4">
                {announcements.map((item) => {
                    const notif = getNotificationForAnnouncement(item.id);
                    const isUnread = notif && !notif.read_at;

                    return (
                        <div
                            key={item.id}
                            onClick={() => handleAnnouncementClick(item)}
                            className={`group relative cursor-pointer rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
                                isUnread
                                    ? 'border-[#d4cafc] bg-[#f3effd]/10 dark:border-indigo-500/20 dark:bg-[#f3effd]0/5'
                                    : 'border-gray-100 bg-white dark:border-slate-800/80 dark:bg-slate-900'
                            }`}
                        >
                            {/* Blue Dot Indicator for Unread */}
                            {isUnread && (
                                <span className="absolute right-4 top-4 flex h-2 w-2 rounded-full bg-[#a488ea] dark:bg-indigo-400 animate-pulse" />
                            )}

                            <div className="mb-3 flex items-center gap-2">
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                        item.division_id
                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                                            : 'bg-[#e8e0fc] text-[#7c64d5] dark:bg-[#f3effd]0/20 dark:text-[#b49ef5]'
                                    }`}
                                >
                                    {item.division_id ? `Divisi ${item.division?.name}` : 'Semua Divisi'}
                                </span>
                                
                                {isUnread && (
                                    <span className="rounded-full bg-[#a488ea] px-2 py-0.5 text-[9px] font-extrabold uppercase text-white dark:bg-[#a488ea] tracking-wider">
                                        Baru
                                    </span>
                                )}
                            </div>

                            <h2 className={`mb-2 text-sm font-bold transition-colors group-hover:text-[#a488ea] dark:group-hover:text-[#b49ef5] ${
                                isUnread ? 'text-gray-900 dark:text-slate-100 font-extrabold' : 'text-gray-800 dark:text-slate-200'
                            }`}>
                                {item.title}
                            </h2>

                            {/* Short Excerpt instead of Raw HTML */}
                            <p className="mb-4 text-xs text-gray-500 dark:text-slate-400 line-clamp-2">
                                {getExcerpt(item.content)}
                            </p>

                            {/* Small Attachment Preview Icon */}
                            {item.attachment_url && (
                                <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-gray-50/50 p-2 dark:bg-slate-800/40 border border-gray-100/30 dark:border-slate-800/30 text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                                    <FileText size={12} className="text-indigo-500 dark:text-[#b49ef5]" />
                                    <span className="truncate max-w-[200px]">{item.attachment_name}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-gray-50 dark:border-slate-800/60 pt-3 text-[10px] text-gray-400 dark:text-slate-500">
                                <div className="flex items-center gap-1">
                                    <User size={10} />
                                    <span>{item.author?.name || 'Mentor'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={10} />
                                    <span>
                                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {announcements.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-gray-100 py-16 text-center text-gray-400 dark:border-slate-800/60 dark:text-slate-500">
                        <Megaphone className="mx-auto mb-3 text-gray-300 dark:text-slate-700" size={36} />
                        <p className="text-xs font-medium">Belum ada pengumuman untuk Anda.</p>
                    </div>
                )}
            </div>

            {/* Announcement Detail Overlay Modal */}
            {selectedAnnouncement && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4 backdrop-blur-sm transition-all duration-300"
                    onClick={() => setSelectedAnnouncement(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl dark:bg-slate-900 max-h-[85dvh] flex flex-col animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-slate-800/80">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                                Detail Pengumuman
                            </h3>
                            <button
                                onClick={() => setSelectedAnnouncement(null)}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                            >
                                Tutup
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                    selectedAnnouncement.division_id
                                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                                        : 'bg-[#e8e0fc] text-[#7c64d5] dark:bg-[#f3effd]0/20 dark:text-[#b49ef5]'
                                }`}>
                                    {selectedAnnouncement.division_id ? `Divisi ${selectedAnnouncement.division?.name}` : 'Semua Divisi'}
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                    <Clock size={10} />
                                    {new Date(selectedAnnouncement.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>

                            <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100">
                                {selectedAnnouncement.title}
                            </h2>

                            {/* Styled HTML Rich Text */}
                            <div
                                className="rich-content text-xs leading-relaxed text-gray-600 dark:text-slate-300 border-t border-gray-50 pt-3 dark:border-slate-800/60 animate-in fade-in duration-300"
                                dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                            />

                            {/* Style block for Rich Text */}
                            <style>{`
                                .rich-content ul { list-style-type: disc; margin-left: 1.25rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
                                .rich-content ol { list-style-type: decimal; margin-left: 1.25rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
                                .rich-content p { margin-bottom: 0.5rem; }
                                .rich-content strong { font-weight: bold; color: inherit; }
                                .rich-content em { font-style: italic; }
                                .rich-content a { color: #4f46e5; text-decoration: underline; }
                            `}</style>

                            {/* File Attachment in Modal */}
                            {selectedAnnouncement.attachment_url && (
                                <div className="mt-4 border-t border-gray-50 pt-3 dark:border-slate-800/60">
                                    {isImageFile(selectedAnnouncement.attachment_name) ? (
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                                                Lampiran Gambar
                                            </span>
                                            <div className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-slate-800">
                                                <img
                                                    src={selectedAnnouncement.attachment_url}
                                                    alt={selectedAnnouncement.attachment_name || 'Lampiran'}
                                                    className="w-full object-contain max-h-[30vh]"
                                                />
                                                <a
                                                    href={selectedAnnouncement.attachment_url}
                                                    download={selectedAnnouncement.attachment_name || 'image'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                                                >
                                                    <Download size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-slate-800/40 border border-gray-100/50 dark:border-slate-800/50">
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f3effd] text-[#a488ea] dark:bg-[#f3effd]0/10 dark:text-[#b49ef5]">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="truncate text-xs font-semibold text-gray-800 dark:text-slate-200">
                                                        {selectedAnnouncement.attachment_name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        Dokumen Lampiran
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={selectedAnnouncement.attachment_url}
                                                download={selectedAnnouncement.attachment_name || 'document'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:text-[#a488ea] dark:hover:text-[#b49ef5] shadow-sm transition-colors border border-gray-100 dark:border-slate-700"
                                            >
                                                <Download size={14} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="border-t border-gray-50 pt-3 dark:border-slate-800/60 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                                <div className="h-6 w-6 rounded-full bg-[#e8e0fc] dark:bg-[#f3effd]0/20 text-[#a488ea] dark:text-[#b49ef5] flex items-center justify-center font-bold text-[10px]">
                                    {selectedAnnouncement.author?.name ? selectedAnnouncement.author.name[0].toUpperCase() : 'M'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-700 dark:text-slate-300 text-[11px] leading-tight">
                                        {selectedAnnouncement.author?.name || 'Mentor'}
                                    </span>
                                    <span className="text-[9px] text-gray-400 leading-none">
                                        Pengirim Pengumuman
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MobileLayout>
    );
}

