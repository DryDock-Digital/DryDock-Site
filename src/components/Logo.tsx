/**
 * The Drydock mark — used in the header and footer.
 * Path colors (stroke + fill) are recolored via CSS:
 *   .logo svg path[stroke]   → stroke: var(--teal)
 *   .logo svg path[fill="#0E2436"] → fill: var(--ink)
 *   .footer .logo svg path[fill="#FFFFFF"] → fill: var(--ink)
 */
type Props = { variant?: 'header' | 'footer'; size?: number }

export function Logo({ variant = 'header', size = 34 }: Props) {
  // The footer variant ships with white hull (overridden to --ink by CSS).
  const hullFill = variant === 'footer' ? '#FFFFFF' : '#0E2436'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 16 L14 44 Q14 52 22 52 L42 52 Q50 52 50 44 L50 16"
        stroke="#19B9C2"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M19 24 L45 24 L40 36 Q32 41 24 36 Z" fill={hullFill} />
    </svg>
  )
}
