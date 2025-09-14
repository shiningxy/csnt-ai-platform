import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/ui/status-badge";
import { CalendarIcon, FileText, Clock, User, MessageSquare, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AlgorithmAsset, ApprovalRecord, UserRole } from "@/types/algorithm";
import { mockUsers } from "@/data/mockData";
import { ApplicationStorage, SubmittedApplication } from "@/lib/storage";

// Mock pending approval data
const mockPendingApprovals: AlgorithmAsset[] = [
  {
    id: "3",
    name: "智能船舶路径规划算法",
    category: "智能运营",
    subCategory: "节能减排",
    tags: ["路径优化", "节能", "API服务"],
    description: "基于海况和燃油消耗优化的智能船舶路径规划",
    status: "pending_review",
    owner: "王小明",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
    applicableScenarios: "用于远洋货轮的航行路径优化，降低燃油消耗",
    targetUsers: ["船长", "航运调度员"],
    interactionMethod: "api",
    inputDataSource: "船舶实时位置数据",
    inputDataType: "json",
    outputSchema: "最优路径坐标点数组",
    resourceRequirements: "CPU: 4核, 内存: 8GB",
    deploymentProcess: "Docker部署",
    pseudoCode: "1. 获取海况数据\n2. 计算路径成本\n3. 优化算法求解",
    apiExample: "POST /api/v1/route/optimize",
    approvalRecords: [],
    callCount: 0,
    rating: 0,
    popularity: 0
  },
  {
    id: "4", 
    name: "港口货物识别AI",
    category: "智能运营",
    subCategory: "港口拥堵分析",
    tags: ["图像识别", "AI", "实时处理"],
    description: "基于计算机视觉的港口货物自动识别与分类",
    status: "pending_review",
    owner: "李华",
    createdAt: "2025-01-08T14:30:00Z",
    updatedAt: "2025-01-08T14:30:00Z",
    applicableScenarios: "港口货物自动化盘点和分类管理",
    targetUsers: ["港口管理员", "仓储人员"],
    interactionMethod: "api",
    inputDataSource: "港口摄像头实时画面",
    inputDataType: "image",
    outputSchema: "货物类型、数量、位置信息",
    resourceRequirements: "GPU: 1张V100, CPU: 8核, 内存: 16GB",
    deploymentProcess: "K8s部署",
    pseudoCode: "1. 图像预处理\n2. 目标检测\n3. 分类识别\n4. 结果输出",
    apiExample: "POST /api/v1/cargo/detect",
    approvalRecords: [],
    callCount: 0,
    rating: 0,
    popularity: 0
  }
];

interface ApprovalFormData {
  needMeeting: boolean;
  meetingDate: Date | undefined;
  attendees: string[];
  conclusion: "approved" | "conditional" | "rejected" | "";
  comment: string;
  conditions?: string;
  rejectionReason?: string;
}

