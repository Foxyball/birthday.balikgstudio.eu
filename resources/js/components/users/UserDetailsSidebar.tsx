import { DetailsSidebar, BaseRecord, DetailSection } from '@/components/ui/details-sidebar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MailIcon, ShieldIcon, CreditCardIcon, ShieldCheckIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import * as users from '@/routes/users';

export interface User extends BaseRecord {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    role: 0 | 1;
    is_locked: boolean;
    subscribed?: boolean;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    image_url?: string | null;
}

interface UserDetailsSidebarProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onToggleLock?: (user: User) => void;
    onDelete?: (user: User) => void;
    isTogglingLock?: boolean;
}

export default function UserDetailsSidebar({
    user,
    open,
    onOpenChange,
    onToggleLock,
    onDelete,
    isTogglingLock = false,
}: UserDetailsSidebarProps) {
    if (!user) return null;

    const handleEdit = () => {
        router.get(users.edit(user.id).url);
    };

    const handleToggleLock = () => {
        if (onToggleLock) {
            onToggleLock(user);
        }
    };

    const sections: DetailSection[] = [
        {
            title: 'User Information',
            fields: [
                {
                    icon: MailIcon,
                    label: 'Email',
                    value: user.email,
                },
                {
                    icon: ShieldIcon,
                    label: 'Role',
                    value: (
                        <Badge variant={Number(user.role) === 1 ? 'default' : 'secondary'}>
                            {Number(user.role) === 1 ? 'Admin' : 'User'}
                        </Badge>
                    ),
                },
            ],
        },
        {
            title: 'Account Status',
            fields: [
                {
                    icon: MailIcon,
                    label: 'Email Verified',
                    value: (
                        <Badge variant={user.email_verified_at ? 'default' : 'outline'}>
                            {user.email_verified_at ? 'Verified' : 'Not Verified'}
                        </Badge>
                    ),
                },
                {
                    icon: CreditCardIcon,
                    label: 'Subscription',
                    value: (
                        <Badge variant={user.subscribed ? 'default' : 'outline'}>
                            {user.subscribed ? 'Subscribed' : 'Free'}
                        </Badge>
                    ),
                },
                {
                    icon: ShieldCheckIcon,
                    label: '2FA',
                    value: (
                        <Badge variant={user.two_factor_enabled ? 'default' : 'outline'}>
                            {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                    ),
                },
            ],
        },
    ];

    const lockToggle = (
        <>
            <section className="mt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="user-lock" className="text-sm font-semibold">
                            Account Lock
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            {user.is_locked
                                ? 'User cannot manage contacts'
                                : 'User has full access'}
                        </p>
                    </div>
                    <Switch
                        id="user-lock"
                        checked={user.is_locked}
                        onCheckedChange={handleToggleLock}
                        disabled={isTogglingLock}
                        aria-label={user.is_locked ? 'Unlock user' : 'Lock user'}
                    />
                </div>
            </section>
            <Separator className="mt-6" />
        </>
    );

    return (
        <DetailsSidebar
            record={user}
            open={open}
            onOpenChange={onOpenChange}
            onEdit={handleEdit}
            onDelete={onDelete}
            entityName="user"
            showAvatar={true}
            sections={sections}
            headerContent={lockToggle}
        />
    );
}
