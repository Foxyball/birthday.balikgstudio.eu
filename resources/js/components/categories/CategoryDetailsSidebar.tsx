import { DetailsSidebar, BaseRecord } from '@/components/ui/details-sidebar';
import { router } from '@inertiajs/react';
import categories from '@/routes/categories';
import { FolderIcon } from 'lucide-react';

export interface Category extends BaseRecord {
    id: number;
    name: string;
    created_at: string;
    updated_at?: string | null;
}

interface CategoryDetailsSidebarProps {
    category: Category | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete?: (category: Category) => void;
}

export default function CategoryDetailsSidebar({
    category,
    open,
    onOpenChange,
    onDelete,
}: CategoryDetailsSidebarProps) {
    if (!category) return null;

    const handleEdit = () => {
        router.get(categories.edit(category.id).url);
    };

    return (
        <DetailsSidebar
            record={category}
            open={open}
            onOpenChange={onOpenChange}
            onEdit={handleEdit}
            onDelete={onDelete}
            entityName="category"
            showAvatar={true}
            sections={[
                {
                    title: 'Category Information',
                    fields: [
                        {
                            icon: FolderIcon,
                            label: 'Name',
                            value: category.name,
                        },
                    ],
                },
            ]}
        />
    );
}
