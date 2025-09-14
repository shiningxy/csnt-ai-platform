import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Code, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockAlgorithms } from '@/data/mockData';

export default function AlgorithmDemo() {
  const { id } = useParams<{ id: string }>();
  const algorithm = mockAlgorithms.find(a => a.id === id);

  if (!algorithm) {
    return <Navigate to="/404" replace />;
  }

  if (algorithm.status !== 'live') {
    return <Navigate to={`/algorithm/${id}`} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/algorithm/${id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回算法详情
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {algorithm.name} - 展示效果
              </h1>
              <p className="text-muted-foreground">
                实时体验算法功能和效果
              </p>
            </div>
            <Badge variant="default" className="bg-success/10 text-success border-success/20">
              {algorithm.status === 'live' ? '已上线' : algorithm.status}
            </Badge>
          </div>
        </div>

        {/* Demo Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                输入数据
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    输入参数
                  </label>
                  <textarea
                    className="w-full h-32 p-3 border border-input rounded-md bg-background text-foreground resize-none"
                    placeholder="请输入测试数据..."
                    defaultValue={JSON.stringify({
                      input: "示例数据",
                      config: {
                        mode: "default"
                      }
                    }, null, 2)}
                  />
                </div>
                
                <Button className="w-full" disabled>
                  <Play className="h-4 w-4 mr-2" />
                  运行算法
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  注：演示功能正在开发中，敬请期待
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                输出结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 border rounded-md p-4 min-h-[300px]">
                  <div className="text-center text-muted-foreground py-16">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-4"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-4"></div>
                      <div className="h-4 bg-muted rounded w-5/6 mx-auto"></div>
                    </div>
                    <p className="mt-4 text-sm">算法运行结果将显示在这里</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/30 rounded-md">
                    <div className="font-medium text-foreground mb-1">处理时间</div>
                    <div className="text-muted-foreground">-- ms</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-md">
                    <div className="font-medium text-foreground mb-1">准确率</div>
                    <div className="text-muted-foreground">--%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Algorithm Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>算法信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-foreground mb-1">算法类型</div>
                <div className="text-muted-foreground">{algorithm.category}</div>
              </div>
              <div>
                <div className="font-medium text-foreground mb-1">交互方式</div>
                <div className="text-muted-foreground">{algorithm.interactionMethod}</div>
              </div>
              <div>
                <div className="font-medium text-foreground mb-1">数据格式</div>
                <div className="text-muted-foreground">{algorithm.inputDataType}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}