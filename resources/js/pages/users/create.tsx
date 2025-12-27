import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
    { title: 'Create', href: '/users/create' },
];

export default function UsersCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '0',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('users.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="max-w-md p-4">
                <h1 className="mb-6 text-xl font-semibold">Create New User</h1>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            placeholder="Full name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
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
                            <span
                                id="name-error"
                                className="text-sm text-red-600"
                            >
                                {errors.name}
                            </span>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email address"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={
                                errors.email
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : ''
                            }
                            aria-invalid={!!errors.email}
                            aria-describedby={
                                errors.email ? 'email-error' : undefined
                            }
                        />
                        {errors.email && (
                            <span
                                id="email-error"
                                className="text-sm text-red-600"
                            >
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className={
                                errors.password
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : ''
                            }
                            aria-invalid={!!errors.password}
                            aria-describedby={
                                errors.password ? 'password-error' : undefined
                            }
                        />
                        {errors.password && (
                            <span
                                id="password-error"
                                className="text-sm text-red-600"
                            >
                                {errors.password}
                            </span>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation">
                            Confirm Password <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            placeholder="Confirm password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            className={
                                errors.password_confirmation
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : ''
                            }
                            aria-invalid={!!errors.password_confirmation}
                            aria-describedby={
                                errors.password_confirmation
                                    ? 'password_confirmation-error'
                                    : undefined
                            }
                        />
                        {errors.password_confirmation && (
                            <span
                                id="password_confirmation-error"
                                className="text-sm text-red-600"
                            >
                                {errors.password_confirmation}
                            </span>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={data.role}
                            onValueChange={(value) => setData('role', value)}
                        >
                            <SelectTrigger
                                id="role"
                                className={
                                    errors.role
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : ''
                                }
                            >
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">User</SelectItem>
                                <SelectItem value="1">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <span
                                id="role-error"
                                className="text-sm text-red-600"
                            >
                                {errors.role}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={processing}>
                            Create User
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(route('users.index'))}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
