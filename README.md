# Birthday Manager

A modern web application for managing birthdays and contacts, built with Laravel and React. Never forget an important birthday again!

## Features

- **Contact Management**: Store and organize your contacts with detailed information including name, email, phone, and birthday
- **Birthday Tracking**: Keep track of upcoming birthdays with visual calendar integration
- **Categories**: Organize contacts into custom categories
- **Gift Ideas**: Store gift ideas for each contact
- **Public Birthday Sharing**: Share your birthday calendar with others via a secure, shareable link
- **Import/Export**: Bulk import and export contacts for easy data management
- **User Authentication**: Secure login with Google OAuth integration
- **Subscription Management**: Built-in Stripe integration for premium features
- **Admin Panel**: User management and administrative controls
- **Dark Mode**: Full dark mode support for comfortable viewing
- **Responsive Design**: Mobile-friendly interface that works on all devices

## Technology Stack

### Backend
- **Laravel 12**: PHP framework for robust backend logic
- **PHP 8.2+**: Modern PHP version
- **SQLite/MySQL**: Flexible database options
- **Laravel Fortify**: Authentication and two-factor authentication
- **Laravel Cashier**: Stripe subscription management
- **Laravel Socialite**: OAuth authentication

### Frontend
- **React 19**: Modern React with the latest features
- **TypeScript**: Type-safe JavaScript
- **Inertia.js**: Modern monolithic application framework
- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Vite**: Fast build tool and dev server
- **Lucide React**: Beautiful icon library

## Requirements

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- SQLite or MySQL database

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Foxyball/birthday.balikgstudio.eu.git
   cd birthday.balikgstudio.eu
   ```

2. **Install dependencies**
   ```bash
   composer setup
   ```
   
   This command will:
   - Install PHP dependencies
   - Copy `.env.example` to `.env`
   - Generate application key
   - Run database migrations
   - Install Node.js dependencies
   - Build frontend assets

3. **Configure environment**
   
   Edit `.env` file and configure:
   - Database connection (SQLite is configured by default)
   - Mail settings (for notifications)
   - Stripe keys (for subscription features)
   - Google OAuth credentials (for social login)

4. **Create admin user** (optional)
   ```bash
   php artisan tinker
   ```
   Then create an admin user through your preferred method.

## Development

### Start development server

Run all services concurrently:
```bash
composer dev
```

This starts:
- Laravel development server (http://localhost:8000)
- Queue worker
- Log viewer
- Vite dev server (with HMR)

### Individual commands

- **Frontend development**: `npm run dev`
- **Build frontend**: `npm run build`
- **Run tests**: `composer test` or `php artisan test`
- **Code formatting**: `npm run format`
- **Linting**: `npm run lint`
- **Type checking**: `npm run types`
- **PHP linting**: `./vendor/bin/pint`

## Usage

1. **Register an account** at `/register` or login with Google
2. **Add contacts** with their birthday information
3. **Create categories** to organize your contacts
4. **Set reminders** to never miss a birthday
5. **Share your calendar** using the public birthday sharing feature
6. **Import contacts** in bulk using CSV templates
7. **Upgrade to premium** for additional features (if applicable)

## Project Structure

- `app/` - Laravel application code (Models, Controllers, etc.)
- `resources/js/` - React frontend application
  - `pages/` - Inertia.js page components
  - `components/` - Reusable React components
  - `hooks/` - Custom React hooks
- `routes/` - Application routes
- `database/` - Database migrations and seeders
- `tests/` - PHP tests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-sourced under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
