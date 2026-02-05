export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-coral/20 rounded-full blur-[120px] animate-float" />
      <div 
        className="absolute top-1/2 -right-32 w-80 h-80 bg-signal-green/15 rounded-full blur-[100px] animate-float" 
        style={{ animationDelay: '2s' }} 
      />
      <div 
        className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-coral/10 rounded-full blur-[80px] animate-float" 
        style={{ animationDelay: '4s' }} 
      />
    </div>
  );
}
