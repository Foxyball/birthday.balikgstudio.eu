import CategoryActions from '@/components/categories/CategoryActions';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import categoriesRoutes from '@/routes/categories';
import { BreadcrumbItem, PaginatedResponse } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import React from 'react';

interface Category {
    id: number;
    name: string;
    created_at: string;
    updated_at?: string | null;
}

interface CategoriesPageProps {
    categories: PaginatedResponse<Category>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: '/categories' },
];

const formatDate = (date?: string | null) =>
    date
        ? new Date(date)
              .toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
              })
              .replace(/\//g, '.')
        : 'N/A';

export default function CategoriesIndex() {
    const { categories } = usePage<CategoriesPageProps>().props;

    const [localCategories, setLocalCategories] = React.useState(
        categories.data ?? ([] as Category[]),
    );

    const handleDelete = (categoryToDelete: Category) => {
        const previous = localCategories;
        setLocalCategories((c) =>
            c.filter((x) => x.id !== categoryToDelete.id),
        );

        router.delete(categoriesRoutes.destroy(categoryToDelete.id).url, {
            onError: () => setLocalCategories(previous),
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Categories</h1>

                    <Button
                        onClick={() =>
                            router.get(categoriesRoutes.create().url)
                        }
                    >
                        + New Category
                    </Button>
                </div>

                <Table>
                    <TableCaption>A list of categories</TableCaption>

                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {localCategories.length > 0 ? (
                            localCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        {category.id}
                                    </TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>
                                        {formatDate(category.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(category.updated_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <CategoryActions
                                            category={category}
                                            onDelete={handleDelete}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination controls */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {categories.from ?? 0} to {categories.to ?? 0}{' '}
                        of {categories.total} results
                    </div>

                    <div className="flex gap-2">
                        {categories.links.map((link, idx) => (
                            <button
                                key={idx}
                                className={`rounded px-3 py-1 ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
