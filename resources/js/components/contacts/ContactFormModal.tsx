import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { router, useForm } from '@inertiajs/react';
import { CalendarIcon, UploadIcon } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

export interface Category {
    id: number;
    name: string;
}

export interface Contact {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    birthday: string;
    image?: string | null;
    image_url?: string | null;
    category_id?: number | null;
    notes?: string | null;
    gift_ideas?: string | null;
}

interface ContactFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contact?: Contact | null;
    categories: Category[];
    onSuccess?: () => void;
}

export default function ContactFormModal({
    open,
    onOpenChange,
    contact,
    categories,
    onSuccess,
}: ContactFormModalProps) {
    const isEditing = !!contact;

    const { data, setData, processing, errors, reset, clearErrors, setError } = useForm<{
        name: string;
        email: string;
        phone: string;
        birthday: string;
        category_id: number | null;
        image: File | null;
        notes: string;
        gift_ideas: string;
    }>({
        name: contact?.name ?? '',
        email: contact?.email ?? '',
        phone: contact?.phone ?? '',
        birthday: contact?.birthday ?? '',
        category_id: contact?.category_id ?? null,
        image: null,
        notes: contact?.notes ?? '',
        gift_ideas: contact?.gift_ideas ?? '',
    });

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    // Birthday handling
    const months = useMemo(
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
        []
    );

    const pad2 = (n: string | number) => String(n).padStart(2, '0');
    const DEFAULT_YEAR = '2000';
    const daysInMonth = (year: number, month1to12: number) =>
        new Date(year, month1to12, 0).getDate();

    const parseBirthday = (b: string | undefined) => {
        if (!b) return { year: '', month: '', day: '' };
        const [y, m, d] = b.split('-');
        const monthNormalized = m ? String(Number(m)) : '';
        const dayNormalized = d ?? '';
        return { year: y ?? '', month: monthNormalized, day: dayNormalized };
    };

    const [birthMonth, setBirthMonth] = useState<string>('');
    const [birthDay, setBirthDay] = useState<string>('');
    const [birthYear, setBirthYear] = useState<string>('');

    // Reset form when modal opens/closes or contact changes
    useEffect(() => {
        if (open) {
            const initial = parseBirthday(contact?.birthday);
            setData({
                name: contact?.name ?? '',
                email: contact?.email ?? '',
                phone: contact?.phone ?? '',
                birthday: contact?.birthday ?? '',
                category_id: contact?.category_id ?? null,
                image: null,
                notes: contact?.notes ?? '',
                gift_ideas: contact?.gift_ideas ?? '',
            });
            setBirthMonth(initial.month);
            setBirthDay(initial.day);
            setBirthYear(initial.year);
            clearErrors();
        } else {
            reset();
            clearErrors();
            setBirthMonth('');
            setBirthDay('');
            setBirthYear('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, contact]);

    // Update birthday when month/day/year changes
    useEffect(() => {
        const y = Number(birthYear || DEFAULT_YEAR);
        const m = Number(birthMonth || 1);
        const maxDay = daysInMonth(y, m);
        const dNum = Number(birthDay || 0);
        if (dNum > maxDay) {
            setBirthDay(String(maxDay));
        }

        if (birthMonth && birthDay) {
            const yearForStorage = birthYear || DEFAULT_YEAR;
            const composed = `${yearForStorage}-${pad2(birthMonth)}-${pad2(birthDay)}`;
            setData('birthday', composed);
        } else {
            setData('birthday', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [birthMonth, birthDay, birthYear]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        if (isEditing) {
            formData.append('_method', 'PUT');
            formData.append('name', data.name);
            if (data.category_id !== null) {
                formData.append('category_id', String(data.category_id));
            }
        } else {
            formData.append('contactName', data.name);
            if (data.category_id !== null) {
                formData.append('categoryID', String(data.category_id));
            }
        }
        
        if (data.email) formData.append('email', data.email);
        if (data.phone) formData.append('phone', data.phone);
        formData.append('birthday', data.birthday);
        if (data.image) formData.append('image', data.image);
        if (data.notes) formData.append('notes', data.notes);
        if (data.gift_ideas) formData.append('gift_ideas', data.gift_ideas);

        const routeName = isEditing && contact
            ? route('contacts.update', contact.id)
            : route('contacts.store');

        router.post(routeName, formData, {
            forceFormData: true,
            onProgress: (progress) => {
                if (progress?.percentage) {
                    setUploadProgress(progress.percentage);
                }
            },
            onSuccess: () => {
                onOpenChange(false);
                reset();
                onSuccess?.();
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
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Contact' : 'New Contact'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the contact details below.'
                            : 'Add a new contact to your birthday list.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Contact name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Contact name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={errors.name ? 'border-destructive' : ''}
                            aria-invalid={!!errors.name}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={data.category_id !== null ? String(data.category_id) : undefined}
                            onValueChange={(value) => setData('category_id', Number(value))}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="No category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email address"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="Phone number"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className={errors.phone ? 'border-destructive' : ''}
                        />
                        {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone}</p>
                        )}
                    </div>

                    {/* Birthday */}
                    <div className="space-y-2">
                        <Label>
                            Birthday <span className="text-destructive">*</span>
                        </Label>
                        <div
                            className={cn(
                                'flex items-center gap-2',
                                errors.birthday && 'aria-[invalid=true]:border-destructive'
                            )}
                            aria-invalid={!!errors.birthday}
                        >
                            <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Select value={birthMonth} onValueChange={setBirthMonth}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                inputMode="numeric"
                                pattern="^[0-9]*$"
                                placeholder="Day"
                                className="w-20"
                                value={birthDay}
                                onChange={(e) => {
                                    const v = e.target.value.replace(/[^0-9]/g, '');
                                    setBirthDay(v);
                                }}
                                onBlur={() => {
                                    const y = Number(birthYear || DEFAULT_YEAR);
                                    const m = Number(birthMonth || 1);
                                    const maxDay = daysInMonth(y, m);
                                    const d = Math.max(
                                        1,
                                        Math.min(Number(birthDay || 0), maxDay)
                                    );
                                    setBirthDay(String(d));
                                }}
                            />
                            <Input
                                inputMode="numeric"
                                pattern="^[0-9]*$"
                                placeholder="Year"
                                className="w-24"
                                value={birthYear}
                                onChange={(e) => {
                                    const v = e.target.value.replace(/[^0-9]/g, '');
                                    setBirthYear(v);
                                }}
                            />
                        </div>
                        {errors.birthday && (
                            <p className="text-sm text-destructive">{errors.birthday}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Personal notes about this contact..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={2}
                        />
                        {errors.notes && (
                            <p className="text-sm text-destructive">{errors.notes}</p>
                        )}
                    </div>

                    {/* Gift Ideas */}
                    <div className="space-y-2">
                        <Label htmlFor="gift_ideas">Gift Ideas</Label>
                        <Textarea
                            id="gift_ideas"
                            placeholder="Gift ideas for this person..."
                            value={data.gift_ideas}
                            onChange={(e) => setData('gift_ideas', e.target.value)}
                            rows={2}
                        />
                        {errors.gift_ideas && (
                            <p className="text-sm text-destructive">{errors.gift_ideas}</p>
                        )}
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Photo</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('image', e.target.files?.[0] ?? null)}
                        />
                        {errors.image && (
                            <p className="text-sm text-destructive">{errors.image}</p>
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

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing || uploadProgress !== null}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || uploadProgress !== null}>
                            {(processing || uploadProgress !== null) && (
                                <Spinner className="mr-2 h-4 w-4" />
                            )}
                            {uploadProgress !== null
                                ? 'Uploading...'
                                : isEditing
                                  ? 'Update'
                                  : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
