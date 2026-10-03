export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8A8.5 8.5 0 1 1 20.5 11.7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 7.4c.4-.3.8-.2 1 .2l.8 1.7c.1.3 0 .5-.3.8l-.5.5c.6 1.3 1.5 2.2 2.9 2.8l.6-.7c.2-.3.5-.3.8-.2l1.7.8c.4.2.5.6.3 1-.4.9-1.1 1.4-2.1 1.2-3.5-.6-6.4-3.4-6.8-6.4-.1-.7.6-1.4 1.6-1.7Z"
        fill="currentColor"
      />
    </svg>
  );
}
