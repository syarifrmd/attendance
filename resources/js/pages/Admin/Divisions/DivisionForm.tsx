import { Form } from '@inertiajs/react';
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

export type DivisionFormValues = {
    id?: string;
    name?: string;
    description?: string | null;
    start_time?: string;
    end_time?: string;
    work_days?: string[];
    mentor_name?: string | null;
};

export default function DivisionForm({
    form,
    values,
    submitLabel,
}: {
    form: Record<string, unknown>;
    values?: DivisionFormValues;
    submitLabel: string;
}) {
    const selectedDays = values?.work_days ?? [];

    return (
        <Form {...form} className="space-y-6">
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama divisi</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={values?.name ?? ''}
                            placeholder="Contoh: IT Support"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={values?.description ?? ''}
                            placeholder="Ringkasan tugas divisi"
                            className="min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="start_time">Jam masuk</Label>
                            <Input
                                id="start_time"
                                name="start_time"
                                type="time"
                                defaultValue={values?.start_time ?? '08:00'}
                                required
                            />
                            <InputError message={errors.start_time} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end_time">Jam keluar</Label>
                            <Input
                                id="end_time"
                                name="end_time"
                                type="time"
                                defaultValue={values?.end_time ?? '16:00'}
                                required
                            />
                            <InputError message={errors.end_time} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Hari kerja</Label>
                        <div className="flex flex-wrap gap-2">
                            {dayOptions.map((day) => (
                                <label
                                    key={day.value}
                                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
                                >
                                    <input
                                        type="checkbox"
                                        name="work_days[]"
                                        value={day.value}
                                        defaultChecked={selectedDays.includes(day.value)}
                                        className="h-4 w-4 rounded border-slate-300 text-slate-700"
                                    />
                                    {day.label}
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.work_days} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="mentor_name">Nama mentor (opsional)</Label>
                            <Input
                                id="mentor_name"
                                name="mentor_name"
                                defaultValue={values?.mentor_name ?? ''}
                                placeholder="Nama mentor divisi"
                            />
                            <InputError message={errors.mentor_name} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {submitLabel}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
