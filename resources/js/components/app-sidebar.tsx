import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Folder, LayoutGrid, User } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    type PageProps = { auth?: { user?: { role?: string | number } } };
    const { auth } = usePage<PageProps>().props;
    const isAdmin = String(auth?.user?.role ?? '0') === '1';
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        ...(isAdmin
            ? [
                  {
                      title: 'Categories',
                      href: '/categories',
                      icon: Folder,
                  },
              ]
            : []),

        {
            title: 'Contacts',
            href: '/contacts',
            icon: User,
        },
        ...(isAdmin
            ? [
                  {
                      title: 'Users',
                      href: '/users',
                      icon: User,
                  },
              ]
            : []),
    ];
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
