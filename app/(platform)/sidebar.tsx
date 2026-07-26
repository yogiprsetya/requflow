import { FolderKanban, LayoutDashboard, Search, Sparkles } from 'lucide-react';
import { Input } from '~/components/ui/input';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar';

const primaryNavigation = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Projects', icon: FolderKanban },
];

export function PlatformSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      className="w-72 md:top-14! md:left-12! md:h-[calc(100svh-3.5rem)]!"
    >
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
            R
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-semibold">Workspace</p>
            <p className="text-sidebar-foreground/60 truncate text-[0.65rem]">
              Personal space
            </p>
          </div>
        </div>

        <label className="relative block w-full">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            aria-label="Search"
            placeholder="Search"
            className="h-8 pl-8"
          />
        </label>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNavigation.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={item.active}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavigation.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>

      <SidebarFooter>
        <div className="bg-sidebar-accent/60 flex items-center gap-2 rounded-md p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1.5">
          <Sparkles className="text-sidebar-primary size-4 shrink-0" />
          <p className="text-sidebar-foreground/70 text-[0.65rem] leading-tight group-data-[collapsible=icon]:hidden">
            Upgrade your workspace for more capacity.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
