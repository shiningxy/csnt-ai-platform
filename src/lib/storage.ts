import { ApplyFormData, ReviewRecord, ReviewAssignment, Notification } from '@/types/algorithm';
import type { AlgorithmAsset, AlgorithmStatus } from '@/types/algorithm';

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
  status: AlgorithmStatus;
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
  // 新版评审字段
  reviewRecords?: ReviewRecord[];
  reviewAssignment?: ReviewAssignment;
  currentApprover?: string;
  assignedReviewers?: string[];
  completedReviewers?: string[];
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

export const ApplicationStorage = {
  submitApplication(data: Omit<SubmittedApplication, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'owner' | 'approvalRecords' | 'callCount' | 'rating' | 'popularity' | 'deploymentProcess' | 'pseudoCode' | 'apiExample'>): string {
    const applications = this.getAllApplications();
    
    const newApplication: SubmittedApplication = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      status: 'pending_review',
      owner: '当前用户', // 实际项目中应该从认证系统获取
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
      reviewRecords: [],
      assignedReviewers: [],
      completedReviewers: [],
      callCount: 0,
      rating: 0,
      popularity: 0,
    };
    
    applications.push(newApplication);
    localStorage.setItem('submitted_applications', JSON.stringify(applications));
    
    console.log('[ApplicationStorage] 提交申请:', newApplication);
    return newApplication.id;
  },

  getAllApplications(): SubmittedApplication[] {
    const stored = localStorage.getItem('submitted_applications');
    return stored ? JSON.parse(stored) : [];
  },

  getPendingApplications(): SubmittedApplication[] {
    return this.getAllApplications().filter(app => app.status === 'pending_review');
  },

  updateApplicationStatus(id: string, status: SubmittedApplication['status']): boolean {
    const applications = this.getAllApplications();
    const index = applications.findIndex(app => app.id === id);
    
    if (index !== -1) {
      applications[index].status = status;
      applications[index].updatedAt = new Date().toISOString();
      localStorage.setItem('submitted_applications', JSON.stringify(applications));
      
      console.log('[ApplicationStorage] 更新状态:', id, status);
      return true;
    }
    
    return false;
  },
  
  /**
   * 分配评审人
   */
  assignReviewers(algorithmId: string, assignment: ReviewAssignment): boolean {
    const applications = this.getAllApplications();
    const index = applications.findIndex(app => app.id === algorithmId);
    
    if (index !== -1) {
      applications[index].reviewAssignment = assignment;
      applications[index].assignedReviewers = assignment.reviewers.map(r => r.id);
      applications[index].status = 'under_review';
      applications[index].currentApprover = assignment.initiated_by;
      applications[index].updatedAt = new Date().toISOString();
      
      localStorage.setItem('submitted_applications', JSON.stringify(applications));
      console.log('[ApplicationStorage] 分配评审人:', algorithmId, assignment);
      return true;
    }
    
    return false;
  },
  
  /**
   * 提交评审结果
   */
  submitReviewResult(algorithmId: string, reviewRecord: ReviewRecord): boolean {
    const applications = this.getAllApplications();
    const index = applications.findIndex(app => app.id === algorithmId);
    
    if (index !== -1) {
      const app = applications[index];
      
      // 添加或更新评审记录
      if (!app.reviewRecords) app.reviewRecords = [];
      const existingIndex = app.reviewRecords.findIndex(r => r.reviewer_id === reviewRecord.reviewer_id);
      
      if (existingIndex >= 0) {
        app.reviewRecords[existingIndex] = reviewRecord;
      } else {
        app.reviewRecords.push(reviewRecord);
      }
      
      // 更新已完成评审的人员列表
      if (!app.completedReviewers) app.completedReviewers = [];
      if (!app.completedReviewers.includes(reviewRecord.reviewer_id)) {
        app.completedReviewers.push(reviewRecord.reviewer_id);
      }
      
      // 检查是否所有评审人都已完成
      const allCompleted = app.assignedReviewers?.every(reviewerId => 
        app.completedReviewers?.includes(reviewerId)
      ) || false;
      
      if (allCompleted) {
        app.status = 'pending_confirmation';
      }
      
      app.updatedAt = new Date().toISOString();
      localStorage.setItem('submitted_applications', JSON.stringify(applications));
      
      console.log('[ApplicationStorage] 提交评审结果:', algorithmId, reviewRecord);
      return true;
    }
    
    return false;
  },
  
  /**
   * 获取指定状态的申请
   */
  getApplicationsByStatus(status: AlgorithmStatus): SubmittedApplication[] {
    return this.getAllApplications().filter(app => app.status === status);
  },
  
  /**
   * 获取用户的评审任务
   */
  getUserReviewTasks(userId: string): SubmittedApplication[] {
    return this.getAllApplications().filter(app => 
      app.assignedReviewers?.includes(userId) && 
      !app.completedReviewers?.includes(userId)
    );
  },
  
  /**
   * 获取用户已完成的评审
   */
  getUserCompletedReviews(userId: string): SubmittedApplication[] {
    return this.getAllApplications().filter(app => 
      app.completedReviewers?.includes(userId)
    );
  },
};

