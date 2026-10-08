/** Approved forward-motion geometric identity; one shared mark across every surface. */
export function ShareFastMark({ size = 36, className }: { size?: number; className?: string }) {
 return <svg width={size} height={size} viewBox="0 0 110 120" className={className} aria-hidden="true" focusable="false" data-testid="share-fast-mark" data-brand-version="forward-v1"><path d="M25 23H85L72 39H37L28 50H68L36 89H9L39 53H1L25 23Z" fill="currentColor"/><path d="M80 50H104L73 89H50L80 50Z" fill="currentColor"/></svg>;
}
