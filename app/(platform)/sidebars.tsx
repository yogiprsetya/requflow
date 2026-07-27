'use client';

import { FileText, Folder, Sparkles } from 'lucide-react';
import { SearchField } from '~/components/common/search-field';
import { Badge } from '~/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
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
  useSidebar,
} from '~/components/ui/sidebar';
import { useLocalSpec, type ApiEndpoint } from './use-local-spec';
import { cn } from '~/lib/css';

export const PlatformSidebar = () => {
  const { open } = useSidebar();
  const apiGroups = useLocalSpec();

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="md:top-14 md:left-12!"
    >
      <SidebarHeader className="mb-4">
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

        <SearchField collapsed={!open} />
      </SidebarHeader>

      <SidebarContent>
        {apiGroups.length === 0 ? (
          <Empty className="gap-3 px-4 py-8 group-data-[collapsible=icon]:hidden">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No endpoints yet</EmptyTitle>
              <EmptyDescription>
                Import an OpenAPI spec to explore its endpoints here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          apiGroups.map((group) => (
            <Collapsible key={group.tag} className="group/collapsible">
              <SidebarGroup className="py-0">
                <CollapsibleTrigger className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs font-medium transition-colors group-data-[collapsible=icon]:hidden">
                  <Folder className="size-4" />

                  <SidebarGroupLabel className="h-auto flex-1 p-0">
                    {group.tag}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>

                <CollapsibleContent className="ml-2">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.endpoints.map((endpoint) => (
                        <SidebarMenuItem
                          key={`${endpoint.method}:${endpoint.path}`}
                        >
                          <SidebarMenuButton
                            tooltip={`${endpoint.method.toUpperCase()} ${endpoint.path}`}
                          >
                            <Badge
                              className={cn(
                                'h-4.5 w-11 text-[0.6rem] font-semibold uppercase opacity-70',
                                methodBadgeClass(endpoint.method)
                              )}
                            >
                              {endpoint.method}
                            </Badge>

                            <span title={endpoint.summary}>
                              {endpoint.path}
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))
        )}
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
};

function methodBadgeClass(method: ApiEndpoint['method']): string {
  switch (method) {
    case 'get':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-transparent';
    case 'post':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-transparent';
    case 'put':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-transparent';
    case 'patch':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-transparent';
    case 'delete':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-transparent';
    default:
      return 'bg-card text-muted-foreground border-border';
  }
}
