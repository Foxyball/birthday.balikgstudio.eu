import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Label } from '@radix-ui/react-dropdown-menu';
import { route } from 'ziggy-js';


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: '/categories' },
];

export default function CategoriesIndex() {
    const { data, setData, post, processing, errors } = useForm({
        catName: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('categories.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="w-8/12 p-4">
                <form onSubmit={submit}>
                    <div className="gap-1.5">
                        <Label>Category name</Label>
                        <Input
                            placeholder="Category name"
                            value={data.catName}
                            onChange={(e) => setData('catName', e.target.value)}
                            className={errors.catName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                            aria-invalid={!!errors.catName}
                            aria-describedby={errors.catName ? 'catName-error' : undefined}
                        ></Input>
                        {errors.catName && (
                            <span className="text-sm text-red-600">
                                {errors.catName}
                            </span>
                        )}
                    </div>

                    <Button
                        className="mt-4"
                        type="submit"
                        disabled={processing}
                    >
                        Add Category
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
