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
import { Folder, LayoutGrid, User, Upload } from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';
import ImportContactsModal from './contacts/ImportContactsModal';

export function AppSidebar() {
    const [importModalOpen, setImportModalOpen] = useState(false);
    
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
        <>
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
                    
                    {/* Import Section */}
                    <SidebarMenu className="mt-2 px-2">
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                onClick={() => setImportModalOpen(true)}
                                tooltip="Import Contacts"
                            >
                                <Upload className="h-4 w-4" />
                                <span>Import</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>

                <SidebarFooter>
                    <NavUser />
                </SidebarFooter>
            </Sidebar>
            
            <ImportContactsModal 
                open={importModalOpen} 
                onOpenChange={setImportModalOpen} 
            />
        </>
    );
}
