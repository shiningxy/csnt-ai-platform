import { AlgorithmAsset, User } from '@/types/algorithm';

export const mockUsers: User[] = [
  {
    id: '1',
    name: '张三',
    role: 'algorithm_engineer',
    email: 'zhangsan@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan'
  },
  {
    id: '2',
    name: '李四',
    role: 'team_lead',
    email: 'lisi@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi'
  },
  {
    id: '3',
    name: '王五',
    role: 'product_manager',
    email: 'wangwu@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu'
  }
];

export const mockAlgorithms: AlgorithmAsset[] = [
  {
    id: '1',
    name: '港口拥堵预测模型V2',
    category: '智能运营',
    subCategory: '港口拥堵分析',
    tags: ['时序预测', 'API服务', '生产级', '热门'],
    description: '预测未来24小时堆场拥堵等级，辅助调度员提前调配资源',
    status: 'live',
    owner: '张三',
    createdAt: '2025-03-15T08:00:00Z',
    updatedAt: '2025-03-15T08:00:00Z',
    applicableScenarios: '用于港口运营中心预测堆场拥堵等级，辅助调度员提前调配资源。可应用于繁忙港口的智能调度系统，帮助预测未来24小时内的货物堆放情况。',
    targetUsers: ['港口调度员', '运营分析师', '大屏值班员'],
    interactionMethod: 'api',
    inputDataSource: '港口IoT实时数据库 congestion_raw',
    inputDataType: 'json',
    outputSchema: '{"congestion_level": 0-5, "confidence": 0.0-1.0, "reason": "string"}',
    resourceRequirements: 'CPU: 4核, 内存: 8GB, 存储: 无状态',
    deploymentProcess: 'Docker容器部署，支持K8s水平扩展',
    pseudoCode: '1. 数据预处理：滑动窗口 + MinMax标准化\n2. 模型结构：LSTM (hidden_size=128, layers=2)\n3. 后处理：概率→等级映射表',
    apiExample: `curl -X POST https://ai-platform.corp/api/v1/congestion/predict \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "location_id": "PORT_SH_01",
    "hours": 24
  }'`,
    approvalRecords: [
      {
        id: '1',
        approver: '李四',
        time: '2025-03-10T10:00:00Z',
        result: 'approved',
        comment: '补充异常处理逻辑后上线',
        meetingNotes: '会议讨论了边界条件处理和监控方案'
      }
    ],
    callCount: 2456,
    rating: 4.8,
    popularity: 95
  },
  {
    id: '2',
    name: '船舶货载优化算法',
    category: '智能运营',
    subCategory: '船舶货载',
    tags: ['优化算法', '批处理', '试验阶段'],
    description: '基于货物特性和船舶结构，计算最优装载方案',
    status: 'pending_frontend',
    owner: '王五',
    createdAt: '2025-03-10T08:00:00Z',
    updatedAt: '2025-03-12T08:00:00Z',
    applicableScenarios: '船舶装载计划制定，提高装载效率和安全性',
    targetUsers: ['船舶调度员', '货运规划师'],
    interactionMethod: 'batch',
    inputDataSource: '货物清单Excel文件',
    inputDataType: 'csv',
    outputSchema: '{"cargo_plan": [...], "efficiency_score": 0.0-1.0}',
    approvalRecords: [
      {
        id: '2',
        approver: '李四',
        time: '2025-03-12T14:00:00Z',
        result: 'approved',
        comment: '算法逻辑清晰，准备进入开发阶段'
      }
    ],
    callCount: 0,
    rating: 0,
    popularity: 20
  },
  {
    id: '3',
    name: '气象导航路径规划',
    category: '智能运营',
    subCategory: '气象导航',
    tags: ['路径规划', 'API服务', '研发中'],
    description: '结合实时气象数据，为船舶规划最优航行路径',
    status: 'pending_frontend',
    owner: '张三',
    createdAt: '2025-02-28T08:00:00Z',
    updatedAt: '2025-03-14T08:00:00Z',
    applicableScenarios: '海上航行路径规划，考虑天气因素优化航行时间和安全性',
    targetUsers: ['船长', '航海员', '调度中心'],
    interactionMethod: 'api',
    inputDataSource: '气象数据API + 船舶位置数据',
    inputDataType: 'json',
    outputSchema: '{"route": [...], "estimated_time": "hours", "weather_risk": 0.0-1.0}',
    approvalRecords: [],
    callCount: 0,
    rating: 0,
    popularity: 35
  },
  {
    id: '4',
    name: '港口设备预测性维护',
    category: '智能运营',
    subCategory: '设备维护',
    tags: ['预测维护', '机器学习', '草稿'],
    description: '基于设备传感器数据，预测设备故障时间',
    status: 'draft',
    owner: '王五',
    createdAt: '2025-03-14T08:00:00Z',
    updatedAt: '2025-03-14T08:00:00Z',
    applicableScenarios: '港口起重机、传送带等关键设备的预防性维护',
    targetUsers: ['设备工程师', '维护人员'],
    interactionMethod: 'api',
    inputDataSource: '设备传感器实时数据',
    inputDataType: 'stream',
    outputSchema: '{"failure_probability": 0.0-1.0, "recommended_action": "string"}',
    approvalRecords: [],
    callCount: 0,
    rating: 0,
    popularity: 10
  },
  {
    id: '5',
    name: '节能减排分析模型',
    category: '智能运营',
    subCategory: '节能减排',
    tags: ['环保', 'API服务', '生产级'],
    description: '分析港口作业的碳排放，提供减排建议',
    status: 'live',
    owner: '李四',
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-03-01T08:00:00Z',
    applicableScenarios: '港口环保合规监测，绿色港口建设支持',
    targetUsers: ['环保专员', '港口管理层', '政府监管部门'],
    interactionMethod: 'api',
    inputDataSource: '港口作业数据 + 能耗监测',
    inputDataType: 'json',
    outputSchema: '{"carbon_emission": "tons", "reduction_suggestions": [...]}',
    approvalRecords: [
      {
        id: '3',
        approver: '李四',
        time: '2025-01-20T10:00:00Z',
        result: 'approved',
        comment: '环保算法，符合国家政策要求'
      }
    ],
    callCount: 1823,
    rating: 4.6,
    popularity: 78
  }
];

export const categories = [
  {
    name: '智能运营',
    subCategories: ['港口拥堵分析', '船舶货载', '气象导航', '节能减排', '设备维护']
  }
];

export const allTags = [
  '时序预测', 'API服务', '生产级', '热门', '优化算法', '批处理', 
  '试验阶段', '路径规划', '研发中', '预测维护', '机器学习', 
  '草稿', '环保', 'Docker', 'K8s', 'LSTM', '实时数据'
];