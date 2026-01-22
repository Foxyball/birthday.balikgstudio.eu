<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        @routes
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            /* Global Preloader Styles */
            #app-preloader {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: oklch(1 0 0);
                transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
            }

            html.dark #app-preloader {
                background-color: oklch(0.145 0 0);
            }

            #app-preloader.hidden {
                opacity: 0;
                visibility: hidden;
            }

            .preloader-spinner {
                width: 48px;
                height: 48px;
                border: 3px solid transparent;
                border-top-color: oklch(0.6 0.2 260);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            html.dark .preloader-spinner {
                border-top-color: oklch(0.7 0.15 260);
            }

            .preloader-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
            }

            .preloader-logo {
                width: 64px;
                height: 64px;
                animation: pulse 1.5s ease-in-out infinite;
            }

            .preloader-text {
                font-family: 'Ubuntu', system-ui, sans-serif;
                font-size: 14px;
                color: oklch(0.5 0 0);
            }

            html.dark .preloader-text {
                color: oklch(0.6 0 0);
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(0.95); }
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/images/logo.png" sizes="any">
        <link rel="icon" href="/images/logo.png" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        {{-- Global Preloader --}}
        <div id="app-preloader">
            <div class="preloader-content">
                <img src="/images/logo.png" alt="Loading..." class="preloader-logo" />
                <div class="preloader-spinner"></div>
            </div>
        </div>

        @inertia
    </body>
</html>
