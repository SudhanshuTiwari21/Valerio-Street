export default function Loading() {
  return (
    <div className="flex min-h-[60svh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border border-charcoal/20 border-t-charcoal animate-spin" />
        <p className="text-[10px] uppercase tracking-editorial text-charcoal/50">Atelier</p>
      </div>
    </div>
  );
}
