import { Search } from 'lucide-react';

import { Input } from '~/components/ui/input';
import { cn } from '~/lib/css';

interface SearchFieldProps {
  collapsed: boolean;
}

export function SearchField({ collapsed }: SearchFieldProps) {
  return (
    <label className="relative block w-full">
      <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />

      <Input
        aria-label="Search"
        placeholder={collapsed ? '' : 'Search'}
        disabled={collapsed}
        className={cn(collapsed ? 'w-8' : 'pl-8', 'h-8')}
      />
    </label>
  );
}
