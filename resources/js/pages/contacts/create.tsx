import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Label } from '@radix-ui/react-dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

                    {/* Birthday – dropdown caption date picker */}
                    <div className="gap-1.5 mb-3">
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
                                    {data.birthday
                                        ? new Date(data.birthday).toLocaleDateString()
                                        : 'Select date'}
                                    <ChevronDownIcon className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    captionLayout="dropdown"
                                    selected={data.birthday ? new Date(data.birthday) : undefined}
                                    onSelect={(date: Date | undefined) => {
                                        setData('birthday', date ? format(date, 'yyyy-MM-dd') : '')
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        {errors.birthday && (
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
