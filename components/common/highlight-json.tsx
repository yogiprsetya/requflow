import { ReactNode } from 'react';

export const highlightJson = (value: string): ReactNode[] => {
  const tokens: ReactNode[] = [];
  const tokenPattern = /("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false|null)|([{}[\],:])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(value))) {
    if (match.index > lastIndex) tokens.push(value.slice(lastIndex, match.index));

    const token = match[0];
    const isKey = Boolean(match[1] && /^\s*:/.test(value.slice(tokenPattern.lastIndex)));
    const className = getJsonTokenClass(match, isKey);

    tokens.push(
      <span key={`${match.index}-${token}`} className={className}>
        {token}
      </span>
    );
    lastIndex = tokenPattern.lastIndex;
  }

  if (lastIndex < value.length) tokens.push(value.slice(lastIndex));
  return tokens;
};

const getJsonTokenClass = (match: RegExpExecArray, isKey: boolean): string => {
  if (isKey) return 'text-sky-600 dark:text-sky-400';
  if (match[1]) return 'text-emerald-600 dark:text-emerald-400';
  if (match[2]) return 'text-amber-600 dark:text-amber-400';
  if (match[3]) return 'text-violet-600 dark:text-violet-400';
  return 'text-muted-foreground';
};
