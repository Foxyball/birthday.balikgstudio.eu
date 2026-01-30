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
import { Spinner } from '@/components/ui/spinner';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

export interface Category {
    id: number;
    name: string;
    created_at: string;
    updated_at?: string | null;
}

interface CategoryFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category | null;
    onSuccess?: () => void;
}

export default function CategoryFormModal({
    open,
    onOpenChange,
    category,
    onSuccess,
}: CategoryFormModalProps) {
    const isEditing = !!category;

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm({
        name: category?.name ?? '',
    });

    useEffect(() => {
        if (open) {
            setData('name', category?.name ?? '');
            clearErrors();
        } else {
            reset();
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                reset();
                onSuccess?.();
            },
        };

        if (isEditing && category) {
            put(route('categories.update', category.id), options);
        } else {
            transform((formData) => ({
                catName: formData.name,
            }));
            post(route('categories.store'), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Category' : 'New Category'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the category details below.'
                            : 'Create a new category for organizing your contacts.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Category name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Enter category name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={errors.name ? 'border-destructive' : ''}
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? 'name-error' : undefined}
                            autoFocus
                        />
                        {errors.name && (
                            <p id="name-error" className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner className="mr-2 h-4 w-4" />}
                            {isEditing ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
