import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types';
import { router } from '@inertiajs/react';
import { EditIcon, MoreHorizontalIcon } from 'lucide-react';
import { route } from 'ziggy-js';

interface UserActionsProps {
    user: User;
}

export default function UserActions({ user }: UserActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label={`More options for ${user.name}`}
                >
                    <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() =>
                                router.get(route('users.edit', user.id))
                            }
                        >
                            <EditIcon className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
