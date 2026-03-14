export default function JiraIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 116 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ── Icon mark ── */}
      <path
        d="M18.24 1.4 10.6 9.04a2.76 2.76 0 0 0 0 3.9l6.26 6.26 8.74-8.74a2.76 2.76 0 0 0 0-3.9L19.34 1.4a.78.78 0 0 0-1.1 0Z"
        fill="url(#jw-g1)"
      />
      <path
        d="M9.14 10.5 1.5 18.14a2.76 2.76 0 0 0 0 3.9l6.26 6.26 8.74-8.74L9.14 10.5Z"
        fill="url(#jw-g2)"
      />
      <path
        d="M18.24 1.4 10.6 9.04a2.76 2.76 0 0 0 0 3.9l6.26 6.26 8.74-8.74a2.76 2.76 0 0 0 0-3.9L19.34 1.4a.78.78 0 0 0-1.1 0Z"
        fill="url(#jw-g3)"
        opacity=".4"
      />
      {/* ── "Jira" wordmark ── */}
      <text
        x="34"
        y="23"
        fontSize="20"
        fontWeight="600"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fill="#253858"
        letterSpacing="-0.3"
      >
        Jira
      </text>
      <defs>
        <linearGradient id="jw-g1" x1="23.4" y1="4.15" x2="15.78" y2="11.77" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2684FF" />
          <stop offset="1" stopColor="#0052CC" />
        </linearGradient>
        <linearGradient id="jw-g2" x1="6.42" y1="13.16" x2="15.2" y2="21.7" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2684FF" />
          <stop offset="1" stopColor="#0052CC" />
        </linearGradient>
        <linearGradient id="jw-g3" x1="23.4" y1="4.15" x2="15.78" y2="11.77" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2684FF" />
          <stop offset="1" stopColor="#0052CC" />
        </linearGradient>
      </defs>
    </svg>
  )
}
