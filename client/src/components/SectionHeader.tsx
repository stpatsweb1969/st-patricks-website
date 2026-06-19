import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  label?: string;
  action?: React.ReactNode;
  /** Use "sm" for inline/card headers, "md" for standard sections, "lg" for hero sections */
  size?: "sm" | "md" | "lg";
  /** Override icon background color class */
  iconBg?: string;
  /** Override icon color class */
  iconColor?: string;
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  label,
  action,
  size = "md",
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
  className = "",
}: SectionHeaderProps) {
  const sizeConfig = {
    sm: {
      container: "w-7 h-7 rounded-lg",
      icon: "w-3.5 h-3.5",
      title: "text-h3",
      gap: "gap-2",
      mb: "mb-3",
    },
    md: {
      container: "w-8 h-8 rounded-lg",
      icon: "w-4 h-4",
      title: "text-h2",
      gap: "gap-2.5",
      mb: "mb-4",
    },
    lg: {
      container: "w-9 h-9 rounded-lg",
      icon: "w-4.5 h-4.5",
      title: "text-h1",
      gap: "gap-3",
      mb: "mb-4",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-end justify-between ${config.mb} ${className}`}>
      <div className={`flex items-center ${config.gap}`}>
        <div
          className={`${config.container} ${iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`${config.icon} ${iconColor}`} />
        </div>
        <div>
          {label && (
            <p className="text-gold text-xs font-semibold tracking-[0.15em] uppercase leading-none mb-1">
              {label}
            </p>
          )}
          <h2
            className={`font-serif ${config.title} font-bold text-foreground tracking-tight`}
          >
            {title}
          </h2>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
