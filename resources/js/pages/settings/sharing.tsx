import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Copy, ExternalLink, RefreshCw, Share2 } from 'lucide-react';
import { route } from 'ziggy-js';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sharing settings',
        href: '/settings/sharing',
    },
];

export default function Sharing({
    shareEnabled,
    shareToken,
}: {
    shareEnabled: boolean;
    shareToken: string | null;
}) {
    const [enabled, setEnabled] = React.useState(shareEnabled);
    const [isToggling, setIsToggling] = React.useState(false);
    const [isRegenerating, setIsRegenerating] = React.useState(false);

    const shareUrl = shareToken 
        ? `${window.location.origin}/birthday/${shareToken}`
        : null;

    const handleToggle = (checked: boolean) => {
        setIsToggling(true);
        router.post(
            route('birthday-share.toggle'),
            { enabled: checked },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEnabled(checked);
                    toast.success(checked ? 'Sharing enabled!' : 'Sharing disabled');
                },
                onError: () => {
                    toast.error('Failed to update sharing settings');
                },
                onFinish: () => {
                    setIsToggling(false);
                },
            }
        );
    };

    const handleRegenerate = () => {
        setIsRegenerating(true);
        router.post(
            route('birthday-share.regenerate'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Share link regenerated!');
                },
                onError: () => {
                    toast.error('Failed to regenerate share link');
                },
                onFinish: () => {
                    setIsRegenerating(false);
                },
            }
        );
    };

    const handleCopy = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied to clipboard!');
        }
    };

    const handlePreview = () => {
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sharing settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Birthday Sharing"
                        description="Share your birthday calendar with others"
                    />

                    <div className="space-y-6">
                        {/* Enable/Disable Toggle */}
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="share-toggle" className="text-base">
                                    Enable Public Birthday Page
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    When enabled, anyone with the link can view your contacts' birthdays.
                                </p>
                            </div>
                            <Switch
                                id="share-toggle"
                                checked={enabled}
                                onCheckedChange={handleToggle}
                                disabled={isToggling}
                            />
                        </div>

                        {/* Share Link Section */}
                        {shareToken && (
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center gap-2">
                                    <Share2 className="h-5 w-5 text-muted-foreground" />
                                    <Label className="text-base">Your Share Link</Label>
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        value={shareUrl || ''}
                                        readOnly
                                        className="flex-1 font-mono text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopy}
                                        title="Copy link"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePreview}
                                        title="Preview"
                                        disabled={!enabled}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-sm text-muted-foreground">
                                        {enabled 
                                            ? '✅ Link is active and publicly accessible'
                                            : '⚠️ Link is disabled. Enable sharing to make it accessible.'}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRegenerate}
                                        disabled={isRegenerating}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                                        Regenerate Link
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Info Section */}
                        <div className="rounded-lg bg-muted p-4">
                            <h4 className="font-medium mb-2">About Birthday Sharing</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Only active contacts (status enabled) are shown on the public page</li>
                                <li>• Private information like email, phone, and notes are never shared</li>
                                <li>• You can regenerate the link at any time to invalidate old links</li>
                                <li>• Disable sharing to make the page inaccessible without deleting it</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
