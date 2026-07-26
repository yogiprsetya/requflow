import { Boxes, Container } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';

export const Sidedock = () => {
  return (
    <nav
      aria-label="Quick navigation"
      className="bg-sidebar border-secondary fixed top-14 bottom-0 left-0 z-20 hidden w-12 flex-col items-center border-r py-3 md:flex"
    >
      <div className="space-y-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                className="opacity-50"
                size="icon-lg"
                aria-label="Collection"
              >
                <Boxes />
              </Button>
            }
          />
          <TooltipContent side="right">Collection</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                size="icon-lg"
                variant="secondary"
                aria-label="Environment"
              >
                <Container />
              </Button>
            }
          />
          <TooltipContent side="right">Environment</TooltipContent>
        </Tooltip>
      </div>

      <div className="text-muted-foreground mt-auto text-[0.6rem] font-medium [writing-mode:vertical-rl]">
        REQFLOW
      </div>
    </nav>
  );
};
