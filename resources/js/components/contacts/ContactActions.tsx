import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import contacts from '@/routes/contacts';
import { router } from '@inertiajs/react';
import { EditIcon, MoreHorizontalIcon, Trash2Icon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

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

interface ContactActionsProps {
    contact: Contact;
    onDelete?: (contact: Contact) => void;
}

export default function ContactActions({ contact, onDelete }: ContactActionsProps) {
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (onDelete) {
            setDeleting(true);
            try {
                onDelete(contact);
            } finally {
                setDeleting(false);
                setOpen(false);
            }
            return;
        }

        setDeleting(true);
        router.delete(contacts.destroy(contact.id).url, {
            preserveScroll: true,
            onFinish: () => {
                setOpen(false);
                setDeleting(false);
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label={`More options for ${contact.name}`}
                    >
                        <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => router.get(contacts.edit(contact.id).url)}
                            >
                                <EditIcon className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="w-full justify-start"
                                >
                                    <Trash2Icon className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete contact?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete{' '}
                        <strong>{contact.name}</strong>. This action cannot be
                        undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                        disabled={deleting}
                    >
                        {deleting ? (
                            <Spinner className="h-4 w-4" />
                        ) : (
                            <Trash2Icon className="h-4 w-4" />
                        )}
                        <span>Delete</span>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
