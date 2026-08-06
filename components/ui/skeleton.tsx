import { cn } from '~/lib/css';

const Skeleton = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div data-slot="skeleton" className={cn('bg-muted animate-pulse rounded-md', className)} {...props} />;
};

export { Skeleton };
