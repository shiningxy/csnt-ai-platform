import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { CodeBlock } from '@/components/ui/code-block';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Brain, 
  User, 
  Calendar, 
  Download, 
  Star,
  TrendingUp,
  Copy,
  Play,
  Settings,
  History,
  ChevronLeft,
  Users,
  Target,
  Code,
  Database,
  Cpu,
  Eye,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockAlgorithms } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

// Mock current user role
const currentUserRole: 'admin' | 'team_lead' | 'algorithm_engineer' = 'admin';

export default function AlgorithmDetail() {
  const { id } = useParams<{ id: string }>();
  const [viewMode, setViewMode] = useState<'technical' | 'business'>('technical');
  const { toast } = useToast();

  const algorithm = mockAlgorithms.find(a => a.id === id);

  if (!algorithm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">算法不存在</h1>
          <Link to="/">
            <Button>返回首页</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyExample = () => {
    if (algorithm.apiExample) {
      navigator.clipboard.writeText(algorithm.apiExample);
      toast({
        title: "调用示例已复制",
        description: "API调用代码已复制到剪贴板",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canViewTechnical = ['algorithm_engineer', 'team_lead', 'admin'].includes(currentUserRole);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">首页</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{algorithm.category}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{algorithm.subCategory}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{algorithm.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/">
            <ChevronLeft className="h-4 w-4 mr-2" />
            返回列表
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <StatusBadge status={algorithm.status} />
                <span className="text-sm text-muted-foreground">
                  v1.2 · 更新于 {formatDate(algorithm.updatedAt)}
                </span>
              </div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Brain className="h-8 w-8 text-primary" />
                <span>{algorithm.name}</span>
              </h1>
              <div className="flex flex-wrap gap-2">
                {algorithm.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {algorithm.rating && (
                <div className="flex items-center space-x-1 text-sm">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-medium">{algorithm.rating}</span>
                </div>
              )}
              {algorithm.callCount && (
                <div className="flex items-center space-x-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium">{algorithm.callCount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center space-x-1 text-sm">
                <User className="h-4 w-4" />
                <span>负责人：{algorithm.owner}</span>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg w-fit">
            <Button
              variant={viewMode === 'technical' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('technical')}
              className="gap-2"
            >
              <Code className="h-4 w-4" />
              技术视图
            </Button>
            <Button
              variant={viewMode === 'business' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('business')}
              className="gap-2"
            >
              <Briefcase className="h-4 w-4" />
              业务视图
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="technical" disabled={!canViewTechnical}>技术参数</TabsTrigger>
            <TabsTrigger value="usage">调用方式</TabsTrigger>
            <TabsTrigger value="approval">审批记录</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span>适用场景</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {algorithm.applicableScenarios}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>面向用户</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {algorithm.targetUsers.map((user, index) => (
                      <Badge key={index} variant="outline">
                        {user}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <span>交互逻辑</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                      {algorithm.interactionMethod === 'api' ? 'API调用' : 
                       algorithm.interactionMethod === 'batch' ? '批处理' : '组件嵌入'}
                    </Badge>
                    <span className="text-muted-foreground">
                      {algorithm.interactionMethod === 'api' 
                        ? '通过 REST API 调用，支持单次/批量预测。调用前需申请API Key。'
                        : algorithm.interactionMethod === 'batch'
                        ? '支持批量文件处理，上传输入文件后获取处理结果。'
                        : '可直接嵌入到现有系统中作为组件使用。'}
                    </span>
                  </div>

                  {algorithm.status === 'live' && (
                    <div className="mt-4 flex space-x-3">
                      <Button onClick={handleCopyExample} className="gap-2">
                        <Copy className="h-4 w-4" />
                        复制调用示例
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        下载输入模板
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technical Parameters */}
          <TabsContent value="technical" className="space-y-6">
            {canViewTechnical ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Cpu className="h-5 w-5 text-primary" />
                      <span>资源需求</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">CPU:</span> 4核
                        </div>
                        <div>
                          <span className="font-medium">内存:</span> 8GB
                        </div>
                        <div>
                          <span className="font-medium">存储:</span> 无状态
                        </div>
                        <div>
                          <span className="font-medium">GPU:</span> 不需要
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-5 w-5 text-primary" />
                      <span>数据源配置</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">输入数据源:</span>
                        <p className="text-muted-foreground mt-1">{algorithm.inputDataSource}</p>
                      </div>
                      <div>
                        <span className="font-medium">数据类型:</span>
                        <Badge variant="outline" className="ml-2">
                          {algorithm.inputDataType.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>输入格式（结构化）</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={`{
  "location_id": "string",
  "start_time": "ISO8601",
  "end_time": "ISO8601"
}`}
                      language="json"
                    />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>输出标准</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock 
                      code={algorithm.outputSchema}
                      language="json"
                    />
                  </CardContent>
                </Card>

                {algorithm.pseudoCode && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>算法逻辑（仅算法角色可见）</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {algorithm.pseudoCode.split('\n').map((line, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <span className="text-success">✅</span>
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">您没有权限查看技术参数</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Usage */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API调用示例</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  示例：预测上海港未来24小时拥堵情况
                </p>
                {algorithm.apiExample && (
                  <CodeBlock code={algorithm.apiExample} language="bash" />
                )}
                
                <div className="mt-6 flex space-x-3">
                  <Button variant="outline" className="gap-2">
                    <Play className="h-4 w-4" />
                    在线测试（未来功能）
                  </Button>
                  <Button variant="outline" className="gap-2">
                    申请API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approval Records */}
          <TabsContent value="approval" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-primary" />
                  <span>审批历史</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {algorithm.approvalRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>时间</TableHead>
                        <TableHead>审批人</TableHead>
                        <TableHead>结果</TableHead>
                        <TableHead>意见</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {algorithm.approvalRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.time)}</TableCell>
                          <TableCell>{record.approver}</TableCell>
                          <TableCell>
                            {record.result === 'approved' && (
                              <Badge className="bg-success/10 text-success border-success/20">
                                ✅ 通过
                              </Badge>
                            )}
                            {record.result === 'conditional' && (
                              <Badge className="bg-warning/10 text-warning border-warning/20">
                                ⚠️ 有条件通过
                              </Badge>
                            )}
                            {record.result === 'rejected' && (
                              <Badge className="bg-danger/10 text-danger border-danger/20">
                                ❌ 驳回
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{record.comment}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无审批记录
                  </div>
                )}

                {(currentUserRole === 'team_lead' || currentUserRole === 'admin') && (
                  <div className="mt-6">
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      上传会议纪要
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}