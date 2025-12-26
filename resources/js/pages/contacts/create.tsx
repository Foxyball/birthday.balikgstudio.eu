import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Label } from '@radix-ui/react-dropdown-menu';
import { CalendarIcon } from 'lucide-react';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';
import React from 'react';

type Category = {
    id: number;
    name: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contacts', href: '/contacts' },
];

export default function Contacts({
    categories,
}: {
    categories: Category[];
}) {
    const { data, setData, post, processing, errors } = useForm<{
        contactName: string;
        categoryID: number | null;
        email: string;
        phone: string;
        birthday: string;
        image: File | null;
    }>({
        contactName: '',
        categoryID: null,
        email: '',
        phone: '',
        birthday: '',
        image: null,
    });

    // Birthday fields and validation
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

    const pad2 = (n: string | number) => String(n).padStart(2, '0');
    const DEFAULT_YEAR = '2000';
    const daysInMonth = (year: number, month1to12: number) => new Date(year, month1to12, 0).getDate();

    const [birthMonth, setBirthMonth] = React.useState<string>('');
    const [birthDay, setBirthDay] = React.useState<string>('');
    const [birthYear, setBirthYear] = React.useState<string>('');

    const isBirthdayValid = React.useMemo(() => {
        if (!birthMonth || !birthDay) return false;
        const y = Number(birthYear || DEFAULT_YEAR);
        const m = Number(birthMonth);
        const d = Number(birthDay);
        if (d < 1) return false;
        return d <= daysInMonth(y, m);
    }, [birthMonth, birthDay, birthYear]);

    React.useEffect(() => {
        // Clamp and validate day
        const y = Number(birthYear || DEFAULT_YEAR);
        const m = Number(birthMonth || 1);
        const maxDay = daysInMonth(y, m);
        const dNum = Number(birthDay || 0);
        if (dNum > maxDay) {
            setBirthDay(String(maxDay));
        }

        // Compose birthday when valid; otherwise clear
        if (isBirthdayValid) {
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
        post(route('contacts.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contacts" />

            <div className="w-8/12 p-4">
                <form onSubmit={submit} encType="multipart/form-data">
                    {/* Contact name */}
                    <div className="gap-1.5 mb-3">
                        <Label>Contact name</Label>
                        <Input
                            placeholder="Contact name"
                            value={data.contactName}
                            onChange={(e) =>
                                setData('contactName', e.target.value)
                            }
                            className={
                                errors.contactName
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : ''
                            }
                        />
                        {errors.contactName && (
                            <span className="text-sm text-red-600">
                                {errors.contactName}
                            </span>
                        )}
                    </div>

                    {/* Category */}
                    <div className="gap-1.5 mb-3">
                        <Label>Category</Label>

                        <Select
                            value={
                                data.categoryID !== null
                                    ? String(data.categoryID)
                                    : undefined
                            }
                            onValueChange={(value) =>
                                setData('categoryID', Number(value))
                            }
                        >
                            <SelectTrigger
                                className={
                                    errors.categoryID
                                        ? 'border-red-500 focus:ring-red-500'
                                        : ''
                                }
                            >
                                <SelectValue placeholder="No category" />
                            </SelectTrigger>

                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {errors.categoryID && (
                            <span className="text-sm text-red-600">
                                {errors.categoryID}
                            </span>
                        )}
                    </div>

                    {/* Email */}
                    <div className="gap-1.5 mb-3">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            placeholder="Email"
                            value={data.email}
                            onChange={(e) =>
                                setData('email', e.target.value)
                            }
                        />
                        {errors.email && (
                            <span className="text-sm text-red-600">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="gap-1.5 mb-3">
                        <Label>Phone</Label>
                        <Input
                            type="tel"
                            placeholder="Phone"
                            value={data.phone}
                            onChange={(e) =>
                                setData('phone', e.target.value)
                            }
                        />
                        {errors.phone && (
                            <span className="text-sm text-red-600">
                                {errors.phone}
                            </span>
                        )}
                    </div>

                    {/* Birthday – Month / Day / Year (optional) */}
                    <div className="gap-1.5 mb-3">
                        <Label>Birthday</Label>
                        <div className={cn('flex items-center gap-2', (errors.birthday) && 'aria-[invalid=true]:border-red-500')} aria-invalid={!!errors.birthday}>
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <Select value={birthMonth} onValueChange={(value) => setBirthMonth(value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                inputMode="numeric"
                                pattern="^[0-9]*$"
                                placeholder="Day"
                                className="w-24"
                                value={birthDay}
                                onChange={(e) => {
                                    const v = e.target.value.replace(/[^0-9]/g, '');
                                    setBirthDay(v);
                                }}
                                onBlur={() => {
                                    const y = Number(birthYear || DEFAULT_YEAR);
                                    const m = Number(birthMonth || 1);
                                    const maxDay = daysInMonth(y, m);
                                    const d = Math.max(1, Math.min(Number(birthDay || 0), maxDay));
                                    setBirthDay(String(d));
                                }}
                            />
                            <Input
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
                        {(errors.birthday) && (
                            <span className="text-sm text-red-600">
                                {errors.birthday}
                            </span>
                        )}
                    </div>

                    {/* Image */}
                    <div className="gap-1.5 mb-3">
                        <Label>Image</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData(
                                    'image',
                                    e.target.files?.[0] ?? null
                                )
                            }
                        />
                        {errors.image && (
                            <span className="text-sm text-red-600">
                                {errors.image}
                            </span>
                        )}
                    </div>

                    <Button
                        className="mt-4"
                        type="submit"
                        disabled={processing}
                    >
                        Add Contact
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
