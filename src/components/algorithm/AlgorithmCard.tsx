import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/hooks/use-toast';
import { AlgorithmAsset } from '@/types/algorithm';
import { 
  Brain, 
  User, 
  Calendar, 
  Copy, 
  Eye, 
  Star,
  TrendingUp,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlgorithmCardProps {
  algorithm: AlgorithmAsset;
  className?: string;
}

export function AlgorithmCard({ algorithm, className }: AlgorithmCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleCopyCall = () => {
    if (algorithm.apiExample) {
      navigator.clipboard.writeText(algorithm.apiExample);
      toast({
        title: "调用示例已复制",
        description: "API调用代码已复制到剪贴板",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-500",
        "border border-border/50 bg-gradient-card",
        "hover:shadow-[var(--card-glow-hover)] hover:border-primary/30",
        "hover:-translate-y-1 hover:scale-[1.02]",
        // Luminous border effect
        "before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-r before:from-primary/20 before:via-primary/40 before:to-primary/20",
        "before:rounded-lg before:opacity-0 before:transition-opacity before:duration-500",
        "hover:before:opacity-100",
        // Inner content positioning
        "before:-z-10",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="transition-transform duration-300 group-hover:scale-105">
            <StatusBadge status={algorithm.status} />
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {algorithm.rating && algorithm.rating > 0 && (
              <div className="flex items-center space-x-1 transition-all duration-300 group-hover:text-warning group-hover:scale-110">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span>{algorithm.rating}</span>
              </div>
            )}
            {algorithm.callCount && algorithm.callCount > 0 && (
              <div className="flex items-center space-x-1 transition-all duration-300 group-hover:text-success group-hover:scale-110">
                <TrendingUp className="h-3 w-3" />
                <span>{algorithm.callCount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Brain className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
            <h3 className="font-semibold text-foreground leading-tight transition-colors duration-300 group-hover:text-primary">
              {algorithm.name}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {algorithm.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className={cn(
                  "text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20",
                  "transition-all duration-300 hover:bg-primary/20 hover:scale-105",
                  // Staggered animation delay for tags
                  isHovered && "animate-pulse"
                )}
                style={{ 
                  animationDelay: isHovered ? `${index * 100}ms` : '0ms',
                  animationDuration: '1s'
                }}
              >
                {tag}
              </Badge>
            ))}
            {algorithm.tags.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 transition-all duration-300 hover:border-primary/50 hover:text-primary"
              >
                +{algorithm.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 transition-colors duration-300 group-hover:text-foreground/80">
          {algorithm.description}
        </p>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2 transition-all duration-300 group-hover:text-foreground/70">
            <User className="h-3 w-3 transition-colors duration-300 group-hover:text-primary" />
            <span>负责人：{algorithm.owner}</span>
          </div>
          <div className="flex items-center space-x-2 transition-all duration-300 group-hover:text-foreground/70">
            <Calendar className="h-3 w-3 transition-colors duration-300 group-hover:text-primary" />
            <span>更新：{formatDate(algorithm.updatedAt)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 relative z-10">
        <div className="flex w-full space-x-2">
          {algorithm.status === 'live' && algorithm.apiExample && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 transition-all duration-300",
                "hover:scale-105 hover:shadow-lg hover:border-primary/50 hover:text-primary",
                "active:scale-95"
              )}
              onClick={handleCopyCall}
            >
              <Copy className="h-3 w-3 mr-1" />
              复制调用
            </Button>
          )}
          <Link to={`/algorithm/${algorithm.id}`} className="flex-1">
            <Button 
              variant="default" 
              size="sm" 
              className={cn(
                "w-full transition-all duration-300",
                "hover:scale-105 hover:shadow-lg hover:shadow-primary/25",
                "active:scale-95"
              )}
            >
              <Eye className="h-3 w-3 mr-1" />
              查看详情
            </Button>
          </Link>
        </div>
      </CardFooter>

      {/* Enhanced Hover Glow Effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5",
        "transition-all duration-500 pointer-events-none",
        isHovered ? "opacity-100" : "opacity-0"
      )} />
      
      {/* Animated glow border */}
      <div className={cn(
        "absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30",
        "rounded-lg opacity-0 blur-sm transition-all duration-500",
        "group-hover:opacity-100 group-hover:blur-md",
        "-z-20"
      )} />
    </Card>
  );
}