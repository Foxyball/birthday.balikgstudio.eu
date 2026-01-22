import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';

export default function NotFound() {
    // Go back to previous page
    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <>
            <Head title="404 - Page Not Found" />
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
                {/* Sliced Cake Emoji/Image */}
                <div className="mb-8 text-[150px] leading-none">
                    🍰
                </div>

                {/* 404 Title */}
                <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
                
                {/* Page Not Found subtitle */}
                <h2 className="text-2xl font-semibold text-foreground mb-6">Page Not Found</h2>

                {/* Description */}
                <p className="text-center text-muted-foreground max-w-md mb-8 leading-relaxed">
                    Sorry, but the page you are looking for has not been found. Try checking the URL for errors, then hit the refresh button on your browser.
                </p>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <span className="text-muted-foreground">Go to our</span>
                    <Button asChild>
                        <Link href="/dashboard">Home Page</Link>
                    </Button>
                    <span className="text-muted-foreground">or</span>
                    <Button variant="outline" onClick={handleGoBack}>
                        Go Back
                    </Button>
                </div>
            </div>
        </>
    );
}
