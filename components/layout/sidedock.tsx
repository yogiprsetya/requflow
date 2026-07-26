import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { SidebarTrigger } from '~/components/ui/sidebar';

export const Sidedock = () => {
  return (
    <nav
      aria-label="Quick navigation"
      className="bg-sidebar border-secondary fixed top-14 bottom-0 left-0 z-20 hidden w-12 flex-col items-center border-r py-3 md:flex"
    >
      <div className="flex flex-col items-center gap-1">
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
