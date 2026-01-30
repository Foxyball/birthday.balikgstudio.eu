import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchIcon, Loader2Icon, UserIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SearchResult {
    id: number;
    name: string;
    email: string;
    birthday: string | null;
    image_url: string | null;
}

export default function QuickSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatBirthday = (date: string | null) => {
        if (!date) return null;
        try {
            return format(new Date(date), 'MMM d');
        } catch {
            return null;
        }
    };

    const searchContacts = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                route('contacts.search') + `?q=${encodeURIComponent(searchQuery)}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                }
            );
            const data = await response.json();
            setResults(data);
            setIsOpen(data.length > 0);
            setSelectedIndex(-1);
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Debounce the search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            searchContacts(value);
        }, 300);
    };

    const handleSelectContact = (contact: SearchResult) => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        router.get(route('contacts.edit', contact.id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    handleSelectContact(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full max-w-sm">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Quick search contacts..."
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    className="pl-9 pr-9"
                />
                {isLoading && (
                    <Loader2Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
            </div>

            {/* Results dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto rounded-md border bg-popover p-1 shadow-md">
                    {results.map((contact, index) => (
                        <button
                            key={contact.id}
                            type="button"
                            onClick={() => handleSelectContact(contact)}
                            className={cn(
                                'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm outline-none transition-colors',
                                'hover:bg-accent hover:text-accent-foreground',
                                selectedIndex === index && 'bg-accent text-accent-foreground'
                            )}
                        >
                            <Avatar className="h-8 w-8">
                                {contact.image_url ? (
                                    <AvatarImage src={contact.image_url} alt={contact.name} />
                                ) : null}
                                <AvatarFallback className="text-xs">
                                    {getInitials(contact.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="font-medium truncate">{contact.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {contact.email}
                                </div>
                            </div>
                            {contact.birthday && (
                                <div className="text-xs text-muted-foreground">
                                    🎂 {formatBirthday(contact.birthday)}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* No results message */}
            {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-md">
                    <UserIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    No contacts found for "{query}"
                </div>
            )}
        </div>
    );
}
