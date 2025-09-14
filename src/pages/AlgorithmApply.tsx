import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CodeBlock } from '@/components/ui/code-block';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, Save, Send, Upload, FileText, Code, Settings, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { DraftStorage, ApplicationStorage } from '@/lib/storage';

const algorithmApplySchema = z.object({
  // 基础信息
  name: z.string().min(1, '算法名称不能为空'),
  category: z.string().min(1, '请选择业务大类'),
  subCategory: z.string().min(1, '请选择业务小方向'),
  tags: z.array(z.string()).min(1, '请至少选择一个标签'),
  description: z.string().min(10, '描述至少10个字').max(100, '描述不能超过100字'),
  
  // 算法逻辑结构
  preprocessing: z.array(z.string()),
  featureEngineering: z.array(z.string()),
  modelStructure: z.string().min(1, '请选择模型结构'),
  postProcessing: z.array(z.string()),
  exceptionHandling: z.array(z.string()),
  
  // 调用方式
  interactionMethod: z.string().min(1, '请选择调用方式'),
  
  // 部署方式
  deploymentMethod: z.array(z.string()).min(1, '请至少选择一种部署方式'),
  dependencies: z.array(z.string()),
  
  // 技术信息
  resourceRequirements: z.string().min(1, '请填写资源需求'),
  inputDataSource: z.string().min(1, '请填写输入数据源'),
  inputDataType: z.string().min(1, '请选择输入数据类型'),
  outputSchema: z.string().min(1, '请填写输出标准'),
  
  // 业务信息
  applicableScenarios: z.string().min(10, '适用场景描述至少10个字'),
  targetUsers: z.array(z.string()).min(1, '请至少选择一个目标用户'),
});

type AlgorithmApplyFormData = z.infer<typeof algorithmApplySchema>;

const categories = [
  { value: 'optimization', label: '运筹优化' },
  { value: 'prediction', label: '预测分析' },
  { value: 'computer_vision', label: '计算机视觉' },
  { value: 'nlp', label: '自然语言处理' },
  { value: 'recommendation', label: '推荐算法' },
];

const subCategories = {
  optimization: ['路径规划', '调度优化', '资源分配', '排班优化'],
  prediction: ['时间序列', '风险预测', '需求预测', '故障预测'],
  computer_vision: ['目标检测', '图像分类', '文字识别', '人脸识别'],
  nlp: ['文本分类', '情感分析', '机器翻译', '问答系统'],
  recommendation: ['协同过滤', '内容推荐', '实时推荐', '冷启动'],
};

const allTags = ['机器学习', '深度学习', '实时计算', '离线批处理', '高性能', '低延迟', '可解释', '鲁棒性'];

const targetUserOptions = ['业务分析师', '产品经理', '运营人员', '决策层', '技术开发', '数据科学家'];

