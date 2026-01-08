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
   - Database connection
   - Mail settings
   - Stripe keys
   - Google OAuth credentials

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-sourced under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
