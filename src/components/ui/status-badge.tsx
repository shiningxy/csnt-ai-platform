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
  under_review: {
    label: '评审中',
    variant: 'secondary' as const,
    className: 'bg-primary/10 text-primary border-primary/20'
  },
  pending_confirmation: {
    label: '待确认',
    variant: 'secondary' as const,
    className: 'bg-success/10 text-success border-success/20'
  },
  pending_product: {
    label: '待产品',
    variant: 'secondary' as const,
    className: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  pending_frontend: {
    label: '待前端',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-700 border-blue-200'
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
  },
  // 保持向后兼容性的旧状态
  approved: {
    label: '已通过',
    variant: 'secondary' as const,
    className: 'bg-status-approved/10 text-status-approved border-status-approved/20'
  },
  rejected: {
    label: '已驳回',
    variant: 'destructive' as const,
    className: 'bg-danger/10 text-danger border-danger/20'
  },
  conditional: {
    label: '有条件通过',
    variant: 'secondary' as const,
    className: 'bg-warning/10 text-warning border-warning/20'
  },
  in_development: {
    label: '开发中',
    variant: 'secondary' as const,
    className: 'bg-primary/10 text-primary border-primary/20'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  // 如果状态配置不存在，提供默认配置
  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return (
      <Badge 
        variant="outline"
        className={cn('bg-muted/10 text-muted-foreground border-muted/20', className)}
      >
        {status}
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}