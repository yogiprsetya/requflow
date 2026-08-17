'use client';

import { useState } from 'react';
import { FileText, Folder, FolderPen, Sparkles } from 'lucide-react';
import { SearchField } from '~/components/common/search-field';
import { Badge } from '~/components/ui/badge';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';
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
import { useWorkspaceStore } from './workspace-store';
import type { ApiEndpoint } from './types';
import { methodBadgeClass } from './utils/helpers';
import { DialogRenameFolder } from './dialog-rename-folder';
import { getActiveWorkspace } from './workspace-store';

export const PlatformSidebar = () => {
  const { open } = useSidebar();
  const apiGroups = useLocalSpec();
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeEndpointId = usePlaygroundStore((state) => state.activeEndpointId);
  const openEndpoint = usePlaygroundStore((state) => state.openEndpoint);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [renameFolder, setRenameFolder] = useState<{ tag: string; label: string } | null>(null);

  const groups = filterGroups(apiGroups, searchQuery);
  const activeWorkspace = getActiveWorkspace({ activeWorkspaceId, workspaces });

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="md:top-14 md:left-12!">
      <SidebarHeader className="mt-1 mb-4">
        <WorkspaceBreadcrumb />
        <Separator className="bg-secondary mb-1" />
        <SearchField collapsed={!open} value={searchQuery} onChange={setSearchQuery} />
      </SidebarHeader>

      <SidebarContent>
        {groups.length === 0 ? (
          <Empty className="gap-3 px-4 py-8 group-data-[collapsible=icon]:hidden">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText aria-hidden="true" />
              </EmptyMedia>

              <EmptyTitle>{searchQuery.trim() ? 'No matching endpoints' : 'No endpoints yet'}</EmptyTitle>

              <EmptyDescription>
                {searchQuery.trim()
                  ? 'Try a different path, method, or group name.'
                  : 'Import an OpenAPI spec to explore its endpoints here.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          groups.map((apiGroup) => (
            <FolderItem
              key={apiGroup.tag}
              group={apiGroup}
              isOpen={
                apiGroup.endpoints.some(
                  (endpoint) => activeEndpointId === `${endpoint.method}:${endpoint.path}`
                ) || openGroups[apiGroup.tag] === true
              }
              onOpenChange={(open) => setOpenGroups((groups) => ({ ...groups, [apiGroup.tag]: open }))}
              onSelectEndpoint={openEndpoint}
              activeEndpointId={activeEndpointId}
              onRename={() => setRenameFolder({ tag: apiGroup.tag, label: apiGroup.label })}
            />
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

      {renameFolder && (
        <DialogRenameFolder
          workspaceId={activeWorkspace.id}
          tag={renameFolder.tag}
          folderName={renameFolder.label}
          open
          onOpenChange={(open) => !open && setRenameFolder(null)}
        />
      )}
    </Sidebar>
  );
};

type SidebarEndpoint = Pick<ApiEndpoint, 'method' | 'path' | 'summary'>;
type SidebarGroup = { tag: string; label: string; endpoints: SidebarEndpoint[] };

const filterGroups = (groups: SidebarGroup[], query: string): SidebarGroup[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return groups;

  return groups
    .map((apiGroup) => ({
      ...apiGroup,
      endpoints: apiGroup.endpoints.filter((endpoint) =>
        [apiGroup.label, apiGroup.tag, endpoint.path, endpoint.method].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        )
      ),
    }))
    .filter((apiGroup) => apiGroup.endpoints.length > 0);
};

type FolderItemProps = {
  group: SidebarGroup;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectEndpoint: (endpointId: string) => void;
  activeEndpointId: string | null;
  onRename: () => void;
};

const FolderItem = ({
  group,
  isOpen,
  onOpenChange,
  onSelectEndpoint,
  activeEndpointId,
  onRename,
}: FolderItemProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Collapsible open={isOpen} onOpenChange={onOpenChange} className="group/collapsible">
          <SidebarGroup className="py-0">
            <CollapsibleTrigger className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs font-medium transition-colors group-data-[collapsible=icon]:hidden">
              <Folder className="size-4" />

              <SidebarGroupLabel
                className="h-auto flex-1 p-0"
                title={group.tag !== group.label ? group.tag : undefined}
              >
                {group.label}
              </SidebarGroupLabel>
            </CollapsibleTrigger>

            <CollapsibleContent className="ml-2">
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.endpoints.map((endpoint) => (
                    <SidebarMenuItem key={`${endpoint.method}:${endpoint.path}`}>
                      <SidebarMenuButton
                        isActive={activeEndpointId === `${endpoint.method}:${endpoint.path}`}
                        tooltip={`${endpoint.method.toUpperCase()} ${endpoint.path}`}
                        onClick={() => onSelectEndpoint(`${endpoint.method}:${endpoint.path}`)}
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
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={onRename}>
          <FolderPen /> Rename folder
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