export default function AlgorithmApply() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [generatedExample, setGeneratedExample] = useState('');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [validationOpen, setValidationOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<{label: string; step: number; name: string; message?: string}[]>([]);

  const form = useForm<AlgorithmApplyFormData>({
    resolver: zodResolver(algorithmApplySchema),
    defaultValues: {
      name: '',
      category: '',
      subCategory: '',
      tags: [],
      description: '',
      preprocessing: [],
      featureEngineering: [],
      modelStructure: '',
      postProcessing: [],
      exceptionHandling: [],
      interactionMethod: '',
      deploymentMethod: [],
      dependencies: [],
      resourceRequirements: '',
      inputDataSource: '',
      inputDataType: '',
      outputSchema: '',
      applicableScenarios: '',
      targetUsers: [],
    },
  });

  // 加载草稿数据
  useEffect(() => {
    const draftId = searchParams.get('draftId');
    if (draftId) {
      const draft = DraftStorage.getDraft(draftId);
      if (draft) {
        setCurrentDraftId(draftId);
        setSelectedCategory(draft.category);
        form.reset(draft);
        if (draft.interactionMethod) {
          generateExample();
        }
      }
    }
  }, [searchParams, form]);

  const steps = [
    { id: 0, title: '基础信息', icon: FileText, description: '算法名称、分类和描述' },
    { id: 1, title: '算法逻辑', icon: Code, description: '算法结构化模板' },
    { id: 2, title: '调用方式', icon: Settings, description: '交互逻辑和部署方式' },
    { id: 3, title: '业务规格', icon: Users, description: '业务场景和技术规格' },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const generateExample = () => {
    const method = form.watch('interactionMethod');
    let example = '';
    
    switch (method) {
      case 'api':
        example = `# REST API 调用示例
curl -X POST "https://api.company.com/algorithm/${form.watch('name')}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "input_data": {
      "field1": "value1",
      "field2": "value2"
    },
    "options": {
      "timeout": 30,
      "format": "json"
    }
  }'

# Python requests 示例
import requests

response = requests.post(
    "https://api.company.com/algorithm/${form.watch('name')}",
    headers={"Authorization": "Bearer YOUR_TOKEN"},
    json={
        "input_data": {"field1": "value1", "field2": "value2"},
        "options": {"timeout": 30, "format": "json"}
    }
)
result = response.json()`;
        break;
      case 'batch':
        example = `# 批处理调用示例
# 1. 上传数据文件
curl -X POST "https://api.company.com/upload" \\
  -F "file=@input_data.csv" \\
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. 提交批处理任务
curl -X POST "https://api.company.com/batch/${form.watch('name')}" \\
  -H "Content-Type: application/json" \\
  -d '{"file_id": "uploaded_file_id", "output_format": "csv"}'

# 3. 查询任务状态
curl -X GET "https://api.company.com/batch/status/TASK_ID" \\
  -H "Authorization: Bearer YOUR_TOKEN"`;
        break;
      case 'component':
        example = `<!-- 大屏组件嵌入示例 -->
<iframe 
  src="https://dashboard.company.com/algorithm/${form.watch('name')}"
  width="100%" 
  height="400"
  frameborder="0">
</iframe>

<!-- JavaScript 配置 -->
<script>
window.algorithmConfig = {
  algorithm: "${form.watch('name')}",
  refreshInterval: 30000, // 30秒刷新
  params: {
    dateRange: "7d",
    threshold: 0.8
  }
};
</script>`;
        break;
    }
    setGeneratedExample(example);
  };

  const onSubmit = async (data: AlgorithmApplyFormData) => {
    console.log('提交数据:', data);
    
    try {
      // 提交申请到审批中心
      const appId = ApplicationStorage.submitApplication({
        name: data.name,
        category: data.category,
        subCategory: data.subCategory,
        tags: data.tags,
        description: data.description,
        applicableScenarios: data.applicableScenarios,
        targetUsers: data.targetUsers,
        interactionMethod: data.interactionMethod,
        inputDataSource: data.inputDataSource,
        inputDataType: data.inputDataType,
        outputSchema: data.outputSchema,
        resourceRequirements: data.resourceRequirements,
        deploymentMethod: data.deploymentMethod,
        preprocessing: data.preprocessing,
        featureEngineering: data.featureEngineering,
        modelStructure: data.modelStructure,
        postProcessing: data.postProcessing,
        exceptionHandling: data.exceptionHandling,
        dependencies: data.dependencies,
      });
      
      // 如果是从草稿提交的，删除草稿
      if (currentDraftId) {
        DraftStorage.deleteDraft(currentDraftId);
      }
      
      toast({
        title: "申请已提交",
        description: "您的算法申请已成功提交，我们会在5个工作日内完成评审。",
      });
      
      // 导航到审批中心
      navigate('/approval');
    } catch (error) {
      console.error('提交申请失败:', error);
      toast({
        title: "提交失败",
        description: "提交申请时出现错误，请重试。",
        variant: "destructive",
      });
    }
  };

  // 提交校验失败时的处理：收集缺失字段并弹窗提示
  const handleInvalid = (errors: any) => {
    const labelMap: Record<string, string> = {
      name: '算法名称',
      category: '业务大类',
      subCategory: '业务小方向',
      tags: '算法标签',
      description: '简要描述',
      preprocessing: '数据预处理',
      featureEngineering: '特征工程',
      modelStructure: '模型结构',
      postProcessing: '后处理',
      exceptionHandling: '异常处理',
      interactionMethod: '调用方式',
      deploymentMethod: '部署方式',
      dependencies: '依赖清单',
      resourceRequirements: '资源需求',
      inputDataSource: '输入数据源',
      inputDataType: '输入数据类型',
      outputSchema: '输出标准',
      applicableScenarios: '适用场景',
      targetUsers: '目标用户',
    };
    const getStepByField = (name: string) => {
      if (['name','category','subCategory','tags','description'].includes(name)) return 0;
      if (['preprocessing','featureEngineering','modelStructure','postProcessing','exceptionHandling'].includes(name)) return 1;
      if (['interactionMethod','deploymentMethod','dependencies'].includes(name)) return 2;
      if (['applicableScenarios','targetUsers','inputDataSource','inputDataType','outputSchema','resourceRequirements'].includes(name)) return 3;
      return 0;
    };
    const items: {label: string; step: number; name: string; message?: string}[] = [];
    Object.keys(errors).forEach((key) => {
      const err = (errors as any)[key];
      items.push({
        label: labelMap[key] || key,
        step: getStepByField(key),
        name: key,
        message: typeof err?.message === 'string' ? err.message : undefined,
      });
    });
    if (items.length > 0) {
      const firstStep = Math.min(...items.map(i => i.step));
      setCurrentStep(firstStep);
      setMissingFields(items);
      setValidationOpen(true);
    }
  };

  const saveDraft = () => {
    try {
      const currentData = form.getValues();
      
      let draftId: string;
      if (currentDraftId) {
        // 更新现有草稿
        DraftStorage.updateDraft(currentDraftId, currentData);
        draftId = currentDraftId;
      } else {
        // 创建新草稿
        draftId = DraftStorage.saveDraft(currentData);
        setCurrentDraftId(draftId);
        // 更新URL参数
        navigate(`/apply?draftId=${draftId}`, { replace: true });
      }
      
      toast({
        title: "草稿已保存",
        description: "您的申请已保存为草稿，可以稍后继续编辑。",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "保存草稿时出现错误，请重试。",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin?tab=drafts')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回草稿
          </Button>
          <div>
            <h1 className="text-3xl font-bold">申请新算法</h1>
            <p className="text-muted-foreground">请按照标准化模板填写算法资产信息</p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    index <= currentStep
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground'
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <div className="hidden sm:block">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, handleInvalid)} className="space-y-8">
          {/* 第一步：基础信息 */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  基础信息
                </CardTitle>
                <CardDescription>
                  填写算法的基本信息，包括名称、分类和简要描述
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>算法名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：港口拥堵预测算法V2.0" {...field} />
                      </FormControl>
                      <FormDescription>
                        请使用简洁明确的名称，建议包含版本号
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>业务大类 *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCategory(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择业务大类" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>业务小方向 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择业务小方向" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedCategory &&
                              subCategories[selectedCategory as keyof typeof subCategories]?.map((sub) => (
                                <SelectItem key={sub} value={sub}>
                                  {sub}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem>
                      <FormLabel>算法标签 *</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {allTags.map((tag) => (
                          <FormField
                            key={tag}
                            control={form.control}
                            name="tags"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={tag}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(tag)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, tag])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== tag)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{tag}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>简要描述 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="简要说明算法解决的问题和核心价值（10-100字）"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/100 字
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* 第二步：算法逻辑结构 */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  算法逻辑结构模板
                </CardTitle>
                <CardDescription>
                  请勾选算法的技术组成部分，确保关键环节不遗漏
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 数据预处理 */}
                <FormField
                  control={form.control}
                  name="preprocessing"
                  render={() => (
                    <FormItem>
                      <FormLabel>数据预处理</FormLabel>
                      <div className="space-y-3">
                        {[
                          { value: 'standardization', label: '标准化' },
                          { value: 'normalization', label: '归一化' },
                          { value: 'missing_value', label: '缺失值填充' },
                          { value: 'outlier', label: '异常值处理' },
                        ].map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="preprocessing"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.value])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== item.value)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                  {item.value === 'missing_value' && field.value?.includes(item.value) && (
                                    <Input placeholder="填充方式：均值/中位数/自定义" className="ml-4 w-48" />
                                  )}
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                {/* 特征工程 */}
                <FormField
                  control={form.control}
                  name="featureEngineering"
                  render={() => (
                    <FormItem>
                      <FormLabel>特征工程</FormLabel>
                      <div className="space-y-3">
                        {[
                          { value: 'sliding_window', label: '滑动窗口' },
                          { value: 'embedding', label: 'Embedding' },
                          { value: 'cross_feature', label: '交叉特征' },
                          { value: 'feature_selection', label: '特征筛选' },
                        ].map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="featureEngineering"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.value])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== item.value)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                  {item.value === 'cross_feature' && field.value?.includes(item.value) && (
                                    <Input placeholder="描述：时间+地理位置" className="ml-4 w-48" />
                                  )}
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                {/* 模型结构 */}
                <FormField
                  control={form.control}
                  name="modelStructure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>模型结构 *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          {[
                            { value: 'lstm', label: 'LSTM', desc: '长短期记忆网络' },
                            { value: 'xgboost', label: 'XGBoost', desc: '梯度提升树' },
                            { value: 'cnn', label: 'CNN', desc: '卷积神经网络' },
                            { value: 'rules', label: '规则引擎', desc: '基于规则的专家系统' },
                          ].map((item) => (
                            <div key={item.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={item.value} id={item.value} />
                              <Label htmlFor={item.value} className="cursor-pointer">
                                <div>
                                  <div className="font-medium">{item.label}</div>
                                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 后处理 */}
                <FormField
                  control={form.control}
                  name="postProcessing"
                  render={() => (
                    <FormItem>
                      <FormLabel>后处理</FormLabel>
                      <div className="space-y-3">
                        {[
                          { value: 'threshold', label: '阈值切割' },
                          { value: 'topk', label: 'TopK 筛选' },
                          { value: 'calibration', label: '概率校准' },
                          { value: 'smoothing', label: '结果平滑' },
                        ].map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="postProcessing"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.value])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== item.value)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                {/* 异常处理 */}
                <FormField
                  control={form.control}
                  name="exceptionHandling"
                  render={() => (
                    <FormItem>
                      <FormLabel>异常处理</FormLabel>
                      <div className="space-y-3">
                        {[
                          { value: 'input_validation', label: '输入校验' },
                          { value: 'fallback', label: 'Fallback 机制' },
                          { value: 'alert', label: '告警触发' },
                          { value: 'retry', label: '重试机制' },
                        ].map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="exceptionHandling"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.value])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== item.value)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                  {item.value === 'alert' && field.value?.includes(item.value) && (
                                    <Input placeholder="条件：错误率>5%" className="ml-4 w-48" />
                                  )}
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* 第三步：调用方式和部署 */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  调用方式与部署配置
                </CardTitle>
                <CardDescription>
                  配置算法的调用接口和部署方式
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 调用方式 */}
                <FormField
                  control={form.control}
                  name="interactionMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>调用方式 *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            generateExample();
                          }}
                          defaultValue={field.value}
                          className="grid grid-cols-1 gap-4"
                        >
                          {[
                            {
                              value: 'api',
                              label: 'API（REST/gRPC）',
                              desc: '实时接口调用，适合在线系统集成',
                            },
                            {
                              value: 'batch',
                              label: '文件批处理',
                              desc: '离线批量处理，适合大数据量场景',
                            },
                            {
                              value: 'component',
                              label: '大屏组件',
                              desc: '可视化组件，适合监控大屏展示',
                            },
                          ].map((item) => (
                            <div key={item.value} className="flex items-center space-x-3 p-4 border rounded-lg">
                              <RadioGroupItem value={item.value} id={item.value} />
                              <Label htmlFor={item.value} className="cursor-pointer flex-1">
                                <div>
                                  <div className="font-medium">{item.label}</div>
                                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 调用示例 */}
                {generatedExample && (
                  <div>
                    <Label className="text-sm font-medium">调用示例</Label>
                    <CodeBlock code={generatedExample} language="bash" className="mt-2" />
                  </div>
                )}

                {/* 部署方式 */}
                <FormField
                  control={form.control}
                  name="deploymentMethod"
                  render={() => (
                    <FormItem>
                      <FormLabel>部署方式 *</FormLabel>
                      <div className="space-y-3">
                        {[
                          { value: 'docker', label: 'Docker 镜像', placeholder: '镜像名:tag' },
                          { value: 'k8s', label: 'Kubernetes Helm Chart', placeholder: 'chart名+values.yaml' },
                          { value: 'bare', label: '裸机部署', placeholder: '启动命令、依赖库' },
                        ].map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="deploymentMethod"
                            render={({ field }) => {
                              return (
                                <div key={item.value} className="space-y-2">
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.value])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== item.value)
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{item.label}</FormLabel>
                                  </FormItem>
                                  {field.value?.includes(item.value) && (
                                    <Input placeholder={item.placeholder} className="ml-6" />
                                  )}
                                </div>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 依赖清单 */}
                <FormField
                  control={form.control}
                  name="dependencies"
                  render={() => (
                    <FormItem>
                      <FormLabel>依赖清单</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          'Python 3.9+',
                          'PyTorch 2.0',
                          '特定GPU驱动',
                          'NAS挂载路径',
                          '数据库连接',
                          'Redis缓存',
                        ].map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="dependencies"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== item)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* 第四步：业务规格 */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  业务规格与技术要求
                </CardTitle>
                <CardDescription>
                  详细说明算法的业务场景和技术规格
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="applicableScenarios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>适用场景 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="详细描述算法解决的具体业务问题、应用场景和预期效果..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        请具体说明在什么业务场景下使用，解决什么问题，预期带来什么价值
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetUsers"
                  render={() => (
                    <FormItem>
                      <FormLabel>目标用户 *</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {targetUserOptions.map((user) => (
                          <FormField
                            key={user}
                            control={form.control}
                            name="targetUsers"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={user}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(user)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, user])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== user)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{user}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="inputDataSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>输入数据源 *</FormLabel>
                        <FormControl>
                          <Input placeholder="例如：MySQL数据库/API接口/CSV文件" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inputDataType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>输入数据类型 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择数据类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="image">图像</SelectItem>
                            <SelectItem value="stream">数据流</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="outputSchema"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>输出标准 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="描述输出字段、数据类型和示例..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        请详细说明输出的数据结构、字段含义和数据类型
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resourceRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>资源需求 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="CPU: 4核, 内存: 16GB, 存储: 100GB, GPU: V100..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* 按钮组 */}
          <div className="flex justify-between items-center pt-6">
            <div className="flex gap-4">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  上一步
                </Button>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                保存草稿
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  下一步
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  提交申请
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>

      <Dialog open={validationOpen} onOpenChange={setValidationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>请完善以下必填项</DialogTitle>
            <DialogDescription>提交前需补全信息，点击可定位到对应步骤。</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {missingFields.length === 0 ? (
              <p className="text-sm text-muted-foreground">所有必填项已完成</p>
            ) : (
              missingFields.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <span className="font-medium">{f.label}</span>
                    {f.message && <span className="text-muted-foreground ml-2">{f.message}</span>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setCurrentStep(f.step); setValidationOpen(false); }}>
                    前往第{f.step + 1}步
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}