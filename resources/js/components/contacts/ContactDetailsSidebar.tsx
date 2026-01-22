import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Spinner } from '@/components/ui/spinner';
import { CalendarIcon, MailIcon, PhoneIcon, TagIcon, ClockIcon, GiftIcon, StickyNoteIcon, EditIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import contacts from '@/routes/contacts';

export interface Contact {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    birthday?: string;
    category_id?: number;
    category?: {
        id: number;
        name: string;
    } | null;
    status: boolean;
    image?: string | null;
    image_url?: string | null;
    notes?: string | null;
    gift_ideas?: string | null;
    created_at: string;
    updated_at?: string | null;
    is_locked?: boolean;
}

interface ContactDetailsSidebarProps {
    contact: Contact | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onToggleStatus?: (contact: Contact) => void;
    onDelete?: (contact: Contact) => void;
    isTogglingStatus?: boolean;
}

const formatDate = (date?: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const formatBirthday = (date?: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
    });
};

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export default function ContactDetailsSidebar({
    contact,
    open,
    onOpenChange,
    onToggleStatus,
    onDelete,
    isTogglingStatus = false,
}: ContactDetailsSidebarProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (!contact) return null;

    const handleEdit = () => {
        router.get(contacts.edit(contact.id).url);
        onOpenChange(false);
    };

    const handleDelete = () => {
        if (onDelete) {
            setDeleting(true);
            try {
                onDelete(contact);
            } finally {
                setDeleting(false);
                setDeleteDialogOpen(false);
                onOpenChange(false);
            }
            return;
        }

        setDeleting(true);
        router.delete(contacts.destroy(contact.id).url, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteDialogOpen(false);
                setDeleting(false);
                onOpenChange(false);
            },
        });
    };

    const handleToggleStatus = () => {
        if (onToggleStatus) {
            onToggleStatus(contact);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto px-6">
                <SheetHeader className="text-left">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            {contact.image_url && (
                                <AvatarImage src={contact.image_url} alt={contact.name} />
                            )}
                            <AvatarFallback className="text-lg">
                                {getInitials(contact.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <SheetTitle className="text-xl truncate">{contact.name}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2 mt-1">
                                {contact.is_locked && (
                                    <Badge variant="destructive">Locked</Badge>
                                )}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Status Toggle */}
                    <section>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="contact-status" className="text-sm font-semibold">
                                    Active Status
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {contact.status ? 'You will receive emails for this contact' : 'Birthday reminders are disabled'}
                                </p>
                            </div>
                            <Switch
                                id="contact-status"
                                checked={contact.status}
                                onCheckedChange={handleToggleStatus}
                                disabled={isTogglingStatus || contact.is_locked}
                                aria-label={contact.status ? 'Deactivate contact' : 'Activate contact'}
                            />
                        </div>
                    </section>

                    <Separator />
                    {/* Contact Information */}
                    <section>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            Contact Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <MailIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{contact.email}</span>
                            </div>
                            {contact.phone && (
                                <div className="flex items-center gap-3">
                                    <PhoneIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-sm">{contact.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm">Birthday: {formatBirthday(contact.birthday)}</span>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Category */}
                    <section>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            Category
                        </h3>
                        <div className="flex items-center gap-3">
                            <TagIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Badge variant="outline">
                                {contact.category?.name ?? 'Uncategorized'}
                            </Badge>
                        </div>
                    </section>

                    <Separator />

                    {/* Notes */}
                    {contact.notes && (
                        <>
                            <section>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                    Notes
                                </h3>
                                <div className="flex gap-3">
                                    <StickyNoteIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {contact.notes}
                                    </p>
                                </div>
                            </section>
                            <Separator />
                        </>
                    )}

                    {/* Gift Ideas */}
                    {contact.gift_ideas && (
                        <>
                            <section>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                    Gift Ideas
                                </h3>
                                <div className="flex gap-3">
                                    <GiftIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {contact.gift_ideas}
                                    </p>
                                </div>
                            </section>
                            <Separator />
                        </>
                    )}

                    {/* Metadata */}
                    <section>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            Record Details
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Created: </span>
                                    {formatDate(contact.created_at)}
                                </div>
                            </div>
                            {contact.updated_at && (
                                <div className="flex items-center gap-3">
                                    <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Updated: </span>
                                        {formatDate(contact.updated_at)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Action Buttons */}
                {!contact.is_locked && (
                    <SheetFooter className="mt-6 flex-row gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleEdit}
                        >
                            <EditIcon className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    <Trash2Icon className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
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
                                        className="bg-destructive text-white hover:bg-destructive/90 flex items-center gap-2"
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
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
