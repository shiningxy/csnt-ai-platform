import { Notification, NotificationChannel } from '@/types/algorithm';

/**
 * 通知系统管理类
 * 负责创建、发送、管理各类通知
 */
export class NotificationManager {
  private static notifications: Notification[] = [];
  
  /**
   * 创建通知
   */
  static createNotification(params: {
    recipient_id: string;
    recipient_name: string;
    title: string;
    content: string;
    type: Notification['type'];
    channels?: NotificationChannel[];
    algorithm_id?: string;
  }): Notification {
    const notification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      recipient_id: params.recipient_id,
      recipient_name: params.recipient_name,
      title: params.title,
      content: params.content,
      type: params.type,
      channels: params.channels || ['internal'],
      created_at: new Date().toISOString(),
      read: false,
      algorithm_id: params.algorithm_id,
    };
    
    this.notifications.push(notification);
    this.sendNotification(notification);
    
    return notification;
  }
  
  /**
   * 发送通知（模拟）
   */
  private static sendNotification(notification: Notification) {
    console.log(`[通知系统] 发送给 ${notification.recipient_name}:`, notification.title);
    
    // 模拟不同渠道的发送
    notification.channels.forEach(channel => {
      switch (channel) {
        case 'internal':
          console.log(`📨 站内信: ${notification.content}`);
          break;
        case 'wechat':
          console.log(`💬 企业微信: ${notification.content}`);
          break;
        case 'email':
          console.log(`📧 邮件: ${notification.content}`);
          break;
      }
    });
  }
  
  /**
   * 获取用户的通知
   */
  static getUserNotifications(userId: string): Notification[] {
    return this.notifications.filter(n => n.recipient_id === userId);
  }
  
  /**
   * 标记通知为已读
   */
  static markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }
  
  /**
   * 获取未读通知数量
   */
  static getUnreadCount(userId: string): number {
    return this.notifications.filter(n => n.recipient_id === userId && !n.read).length;
  }
  
  /**
   * 清空所有通知（仅测试用）
   */
  static clearAll(): void {
    this.notifications = [];
  }
}

/**
 * 通知模板工厂
 * 根据事件类型生成标准化通知内容
 */
export class NotificationTemplates {
  /**
   * 提交申请通知（发给审批人）
   */
  static submitApplication(applicantName: string, algorithmName: string) {
    return {
      title: '新算法申请待审批',
      content: `${applicantName}提交了《${algorithmName}》算法申请，请尽快发起评审流程。`,
      type: 'status_update' as const,
      channels: ['internal', 'wechat'] as NotificationChannel[],
    };
  }
  
  /**
   * 发起评审通知（发给评审人）
   */
  static assignReview(algorithmName: string, deadline: string) {
    return {
      title: '算法评审任务分配',
      content: `您被指派评审《${algorithmName}》算法，请在${deadline}前完成评审。`,
      type: 'review_request' as const,
      channels: ['internal', 'email'] as NotificationChannel[],
    };
  }
  
  /**
   * 评审完成通知（发给组长）
   */
  static reviewCompleted(algorithmName: string, completedCount: number, totalCount: number) {
    const isAllCompleted = completedCount === totalCount;
    return {
      title: isAllCompleted ? '算法评审已完成' : '算法评审进度更新',
      content: isAllCompleted 
        ? `《${algorithmName}》所有评审人已完成评审，请确认评审结果。`
        : `《${algorithmName}》评审进度：${completedCount}/${totalCount} 已完成。`,
      type: 'review_completed' as const,
      channels: ['internal', 'wechat'] as NotificationChannel[],
    };
  }
  
  /**
   * 审批结果通知
   */
  static approvalResult(algorithmName: string, result: 'approved' | 'rejected', nextStep?: string) {
    const resultText = result === 'approved' ? '已通过' : '需修改';
    const nextStepText = nextStep ? `，${nextStep}` : '';
    
    return {
      title: `算法审批${resultText}`,
      content: `《${algorithmName}》审批${resultText}${nextStepText}。`,
      type: 'approval_result' as const,
      channels: ['internal', result === 'approved' ? 'email' : 'wechat'] as NotificationChannel[],
    };
  }
  
  /**
   * 超时提醒通知
   */
  static overdueReminder(algorithmName: string, daysPassed: number, role: string) {
    return {
      title: '⚠️ 算法评审超时提醒',
      content: `《${algorithmName}》${role}任务已超时${daysPassed}天，请尽快处理。`,
      type: 'overdue_reminder' as const,
      channels: ['wechat'] as NotificationChannel[],
    };
  }
}