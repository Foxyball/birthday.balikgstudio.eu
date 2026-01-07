import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem} from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Subscription', href: '/subscription/plans' },
    { title: 'Success', href: '/subscription/checkout/success' },
];

export default function SubscriptionSuccess() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription Successful" />

            <div className="flex h-full flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl">Welcome to Pro!</CardTitle>
                        <CardDescription>
                            Your subscription has been activated successfully
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
                        <p>
                            You now have unlimited access to all contacts and features.
                            All your locked contacts have been unlocked.
                        </p>
                        <p>
                            You'll receive birthday reminders for all your contacts.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button
                            onClick={() => router.get(route('contacts.index'))}
                            className="w-full"
                        >
                            Go to Contacts
                        </Button>
                        <Button
                            onClick={() => router.get(route('dashboard'))}
                            variant="outline"
                            className="w-full"
                        >
                            Go to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
