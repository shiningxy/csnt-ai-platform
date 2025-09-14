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
  Phone,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlgorithmCardProps {
  algorithm: AlgorithmAsset;
  className?: string;
}

export function AlgorithmCard({ algorithm, className }: AlgorithmCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const generateApiExample = () => {
    return `// 示例：调用${algorithm.name}
fetch('https://api.example.com/algorithms/${algorithm.id}/invoke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <YOUR_API_KEY>'
  },
  body: JSON.stringify({ input: {} })
}).then(res => res.json()).then(console.log).catch(console.error);
`;
  };

  const handleCopyCall = async () => {
    const code = (algorithm.apiExample?.trim()) || generateApiExample();
    await navigator.clipboard.writeText(code);
    toast({
      title: "调用示例已复制",
      description: "API调用代码已复制到剪贴板",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // Determine which buttons should be available based on status
  const getButtonAvailability = (status: string) => {
    switch (status) {
      case 'draft':
      case 'pending_review':
      case 'under_review':
      case 'pending_confirmation':
        return { showDemo: false, showCopy: false, showDetails: false };
      case 'pending_product':
      case 'deprecated':
        return { showDemo: false, showCopy: false, showDetails: true };
      case 'pending_frontend':
        return { showDemo: false, showCopy: true, showDetails: true };
      case 'live':
        return { showDemo: true, showCopy: true, showDetails: true };
      default:
        return { showDemo: false, showCopy: false, showDetails: false };
    }
  };

  const buttonAvailability = getButtonAvailability(algorithm.status);

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "border border-border/50 bg-gradient-card",
        "hover:-translate-y-1",
        // Simple luminous border effect
        "hover:shadow-[0_0_20px_rgba(24,144,255,0.4)] hover:border-primary/60",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <StatusBadge status={algorithm.status} />
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {algorithm.rating && algorithm.rating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span>{algorithm.rating}</span>
              </div>
            )}
            {algorithm.callCount && algorithm.callCount > 0 && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>{algorithm.callCount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Brain className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <h3 className="font-semibold text-foreground leading-tight">
              {algorithm.name}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {algorithm.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
              >
                {tag}
              </Badge>
            ))}
            {algorithm.tags.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5"
              >
                +{algorithm.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {algorithm.description}
        </p>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3" />
            <span>负责人：{algorithm.owner}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3" />
            <span>更新：{formatDate(algorithm.updatedAt)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full space-x-2">
          {buttonAvailability.showDemo && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 transition-all duration-300 hover:scale-105"
              onClick={() => {
                toast({
                  title: "展示效果",
                  description: "算法展示功能开发中...",
                });
              }}
            >
              <Play className="h-3 w-3 mr-1" />
              查看展示效果
            </Button>
          )}
          
          {buttonAvailability.showCopy && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 transition-all duration-300 hover:scale-105"
              onClick={handleCopyCall}
            >
              <Copy className="h-3 w-3 mr-1" />
              复制调用代码
            </Button>
          )}
          
          {buttonAvailability.showDetails && (
            <Link to={`/algorithm/${algorithm.id}`} className="flex-1">
              <Button 
                variant="default" 
                size="sm" 
                className="w-full transition-all duration-300 hover:scale-105"
              >
                <Eye className="h-3 w-3 mr-1" />
                查看算法详情
              </Button>
            </Link>
          )}
          
          {!buttonAvailability.showDemo && !buttonAvailability.showCopy && !buttonAvailability.showDetails && (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-2">
              该状态下暂无可用操作
            </div>
          )}
        </div>
      </CardFooter>

    </Card>
  );
}