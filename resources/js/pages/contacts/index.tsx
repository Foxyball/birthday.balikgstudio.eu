import ContactActions from '@/components/contacts/ContactActions';
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
import contactsRoutes from '@/routes/contacts';
import { BreadcrumbItem, PaginatedResponse, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import React from 'react';

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

export default function ContactsIndex() {
    const { contacts } = usePage<Props>().props;

    const [localContacts, setLocalContacts] = React.useState(
        contacts.data ?? ([] as Contact[]),
    );

    const handleDelete = (contactToDelete: Contact) => {
        const previous = localContacts;
        setLocalContacts((c) => c.filter((x) => x.id !== contactToDelete.id));

        router.delete(contactsRoutes.destroy(contactToDelete.id).url, {
            onError: () => setLocalContacts(previous),
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contacts" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Contacts</h1>

                    <Button
                        onClick={() => router.get(contactsRoutes.create().url)}
                    >
                        + New Contact
                    </Button>
                </div>

                <Table>
                    <TableCaption>A list of contacts</TableCaption>

                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Birthday</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {localContacts.length > 0 ? (
                            localContacts.map((contact) => (
                                <TableRow key={contact.id}>
                                    <TableCell className="font-medium">
                                        {contact.id}
                                    </TableCell>
                                    <TableCell>{contact.name}</TableCell>
                                    <TableCell>
                                        {contact.image ? (
                                            <img
                                                src={contact.image}
                                                alt={contact.name}
                                                className="h-10 w-10 rounded-full object-cover border"
                                            />
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell>{contact.email}</TableCell>
                                    <TableCell>{contact.phone ?? '—'}</TableCell>
                                    <TableCell>
                                        {formatDate(contact.birthday)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(contact.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(contact.updated_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ContactActions
                                            contact={contact}
                                            onDelete={handleDelete}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
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
        </AppLayout>
    );
}
