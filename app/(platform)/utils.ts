import { type ApiEndpoint } from './types';

export const methodBadgeClass = (method: ApiEndpoint['method']): string => {
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
};

export const methodTextClass = (method: ApiEndpoint['method']): string => {
  switch (method) {
    case 'get':
      return 'text-green-800 dark:text-green-300';
    case 'post':
      return 'text-yellow-800 dark:text-yellow-300';
    case 'put':
      return 'text-blue-800 dark:text-blue-300';
    case 'patch':
      return 'text-purple-800 dark:text-purple-300';
    case 'delete':
      return 'text-red-800 dark:text-red-300';
    default:
      return 'text-muted-foreground';
  }
};
