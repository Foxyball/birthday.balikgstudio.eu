import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, UploadIcon } from 'lucide-react';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';
import React from 'react';

type Category = {
    id: number;
    name: string;
};

type Contact = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    birthday: string;
    image?: string | null;
    image_url?: string | null;
    category_id: number;
};

export default function Edit({
    contact,
    categories,
}: {
    contact: Contact;
    categories: Category[];
}) {
    const { data, setData, put, processing, errors, setError, clearErrors } = useForm<{
        name: string;
        email: string;
        phone: string;
        birthday: string;
        image: File | null;
        category_id: number;
    }>({
        name: contact.name,
        email: contact.email,
        phone: contact.phone ?? '',
        birthday: contact.birthday,
        image: null,
        category_id: contact.category_id,
    });

    const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);

    const months = React.useMemo(
        () => [
            { value: '1', label: 'January' },
            { value: '2', label: 'February' },
            { value: '3', label: 'March' },
            { value: '4', label: 'April' },
            { value: '5', label: 'May' },
            { value: '6', label: 'June' },
            { value: '7', label: 'July' },
            { value: '8', label: 'August' },
            { value: '9', label: 'September' },
            { value: '10', label: 'October' },
            { value: '11', label: 'November' },
            { value: '12', label: 'December' },
        ],
        [],
    );

    const parseBirthday = (b: string | undefined) => {
        if (!b) return { year: '', month: '', day: '' };
        const [y, m, d] = b.split('-');
        const monthNormalized = m ? String(Number(m)) : '';
        const dayNormalized = d ?? '';
        return { year: y ?? '', month: monthNormalized, day: dayNormalized };
    };

    const initial = React.useMemo(() => parseBirthday(data.birthday), [data.birthday]);
    const [birthMonth, setBirthMonth] = React.useState<string>(initial.month);
    const [birthDay, setBirthDay] = React.useState<string>(initial.day);
    const [birthYear, setBirthYear] = React.useState<string>(initial.year);

    const pad2 = (n: string | number) => String(n).padStart(2, '0');
    const DEFAULT_YEAR = '2000';
    const daysInMonth = (year: number, month1to12: number) => new Date(year, month1to12, 0).getDate();

    React.useEffect(() => {
        // Clamp day within valid range when month/year change
        const y = Number(birthYear || DEFAULT_YEAR);
        const m = Number(birthMonth || 1);
        const maxDay = daysInMonth(y, m);
        const dNum = Number(birthDay || 0);
        if (dNum > maxDay) {
            setBirthDay(String(maxDay));
        }
        // Compose and sync to form data when month and day present
        if (birthMonth && birthDay) {
            const yearForStorage = birthYear || DEFAULT_YEAR;
            const composed = `${yearForStorage}-${pad2(birthMonth)}-${pad2(birthDay)}`;
            setData('birthday', composed);
        } else {
            setData('birthday', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [birthMonth, birthDay, birthYear]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name);
        formData.append('category_id', String(data.category_id));
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('birthday', data.birthday);
        if (data.image) {
            formData.append('image', data.image);
        }

        router.post(route('contacts.update', contact.id), formData, {
            forceFormData: true,
            onProgress: (progress) => {
                if (progress.percentage) {
                    setUploadProgress(progress.percentage);
                }
            },
            onFinish: () => {
                setUploadProgress(null);
            },
            onError: (errors) => {
                Object.entries(errors).forEach(([key, value]) => {
                    setError(key as keyof typeof data, value as string);
                });
            },
        });
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Contacts', href: '/contacts' },
                {
                    title: `Edit Contact`,
                    href: `/contacts/${contact.id}/edit`,
                },
            ]}
        >
            <Head title={`Edit Contact: ${contact.name}`} />

            <form onSubmit={submit} encType="multipart/form-data" className="max-w-xl space-y-4 p-4">
                {/* Contact name */}
                <div className="gap-1.5">
                    <Label htmlFor="name">Contact name</Label>
                    <Input
                        id="name"
                        placeholder="Contact name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className={errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                        aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                        <span className="text-sm text-red-600">{errors.name}</span>
                    )}
                </div>

                {/* Category */}
                <div className="gap-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select
                        value={String(data.category_id)}
                        onValueChange={(value) => setData('category_id', Number(value))}
                    >
                        <SelectTrigger id="category" className={errors.category_id ? 'border-red-500 focus:ring-red-500' : ''}>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category_id && (
                        <span className="text-sm text-red-600">{errors.category_id}</span>
                    )}
                </div>

                {/* Email */}
                <div className="gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className={errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.email && (
                        <span className="text-sm text-red-600">{errors.email}</span>
                    )}
                </div>

                {/* Phone */}
                <div className="gap-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="Phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className={errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.phone && (
                        <span className="text-sm text-red-600">{errors.phone}</span>
                    )}
                </div>

                {/* Birthday – Month / Day / Year (optional) */}
                <div className="gap-1.5">
                    <Label htmlFor="birthday-month">Birthday</Label>
                    <div className={cn('flex items-center gap-2', errors.birthday && 'aria-[invalid=true]:border-red-500')} aria-invalid={!!errors.birthday}>
                        <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Select value={birthMonth} onValueChange={(value) => setBirthMonth(value)}>
                            <SelectTrigger id="birthday-month" className="w-40">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            id="birthday-day"
                            inputMode="numeric"
                            pattern="^[0-9]*$"
                            placeholder="Day"
                            className="w-24"
                            value={birthDay}
                            onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, '');
                                setBirthDay(v);
                            }}
                        />
                        <Input
                            id="birthday-year"
                            inputMode="numeric"
                            pattern="^[0-9]*$"
                            placeholder="Year (optional)"
                            className="w-36"
                            value={birthYear}
                            onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, '');
                                setBirthYear(v);
                            }}
                        />
                    </div>
                    {errors.birthday && (
                        <span className="text-sm text-red-600">{errors.birthday}</span>
                    )}
                </div>

                {/* Image */}
                <div className="gap-1.5">
                    <Label htmlFor="image">Image</Label>
                    {contact.image_url && (
                        <div className="mb-2 flex items-center gap-3">
                            <img
                                src={contact.image_url}
                                alt={`${contact.name} current image`}
                                className="h-16 w-16 rounded object-cover border"
                            />
                            <span className="text-sm text-muted-foreground">
                                Current image. Upload a new file to replace.
                            </span>
                        </div>
                    )}
                    <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setData('image', e.target.files?.[0] ?? null)}
                    />
                    <span className="text-xs text-muted-foreground">
                        Note: Browsers don’t allow pre-filling file inputs for security. The current image is shown above.
                    </span>
                    {errors.image && (
                        <span className="text-sm text-red-600">{errors.image}</span>
                    )}
                </div>

                {/* Upload Progress */}
                {uploadProgress !== null && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UploadIcon className="h-4 w-4 animate-pulse" />
                            <span>Uploading... {Math.round(uploadProgress)}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={processing || uploadProgress !== null}>
                        {uploadProgress !== null ? 'Uploading...' : 'Update Contact'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.visit(route('contacts.index'))}>
                        Cancel
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
