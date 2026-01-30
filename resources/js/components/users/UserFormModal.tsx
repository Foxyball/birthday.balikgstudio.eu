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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { User } from '@/types';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

interface UserFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null;
    onSuccess?: () => void;
}

export default function UserFormModal({
    open,
    onOpenChange,
    user,
    onSuccess,
}: UserFormModalProps) {
    const isEditing = !!user;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        role: user ? String(user.role) : '0',
    });

    useEffect(() => {
        if (open) {
            setData({
                name: user?.name ?? '',
                email: user?.email ?? '',
                password: '',
                password_confirmation: '',
                role: user ? String(user.role) : '0',
            });
            clearErrors();
        } else {
            reset();
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, user]);

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

        if (isEditing && user) {
            put(route('users.update', user.id), options);
        } else {
            post(route('users.store'), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit User' : 'New User'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the user details below.'
                            : 'Create a new user account.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Full name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={errors.name ? 'border-destructive' : ''}
                            aria-invalid={!!errors.name}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email address"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={errors.email ? 'border-destructive' : ''}
                            aria-invalid={!!errors.email}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Password{' '}
                            {isEditing ? (
                                <span className="text-muted-foreground font-normal">
                                    (leave blank to keep current)
                                </span>
                            ) : (
                                <span className="text-destructive">*</span>
                            )}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder={isEditing ? 'New password' : 'Password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className={errors.password ? 'border-destructive' : ''}
                            aria-invalid={!!errors.password}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">
                            Confirm Password{' '}
                            {!isEditing && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            placeholder="Confirm password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className={errors.password_confirmation ? 'border-destructive' : ''}
                            aria-invalid={!!errors.password_confirmation}
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm text-destructive">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={data.role}
                            onValueChange={(value) => setData('role', value)}
                        >
                            <SelectTrigger
                                id="role"
                                className={errors.role ? 'border-destructive' : ''}
                            >
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">User</SelectItem>
                                <SelectItem value="1">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-sm text-destructive">{errors.role}</p>
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
