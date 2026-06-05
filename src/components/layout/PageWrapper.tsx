import { cn } from '@/lib/utils';

type PageWrapperProps = {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
};

export function PageWrapper({ children, className, wide = false }: PageWrapperProps) {
  return (
    <main
      id="main-content"
      className={cn(
        'mx-auto w-full flex-1 px-[var(--content-padding-x)] pt-14',
        wide
          ? 'max-w-[var(--content-wide-width)]'
          : 'max-w-[var(--content-max-width)]',
        className
      )}
    >
      {children}
    </main>
  );
}
