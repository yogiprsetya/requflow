import { Braces, FileUp, MousePointerClick } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';

export const PlaygroundEmpty = () => (
  <Empty className="h-full min-h-130 border">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Braces />
      </EmptyMedia>

      <EmptyTitle>Build your first request</EmptyTitle>

      <EmptyDescription>
        Import an OpenAPI spec to automatically generate params, headers, and a request body in the Playground.
      </EmptyDescription>
    </EmptyHeader>

    <EmptyContent className="flex-row justify-center">
      <Button>
        <FileUp data-icon="inline-start" />
        Import spec
      </Button>

      <Button variant="outline">
        <MousePointerClick data-icon="inline-start" />
        Add manually
      </Button>
    </EmptyContent>
  </Empty>
);
