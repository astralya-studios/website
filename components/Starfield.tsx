/** Fixed, restrained celestial backdrop. Purely decorative. */
export default function Starfield() {
  return (
    <div
      aria-hidden="true"
      className="starfield pointer-events-none fixed inset-0 z-0 opacity-70"
    />
  );
}
