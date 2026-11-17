interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-xl bg-[var(--fg)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] shadow-lg lg:bottom-5"
    >
      {message}
    </div>
  );
}
