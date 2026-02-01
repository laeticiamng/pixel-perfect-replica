import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatItem {
  icon: ReactNode;
  label: string;
  value: string | number;
  colorClass?: string;
  onClick?: () => void;
}

interface StatsGridProps {
  items: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ items, columns = 2, className }: StatsGridProps) {
  return (
    <div 
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        columns === 4 && "grid-cols-4",
        className
      )}
    >
      {items.map((item, index) => {
        const Card = item.onClick ? 'button' : 'div';
        return (
          <Card
            key={index}
            onClick={item.onClick}
            className={cn(
              "glass rounded-xl p-4 animate-slide-up text-left",
              item.onClick && "hover:scale-105 hover:bg-card/90 active:scale-95 transition-all duration-300"
            )}
            style={{ animationDelay: `${0.05 * index}s` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("p-1.5 rounded-lg", item.colorClass || "bg-coral/20 [&>svg]:text-coral")}>
                {item.icon}
              </div>
              <span className="text-sm text-muted-foreground truncate">{item.label}</span>
            </div>
            <p className={cn(
              "text-2xl sm:text-3xl font-bold",
              item.colorClass?.includes('coral') 
                ? "bg-gradient-to-r from-coral to-coral-light bg-clip-text text-transparent"
                : "text-foreground"
            )}>
              {item.value}
            </p>
          </Card>
        );
      })}
    </div>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  colorClass?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({ icon, label, value, colorClass, onClick, className }: StatCardProps) {
  const Card = onClick ? 'button' : 'div';
  return (
    <Card
      onClick={onClick}
      className={cn(
        "glass rounded-xl p-4 text-left",
        onClick && "hover:scale-105 hover:bg-card/90 active:scale-95 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-lg", colorClass || "bg-coral/20 [&>svg]:text-coral")}>
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className={cn(
        "text-3xl font-bold",
        colorClass?.includes('coral') 
          ? "bg-gradient-to-r from-coral to-coral-light bg-clip-text text-transparent"
          : "text-foreground"
      )}>
        {value}
      </p>
    </Card>
  );
}
