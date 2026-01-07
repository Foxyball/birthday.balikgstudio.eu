import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Check, Loader2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Props extends SharedData {
    prices: {
        monthly: {
            id: string;
            amount: number;
            currency: string;
            interval: string;
        } | null;
        yearly: {
            id: string;
            amount: number;
            currency: string;
            interval: string;
        } | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Subscription Plans', href: '/subscription/plans' },
];

export default function SubscriptionPlans() {
    const { prices } = usePage<Props>().props;
    const [isLoading, setIsLoading] = React.useState<string | null>(null);

    const startCheckout = async (plan: 'monthly' | 'yearly') => {
        const priceData = plan === 'monthly' ? prices.monthly : prices.yearly;

        if (!priceData?.id) {
            toast.error('Price ID not configured. Please contact support.');
            return;
        }

        setIsLoading(plan);

        try {
            const response = await fetch(route('create-checkout-session'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ price_id: priceData.id }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                toast.error(errorData.error || 'Failed to create checkout session');
                setIsLoading(null);
                return;
            }

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error('Failed to create checkout session');
                setIsLoading(null);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Something went wrong. Please try again.');
            setIsLoading(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription Plans" />

            <div className="flex h-full flex-1 flex-col gap-8 p-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Choose Your Plan</h1>
                    <p className="mt-2 text-muted-foreground">
                        Unlock unlimited contacts and never miss a birthday
                    </p>
                </div>

                <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-2">
                    {/* Monthly Plan */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl">Monthly</CardTitle>
                            <CardDescription>Perfect for getting started</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-4">
                                {prices.monthly ? (
                                    <>
                                        <span className="text-4xl font-bold">
                                            {prices.monthly.currency === 'EUR' ? '€' : '$'}{prices.monthly.amount.toFixed(2)}
                                        </span>
                                        <span className="text-muted-foreground">/{prices.monthly.interval}</span>
                                    </>
                                ) : (
                                    <span className="text-muted-foreground">Price not available</span>
                                )}
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span>Unlimited contacts</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span>Birthday email reminders</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span>Contact categories</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span>Import/Export contacts</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span>Cancel anytime</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => startCheckout('monthly')}
                                className="w-full"
                                disabled={isLoading !== null || !prices.monthly}
                            >
                                {isLoading === 'monthly' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    'Subscribe Monthly'
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Yearly Plan */}
                    <Card className="relative flex flex-col border-primary">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                            Best Value
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl">Yearly</CardTitle>
                            <CardDescription>Save 20% with annual billing</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-4">
                                {prices.yearly && prices.monthly ? (
                                    <>
                                        <span className="text-4xl font-bold">
                                            {prices.yearly.currency === 'EUR' ? '€' : '$'}{prices.yearly.amount.toFixed(2)}
                                        </span>
                                        <span className="text-muted-foreground">/{prices.yearly.interval}</span>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            <span className="line-through">
                                                {prices.yearly.currency === 'EUR' ? '€' : '$'}{(prices.monthly.amount * 12).toFixed(2)}
                                            </span>
                                            {' '}Save {prices.yearly.currency === 'EUR' ? '€' : '$'}
                                            {(prices.monthly.amount * 12 - prices.yearly.amount).toFixed(2)}/year
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-muted-foreground">Price not available</span>
                                )}
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span>Unlimited contacts</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span>Birthday email reminders</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span>Contact categories</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span>Import/Export contacts</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span>Cancel anytime</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span className="font-semibold">2 months free!</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => startCheckout('yearly')}
                                className="w-full"
                                disabled={isLoading !== null || !prices.yearly}
                            >
                                {isLoading === 'yearly' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    'Subscribe Yearly'
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Free Plan Info */}
                <Card className="mx-auto w-full max-w-2xl border-dashed">
                    <CardHeader>
                        <CardTitle className="text-xl">Free Plan</CardTitle>
                        <CardDescription>Continue using limited features</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                <span>Up to 20 contacts</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                <span>Birthday email reminders (for unlocked contacts)</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
