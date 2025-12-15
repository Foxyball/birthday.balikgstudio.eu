import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import categoriesRoutes from '@/routes/categories';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs = (id: number, name: string): BreadcrumbItem[] => [
    { title: 'Categories', href: '/categories' },
    { title: name, href: `/categories/${id}` },
    { title: 'Edit', href: `/categories/${id}/edit` },
];

export default function EditCategory({ category }: { category: { id: number; name: string } }) {
    const [name, setName] = useState(category.name || '');
    const [processing] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(categoriesRoutes.update(category.id).url, { name });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(category.id, category.name)}>
            <Head title={`Edit Category: ${category.name}`} />

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
                        Update
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
