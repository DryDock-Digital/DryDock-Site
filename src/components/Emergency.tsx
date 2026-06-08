type Props = { onTriage: () => void }

export function Emergency({ onTriage }: Props) {
  return (
    <section className="emergency" aria-label="Emergency triage">
      <div className="container">
        <div className="msg">
          <svg
            className="siren"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 18v-6a5 5 0 0 1 10 0v6" />
            <path d="M5 21h14M5 18h14M12 2v1M4.2 5.2l.7.7M19.8 5.2l-.7.7" />
          </svg>
          <span>
            App leaking data or down right now?{' '}
            <span className="light">We offer 48-hour emergency triage.</span>
          </span>
        </div>
        <button type="button" className="e-cta" onClick={onTriage}>
          Get emergency help
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  )
}
