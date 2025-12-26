import ContactActions from '@/components/contacts/ContactActions';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { Copy, Check, Plus, Download, Printer, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
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
    image?: string | null;
    created_at: string;
    updated_at?: string | null;
}

interface Props extends SharedData {
    contacts: PaginatedResponse<Contact>;
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

export default function ContactsIndex() {
    const { contacts } = usePage<Props>().props;

    const [localContacts, setLocalContacts] = React.useState(
        contacts.data ?? ([] as Contact[]),
    );

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

    const toCSV = React.useCallback((rows: Contact[]) => {
        const headers = [
            'name',
            'email',
            'phone',
            'birthday',
            'category',
        ];
        const escape = (val: unknown) => {
            const s = val == null ? '' : String(val);
            return '"' + s.replace(/"/g, '""') + '"';
        };
        const lines = rows.map((r) => {
            const categoryName = (r as unknown as { category?: { name?: string }; category_name?: string }).category?.name
                ?? (r as unknown as { category_name?: string }).category_name
                ?? '';
            return [
                r.name,
                r.email,
                r.phone ?? '',
                r.birthday ?? '',
                categoryName,
            ]
                .map(escape)
                .join(',');
        });
        return [headers.join(','), ...lines].join('\n');
    }, []);

    const handleConfirmExport = React.useCallback(() => {
        try {
            const csv = toCSV(localContacts);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contacts.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('CSV export started');
        } catch {
            toast.error('Failed to export CSV');
        } finally {
            setIsExportOpen(false);
        }
    }, [localContacts, toCSV]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contacts" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Contacts</h1>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => router.get(contactsRoutes.create().url)}>
                            <Plus className="size-4" />
                            New Contact
                        </Button>
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

                <Table>
                    <TableCaption>A list of contacts</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Birthday</TableHead>
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
                                                {contact.image ? (
                                                    <AvatarImage src={contact.image} alt={contact.name} />
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
                                    <TableCell className="text-right">
                                        <ContactActions contact={contact} onDelete={handleDelete} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
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
