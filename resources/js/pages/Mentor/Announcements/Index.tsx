import { Head, router } from '@inertiajs/react';
import ManagerLayout from '@/layouts/ManagerLayout';
import { useState } from 'react';
import { Megaphone, Plus, Trash2, X } from 'lucide-react';

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
    division?: Division;
    author?: { name: string };
}

export default function AnnouncementsIndex({ announcements, divisions }: { announcements: Announcement[], divisions: Division[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ title: '', content: '', division_id: '' });
    const [addLoading, setAddLoading] = useState(false);

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        router.post('/mentor/announcements', {
            title: addForm.title,
            content: addForm.content,
            division_id: addForm.division_id || null,
        }, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setAddForm({ title: '', content: '', division_id: '' });
                setAddLoading(false);
            },
            onError: () => setAddLoading(false),
        });
    };

    const deleteAnnouncement = (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;
        router.delete(`/mentor/announcements/${id}`);
    };

    return (
        <ManagerLayout title="Pengumuman">
            <Head title="Pengumuman" />

            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Megaphone className="text-indigo-600 dark:text-indigo-400" /> Pengumuman
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Kelola pengumuman untuk seluruh intern atau divisi tertentu.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                        <Plus size={18} />
                        Tambah Pengumuman
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-2">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${announcement.division_id ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'}`}>
                                            {announcement.division_id ? `Divisi ${announcement.division?.name}` : 'Semua Divisi'}
                                        </span>
                                    </div>
                                    <button onClick={() => deleteAnnouncement(announcement.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">{announcement.title}</h3>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                                    {announcement.content}
                                </p>
                            </div>
                            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 flex justify-between items-center">
                                <span>{new Date(announcement.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span>{announcement.author?.name}</span>
                            </div>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            Belum ada pengumuman yang dibuat.
                        </div>
                    )}
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Buat Pengumuman Baru</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={submitAdd} className="p-6 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Target Divisi</label>
                                <select
                                    value={addForm.division_id}
                                    onChange={e => setAddForm({ ...addForm, division_id: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                >
                                    <option value="">Semua Divisi (Global)</option>
                                    {divisions.map(d => (
                                        <option key={d.id} value={d.id}>Divisi {d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Judul Pengumuman *</label>
                                <input
                                    type="text"
                                    required
                                    value={addForm.title}
                                    onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    placeholder="Contoh: Jadwal Libur Lebaran"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Isi Pengumuman *</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={addForm.content}
                                    onChange={e => setAddForm({ ...addForm, content: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    placeholder="Tuliskan detail pengumuman..."
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Batal</button>
                                <button type="submit" disabled={addLoading} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                                    {addLoading ? 'Menyimpan...' : 'Sebarkan Pengumuman'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ManagerLayout>
    );
}
