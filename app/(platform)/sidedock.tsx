import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { SidebarTrigger } from '~/components/ui/sidebar';

export const Sidedock = () => {
  return (
    <nav
      aria-label="Quick navigation"
      className="bg-sidebar border-secondary sticky top-14 z-20 flex h-[calc(100svh-3.5rem)] w-12 shrink-0 flex-col items-center border-r py-3"
    >
      <div className="flex flex-col items-center gap-2">
        <SidebarTrigger aria-label="Toggle navigation sidebar" />

        <Button type="button" size="icon-lg" aria-label="Open quick create">
          <Plus />
        </Button>
      </div>

      <div className="text-muted-foreground mt-auto text-[0.6rem] font-medium [writing-mode:vertical-rl]">
        REQFLOW
      </div>
    </nav>
  );
};
