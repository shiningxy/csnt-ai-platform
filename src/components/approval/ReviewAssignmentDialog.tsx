import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Users } from 'lucide-react';
import { MeetingType, ReviewAssignment, UserRole } from '@/types/algorithm';
import { format } from 'date-fns';

interface ReviewAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  algorithmName: string;
  algorithmId: string;
  onAssign: (assignment: Omit<ReviewAssignment, 'id'>) => void;
}

// 模拟可用的评审人员
const mockReviewers = [
  { id: 'reviewer1', name: '张评审', role: 'algorithm_engineer' as UserRole },
  { id: 'reviewer2', name: '李专家', role: 'reviewer' as UserRole },
  { id: 'reviewer3', name: '王工程师', role: 'algorithm_engineer' as UserRole },
  { id: 'reviewer4', name: '赵技术', role: 'algorithm_engineer' as UserRole },
];

export function ReviewAssignmentDialog({ 
  open, 
  onOpenChange, 
  algorithmName, 
  algorithmId,
  onAssign 
}: ReviewAssignmentDialogProps) {
  const [meetingType, setMeetingType] = useState<MeetingType>('none');
  const [meetingTime, setMeetingTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

  const handleReviewerToggle = (reviewerId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviewers(prev => [...prev, reviewerId]);
    } else {
      setSelectedReviewers(prev => prev.filter(id => id !== reviewerId));
    }
  };

  const handleAssign = () => {
    if (selectedReviewers.length === 0) {
      alert('请至少选择一名评审人');
      return;
    }

    const reviewers = selectedReviewers.map(id => {
      const reviewer = mockReviewers.find(r => r.id === id);
      return reviewer!;
    });

    const assignment: Omit<ReviewAssignment, 'id'> = {
      algorithm_id: algorithmId,
      meeting_type: meetingType,
      meeting_time: meetingTime || undefined,
      meeting_description: description || undefined,
      reviewers,
      initiated_by: 'current_user', // 实际应用中从认证系统获取
      initiated_at: new Date().toISOString(),
      status: 'active',
    };

    onAssign(assignment);
    
    // 重置表单
    setMeetingType('none');
    setMeetingTime('');
    setDescription('');
    setSelectedReviewers([]);
    onOpenChange(false);
  };

  const getDeadlineDate = () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);
    return format(deadline, 'yyyy年MM月dd日');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            发起评审 - {algorithmName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 会议形式 */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">评审形式</Label>
            <RadioGroup value={meetingType} onValueChange={(value) => setMeetingType(value as MeetingType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offline" id="offline" />
                <Label htmlFor="offline">线下会议</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online">线上会议（Teams/钉钉）</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">无需会议（仅文档评审）</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 会议时间 */}
          {meetingType !== 'none' && (
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                会议时间
              </Label>
              <Input
                type="datetime-local"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                placeholder="选择会议时间"
              />
            </div>
          )}

          {/* 评审人选择 */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              选择评审人 <span className="text-sm text-muted-foreground">(建议1-3人)</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {mockReviewers.map((reviewer) => (
                <div key={reviewer.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50">
                  <Checkbox
                    id={reviewer.id}
                    checked={selectedReviewers.includes(reviewer.id)}
                    onCheckedChange={(checked) => 
                      handleReviewerToggle(reviewer.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={reviewer.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{reviewer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {reviewer.role === 'algorithm_engineer' ? '算法工程师' : 
                       reviewer.role === 'reviewer' ? '评审专家' : '技术专家'}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 附加说明 */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">附加说明</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="评审要求、注意事项等（可选）"
              rows={3}
            />
          </div>

          {/* 评审截止时间提醒 */}
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              评审截止时间：{getDeadlineDate()}（发起后5个工作日）
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleAssign} disabled={selectedReviewers.length === 0}>
            发起评审
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}