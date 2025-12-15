import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import categoriesRoutes from '@/routes/categories';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: '/categories' },
    { title: 'Create', href: '/categories/create' },
];

export default function CreateCategory() {
    const [name, setName] = useState('');
    const [processing] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(categoriesRoutes.store().url, {
            name,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />

            <form onSubmit={submit} className="max-w-md space-y-4">
                <div>
                    <Label htmlFor="name">Category name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>
                        Create
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.get(categoriesRoutes.index().url)}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
