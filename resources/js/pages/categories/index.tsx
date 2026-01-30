import CategoryActions from '@/components/categories/CategoryActions';
import CategoryDetailsSidebar, { Category } from '@/components/categories/CategoryDetailsSidebar';
import CategoryFormModal from '@/components/categories/CategoryFormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { BreadcrumbItem, PaginatedResponse, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDownIcon, ArrowUpIcon, SearchIcon } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

interface Filters {
    search: string;
    sort: string;
    direction: 'asc' | 'desc';
}

interface Props extends SharedData {
    categories: PaginatedResponse<Category>;
    filters: Filters;
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

const SortIcon = ({
    field,
    sortField,
    sortDirection,
}: {
    field: string;
    sortField: string;
    sortDirection: 'asc' | 'desc';
}) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
        <ArrowUpIcon className="ml-1 inline h-4 w-4" />
    ) : (
        <ArrowDownIcon className="ml-1 inline h-4 w-4" />
    );
};

export default function CategoriesIndex() {
    const { categories, filters } = usePage<Props>().props;

    const [search, setSearch] = React.useState(filters.search || '');
    const [sortField, setSortField] = React.useState(filters.sort || 'created_at');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
        filters.direction || 'desc'
    );

    const [localCategories, setLocalCategories] = React.useState(
        categories.data ?? ([] as Category[]),
    );

    // Sidebar state for category details
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    // Modal state for create/edit
    const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

    const handleRowClick = (category: Category) => {
        setSelectedCategory(category);
        setIsSidebarOpen(true);
    };

    React.useEffect(() => {
        setLocalCategories(categories.data ?? []);
    }, [categories.data]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('categories.index'),
            { search, sort: sortField, direction: sortDirection },
            { preserveState: true }
        );
    };

    const handleSort = (field: string) => {
        const newDirection =
            sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
        router.get(
            route('categories.index'),
            { search, sort: field, direction: newDirection },
            { preserveState: true }
        );
    };

    const handleDirectionChange = (direction: 'asc' | 'desc') => {
        setSortDirection(direction);
        router.get(
            route('categories.index'),
            { search, sort: sortField, direction },
            { preserveState: true }
        );
    };

    const handleDelete = (categoryToDelete: Category) => {
        const previous = localCategories;
        setLocalCategories((c) =>
            c.filter((x) => x.id !== categoryToDelete.id),
        );

        // Close sidebar if the deleted category was selected
        if (selectedCategory?.id === categoryToDelete.id) {
            setIsSidebarOpen(false);
            setSelectedCategory(null);
        }

        router.delete(categoriesRoutes.destroy(categoryToDelete.id).url, {
            onError: () => setLocalCategories(previous),
            preserveScroll: true,
            preserveState: false,
        });
    };

    const handleCreateNew = () => {
        setEditingCategory(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsFormModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Categories</h1>

                    <Button
                        onClick={handleCreateNew}
                    >
                        + New Category
                    </Button>
                </div>

                {/* Search and Sort Controls */}
                <div className="flex flex-wrap items-center gap-4">
                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2"
                    >
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64 pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                        {search && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setSearch('');
                                    router.get(
                                        route('categories.index'),
                                        { sort: sortField, direction: sortDirection },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </form>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Sort by:
                        </span>
                        <Select value={sortField} onValueChange={handleSort}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="created_at">
                                    Created At
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={sortDirection}
                            onValueChange={(value) =>
                                handleDirectionChange(value as 'asc' | 'desc')
                            }
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Direction" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Ascending</SelectItem>
                                <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Table>
                    <TableCaption>A list of categories</TableCaption>

                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort('name')}
                            >
                                Category <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort('created_at')}
                            >
                                Created At <SortIcon field="created_at" sortField={sortField} sortDirection={sortDirection} />
                            </TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {localCategories.length > 0 ? (
                            localCategories.map((category) => (
                                <TableRow 
                                    key={category.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleRowClick(category)}
                                >
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
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <CategoryActions
                                            category={category}
                                            onDelete={handleDelete}
                                            onEdit={handleEdit}
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

            {/* Category Details Sidebar */}
            <CategoryDetailsSidebar
                category={selectedCategory}
                open={isSidebarOpen}
                onOpenChange={setIsSidebarOpen}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />

            {/* Category Form Modal */}
            <CategoryFormModal
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                category={editingCategory}
            />
        </AppLayout>
    );
}
