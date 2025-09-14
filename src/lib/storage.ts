// 本地存储管理
export interface DraftData {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  tags: string[];
  description: string;
  preprocessing: string[];
  featureEngineering: string[];
  modelStructure: string;
  postProcessing: string[];
  exceptionHandling: string[];
  interactionMethod: string;
  deploymentMethod: string[];
  dependencies: string[];
  resourceRequirements: string;
  inputDataSource: string;
  inputDataType: string;
  outputSchema: string;
  applicableScenarios: string;
  targetUsers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SubmittedApplication {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  tags: string[];
  description: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'conditional';
  owner: string;
  createdAt: string;
  updatedAt: string;
  applicableScenarios: string;
  targetUsers: string[];
  interactionMethod: string;
  inputDataSource: string;
  inputDataType: string;
  outputSchema: string;
  resourceRequirements: string;
  deploymentProcess: string;
  pseudoCode: string;
  apiExample: string;
  approvalRecords: any[];
  callCount: number;
  rating: number;
  popularity: number;
  // 算法逻辑结构字段
  preprocessing?: string[];
  featureEngineering?: string[];
  modelStructure?: string;
  postProcessing?: string[];
  exceptionHandling?: string[];
  deploymentMethod?: string[];
  dependencies?: string[];
}

// 草稿管理
export const DraftStorage = {
  // 保存草稿
  saveDraft: (data: Partial<Omit<DraftData, 'id' | 'createdAt' | 'updatedAt'>>): string => {
    const drafts = DraftStorage.getAllDrafts();
    const draftId = `draft_${Date.now()}`;
    const newDraft: DraftData = {
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
      ...data,
      id: draftId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    drafts.push(newDraft);
    localStorage.setItem('algorithm_drafts', JSON.stringify(drafts));
    return draftId;
  },

  // 获取所有草稿
  getAllDrafts: (): DraftData[] => {
    const stored = localStorage.getItem('algorithm_drafts');
    return stored ? JSON.parse(stored) : [];
  },

  // 获取单个草稿
  getDraft: (id: string): DraftData | null => {
    const drafts = DraftStorage.getAllDrafts();
    return drafts.find(draft => draft.id === id) || null;
  },

  // 更新草稿
  updateDraft: (id: string, data: Partial<DraftData>): boolean => {
    const drafts = DraftStorage.getAllDrafts();
    const index = drafts.findIndex(draft => draft.id === id);
    
    if (index === -1) return false;
    
    drafts[index] = {
      ...drafts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('algorithm_drafts', JSON.stringify(drafts));
    return true;
  },

  // 删除草稿
  deleteDraft: (id: string): boolean => {
    const drafts = DraftStorage.getAllDrafts();
    const filtered = drafts.filter(draft => draft.id !== id);
    
    if (filtered.length === drafts.length) return false;
    
    localStorage.setItem('algorithm_drafts', JSON.stringify(filtered));
    return true;
  },
};

// 申请管理
export const ApplicationStorage = {
  // 提交申请
  submitApplication: (data: Omit<SubmittedApplication, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'owner' | 'approvalRecords' | 'callCount' | 'rating' | 'popularity' | 'deploymentProcess' | 'pseudoCode' | 'apiExample'>): string => {
    const applications = ApplicationStorage.getAllApplications();
    const appId = `app_${Date.now()}`;
    const newApp: SubmittedApplication = {
      ...data,
      id: appId,
      status: 'pending_review',
      owner: '当前用户', // 这里应该从认证上下文获取
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deploymentProcess: data.deploymentMethod?.join(', ') || '',
      pseudoCode: `算法逻辑结构：
预处理: ${data.preprocessing?.join(', ') || '无'}
特征工程: ${data.featureEngineering?.join(', ') || '无'}
模型结构: ${data.modelStructure || '无'}
后处理: ${data.postProcessing?.join(', ') || '无'}
异常处理: ${data.exceptionHandling?.join(', ') || '无'}`,
      apiExample: `调用方式: ${data.interactionMethod}
输入数据源: ${data.inputDataSource}
输入数据类型: ${data.inputDataType}
输出格式: ${data.outputSchema}`,
      approvalRecords: [],
      callCount: 0,
      rating: 0,
      popularity: 0,
    };
    
    applications.push(newApp);
    localStorage.setItem('submitted_applications', JSON.stringify(applications));
    return appId;
  },

  // 获取所有申请
  getAllApplications: (): SubmittedApplication[] => {
    const stored = localStorage.getItem('submitted_applications');
    return stored ? JSON.parse(stored) : [];
  },

  // 获取待审批申请
  getPendingApplications: (): SubmittedApplication[] => {
    return ApplicationStorage.getAllApplications().filter(app => app.status === 'pending_review');
  },

  // 更新申请状态
  updateApplicationStatus: (id: string, status: SubmittedApplication['status']): boolean => {
    const applications = ApplicationStorage.getAllApplications();
    const index = applications.findIndex(app => app.id === id);
    
    if (index === -1) return false;
    
    applications[index] = {
      ...applications[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('submitted_applications', JSON.stringify(applications));
    return true;
  },
};