export function ChatEmptyState() {
  return (
    <div className="flex items-center justify-center h-full text-center py-12">
      <p className="text-muted-foreground text-sm">
        Aucun message pour l'instant 💬<br />
        <span className="text-xs">Sois le premier à écrire !</span>
      </p>
    </div>
  );
}