/**
 * 评审管理存储
 */
export const ReviewStorage = {
  /**
   * 保存评审分配
   */
  saveAssignment(assignment: ReviewAssignment): string {
    const assignments = this.getAllAssignments();
    assignments.push(assignment);
    localStorage.setItem('review_assignments', JSON.stringify(assignments));
    return assignment.id;
  },
  
  /**
   * 获取所有评审分配
   */
  getAllAssignments(): ReviewAssignment[] {
    const stored = localStorage.getItem('review_assignments');
    return stored ? JSON.parse(stored) : [];
  },
  
  /**
   * 根据算法ID获取评审分配
   */
  getAssignmentByAlgorithmId(algorithmId: string): ReviewAssignment | null {
    const assignments = this.getAllAssignments();
    return assignments.find(a => a.algorithm_id === algorithmId) || null;
  },
  
  /**
   * 保存评审记录
   */
  saveReviewRecord(record: ReviewRecord): string {
    const records = this.getAllReviewRecords();
    const existingIndex = records.findIndex(r => 
      r.algorithm_id === record.algorithm_id && r.reviewer_id === record.reviewer_id
    );
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    localStorage.setItem('review_records', JSON.stringify(records));
    return record.id;
  },
  
  /**
   * 获取所有评审记录
   */
  getAllReviewRecords(): ReviewRecord[] {
    const stored = localStorage.getItem('review_records');
    return stored ? JSON.parse(stored) : [];
  },
  
  /**
   * 根据算法ID获取评审记录
   */
  getReviewRecordsByAlgorithmId(algorithmId: string): ReviewRecord[] {
    const records = this.getAllReviewRecords();
    return records.filter(r => r.algorithm_id === algorithmId);
  },
  
  /**
   * 根据评审人ID获取评审记录
   */
  getReviewRecordsByReviewerId(reviewerId: string): ReviewRecord[] {
    const records = this.getAllReviewRecords();
    return records.filter(r => r.reviewer_id === reviewerId);
  },
};

/**
 * 通知存储
 */
export const NotificationStorage = {
  /**
   * 保存通知
   */
  saveNotification(notification: Notification): string {
    const notifications = this.getAllNotifications();
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    return notification.id;
  },
  
  /**
   * 获取所有通知
   */
  getAllNotifications(): Notification[] {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  },
  
  /**
   * 获取用户通知
   */
  getUserNotifications(userId: string): Notification[] {
    const notifications = this.getAllNotifications();
    return notifications.filter(n => n.recipient_id === userId);
  },
  
  /**
   * 标记通知为已读
   */
  markAsRead(notificationId: string): boolean {
    const notifications = this.getAllNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index >= 0) {
      notifications[index].read = true;
      localStorage.setItem('notifications', JSON.stringify(notifications));
      return true;
    }
    
    return false;
  },
};