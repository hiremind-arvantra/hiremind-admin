export default function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="#F4F1FF" />
      <path
        d="M14 12c-2.2 0-4 1.8-4 4 0 1 .4 1.9 1 2.6-.6.7-1 1.6-1 2.6 0 2.2 1.8 4 4 4 .3 0 .6 0 .9-.1.6 1.2 1.8 2 3.1 2 1.9 0 3.5-1.6 3.5-3.5V13.5C21.5 11.6 19.9 10 18 10c-1.3 0-2.5.8-3.1 2-.3-.1-.6 0-.9 0z"
        stroke="#6D4CFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 12c2.2 0 4 1.8 4 4 0 1-.4 1.9-1 2.6.6.7 1 1.6 1 2.6 0 2.2-1.8 4-4 4-.3 0-.6 0-.9-.1-.6 1.2-1.8 2-3.1 2-1.9 0-3.5-1.6-3.5-3.5V13.5C18.5 11.6 20.1 10 22 10c1.3 0 2.5.8 3.1 2 .3-.1.6 0 .9 0z"
        stroke="#6D4CFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="16" r="1" fill="#6D4CFF" />
      <circle cx="26" cy="16" r="1" fill="#6D4CFF" />
      <circle cx="14" cy="22" r="1" fill="#6D4CFF" />
      <circle cx="26" cy="22" r="1" fill="#6D4CFF" />
    </svg>
  );
}
