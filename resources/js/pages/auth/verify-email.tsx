// Components
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { type SharedData } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { CheckCircle2, Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AuthLayout
            title="Verify your email"
            description="We need to verify your email address before you can continue."
            imageUrl="/images/auth-logo.png"
        >
            <Head title="Email verification" />

            <div className="space-y-6">
                {/* Email Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-10 w-10 text-primary" />
                        </div>
                        {status === 'verification-link-sent' && (
                            <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Info Card */}
                <div className="rounded-lg border bg-muted/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        We sent a verification link to
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                        {auth.user?.email}
                    </p>
                </div>

                {/* Status Messages */}
                {status === 'verification-link-sent' && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                Verification link sent!
                            </p>
                        </div>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                            Check your inbox and click the link to verify your email.
                        </p>
                    </div>
                )}

                {/* Instructions */}
                <div className="space-y-2 text-center text-sm text-muted-foreground">
                    <p>
                        Click the link in the email to verify your account.
                        If you don't see the email, check your spam folder.
                    </p>
                </div>

                {/* Actions */}
                <Form {...send.form()} className="space-y-4">
                    {({ processing }) => (
                        <>
                            <Button
                                className="w-full"
                                disabled={processing}
                                variant={status === 'verification-link-sent' ? 'outline' : 'default'}
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                                {status === 'verification-link-sent'
                                    ? 'Resend verification email'
                                    : 'Send verification email'}
                            </Button>
                        </>
                    )}
                </Form>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or
                        </span>
                    </div>
                </div>

                {/* Secondary Actions */}
                <div className="text-center">
                    <TextLink
                        href={logout()}
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Sign out and use a different account
                    </TextLink>
                </div>

                {/* Help Text */}
                <p className="text-center text-xs text-muted-foreground">
                    Having trouble? Contact support at{' '}
                    <a
                        href="mailto:h.sabev.business@gmail.com"
                        className="text-primary hover:underline"
                    >
                        h.sabev.business@gmail.com
                    </a>
                </p>
            </div>
        </AuthLayout>
    );
}
