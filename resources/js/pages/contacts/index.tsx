import ContactActions from '@/components/contacts/ContactActions';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import contactsRoutes from '@/routes/contacts';
import { BreadcrumbItem, PaginatedResponse, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import React from 'react';
import { useClipboard } from '@/hooks/use-clipboard';
import { Copy, Check, Plus, Download, Printer, X, SearchIcon, ArrowUpIcon, ArrowDownIcon, Sparkles} from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { route } from 'ziggy-js';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Contact {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    birthday?: string;
    category_id?: number;
    status: boolean;
    image?: string | null;
    image_url?: string | null;
    created_at: string;
    updated_at?: string | null;
}

interface Filters {
    search: string;
    sort: string;
    direction: 'asc' | 'desc';
}

interface Props extends SharedData {
    contacts: PaginatedResponse<Contact>;
    filters: Filters;
    canAddContact: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contacts', href: '/contacts' },
];

const formatBirthday = (date?: string | null) =>
    date
        ? new Date(date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
          })
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

export default function ContactsIndex() {
    const { contacts, filters, canAddContact, auth } = usePage<Props>().props;

    const [search, setSearch] = React.useState(filters.search || '');
    const [sortField, setSortField] = React.useState(filters.sort || 'created_at');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
        filters.direction || 'desc'
    );

    const [localContacts, setLocalContacts] = React.useState(
        contacts.data ?? ([] as Contact[]),
    );
    const [togglingIds, setTogglingIds] = React.useState<Set<number>>(new Set());

    React.useEffect(() => {
        setLocalContacts(contacts.data ?? []);
    }, [contacts.data]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('contacts.index'),
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
            route('contacts.index'),
            { search, sort: field, direction: newDirection },
            { preserveState: true }
        );
    };

    const handleDirectionChange = (direction: 'asc' | 'desc') => {
        setSortDirection(direction);
        router.get(
            route('contacts.index'),
            { search, sort: sortField, direction },
            { preserveState: true }
        );
    };

    const handleToggleStatus = async (contact: Contact) => {
        setTogglingIds((prev) => new Set(prev).add(contact.id));
        
        // Optimistic update
        setLocalContacts((prev) =>
            prev.map((c) =>
                c.id === contact.id ? { ...c, status: !c.status } : c
            )
        );

        try {
            const response = await fetch(route('contacts.toggle-status', contact.id), {
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
                setLocalContacts((prev) =>
                    prev.map((c) =>
                        c.id === contact.id ? { ...c, status: contact.status } : c
                    )
                );
                toast.error('Failed to update contact status');
            }
        } catch {
            // Revert on error
            setLocalContacts((prev) =>
                prev.map((c) =>
                    c.id === contact.id ? { ...c, status: contact.status } : c
                )
            );
            toast.error('Failed to update contact status');
        } finally {
            setTogglingIds((prev) => {
                const next = new Set(prev);
                next.delete(contact.id);
                return next;
            });
        }
    };

    const [, copy] = useClipboard();
    const [justCopiedPhone, setJustCopiedPhone] = React.useState<string | null>(null);
    const handleCopyPhone = React.useCallback(async (phone: string) => {
        const ok = await copy(phone);
        if (ok) {
            setJustCopiedPhone(phone);
            toast.success('Phone number copied to clipboard');
            window.setTimeout(() => setJustCopiedPhone(null), 1500);
        } else {
            toast.error('Failed to copy phone number');
        }
    }, [copy]);

    const handleDelete = (contactToDelete: Contact) => {
        const previous = localContacts;
        setLocalContacts((c) => c.filter((x) => x.id !== contactToDelete.id));

        router.delete(contactsRoutes.destroy(contactToDelete.id).url, {
            onError: () => setLocalContacts(previous),
            preserveScroll: true,
        });
    };

    const [isExportOpen, setIsExportOpen] = React.useState(false);
    const handlePrint = React.useCallback(() => {
        window.print();
    }, []);

    const handleConfirmExport = React.useCallback(() => {
        try {
            // Use server-side export for all contacts with proper encoding
            window.location.href = route('contacts.export');
            toast.success('CSV export started');
        } catch {
            toast.error('Failed to export CSV');
        } finally {
            setIsExportOpen(false);
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contacts" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Contacts</h1>
                    <div className="flex items-center gap-2">
                        {!auth.user?.subscribed && auth.user?.role !== 1 && (
                            <Button 
                                onClick={() => router.get(route('subscription.index'))}
                                variant="default"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                <Sparkles className="size-4" />
                                Upgrade to Pro
                            </Button>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button 
                                        onClick={() => router.get(contactsRoutes.create().url)}
                                        disabled={!canAddContact}
                                    >
                                        <Plus className="size-4" />
                                        New Contact
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {!canAddContact && (
                                <TooltipContent>
                                    <p>You've reached the free plan limit of 20 contacts. Subscribe to add more.</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                        <Button variant="outline" onClick={() => setIsExportOpen(true)}>
                            <Download className="size-4" />
                            Export
                        </Button>
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="size-4" />
                            Print
                        </Button>
                    </div>
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
                                placeholder="Search by name, email, phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-72 pl-9"
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
                                        route('contacts.index'),
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
                                <SelectItem value="birthday">Birthday</SelectItem>
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
                    <TableCaption>A list of contacts</TableCaption>
                    <TableHeader>
                        <TableRow>
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
                            <TableHead>Phone</TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort('birthday')}
                            >
                                Birthday <SortIcon field="birthday" sortField={sortField} sortDirection={sortDirection} />
                            </TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {localContacts.length > 0 ? (
                            localContacts.map((contact) => (
                                <TableRow key={contact.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-9">
                                                {contact.image_url ? (
                                                    <AvatarImage src={contact.image_url} alt={contact.name} />
                                                ) : (
                                                    <AvatarFallback className="bg-muted text-foreground">
                                                        {contact.name?.trim()?.charAt(0)?.toUpperCase() ?? '?'}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <span className="font-medium">{contact.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{contact.email}</TableCell>
                                    <TableCell>
                                        {contact.phone ? (
                                            <div className="flex items-center gap-2">
                                                <span>{contact.phone}</span>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label="Copy phone number"
                                                            onClick={() => handleCopyPhone(contact.phone!)}
                                                        >
                                                            {justCopiedPhone === contact.phone ? (
                                                                <Check className="size-4" />
                                                            ) : (
                                                                <Copy className="size-4" />
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Copy phone number
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell>{formatBirthday(contact.birthday)}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={contact.status}
                                            onCheckedChange={() => handleToggleStatus(contact)}
                                            disabled={togglingIds.has(contact.id)}
                                            aria-label={contact.status ? 'Deactivate contact' : 'Activate contact'}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ContactActions contact={contact} onDelete={handleDelete} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    No contacts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination controls */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {contacts.from ?? 0} to {contacts.to ?? 0}{' '}
                        of {contacts.total} results
                    </div>

                    <div className="flex gap-2">
                        {contacts.links.map((link, idx) => (
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
            <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Export Contacts</DialogTitle>
                        <DialogDescription>
                            All contacts will be exported to CSV. Do you want to proceed?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsExportOpen(false)}>
                            <X className="size-4" />
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmExport}>
                            <Download className="size-4" />
                            Export
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
