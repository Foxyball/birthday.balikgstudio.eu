import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle, AlertCircle, Crown, CreditCard } from 'lucide-react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import React from 'react';
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

interface Subscription {
    name: string;
    stripe_status: string;
    stripe_price: string;
    quantity: number;
    ends_at: string | null;
    current_period_end: string | null;
    trial_ends_at: string | null;
    on_grace_period: boolean;
    canceled: boolean;
    active: boolean;
}

interface Props extends SharedData {
    subscription: Subscription | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Subscription', href: '/settings/subscription' },
];

export default function SubscriptionSettings() {
    const { subscription } = usePage<Props>().props;
    const [isCanceling, setIsCanceling] = React.useState(false);
    const [isResuming, setIsResuming] = React.useState(false);

    const handleCancel = async () => {
        setIsCanceling(true);
        router.post(
            route('subscription.cancel'),
            {},
            {
                onSuccess: () => {
                    toast.success('Subscription canceled successfully');
                    setIsCanceling(false);
                },
                onError: () => {
                    toast.error('Failed to cancel subscription');
                    setIsCanceling(false);
                },
            }
        );
    };

    const handleResume = () => {
        setIsResuming(true);
        router.post(
            route('subscription.resume'),
            {},
            {
                onSuccess: () => {
                    toast.success('Subscription resumed successfully');
                    setIsResuming(false);
                },
                onError: () => {
                    toast.error('Failed to resume subscription');
                    setIsResuming(false);
                },
            }
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Subscription"
                        description="Manage your subscription and billing"
                    />

                    {!subscription ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>No Active Subscription</CardTitle>
                                <CardDescription>
                                    You're currently on the free plan (20 contacts limit)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Upgrade to Pro to unlock unlimited contacts and never miss a birthday!
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => router.get(route('subscription.index'))}>
                                    <Crown className="mr-2 h-4 w-4" />
                                    View Plans
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {/* Current Plan */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Crown className="h-5 w-5 text-purple-600" />
                                                Pro Plan
                                            </CardTitle>
                                            <CardDescription>Unlimited contacts and features</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {subscription.active && !subscription.canceled ? (
                                                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Active
                                                </div>
                                            ) : subscription.on_grace_period ? (
                                                <div className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Cancels Soon
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                                                    <XCircle className="h-4 w-4" />
                                                    Inactive
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                                            <p className="mt-1 text-sm capitalize">{subscription.stripe_status}</p>
                                        </div>
                                        {subscription.ends_at && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    {subscription.on_grace_period ? 'Ends On' : 'Renews On'}
                                                </p>
                                                <p className="mt-1 text-sm">{formatDate(subscription.ends_at)}</p>
                                            </div>
                                        )}
                                        {!subscription.ends_at && subscription.current_period_end && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Renews On</p>
                                                <p className="mt-1 text-sm">{formatDate(subscription.current_period_end)}</p>
                                            </div>
                                        )}
                                    </div>

                                    {subscription.on_grace_period && (
                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                                            <div className="flex gap-3">
                                                <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                        Subscription Canceled
                                                    </p>
                                                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                                        You can continue using Pro features until{' '}
                                                        {formatDate(subscription.ends_at)}. After that, your account will
                                                        revert to the free plan.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                    {subscription.on_grace_period ? (
                                        <Button onClick={handleResume} disabled={isResuming}>
                                            {isResuming ? 'Resuming...' : 'Resume Subscription'}
                                        </Button>
                                    ) : subscription.active ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive">Cancel Subscription</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Your subscription will remain active until the end of your current
                                                        billing period
                                                        {subscription.current_period_end && (
                                                            <> ({formatDate(subscription.current_period_end)})</>
                                                        )}
                                                        . After that, you'll revert to the free plan and any contacts
                                                        beyond 20 will be locked.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleCancel}
                                                        disabled={isCanceling}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        {isCanceling ? 'Canceling...' : 'Yes, Cancel'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : null}
                                </CardFooter>
                            </Card>

                            {/* Billing Portal Link */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Billing & Invoices
                                    </CardTitle>
                                    <CardDescription>
                                        Manage payment methods and view billing history
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Access the Stripe billing portal to update your payment method, view invoices,
                                        and manage billing details.
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            // This would redirect to Stripe's billing portal
                                            toast.info('Billing portal integration coming soon');
                                        }}
                                    >
                                        Manage Billing
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
