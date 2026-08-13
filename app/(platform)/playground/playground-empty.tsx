import { Braces, FileUp, MousePointerClick } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { ImportSpecDialog } from '../dialog-import-spec';
import { AddManualEndpointDialog } from '../dialog-add-manual-endpoint';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';

export const PlaygroundEmpty = () => {
  const [manualDialogOpen, setManualDialogOpen] = useState(false);

  return (
    <>
      <Empty className="h-full min-h-130 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Braces />
          </EmptyMedia>

          <EmptyTitle>Build your first request</EmptyTitle>

          <EmptyDescription>
            Import an OpenAPI spec to automatically generate params, headers, and a request body in the
            Playground.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="flex-row justify-center">
          <ImportSpecDialog
            trigger={(onOpen) => (
              <Button onClick={onOpen}>
                <FileUp data-icon="inline-start" />
                Import spec
              </Button>
            )}
          />

          <Button variant="outline" onClick={() => setManualDialogOpen(true)}>
            <MousePointerClick data-icon="inline-start" />
            Add manually
          </Button>
        </EmptyContent>
      </Empty>
      <AddManualEndpointDialog open={manualDialogOpen} onOpenChange={setManualDialogOpen} />
    </>
  );
};
