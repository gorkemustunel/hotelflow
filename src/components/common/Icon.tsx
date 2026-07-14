import * as icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
}

/**
 * Renders a lucide-react icon by its string name. This indirection lets
 * category/service data (which comes from "mock backend" data files) store
 * icon names as plain strings, exactly as a real API response would.
 */
export function Icon({ name, ...props }: IconProps) {
  const Cmp = (icons as unknown as Record<string, icons.LucideIcon>)[name];
  if (!Cmp) return <icons.CircleHelp {...props} />;
  return <Cmp {...props} />;
}
