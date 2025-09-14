// 状态机定义（按照SOP流程）
export type AlgorithmStatus = 
  | 'draft'                    // 草稿 - 未提交或被打回修改
  | 'pending_review'           // 待评审 - 已提交，等待组长发起评审
  | 'under_review'            // 评审中 - 评审人正在评审
  | 'pending_confirmation'     // 待确认 - 评审完成，等待组长确认
  | 'pending_product'         // 待产品 - 组长确认通过，等待产品转化
  | 'pending_frontend'        // 待前端 - 产品完成，等待前端实现
  | 'live'                    // 已上线 - 前端完成，正式开放
  | 'deprecated';             // 已下线 - 手动或自动下线

export type UserRole = 
  | 'algorithm_engineer'      // 算法工程师
  | 'team_lead'              // 算法组长/小组长
  | 'reviewer'               // 评审人（可以是算法工程师或专家）
  | 'product_manager'        // 产品经理
  | 'frontend_engineer'      // 前端工程师
  | 'business_user'          // 业务用户
  | 'admin';                 // 系统管理员

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
  
  // 审批记录（兼容旧版）
  approvalRecords: ApprovalRecord[];
  
  // 新版评审记录
  reviewRecords?: ReviewRecord[];
  reviewAssignment?: ReviewAssignment;
  
  // 流程追踪
  currentApprover?: string;       // 当前处理人
  assignedReviewers?: string[];   // 已分配的评审人ID列表
  completedReviewers?: string[];  // 已完成评审的人员ID列表
  
  // 统计信息
  callCount?: number;
  rating?: number;
  popularity?: number;
}

// 评审结论类型
export type ReviewConclusion = 'approved' | 'conditional' | 'rejected';

// 会议形式类型
export type MeetingType = 'offline' | 'online' | 'none';

// 通知渠道类型
export type NotificationChannel = 'internal' | 'wechat' | 'email';

// 评审记录
export interface ReviewRecord {
  id: string;
  algorithm_id: string;
  reviewer_id: string;
  reviewer_name: string;
  assigned_by: string;
  assigned_at: string;
  completed_at?: string;
  status: 'pending' | 'completed';
  conclusion?: ReviewConclusion;
  comments?: string;
  attachments?: string[];
}

// 评审分配信息
export interface ReviewAssignment {
  id: string;
  algorithm_id: string;
  meeting_type: MeetingType;
  meeting_time?: string;
  meeting_description?: string;
  reviewers: Array<{
    id: string;
    name: string;
    role: UserRole;
  }>;
  initiated_by: string;
  initiated_at: string;
  status: 'active' | 'completed' | 'cancelled';
}

// 通知信息
export interface Notification {
  id: string;
  recipient_id: string;
  recipient_name: string;
  title: string;
  content: string;
  type: 'review_request' | 'review_completed' | 'approval_result' | 'status_update' | 'overdue_reminder';
  channels: NotificationChannel[];
  created_at: string;
  read: boolean;
  algorithm_id?: string;
}

// 原有审批记录（保持兼容性）
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