export default function ApprovalCenter() {
  const { toast } = useToast();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmAsset | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [pendingApplications, setPendingApplications] = useState<(AlgorithmAsset | SubmittedApplication)[]>(() => {
    // 合并静态数据和动态数据
    const dynamicApps = ApplicationStorage.getPendingApplications();
    return [...mockPendingApprovals, ...dynamicApps];
  });
  const [approvalForm, setApprovalForm] = useState<ApprovalFormData>({
    needMeeting: false,
    meetingDate: undefined,
    attendees: [],
    conclusion: "",
    comment: ""
  });

  // Mock current user - should be from auth context
  const currentUser = mockUsers.find(u => u.role === 'team_lead') || mockUsers[0];

  // Check if user has approval permissions
  const canApprove = ['team_lead', 'admin'].includes(currentUser.role);

  if (!canApprove) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">权限不足</h2>
            <p className="text-muted-foreground">
              您没有访问审批中心的权限。请联系管理员获取相应权限。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOpenApproval = (algorithm: AlgorithmAsset) => {
    setSelectedAlgorithm(algorithm);
    setApprovalForm({
      needMeeting: false,
      meetingDate: undefined,
      attendees: [],
      conclusion: "",
      comment: ""
    });
    setIsApprovalDialogOpen(true);
  };

  const handleSubmitApproval = () => {
    if (!selectedAlgorithm || !approvalForm.conclusion) {
      toast({
        title: "请完善审批信息",
        description: "请选择审批结论并填写审批意见",
        variant: "destructive"
      });
      return;
    }

    if (approvalForm.conclusion === "conditional" && !approvalForm.conditions) {
      toast({
        title: "请填写修改条件",
        description: "有条件通过需要说明具体的修改要求",
        variant: "destructive"
      });
      return;
    }

    if (approvalForm.conclusion === "rejected" && !approvalForm.rejectionReason) {
      toast({
        title: "请填写驳回原因", 
        description: "驳回申请需要说明具体原因",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call
    console.log("Submitting approval:", {
      algorithmId: selectedAlgorithm.id,
      approver: currentUser.name,
      ...approvalForm
    });

    // 更新申请状态（只对动态申请有效）
    if (selectedAlgorithm.id.startsWith('app_')) {
      const newStatus = approvalForm.conclusion === "approved" ? "approved" : 
                       approvalForm.conclusion === "conditional" ? "conditional" : "rejected";
      
      ApplicationStorage.updateApplicationStatus(selectedAlgorithm.id, newStatus);
    }
    
    // 刷新待审批列表
    const dynamicApps = ApplicationStorage.getPendingApplications();
    setPendingApplications([...mockPendingApprovals, ...dynamicApps]);

    toast({
      title: "审批提交成功",
      description: `已成功提交对"${selectedAlgorithm.name}"的审批结果`
    });

    setIsApprovalDialogOpen(false);
    setSelectedAlgorithm(null);
  };

  const handleAttendeeToggle = (userId: string, checked: boolean) => {
    setApprovalForm(prev => ({
      ...prev,
      attendees: checked 
        ? [...prev.attendees, userId]
        : prev.attendees.filter(id => id !== userId)
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">审批中心</h1>
        <p className="text-muted-foreground">
          管理算法申请的审批流程，确保算法质量和安全性
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待审批</p>
                <p className="text-2xl font-bold text-warning">{pendingApplications.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">本月已审批</p>
                <p className="text-2xl font-bold text-success">12</p>
              </div>
              <FileText className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">通过率</p>
                <p className="text-2xl font-bold text-primary">85%</p>
              </div>
              <Badge className="h-8 w-8 rounded-full p-0 flex items-center justify-center">✓</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">平均审批时间</p>
                <p className="text-2xl font-bold text-info">2.3天</p>
              </div>
              <User className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>待审批算法列表</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">暂无待审批项目</h3>
              <p className="text-muted-foreground">所有提交的算法申请都已处理完成</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>算法名称</TableHead>
                  <TableHead>申请人</TableHead>
                  <TableHead>提交时间</TableHead>
                  <TableHead>业务分类</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApplications.map((algorithm) => (
                  <TableRow key={algorithm.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{algorithm.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {algorithm.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{algorithm.owner}</TableCell>
                    <TableCell>
                      {format(new Date(algorithm.createdAt), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{algorithm.category}</div>
                        <div className="text-xs text-muted-foreground">{algorithm.subCategory}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={algorithm.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog 
                          open={isApprovalDialogOpen && selectedAlgorithm?.id === algorithm.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setIsApprovalDialogOpen(false);
                              setSelectedAlgorithm(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            onClick={() => handleOpenApproval(algorithm as AlgorithmAsset)}
                          >
                              评审
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>算法审批 - {selectedAlgorithm?.name}</DialogTitle>
                            </DialogHeader>
                            
                            {selectedAlgorithm && (
                              <div className="space-y-6">
                                {/* Algorithm Info */}
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <h4 className="font-semibold mb-2">申请信息</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">申请人：</span>
                                      {selectedAlgorithm.owner}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">提交时间：</span>
                                      {format(new Date(selectedAlgorithm.createdAt), "yyyy-MM-dd HH:mm")}
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">算法描述：</span>
                                      {selectedAlgorithm.description}
                                    </div>
                                  </div>
                                </div>

                                {/* Meeting Arrangement */}
                                <div>
                                  <Label className="text-base font-semibold">会议安排</Label>
                                  <div className="mt-2 space-y-4">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox 
                                        id="needMeeting"
                                        checked={approvalForm.needMeeting}
                                        onCheckedChange={(checked) => 
                                          setApprovalForm(prev => ({ ...prev, needMeeting: checked as boolean }))
                                        }
                                      />
                                      <Label htmlFor="needMeeting">是否需要召开线下会议？</Label>
                                    </div>

                                    {approvalForm.needMeeting && (
                                      <div className="space-y-4 pl-6">
                                        <div>
                                          <Label htmlFor="meetingDate">会议时间</Label>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button
                                                variant="outline"
                                                className={cn(
                                                  "w-full justify-start text-left font-normal mt-1",
                                                  !approvalForm.meetingDate && "text-muted-foreground"
                                                )}
                                              >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {approvalForm.meetingDate ? 
                                                  format(approvalForm.meetingDate, "yyyy-MM-dd") : 
                                                  "选择会议日期"
                                                }
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                              <Calendar
                                                mode="single"
                                                selected={approvalForm.meetingDate}
                                                onSelect={(date) => 
                                                  setApprovalForm(prev => ({ ...prev, meetingDate: date }))
                                                }
                                                initialFocus
                                              />
                                            </PopoverContent>
                                          </Popover>
                                        </div>

                                        <div>
                                          <Label>与会人员</Label>
                                          <div className="mt-2 space-y-2">
                                            {mockUsers
                                              .filter(user => ['algorithm_engineer', 'team_lead', 'product_manager'].includes(user.role))
                                              .map((user) => (
                                              <div key={user.id} className="flex items-center space-x-2">
                                                <Checkbox 
                                                  id={`attendee-${user.id}`}
                                                  checked={approvalForm.attendees.includes(user.id)}
                                                  onCheckedChange={(checked) => 
                                                    handleAttendeeToggle(user.id, checked as boolean)
                                                  }
                                                />
                                                <Label htmlFor={`attendee-${user.id}`} className="text-sm">
                                                  {user.name} ({user.role === 'algorithm_engineer' ? '算法工程师' : 
                                                           user.role === 'team_lead' ? '组长' : '产品经理'})
                                                </Label>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Approval Conclusion */}
                                <div>
                                  <Label className="text-base font-semibold">审批结论</Label>
                                  <RadioGroup 
                                    value={approvalForm.conclusion} 
                                    onValueChange={(value) => 
                                      setApprovalForm(prev => ({ ...prev, conclusion: value as any }))
                                    }
                                    className="mt-2"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="approved" id="approved" />
                                      <Label htmlFor="approved" className="text-success">✅ 通过（无修改）</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="conditional" id="conditional" />
                                      <Label htmlFor="conditional" className="text-warning">⚠️ 有条件通过</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="rejected" id="rejected" />
                                      <Label htmlFor="rejected" className="text-destructive">❌ 驳回</Label>
                                    </div>
                                  </RadioGroup>

                                  {approvalForm.conclusion === "conditional" && (
                                    <div className="mt-4">
                                      <Label htmlFor="conditions">需要补充的内容</Label>
                                      <Textarea
                                        id="conditions"
                                        placeholder="请详细说明需要补充或修改的内容..."
                                        value={approvalForm.conditions || ""}
                                        onChange={(e) => 
                                          setApprovalForm(prev => ({ ...prev, conditions: e.target.value }))
                                        }
                                        className="mt-1"
                                      />
                                    </div>
                                  )}

                                  {approvalForm.conclusion === "rejected" && (
                                    <div className="mt-4">
                                      <Label htmlFor="rejectionReason">驳回原因</Label>
                                      <Textarea
                                        id="rejectionReason"
                                        placeholder="请详细说明驳回的具体原因..."
                                        value={approvalForm.rejectionReason || ""}
                                        onChange={(e) => 
                                          setApprovalForm(prev => ({ ...prev, rejectionReason: e.target.value }))
                                        }
                                        className="mt-1"
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Approval Comments */}
                                <div>
                                  <Label htmlFor="comment" className="text-base font-semibold">审批意见</Label>
                                  <Textarea
                                    id="comment"
                                    placeholder="请填写详细的审批意见和建议..."
                                    value={approvalForm.comment}
                                    onChange={(e) => 
                                      setApprovalForm(prev => ({ ...prev, comment: e.target.value }))
                                    }
                                    className="mt-2"
                                    rows={4}
                                  />
                                </div>

                                {/* File Upload */}
                                <div>
                                  <Label className="text-base font-semibold">附件上传（可选）</Label>
                                  <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                      上传会议录音、纪要或其他相关文件
                                    </p>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-2 pt-4">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setIsApprovalDialogOpen(false)}
                                  >
                                    取消
                                  </Button>
                                  <Button onClick={handleSubmitApproval}>
                                    提交审批
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/algorithm/${algorithm.id}`, '_blank')}
                        >
                          查看详情
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}