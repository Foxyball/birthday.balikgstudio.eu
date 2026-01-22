<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Under Maintenance</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Ubuntu', ui-sans-serif, system-ui, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #fafafa;
            color: #171717;
            padding: 1rem;
        }

        @media (prefers-color-scheme: dark) {
            body {
                background-color: #0a0a0a;
                color: #fafafa;
            }
        }

        .container {
            text-align: center;
            max-width: 500px;
        }

        .emoji {
            font-size: 150px;
            line-height: 1;
            margin-bottom: 2rem;
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #7c3aed;
        }

        @media (prefers-color-scheme: dark) {
            h1 {
                color: #a78bfa;
            }
        }

        p {
            font-size: 1.125rem;
            color: #737373;
            line-height: 1.75;
            margin-bottom: 2rem;
        }

        @media (prefers-color-scheme: dark) {
            p {
                color: #a3a3a3;
            }
        }

        .status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: #737373;
        }

        @media (prefers-color-scheme: dark) {
            .status {
                color: #a3a3a3;
            }
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background-color: #eab308;
            border-radius: 50%;
            animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: 0.5;
                transform: scale(0.9);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">🔌</div>
        <h1>We're Under Maintenance</h1>
        <p>Our website is down for maintenance. We will be back shortly.</p>
        <div class="status">
            <span class="status-dot"></span>
            <span>Working on it...</span>
        </div>
    </div>
</body>
</html>
