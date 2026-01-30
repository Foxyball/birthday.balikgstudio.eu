import { DetailsSidebar, BaseRecord, DetailSection } from '@/components/ui/details-sidebar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarIcon, MailIcon, PhoneIcon, TagIcon, GiftIcon, StickyNoteIcon } from 'lucide-react';

export interface Contact extends BaseRecord {
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
    onEdit?: (contact: Contact) => void;
    onDelete?: (contact: Contact) => void;
    isTogglingStatus?: boolean;
}

const formatBirthday = (date?: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
    });
};

export default function ContactDetailsSidebar({
    contact,
    open,
    onOpenChange,
    onToggleStatus,
    onEdit,
    onDelete,
    isTogglingStatus = false,
}: ContactDetailsSidebarProps) {
    if (!contact) return null;

    const handleEdit = () => {
        if (onEdit) {
            onEdit(contact);
        }
    };

    const handleToggleStatus = () => {
        if (onToggleStatus) {
            onToggleStatus(contact);
        }
    };

    const sections: DetailSection[] = [
        {
            title: 'Contact Information',
            fields: [
                {
                    icon: MailIcon,
                    value: contact.email,
                },
                ...(contact.phone
                    ? [
                          {
                              icon: PhoneIcon,
                              value: contact.phone,
                          },
                      ]
                    : []),
                {
                    icon: CalendarIcon,
                    label: 'Birthday',
                    value: formatBirthday(contact.birthday),
                },
            ],
        },
        {
            title: 'Category',
            fields: [
                {
                    icon: TagIcon,
                    value: (
                        <Badge variant="outline">
                            {contact.category?.name ?? 'Uncategorized'}
                        </Badge>
                    ),
                },
            ],
        },
    ];

    if (contact.notes) {
        sections.push({
            title: 'Notes',
            fields: [
                {
                    icon: StickyNoteIcon,
                    value: (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {contact.notes}
                        </p>
                    ),
                },
            ],
        });
    }

    if (contact.gift_ideas) {
        sections.push({
            title: 'Gift Ideas',
            fields: [
                {
                    icon: GiftIcon,
                    value: (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {contact.gift_ideas}
                        </p>
                    ),
                },
            ],
        });
    }

    const statusToggle = (
        <>
            <section className="mt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="contact-status" className="text-sm font-semibold">
                            Active Status
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            {contact.status
                                ? 'You will receive emails for this contact'
                                : 'Birthday reminders are disabled'}
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
            <Separator className="mt-6" />
        </>
    );

    return (
        <DetailsSidebar
            record={contact}
            open={open}
            onOpenChange={onOpenChange}
            onEdit={handleEdit}
            onDelete={onDelete}
            entityName="contact"
            showAvatar={true}
            sections={sections}
            headerContent={statusToggle}
        />
    );
}
