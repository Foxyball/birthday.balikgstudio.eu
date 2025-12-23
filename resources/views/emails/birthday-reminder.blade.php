<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Birthday Reminder</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; background: #f6f7f9; color: #111827; }
        .container { max-width: 640px; margin: 24px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); overflow: hidden; }
        .header { padding: 20px 24px; background: #111827; color: #ffffff; }
        .title { margin: 0; font-size: 20px; font-weight: 600; }
        .content { padding: 24px; }
        .lead { margin: 0 0 16px; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; font-size: 13px; color: #374151; }
        td { font-size: 14px; }
        .footer { padding: 16px 24px; font-size: 12px; color: #6b7280; background: #f9fafb; }
    </style>
    <!--[if mso]>
    <style>
        table { border-collapse: collapse; }
        .container { width: 640px; }
    </style>
    <![endif]-->
    </head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Birthday Reminder</h1>
        </div>
        <div class="content">
            <p class="lead">Hello {{ $user->name ?? 'there' }},</p>
            <p class="lead">The following contact(s) have a birthday today ({{ $today->toFormattedDateString() }}):</p>

            <table role="table" aria-label="Birthdays">
                <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Date</th>
                        <th scope="col">Age</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($contacts as $c)
                        <tr>
                            <td>{{ $c['name'] }}</td>
                            <td>{{ $c['date'] }}</td>
                            <td>{{ $c['age'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <p class="lead" style="margin-top: 16px;">Have a great day!</p>
        </div>
        <div class="footer">
            <p>This is an automated reminder from Birthday Reminder App.</p>
        </div>
    </div>
</body>
</html>
