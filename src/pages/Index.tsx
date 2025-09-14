import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Code, Zap, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Silk from "@/components/effects/Silk";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Silk Background */}
      <section className="relative h-screen overflow-hidden">
        {/* Silk Background */}
        <div className="absolute inset-0 z-0">
          <Silk
            speed={8}
            scale={1.5}
            color="#409eff"
            noiseIntensity={1.5}
            rotation={0.2}
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="mb-6 text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent animate-fade-in">
              算法管理平台
            </h1>
            <p className="mb-8 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in [animation-delay:0.2s] opacity-0 animate-[fade-in_0.6s_ease-out_0.2s_forwards]">
              智能算法提交、审核与管理的一体化解决方案
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in [animation-delay:0.4s] opacity-0 animate-[fade-in_0.6s_ease-out_0.4s_forwards]">
              <Button 
                size="lg" 
                onClick={() => navigate('/algorithms')}
                className="text-lg px-8 py-6 hover-scale"
              >
                浏览算法
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/apply')}
                className="text-lg px-8 py-6 hover-scale"
              >
                提交算法
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Cards */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/80 backdrop-blur-sm hover-scale">
              <CardContent className="p-6 text-center">
                <Code className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">智能审核</h3>
                <p className="text-muted-foreground">自动化算法代码审核与质量评估</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm hover-scale">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">高效管理</h3>
                <p className="text-muted-foreground">一站式算法生命周期管理平台</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm hover-scale">
              <CardContent className="p-6 text-center">
                <Layers className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">协作共享</h3>
                <p className="text-muted-foreground">团队协作与知识分享社区</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Content Sections */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">为什么选择我们？</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">01</span>
              </div>
              <h3 className="text-xl font-semibold">专业审核</h3>
              <p className="text-muted-foreground">专业团队严格把关每一个算法质量</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">02</span>
              </div>
              <h3 className="text-xl font-semibold">快速响应</h3>
              <p className="text-muted-foreground">24小时内完成初步审核反馈</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">03</span>
              </div>
              <h3 className="text-xl font-semibold">版本控制</h3>
              <p className="text-muted-foreground">完整的算法版本管理与历史追踪</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">04</span>
              </div>
              <h3 className="text-xl font-semibold">安全可靠</h3>
              <p className="text-muted-foreground">企业级安全保障与数据保护</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
