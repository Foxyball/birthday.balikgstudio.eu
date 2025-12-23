import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
 
import { ChevronDownIcon } from 'lucide-react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
    category_id: number;
};

export default function Edit({
    contact,
    categories,
}: {
    contact: Contact;
    categories: Category[];
}) {
    const { data, setData, put, processing, errors } = useForm<{
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

    function submit(e: React.FormEvent) {
        e.preventDefault();
        // For file uploads, inertia will set FormData automatically when a File is present
        put(route('contacts.update', contact.id));
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

                {/* Birthday – dropdown caption date picker */}
                <div className="gap-1.5">
                    <Label htmlFor="birthday">Birthday</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="birthday"
                                variant="outline"
                                className={cn(
                                    'w-60 justify-between font-normal',
                                    !data.birthday && 'text-muted-foreground',
                                    errors.birthday && 'border-red-500'
                                )}
                            >
                                {data.birthday ? new Date(data.birthday).toLocaleDateString() : 'Select date'}
                                <ChevronDownIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                selected={data.birthday ? new Date(data.birthday) : undefined}
                                onSelect={(date: Date | undefined) =>
                                    setData('birthday', date ? format(date, 'yyyy-MM-dd') : '')
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.birthday && (
                        <span className="text-sm text-red-600">{errors.birthday}</span>
                    )}
                </div>

                {/* Image */}
                <div className="gap-1.5">
                    <Label htmlFor="image">Image</Label>
                    {contact.image && (
                        <div className="mb-2 flex items-center gap-3">
                            <img
                                src={contact.image}
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

                <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={processing}>
                        Update Contact
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.visit(route('contacts.index'))}>
                        Cancel
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
