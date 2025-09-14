export type AlgorithmStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'conditional' | 'in_development' | 'live' | 'deprecated';

export type UserRole = 'algorithm_engineer' | 'team_lead' | 'product_manager' | 'frontend_engineer' | 'business_user' | 'admin';

export type InteractionMethod = 'api' | 'batch' | 'component';

export type DataType = 'json' | 'csv' | 'image' | 'stream';

export interface AlgorithmAsset {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  tags: string[];
  description: string;
  status: AlgorithmStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
  
  // 业务字段
  applicableScenarios: string;
  targetUsers: string[];
  interactionMethod: InteractionMethod;
  inputDataSource: string;
  inputDataType: DataType;
  outputSchema: string;
  
  // 技术字段（权限控制）
  resourceRequirements?: string;
  deploymentProcess?: string;
  pseudoCode?: string;
  
  // 调用示例
  apiExample?: string;
  
  // 审批记录
  approvalRecords: ApprovalRecord[];
  
  // 统计信息
  callCount?: number;
  rating?: number;
  popularity?: number;
}

export interface ApprovalRecord {
  id: string;
  approver: string;
  time: string;
  result: 'approved' | 'rejected' | 'conditional';
  comment: string;
  meetingNotes?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email: string;
}

export interface FilterOptions {
  search: string;
  category: string;
  subCategory: string;
  tags: string[];
  status: AlgorithmStatus | '';
  sortBy: 'latest' | 'popular' | 'rating';
}

export interface ApplyFormData {
  // Step 1: 基础信息
  name: string;
  category: string;
  subCategory: string;
  tags: string[];
  description: string;
  
  // Step 2: 业务价值
  applicableScenarios: string;
  targetUsers: string[];
  interactionMethod: InteractionMethod;
  
  // Step 3: 技术规格
  resourceRequirements: string;
  inputDataSource: string;
  inputDataType: DataType;
  outputSchema: string;
  deploymentProcess: string;
  pseudoCode: string;
  
  // Step 4: 附件
  attachments: File[];
}