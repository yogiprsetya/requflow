'use client';

import { useState } from 'react';
import { FileText, Folder, Sparkles } from 'lucide-react';
import { SearchField } from '~/components/common/search-field';
import { Badge } from '~/components/ui/badge';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
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
import { useLocalSpec } from './use-local-spec';
import { cn } from '~/lib/css';
import { WorkspaceBreadcrumb } from './workspace-breadcrumb';
import { Separator } from '~/components/ui/separator';
import { usePlaygroundStore } from './playground/playground-store';
import { methodBadgeClass } from './utils';

export const PlatformSidebar = () => {
  const { open } = useSidebar();
  const apiGroups = useLocalSpec();
  const activeEndpointId = usePlaygroundStore((state) => state.activeEndpointId);
  const openEndpoint = usePlaygroundStore((state) => state.openEndpoint);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="md:top-14 md:left-12!">
      <SidebarHeader className="mt-1 mb-4">
        <WorkspaceBreadcrumb />
        <Separator className="bg-secondary mb-1" />
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

              <EmptyDescription>Import an OpenAPI spec to explore its endpoints here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          apiGroups.map((group) => (
            <Collapsible
              key={group.tag}
              open={
                group.endpoints.some((endpoint) => activeEndpointId === `${endpoint.method}:${endpoint.path}`) ||
                openGroups[group.tag] === true
              }
              onOpenChange={(open) => setOpenGroups((groups) => ({ ...groups, [group.tag]: open }))}
              className="group/collapsible"
            >
              <SidebarGroup className="py-0">
                <CollapsibleTrigger className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs font-medium transition-colors group-data-[collapsible=icon]:hidden">
                  <Folder className="size-4" />

                  <SidebarGroupLabel className="h-auto flex-1 p-0">{group.tag}</SidebarGroupLabel>
                </CollapsibleTrigger>

                <CollapsibleContent className="ml-2">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.endpoints.map((endpoint) => (
                        <SidebarMenuItem key={`${endpoint.method}:${endpoint.path}`}>
                          <SidebarMenuButton
                            isActive={activeEndpointId === `${endpoint.method}:${endpoint.path}`}
                            tooltip={`${endpoint.method.toUpperCase()} ${endpoint.path}`}
                            onClick={() => openEndpoint(`${endpoint.method}:${endpoint.path}`)}
                          >
                            <Badge
                              className={cn(
                                'h-4.5 w-11 text-[0.6rem] font-semibold uppercase opacity-70',
                                methodBadgeClass(endpoint.method)
                              )}
                            >
                              {endpoint.method}
                            </Badge>

                            <span title={endpoint.summary}>{endpoint.path}</span>
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
