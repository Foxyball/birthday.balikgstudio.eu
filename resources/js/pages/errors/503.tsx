import { Head } from '@inertiajs/react';

export default function Maintenance() {
    return (
        <>
            <Head title="Under Maintenance" />
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
                {/* Cable/Plug Emoji */}
                <div className="mb-8 text-[150px] leading-none">
                    🔌
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-center">
                    We're Under Maintenance
                </h1>

                {/* Description */}
                <p className="text-center text-muted-foreground max-w-md mb-8 leading-relaxed text-lg">
                    Our website is down for maintenance. We will be back shortly.
                </p>

                {/* Optional: Estimated time or contact */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    <span>Working on it...</span>
                </div>
            </div>
        </>
    );
}
