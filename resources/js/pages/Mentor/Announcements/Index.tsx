import { Head, router } from '@inertiajs/react';
import ManagerLayout from '@/layouts/ManagerLayout';
import { useState, useRef } from 'react';
import { Megaphone, Plus, Trash2, X, FileText, Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

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

// Custom Zero-Dependency, React 19 & SSR safe Rich Text Editor
function RichEditor({ 
    onChange, 
    placeholder, 
    editorKey 
}: { 
    onChange: (val: string) => void; 
    placeholder: string;
    editorKey: string;
}) {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleCommand = (command: string) => {
        document.execCommand(command, false);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white text-slate-900 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center gap-1 bg-slate-50 border-b border-slate-200 p-1.5 flex-wrap">
                <button
                    type="button"
                    onClick={() => handleCommand('bold')}
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-700 hover:text-slate-900"
                    title="Bold"
                >
                    <Bold size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => handleCommand('italic')}
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-700 hover:text-slate-900"
                    title="Italic"
                >
                    <Italic size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => handleCommand('underline')}
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-700 hover:text-slate-900"
                    title="Underline"
                >
                    <Underline size={14} />
                </button>
                <span className="w-[1px] h-4 bg-slate-300 mx-1" />
                <button
                    type="button"
                    onClick={() => handleCommand('insertUnorderedList')}
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-700 hover:text-slate-900"
                    title="Bullet List"
                >
                    <List size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => handleCommand('insertOrderedList')}
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-700 hover:text-slate-900"
                    title="Numbered List"
                >
                    <ListOrdered size={14} />
                </button>
            </div>

            {/* Editable Content */}
            <div
                key={editorKey}
                ref={editorRef}
                contentEditable
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
                className="rich-editor-content w-full min-h-[140px] max-h-[220px] overflow-y-auto p-3 outline-none text-sm leading-relaxed"
                placeholder={placeholder}
            />

            <style>{`
                .rich-editor-content:empty:before {
                    content: attr(placeholder);
                    color: #94a3b8;
                    cursor: text;
                }
            `}</style>
        </div>
    );
}

export default function AnnouncementsIndex({ announcements, divisions }: { announcements: Announcement[], divisions: Division[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editorResetKey, setEditorResetKey] = useState(0);
    const [addForm, setAddForm] = useState<{
        title: string;
        content: string;
        division_id: string;
        attachment: File | null;
    }>({ title: '', content: '', division_id: '', attachment: null });
    const [addLoading, setAddLoading] = useState(false);

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        router.post('/mentor/announcements', {
            title: addForm.title,
            content: addForm.content,
            division_id: addForm.division_id || null,
            attachment: addForm.attachment,
        }, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setAddForm({ title: '', content: '', division_id: '', attachment: null });
                setEditorResetKey(prev => prev + 1);
                setAddLoading(false);
            },
            onError: () => setAddLoading(false),
        });
    };

    const deleteAnnouncement = (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;
        router.delete(`/mentor/announcements/${id}`);
    };

    const handleOpenModal = () => {
        setAddForm({ title: '', content: '', division_id: '', attachment: null });
        setEditorResetKey(prev => prev + 1);
        setIsAddModalOpen(true);
    };

    return (
        <ManagerLayout title="Pengumuman">
            <Head title="Pengumuman" />

            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Megaphone className="text-[#a488ea] dark:text-[#b49ef5]" /> Pengumuman
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Kelola pengumuman untuk seluruh intern atau divisi tertentu.
                        </p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#a488ea] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#8b6fe0] transition-colors dark:bg-[#a488ea] dark:hover:bg-[#a488ea]"
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
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${announcement.division_id ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-[#e8e0fc] text-[#7c64d5] dark:bg-[#f3effd]0/20 dark:text-[#b49ef5]'}`}>
                                            {announcement.division_id ? `Divisi ${announcement.division?.name}` : 'Semua Divisi'}
                                        </span>
                                    </div>
                                    <button onClick={() => deleteAnnouncement(announcement.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">{announcement.title}</h3>
                                <div 
                                    className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3 rich-content"
                                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                                />
                                
                                <style>{`
                                    .rich-content ul { list-style-type: disc; margin-left: 1rem; }
                                    .rich-content ol { list-style-type: decimal; margin-left: 1rem; }
                                    .rich-content strong { font-weight: bold; }
                                `}</style>

                                {announcement.attachment_url && (
                                    <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                                        <a 
                                            href={announcement.attachment_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-[#a488ea] dark:text-[#b49ef5] hover:underline font-semibold"
                                        >
                                            <FileText size={14} />
                                            <span className="truncate max-w-[180px]">{announcement.attachment_name}</span>
                                        </a>
                                    </div>
                                )}
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
                        <form onSubmit={submitAdd} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Target Divisi</label>
                                <select
                                    value={addForm.division_id}
                                    onChange={e => setAddForm({ ...addForm, division_id: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#a488ea] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#a488ea] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    placeholder="Contoh: Jadwal Libur Lebaran"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Isi Pengumuman *</label>
                                <RichEditor
                                    editorKey={editorResetKey.toString()}
                                    onChange={(val) => setAddForm({ ...addForm, content: val })}
                                    placeholder="Tuliskan detail pengumuman terformat..."
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Lampiran Berkas (Gambar/Dokumen - Opsional)</label>
                                <input
                                    type="file"
                                    onChange={e => setAddForm({ ...addForm, attachment: e.target.files ? e.target.files[0] : null })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#a488ea] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 file:mr-4 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#f3effd] file:text-[#7c64d5] hover:file:bg-[#e8e0fc] dark:file:bg-slate-700 dark:file:text-[#b49ef5]"
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                                />
                                <p className="mt-1 text-[10px] text-slate-400">Format: JPG, PNG, PDF, Word, Excel. Maksimal 5MB.</p>
                            </div>
                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Batal</button>
                                <button type="submit" disabled={addLoading} className="rounded-xl bg-[#a488ea] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8b6fe0] disabled:opacity-50 dark:bg-[#a488ea] dark:hover:bg-[#a488ea]">
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

