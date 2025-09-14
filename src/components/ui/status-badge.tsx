import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlgorithmStatus } from "@/types/algorithm";

interface StatusBadgeProps {
  status: AlgorithmStatus;
  className?: string;
}

const statusConfig = {
  draft: {
    label: '草稿',
    variant: 'secondary' as const,
    className: 'bg-status-draft/10 text-status-draft border-status-draft/20'
  },
  pending_review: {
    label: '待评审',
    variant: 'secondary' as const,
    className: 'bg-status-pending/10 text-status-pending border-status-pending/20'
  },
  approved: {
    label: '已通过',
    variant: 'secondary' as const,
    className: 'bg-status-approved/10 text-status-approved border-status-approved/20'
  },
  in_development: {
    label: '开发中',
    variant: 'secondary' as const,
    className: 'bg-primary/10 text-primary border-primary/20'
  },
  live: {
    label: '已上线',
    variant: 'secondary' as const,
    className: 'bg-success/10 text-success border-success/20'
  },
  deprecated: {
    label: '已下线',
    variant: 'secondary' as const,
    className: 'bg-status-deprecated/10 text-status-deprecated border-status-deprecated/20'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}