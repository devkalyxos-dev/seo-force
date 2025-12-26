export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-500">Chargement...</p>
      </div>
    </div>
  );
}
