import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Category {
    id: number;
    name: string;
}

interface Props {
    category: Category;
}

export default function Edit({ category }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('categories.update', category.id));
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: `Edit Category`,
                    href: `/categories/${category.id}/edit`,
                },
            ]}
        >
            <Head title={`Edit Category: ${category.name}`} />

            <form onSubmit={handleUpdate} className="max-w-md space-y-4">
                <div>
                    <Label htmlFor="name">Category name <span className="text-red-500">*</span></Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        className={
                            errors.name
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : ''
                        }
                        aria-invalid={!!errors.name}
                        aria-describedby={
                            errors.name ? 'name-error' : undefined
                        }
                    />
                    {errors.name && (
                        <span id="name-error" className="text-sm text-red-600">
                            {errors.name}
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>
                        Update Category
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(route('categories.index'))}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
