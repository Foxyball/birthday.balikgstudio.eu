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
import {usePage } from '@inertiajs/react';
import { Folder, LayoutGrid, User, Upload, Download } from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';
import ImportContactsModal from './contacts/ImportContactsModal';
import ExportDatabaseModal from './database/ExportDatabaseModal';

export function AppSidebar() {
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    
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
                            <div className="flex w-full items-center gap-3 p-4">
                                <AppLogo />
                            </div>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={mainNavItems} />
                    
                    {/* Import/Export Section */}
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
                        {isAdmin && (
                            <SidebarMenuItem>
                                <SidebarMenuButton 
                                    onClick={() => setExportModalOpen(true)}
                                    tooltip="Export Database"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Export DB</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
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
            
            <ExportDatabaseModal 
                open={exportModalOpen} 
                onOpenChange={setExportModalOpen} 
            />
        </>
    );
}
