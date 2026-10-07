/** Two shared origins converge into one forward route: the SHARE FAST brand mark. */
export function ShareFastMark({ size = 32, className }: { size?: number; className?: string }) {
 return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true" focusable="false" data-testid="share-fast-mark">
  <path d="M12 12h5l9 12h11M12 36h5l9-12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="m31 17 7 7-7 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="9" cy="12" r="3.5" fill="currentColor"/>
  <circle cx="9" cy="36" r="3.5" fill="currentColor"/>
 </svg>;
}
