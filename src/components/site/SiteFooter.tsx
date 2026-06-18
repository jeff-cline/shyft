export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-ink/10 py-10 text-center text-sm opacity-60">
      <div className="font-display text-2xl mb-2">shYft</div>
      <div>© {new Date().getFullYear()} — Make the shYft.</div>
    </footer>
  );
}
