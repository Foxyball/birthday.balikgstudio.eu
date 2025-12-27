import { Head } from '@inertiajs/react';
import { Cake, CalendarDays, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type Contact = {
    id: number;
    name: string;
    birthday: string;
    image_url: string | null;
    category: string | null;
};

type Props = {
    user: {
        name: string;
    };
    contacts: Contact[];
};

function formatBirthday(birthday: string): string {
    const date = new Date(birthday);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
    });
}

function daysUntilBirthday(birthday: string): number {
    const today = new Date();
    const birthDate = new Date(birthday);
    const thisYear = today.getFullYear();
    
    // Set birthday to this year
    let nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
    
    // If birthday has passed this year, use next year
    if (nextBirthday < today) {
        nextBirthday = new Date(thisYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function PublicBirthdayPage({ user, contacts }: Props) {
    // Sort contacts by upcoming birthday
    const sortedContacts = [...contacts].sort((a, b) => {
        return daysUntilBirthday(a.birthday) - daysUntilBirthday(b.birthday);
    });

    const upcomingContacts = sortedContacts.filter(c => daysUntilBirthday(c.birthday) <= 30);
    const otherContacts = sortedContacts.filter(c => daysUntilBirthday(c.birthday) > 30);

    return (
        <>
            <Head title={`${user.name}'s Birthday Calendar`} />
            
            <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                {/* Header */}
                <header className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-12">
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
                            <Cake className="h-10 w-10" />
                        </div>
                        <h1 className="text-4xl font-bold mb-2">{user.name}'s Birthday Calendar</h1>
                        <p className="text-pink-100">Celebrate the special moments together! 🎉</p>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8">
                    {/* Upcoming Birthdays Section */}
                    {upcomingContacts.length > 0 && (
                        <section className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <Gift className="h-6 w-6 text-pink-500" />
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                    Coming Up Soon!
                                </h2>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {upcomingContacts.map((contact) => {
                                    const days = daysUntilBirthday(contact.birthday);
                                    return (
                                        <Card 
                                            key={contact.id} 
                                            className="bg-gradient-to-br from-pink-50 to-white dark:from-gray-800 dark:to-gray-700 border-pink-200 dark:border-pink-800 shadow-lg hover:shadow-xl transition-shadow"
                                        >
                                            <CardContent className="flex items-center gap-4 p-6">
                                                <Avatar className="h-16 w-16 border-2 border-pink-300">
                                                    <AvatarImage src={contact.image_url || ''} alt={contact.name} />
                                                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white text-lg">
                                                        {getInitials(contact.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                                                        {contact.name}
                                                    </h3>
                                                    <p className="text-pink-600 dark:text-pink-400 font-medium">
                                                        {formatBirthday(contact.birthday)}
                                                    </p>
                                                    {contact.category && (
                                                        <Badge variant="secondary" className="mt-1">
                                                            {contact.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <div className={`text-2xl font-bold ${
                                                        days === 0 
                                                            ? 'text-green-500' 
                                                            : days <= 7 
                                                                ? 'text-pink-500' 
                                                                : 'text-purple-500'
                                                    }`}>
                                                        {days === 0 ? '🎂' : days}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {days === 0 ? 'Today!' : days === 1 ? 'day' : 'days'}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* All Birthdays Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <CalendarDays className="h-6 w-6 text-purple-500" />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                All Birthdays
                            </h2>
                        </div>
                        
                        {contacts.length === 0 ? (
                            <Card className="p-8 text-center">
                                <CardContent>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No birthdays to show yet.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {(upcomingContacts.length > 0 ? otherContacts : sortedContacts).map((contact) => {
                                    const days = daysUntilBirthday(contact.birthday);
                                    return (
                                        <Card 
                                            key={contact.id} 
                                            className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                                        >
                                            <CardContent className="flex items-center gap-3 p-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={contact.image_url || ''} alt={contact.name} />
                                                    <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-600 dark:text-gray-200">
                                                        {getInitials(contact.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate">
                                                        {contact.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatBirthday(contact.birthday)}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm text-gray-400">
                                                    {days}d
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>

                {/* Footer */}
                <footer className="py-8 text-center text-gray-400 text-sm">
                    <p>Made with ❤️ using Birthday Reminder</p>
                </footer>
            </div>
        </>
    );
}
