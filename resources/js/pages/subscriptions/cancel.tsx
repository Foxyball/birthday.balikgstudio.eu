import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { XCircle } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Subscription', href: '/subscription/plans' },
    { title: 'Canceled', href: '/subscription/checkout/cancel' },
];

export default function SubscriptionCancel() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription Canceled" />

            <div className="flex h-full flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                            <XCircle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <CardTitle className="text-2xl">Subscription Canceled</CardTitle>
                        <CardDescription>
                            You canceled the subscription process
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
                        <p>
                            No worries! You can upgrade to Pro anytime to unlock unlimited contacts
                            and never miss a birthday.
                        </p>
                        <p>
                            Your free plan (20 contacts) is still active.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button
                            onClick={() => router.get(route('subscription.index'))}
                            className="w-full"
                        >
                            View Plans Again
                        </Button>
                        <Button
                            onClick={() => router.get(route('contacts.index'))}
                            variant="outline"
                            className="w-full"
                        >
                            Go to Contacts
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
