import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface GatedFeatureProps {
  isFree: boolean;
  feature: string;
  children: React.ReactNode;
}

export function GatedFeature({ isFree, feature, children }: GatedFeatureProps) {
  const [, navigate] = useLocation();

  if (!isFree) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground cursor-not-allowed opacity-60">
      <Lock className="h-3 w-3" />
      <span className="flex-1">{feature}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs px-2"
        onClick={(e) => {
          e.preventDefault();
          navigate("/plans");
        }}
        data-testid={`button-upgrade-${feature.toLowerCase().replace(/\s+/g, '-')}`}
      >
        Upgrade
      </Button>
    </div>
  );
}
