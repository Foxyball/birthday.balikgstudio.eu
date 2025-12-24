import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboard } from '@/routes';
import * as contactRoutes from '@/routes/contacts';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, ArrowRight } from 'lucide-react';

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
};

interface Props extends SharedData {
    kpis: {
        contacts: number;
        users: number;
        birthdaysToday: number;
    };
    upcomingBirthdays: UpcomingBirthday[];
}

export default function Dashboard() {
    const { kpis, upcomingBirthdays } = usePage<Props>().props;
    const isAdmin = Number(usePage<Props>().props.auth?.user?.role ?? 0) === 1;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
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
                <Card className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70">
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
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcomingBirthdays.map((b) => (
                                        <TableRow key={b.id}>
                                            <TableCell className="font-medium">{b.name}</TableCell>
                                            <TableCell>
                                                {format(new Date(b.nextBirthday), 'MMM d')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{b.daysLeft === 0 ? 'today' : `in ${b.daysLeft} day${b.daysLeft === 1 ? '' : 's'}`}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge> {b.ageTurning}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    href={contactRoutes.edit(b.id).url}
                                                    className="inline-flex items-center gap-1 text-sm text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-current"
                                                >
                                                    View <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
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
            </div>
        </AppLayout>
    );
}
