import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const dayOptions = [
    { value: 'mon', label: 'Senin' },
    { value: 'tue', label: 'Selasa' },
    { value: 'wed', label: 'Rabu' },
    { value: 'thu', label: 'Kamis' },
    { value: 'fri', label: 'Jumat' },
    { value: 'sat', label: 'Sabtu' },
    { value: 'sun', label: 'Minggu' },
];

interface Division {
    id: string;
    name: string;
    description?: string | null;
    start_time: string;
    end_time: string;
    work_days: string[];
    internship_duration_days: number;
    mentor_name?: string | null;
}

export default function AdminDivisionEdit({ division }: { division: Division }) {
    const { data, setData, put, processing, errors } = useForm({
        name: division.name ?? '',
        description: division.description ?? '',
        start_time: (division.start_time ?? '08:00').slice(0, 5),
        end_time: (division.end_time ?? '17:00').slice(0, 5),
        work_days: division.work_days ?? [],
        internship_duration_days: division.internship_duration_days ?? 90,
        mentor_name: division.mentor_name ?? '',
    });

    const toggleDay = (day: string) => {
        setData('work_days', data.work_days.includes(day)
            ? data.work_days.filter((d) => d !== day)
            : [...data.work_days, day]);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/divisions/${division.id}`);
    };

    return (
        <AdminLayout title="Edit Divisi">
            <Head title="Edit Divisi" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Edit Divisi</h2>
                    <p className="text-sm text-slate-500">Perbarui aturan jam kerja divisi.</p>
                </div>
                <Link href="/admin/divisions" className="text-sm font-semibold text-slate-600 hover:text-slate-800">
                    Kembali
                </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama divisi</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <textarea
                            id="description"
                            value={data.description ?? ''}
                            onChange={(e) => setData('description', e.target.value)}
                            className="min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="start_time">Jam masuk</Label>
                            <Input id="start_time" type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} required />
                            <InputError message={errors.start_time} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end_time">Jam keluar</Label>
                            <Input id="end_time" type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} required />
                            <InputError message={errors.end_time} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Hari kerja</Label>
                        <div className="flex flex-wrap gap-2">
                            {dayOptions.map((day) => (
                                <label
                                    key={day.value}
                                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                                        data.work_days.includes(day.value)
                                            ? 'border-slate-400 bg-slate-100 text-slate-800'
                                            : 'border-slate-200 bg-white text-slate-700'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.work_days.includes(day.value)}
                                        onChange={() => toggleDay(day.value)}
                                        className="h-4 w-4 rounded border-slate-300"
                                    />
                                    {day.label}
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.work_days} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="internship_duration_days">Durasi magang (hari)</Label>
                            <Input id="internship_duration_days" type="number" min={1} value={data.internship_duration_days} onChange={(e) => setData('internship_duration_days', Number(e.target.value))} required />
                            <InputError message={errors.internship_duration_days} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mentor_name">Nama mentor (opsional)</Label>
                            <Input id="mentor_name" value={data.mentor_name ?? ''} onChange={(e) => setData('mentor_name', e.target.value)} placeholder="Nama mentor divisi" />
                            <InputError message={errors.mentor_name} />
                        </div>
                    </div>

                    <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                </form>
            </div>
        </AdminLayout>
    );
}
