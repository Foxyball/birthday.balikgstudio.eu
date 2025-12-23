import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Props extends SharedData {
    kpis: {
        contacts: number;
        users: number;
        birthdaysToday: number;
    };
}

export default function Dashboard() {
    const { kpis } = usePage<Props>().props;
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{kpis.users}</div>
                            <div className="text-sm text-muted-foreground">Total users</div>
                        </CardContent>
                    </Card>
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
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
