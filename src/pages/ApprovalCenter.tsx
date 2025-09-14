import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Settings,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AlgorithmAsset, ApprovalRecord, UserRole, ReviewAssignment, ReviewRecord, AlgorithmStatus } from '@/types/algorithm';
import { ApplicationStorage, ReviewStorage } from '@/lib/storage';
import { NotificationManager, NotificationTemplates } from '@/lib/notification';
import { ReviewAssignmentDialog } from '@/components/approval/ReviewAssignmentDialog';
import { ReviewResultDialog } from '@/components/approval/ReviewResultDialog';

// 模拟数据和类型定义
const mockPendingApprovals: AlgorithmAsset[] = [
  // 模拟一些待审批的算法
];

interface ApprovalFormData {
  conclusion: 'approved' | 'rejected' | 'conditional';
  comment: string;
  meetingDate?: string;
  selectedAttendees: string[];
  rejectionReason?: string;
  conditions?: string;
}

const mockUsers = [
  { id: 'user1', name: '张三', role: 'algorithm_engineer' as UserRole },
  { id: 'user2', name: '李四', role: 'team_lead' as UserRole },
  { id: 'user3', name: '王五', role: 'product_manager' as UserRole },
];

const ApprovalCenter = () => {
  const { toast } = useToast();

  // 模拟当前用户（实际应用中从认证系统获取）
  const currentUser = { 
    id: 'current_user',
    name: '李四', 
    role: 'team_lead' as UserRole 
  };

  // 检查用户是否有审批权限
  const hasApprovalPermission = ['team_lead', 'product_manager', 'admin'].includes(currentUser.role);

  if (!hasApprovalPermission) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-4">权限不足</h1>
          <p className="text-muted-foreground">您没有权限访问审批中心</p>
        </div>
      </div>
    );
  }

  // 状态管理
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmAsset | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isReviewAssignmentOpen, setIsReviewAssignmentOpen] = useState(false);
  const [isReviewResultOpen, setIsReviewResultOpen] = useState(false);
  const [pendingApplications, setPendingApplications] = useState<AlgorithmAsset[]>([]);
  const [currentTab, setCurrentTab] = useState('pending');
  const [approvalFormData, setApprovalFormData] = useState<ApprovalFormData>({
    conclusion: 'approved',
    comment: '',
    meetingDate: '',
    selectedAttendees: [],
    rejectionReason: '',
    conditions: ''
  });

  // 获取待审批申请
  useEffect(() => {
    const dynamicApps = ApplicationStorage.getPendingApplications().map(app => ({
      ...app,
      // 将SubmittedApplication转换为AlgorithmAsset格式
      applicableScenarios: app.applicableScenarios,
      targetUsers: app.targetUsers,
      interactionMethod: app.interactionMethod as any,
      inputDataSource: app.inputDataSource,
      inputDataType: app.inputDataType as any,
      outputSchema: app.outputSchema,
      resourceRequirements: app.resourceRequirements,
      deploymentProcess: app.deploymentProcess,
      pseudoCode: app.pseudoCode,
      apiExample: app.apiExample,
      approvalRecords: app.approvalRecords as ApprovalRecord[],
    })) as AlgorithmAsset[];

    setPendingApplications([...mockPendingApprovals, ...dynamicApps]);
  }, []);

  // 获取不同状态的申请数据
  const allApplications = ApplicationStorage.getAllApplications();
  const pendingReviewApps = allApplications.filter(app => app.status === 'pending_review');
  const underReviewApps = allApplications.filter(app => app.status === 'under_review');
  const pendingConfirmationApps = allApplications.filter(app => app.status === 'pending_confirmation');

  // 打开审批对话框
  const handleOpenApproval = (algorithm: AlgorithmAsset) => {
    setSelectedAlgorithm(algorithm);
    setIsApprovalDialogOpen(true);
    setApprovalFormData({
      conclusion: 'approved',
      comment: '',
      meetingDate: '',
      selectedAttendees: [],
      rejectionReason: '',
      conditions: ''
    });
  };

  // 发起评审
  const handleInitiateReview = (algorithm: AlgorithmAsset) => {
    setSelectedAlgorithm(algorithm);
    setIsReviewAssignmentOpen(true);
  };

  // 分配评审人
  const handleAssignReviewers = (assignment: Omit<ReviewAssignment, 'id'>) => {
    const assignmentWithId: ReviewAssignment = {
      ...assignment,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    // 保存评审分配记录
    ReviewStorage.saveAssignment(assignmentWithId);
    
    // 更新申请状态和分配信息
    ApplicationStorage.assignReviewers(assignment.algorithm_id, assignmentWithId);
    
    // 发送通知给评审人
    assignment.reviewers.forEach(reviewer => {
      const notification = NotificationTemplates.assignReview(
        selectedAlgorithm?.name || '算法申请',
        '5个工作日后'
      );
      
      NotificationManager.createNotification({
        recipient_id: reviewer.id,
        recipient_name: reviewer.name,
        title: notification.title,
        content: notification.content,
        type: notification.type,
        channels: notification.channels,
        algorithm_id: assignment.algorithm_id,
      });
    });

    toast({
      title: "评审已发起",
      description: `已成功为"${selectedAlgorithm?.name}"分配${assignment.reviewers.length}名评审人`,
    });

    // 刷新数据
    const dynamicApps = ApplicationStorage.getAllApplications().map(app => ({
      ...app,
      applicableScenarios: app.applicableScenarios,
      targetUsers: app.targetUsers,
      interactionMethod: app.interactionMethod as any,
      inputDataSource: app.inputDataSource,
      inputDataType: app.inputDataType as any,
      outputSchema: app.outputSchema,
      resourceRequirements: app.resourceRequirements,
      deploymentProcess: app.deploymentProcess,
      pseudoCode: app.pseudoCode,
      apiExample: app.apiExample,
      approvalRecords: app.approvalRecords as ApprovalRecord[],
    })) as AlgorithmAsset[];

    setPendingApplications(dynamicApps);
  };

  // 完成评审
  const handleCompleteReview = (algorithm: AlgorithmAsset) => {
    setSelectedAlgorithm(algorithm);
    setIsReviewResultOpen(true);
  };

  // 提交评审结果
  const handleSubmitReviewResult = (review: Omit<ReviewRecord, 'id'>) => {
    const reviewWithId: ReviewRecord = {
      ...review,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    // 保存评审记录
    ReviewStorage.saveReviewRecord(reviewWithId);
    
    // 更新申请状态
    ApplicationStorage.submitReviewResult(review.algorithm_id, reviewWithId);
    
    // 检查是否所有评审人都已完成
    const app = ApplicationStorage.getAllApplications().find(a => a.id === review.algorithm_id);
    const allCompleted = app?.assignedReviewers?.every(reviewerId => 
      app.completedReviewers?.includes(reviewerId)
    ) || false;

    if (allCompleted) {
      // 通知组长确认结果
      const notification = NotificationTemplates.reviewCompleted(
        selectedAlgorithm?.name || '算法申请',
        app?.completedReviewers?.length || 0,
        app?.assignedReviewers?.length || 0
      );
      
      NotificationManager.createNotification({
        recipient_id: currentUser.id,
        recipient_name: currentUser.name,
        title: notification.title,
        content: notification.content,
        type: notification.type,
        channels: notification.channels,
        algorithm_id: review.algorithm_id,
      });
    }

    toast({
      title: "评审提交成功",
      description: `已成功提交对"${selectedAlgorithm?.name}"的评审结果`,
    });

    // 刷新数据
    const dynamicApps = ApplicationStorage.getAllApplications().map(app => ({
      ...app,
      applicableScenarios: app.applicableScenarios,
      targetUsers: app.targetUsers,
      interactionMethod: app.interactionMethod as any,
      inputDataSource: app.inputDataSource,
      inputDataType: app.inputDataType as any,
      outputSchema: app.outputSchema,
      resourceRequirements: app.resourceRequirements,
      deploymentProcess: app.deploymentProcess,
      pseudoCode: app.pseudoCode,
      apiExample: app.apiExample,
      approvalRecords: app.approvalRecords as ApprovalRecord[],
    })) as AlgorithmAsset[];

    setPendingApplications(dynamicApps);
  };

  // 确认评审结果
  const handleConfirmReviewResult = (algorithmId: string, approved: boolean) => {
    const newStatus: AlgorithmStatus = approved ? 'pending_product' : 'draft';
    ApplicationStorage.updateApplicationStatus(algorithmId, newStatus);
    
    // 发送通知
    const algorithm = allApplications.find(a => a.id === algorithmId);
    if (algorithm) {
      const notification = NotificationTemplates.approvalResult(
        algorithm.name,
        approved ? 'approved' : 'rejected',
        approved ? '请产品同学跟进需求文档' : '请申请人修改后重新提交'
      );
      
      NotificationManager.createNotification({
        recipient_id: algorithm.owner,
        recipient_name: algorithm.owner,
        title: notification.title,
        content: notification.content,
        type: notification.type,
        channels: notification.channels,
        algorithm_id: algorithmId,
      });
    }

    toast({
      title: approved ? "审批通过" : "已打回修改",
      description: approved ? "已转交产品经理跟进" : "已通知申请人修改",
    });

    // 刷新数据
    const dynamicApps = ApplicationStorage.getAllApplications().map(app => ({
      ...app,
      applicableScenarios: app.applicableScenarios,
      targetUsers: app.targetUsers,
      interactionMethod: app.interactionMethod as any,
      inputDataSource: app.inputDataSource,
      inputDataType: app.inputDataType as any,
      outputSchema: app.outputSchema,
      resourceRequirements: app.resourceRequirements,
      deploymentProcess: app.deploymentProcess,
      pseudoCode: app.pseudoCode,
      apiExample: app.apiExample,
      approvalRecords: app.approvalRecords as ApprovalRecord[],
    })) as AlgorithmAsset[];

    setPendingApplications(dynamicApps);
  };

  // 获取状态Badge组件
  const getStatusBadge = (status: AlgorithmStatus) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="secondary" className="bg-warning/20 text-warning">待评审</Badge>;
      case 'under_review':
        return <Badge variant="secondary" className="bg-primary/20 text-primary">评审中</Badge>;
      case 'pending_confirmation':
        return <Badge variant="secondary" className="bg-success/20 text-success">待确认</Badge>;
      case 'pending_product':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700">待产品</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 计算统计数据
  const stats = {
    pending: pendingReviewApps.length,
    underReview: underReviewApps.length,
    pendingConfirmation: pendingConfirmationApps.length,
    completed: allApplications.filter(app => ['pending_product', 'pending_frontend', 'live'].includes(app.status)).length,
  };

  return (
    <div className="container mx-auto pt-20 pb-8 space-y-6">
      {/* 页面标题 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          审批中心
        </h1>
        <p className="text-muted-foreground">
          管理算法申请的评审分配、进度跟踪和结果确认流程
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待发起评审</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">需要分配评审人</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">评审进行中</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.underReview}</div>
            <p className="text-xs text-muted-foreground">评审人处理中</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待确认结果</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.pendingConfirmation}</div>
            <p className="text-xs text-muted-foreground">组长确认中</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成审批</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">本月累计</p>
          </CardContent>
        </Card>
      </div>

      {/* 审批列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            算法申请审批
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">待发起评审 ({stats.pending})</TabsTrigger>
              <TabsTrigger value="reviewing">评审中 ({stats.underReview})</TabsTrigger>
              <TabsTrigger value="confirming">待确认 ({stats.pendingConfirmation})</TabsTrigger>
              <TabsTrigger value="completed">已完成 ({stats.completed})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>算法名称</TableHead>
                    <TableHead>申请人</TableHead>
                    <TableHead>提交时间</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReviewApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{app.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {app.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{app.owner}</TableCell>
                      <TableCell>
                        {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{app.category}</div>
                          <div className="text-xs text-muted-foreground">{app.subCategory}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(app.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleInitiateReview(app as AlgorithmAsset)}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            发起评审
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/algorithm/${app.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            查看详情
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingReviewApps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        暂无待发起评审的申请
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="reviewing" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>算法名称</TableHead>
                    <TableHead>申请人</TableHead>
                    <TableHead>评审人</TableHead>
                    <TableHead>完成情况</TableHead>
                    <TableHead>会议安排</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {underReviewApps.map((app) => {
                    const assignment = app.reviewAssignment;
                    const completedCount = app.completedReviewers?.length || 0;
                    const totalCount = app.assignedReviewers?.length || 0;
                    
                    return (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{app.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {app.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{app.owner}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {assignment?.reviewers.map((reviewer) => (
                              <Badge 
                                key={reviewer.id} 
                                variant={app.completedReviewers?.includes(reviewer.id) ? "default" : "outline"}
                                className="text-xs"
                              >
                                {reviewer.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {completedCount}/{totalCount} 已完成
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all" 
                                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {assignment?.meeting_time ? (
                            <div className="text-sm">
                              <div>{assignment.meeting_type === 'offline' ? '线下' : '线上'}会议</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(assignment.meeting_time).toLocaleString('zh-CN')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">无需会议</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {/* 当前用户是否为评审人且未完成评审 */}
                            {app.assignedReviewers?.includes(currentUser.id) && 
                             !app.completedReviewers?.includes(currentUser.id) && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCompleteReview(app as AlgorithmAsset)}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                完成评审
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(`/algorithm/${app.id}`, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              查看详情
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {underReviewApps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        暂无正在评审的申请
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="confirming" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>算法名称</TableHead>
                    <TableHead>申请人</TableHead>
                    <TableHead>评审完成时间</TableHead>
                    <TableHead>评审摘要</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingConfirmationApps.map((app) => {
                    const reviews = app.reviewRecords || [];
                    const approvedCount = reviews.filter(r => r.conclusion === 'approved').length;
                    const conditionalCount = reviews.filter(r => r.conclusion === 'conditional').length;
                    const rejectedCount = reviews.filter(r => r.conclusion === 'rejected').length;
                    
                    return (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{app.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {app.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{app.owner}</TableCell>
                        <TableCell>
                          {reviews.length > 0 ? 
                            new Date(Math.max(...reviews.map(r => new Date(r.completed_at || r.assigned_at).getTime()))).toLocaleString('zh-CN') :
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {approvedCount > 0 && (
                              <Badge variant="default" className="text-xs bg-success/20 text-success">
                                {approvedCount}通过
                              </Badge>
                            )}
                            {conditionalCount > 0 && (
                              <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">
                                {conditionalCount}需修改
                              </Badge>
                            )}
                            {rejectedCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {rejectedCount}驳回
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleConfirmReviewResult(app.id, true)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              确认通过
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleConfirmReviewResult(app.id, false)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              打回修改
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(`/algorithm/${app.id}`, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              查看详情
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pendingConfirmationApps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        暂无待确认的评审结果
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>算法名称</TableHead>
                    <TableHead>申请人</TableHead>
                    <TableHead>完成时间</TableHead>
                    <TableHead>当前状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allApplications
                    .filter(app => ['pending_product', 'pending_frontend', 'live'].includes(app.status))
                    .map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{app.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {app.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{app.owner}</TableCell>
                      <TableCell>
                        {new Date(app.updatedAt).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(app.status)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(`/algorithm/${app.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 评审分配对话框 */}
      <ReviewAssignmentDialog
        open={isReviewAssignmentOpen}
        onOpenChange={setIsReviewAssignmentOpen}
        algorithmName={selectedAlgorithm?.name || ''}
        algorithmId={selectedAlgorithm?.id || ''}
        onAssign={handleAssignReviewers}
      />

      {/* 评审结果对话框 */}
      <ReviewResultDialog
        open={isReviewResultOpen}
        onOpenChange={setIsReviewResultOpen}
        algorithmName={selectedAlgorithm?.name || ''}
        algorithmId={selectedAlgorithm?.id || ''}
        reviewerId={currentUser.id}
        reviewerName={currentUser.name}
        onSubmit={handleSubmitReviewResult}
      />
    </div>
  );
};

export default ApprovalCenter;