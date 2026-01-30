import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { format, formatDistanceToNow } from 'date-fns';
import { CalendarIcon, UserPlusIcon } from 'lucide-react';
import QuickSearch from '@/components/dashboard/QuickSearch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type UpcomingBirthday = {
    id: number;
    name: string;
    birthday: string; // ISO date (YYYY-MM-DD)
    nextBirthday: string; // ISO date for upcoming occurrence
    daysLeft: number;
    ageTurning: number;
    image_url: string | null;
};

type RecentContact = {
    id: number;
    name: string;
    email: string;
    image_url: string | null;
    created_at: string;
};

interface Props extends SharedData {
    kpis: {
        contacts: number;
        users: number;
        birthdaysToday: number;
    };
    upcomingBirthdays: UpcomingBirthday[];
    recentContacts: RecentContact[];
}

export default function Dashboard() {
    const { kpis, upcomingBirthdays, recentContacts, auth } = usePage<Props>().props;
    const isAdmin = String(auth?.user?.role ?? '0') === '1';

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Quick Search */}
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <QuickSearch />
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contacts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{kpis.contacts}</div>
                            <div className="text-sm text-muted-foreground">Total contacts</div>
                        </CardContent>
                    </Card>
    {isAdmin &&
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{kpis.users}</div>
                            <div className="text-sm text-muted-foreground">Total users</div>
                        </CardContent>
                    </Card>
    }
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Birthdays Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{kpis.birthdaysToday}</div>
                            <div className="text-sm text-muted-foreground">Your contacts with birthdays today</div>
                        </CardContent>
                    </Card>
                </div>
                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Upcoming Birthdays */}
                    <Card className="relative overflow-hidden rounded-xl border border-sidebar-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5" />
                                Upcoming Birthdays
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {upcomingBirthdays && upcomingBirthdays.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>In</TableHead>
                                            <TableHead>Turns</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {upcomingBirthdays.map((b) => (
                                            <TableRow key={b.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={b.image_url ?? undefined} alt={b.name} />
                                                            <AvatarFallback>{getInitials(b.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">{b.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(b.nextBirthday), 'MMM d')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{b.daysLeft === 0 ? 'today' : `in ${b.daysLeft} day${b.daysLeft === 1 ? '' : 's'}`}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge> {b.ageTurning}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="relative min-h-[300px]">
                                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                    <div className="relative z-10 flex h-full items-center justify-center text-sm text-muted-foreground">
                                        No upcoming birthdays in the next 30 days.
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recently Added Contacts */}
                    <Card className="relative overflow-hidden rounded-xl border border-sidebar-border/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlusIcon className="h-5 w-5" />
                                Recently Added Contacts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentContacts && recentContacts.length > 0 ? (
                                <div className="space-y-4">
                                    {recentContacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className="flex items-center justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={contact.image_url ?? undefined} alt={contact.name} />
                                                    <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{contact.name}</span>
                                                    <span className="text-sm text-muted-foreground">{contact.email}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="relative min-h-[300px]">
                                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                    <div className="relative z-10 flex h-full items-center justify-center text-sm text-muted-foreground">
                                        No contacts added yet.
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
