export function Watermark() {
  return (
    <div
      className="fixed bottom-16 right-4 md:bottom-6 md:right-8 pointer-events-none select-none z-0 opacity-[0.15] flex flex-col items-center justify-center font-serif text-dragao-black"
      aria-hidden="true"
    >
      {/* Shotokan (松濤館), escrita vertical de cima para baixo */}
      <span className="text-4xl md:text-5xl font-bold leading-tight">松</span>
      <span className="text-4xl md:text-5xl font-bold leading-tight">濤</span>
      <span className="text-4xl md:text-5xl font-bold leading-tight">館</span>
    </div>
  );
}
