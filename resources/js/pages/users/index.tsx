import UserActions from '@/components/users/UserActions';
import UserDetailsSidebar from '@/components/users/UserDetailsSidebar';
import UserFormModal from '@/components/users/UserFormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
import { BreadcrumbItem, PaginatedResponse, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowDownIcon, ArrowUpIcon, SearchIcon } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

interface Filters {
    search: string;
    sort: string;
    direction: 'asc' | 'desc';
}

interface Props {
    users: PaginatedResponse<User>;
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/users' }];

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

const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
};

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

export default function UsersIndex({ users, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');
    const [sortField, setSortField] = React.useState(filters.sort || 'created_at');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
        filters.direction || 'desc'
    );
    const [localUsers, setLocalUsers] = React.useState(users.data);
    const [togglingIds, setTogglingIds] = React.useState<Set<number>>(new Set());
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    // Modal state for create/edit
    const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        setLocalUsers(users.data);
    }, [users.data]);

    // Update selected user when localUsers changes
    React.useEffect(() => {
        if (selectedUser) {
            const updated = localUsers.find((u) => u.id === selectedUser.id);
            if (updated) {
                setSelectedUser(updated);
            }
        }
    }, [localUsers, selectedUser]);

    const handleRowClick = (user: User) => {
        setSelectedUser(user);
        setIsSidebarOpen(true);
    };

    const handleCreateNew = () => {
        setEditingUser(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsFormModalOpen(true);
    };

    const handleToggleLock = async (user: User) => {
        setTogglingIds((prev) => new Set(prev).add(user.id));
        
        // Optimistic update
        setLocalUsers((prev) =>
            prev.map((u) =>
                u.id === user.id ? { ...u, is_locked: !u.is_locked } : u
            )
        );

        try {
            const response = await fetch(route('users.toggle-lock', user.id), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success(data.message);
            } else {
                // Revert on failure
                setLocalUsers((prev) =>
                    prev.map((u) =>
                        u.id === user.id ? { ...u, is_locked: user.is_locked } : u
                    )
                );
                toast.error('Failed to update user status');
            }
        } catch {
            // Revert on error
            setLocalUsers((prev) =>
                prev.map((u) =>
                    u.id === user.id ? { ...u, is_locked: user.is_locked } : u
                )
            );
            toast.error('Failed to update user status');
        } finally {
            setTogglingIds((prev) => {
                const next = new Set(prev);
                next.delete(user.id);
                return next;
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('users.index'),
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
            route('users.index'),
            { search, sort: field, direction: newDirection },
            { preserveState: true }
        );
    };

    const handleDirectionChange = (direction: 'asc' | 'desc') => {
        setSortDirection(direction);
        router.get(
            route('users.index'),
            { search, sort: sortField, direction },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Users</h1>

                    <Button onClick={handleCreateNew}>
                        + New User
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
                                placeholder="Search by name or email..."
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
                                        route('users.index'),
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
                                <SelectItem value="email">Email</SelectItem>
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
                    <TableCaption>A list of users</TableCaption>

                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort('name')}
                            >
                                Name <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort('email')}
                            >
                                Email <SortIcon field="email" sortField={sortField} sortDirection={sortDirection} />
                            </TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Locked</TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort('created_at')}
                            >
                                Created At <SortIcon field="created_at" sortField={sortField} sortDirection={sortDirection} />
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {localUsers.length > 0 ? (
                            localUsers.map((user) => (
                                <TableRow
                                    key={user.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleRowClick(user)}
                                >
                                    <TableCell>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                                            {getInitials(user.name)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {user.name}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                Number(user.role) === 1
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                            }`}
                                        >
                                            {Number(user.role) === 1 ? 'Admin' : 'User'}
                                        </span>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Switch
                                            checked={user.is_locked}
                                            onCheckedChange={() => handleToggleLock(user)}
                                            disabled={togglingIds.has(user.id)}
                                            aria-label={user.is_locked ? 'Unlock user' : 'Lock user'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(user.created_at)}
                                    </TableCell>
                                    <TableCell
                                        className="text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <UserActions user={user} onEdit={handleEdit} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination controls */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {users.from ?? 0} to {users.to ?? 0} of{' '}
                        {users.total} results
                    </div>

                    <div className="flex gap-2">
                        {users.links.map((link, idx) => (
                            <button
                                key={idx}
                                className={`rounded px-3 py-1 ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                }`}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <UserDetailsSidebar
                user={selectedUser}
                open={isSidebarOpen}
                onOpenChange={setIsSidebarOpen}
                onToggleLock={handleToggleLock}
                onEdit={handleEdit}
                isTogglingLock={selectedUser ? togglingIds.has(selectedUser.id) : false}
            />

            <UserFormModal
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                user={editingUser}
            />
        </AppLayout>
    );
}
