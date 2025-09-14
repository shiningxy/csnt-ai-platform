import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { ReviewConclusion, ReviewRecord } from '@/types/algorithm';

interface ReviewResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  algorithmName: string;
  algorithmId: string;
  reviewerId: string;
  reviewerName: string;
  onSubmit: (review: Omit<ReviewRecord, 'id'>) => void;
}

export function ReviewResultDialog({ 
  open, 
  onOpenChange, 
  algorithmName, 
  algorithmId,
  reviewerId,
  reviewerName,
  onSubmit 
}: ReviewResultDialogProps) {
  const [conclusion, setConclusion] = useState<ReviewConclusion>('approved');
  const [comments, setComments] = useState('');
  const [conditionalRequirements, setConditionalRequirements] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = () => {
    let finalComments = comments;

    // 根据结论添加额外的信息
    if (conclusion === 'conditional' && conditionalRequirements.trim()) {
      finalComments = `需补充完善：${conditionalRequirements.trim()}\n\n${comments}`;
    } else if (conclusion === 'rejected' && rejectionReason.trim()) {
      finalComments = `驳回原因：${rejectionReason.trim()}\n\n${comments}`;
    }

    if (!finalComments.trim()) {
      alert('请填写评审意见');
      return;
    }

    const review: Omit<ReviewRecord, 'id'> = {
      algorithm_id: algorithmId,
      reviewer_id: reviewerId,
      reviewer_name: reviewerName,
      assigned_by: 'system', // 实际应用中从评审分配记录获取
      assigned_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed',
      conclusion,
      comments: finalComments,
    };

    onSubmit(review);
    
    // 重置表单
    setConclusion('approved');
    setComments('');
    setConditionalRequirements('');
    setRejectionReason('');
    onOpenChange(false);
  };

  const getConclusionIcon = (type: ReviewConclusion) => {
    switch (type) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'conditional':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-danger" />;
    }
  };

  const getConclusionLabel = (type: ReviewConclusion) => {
    switch (type) {
      case 'approved':
        return '通过';
      case 'conditional':
        return '有条件通过';
      case 'rejected':
        return '驳回';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            完成评审 - {algorithmName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 评审结论 */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">评审结论</Label>
            <RadioGroup value={conclusion} onValueChange={(value) => setConclusion(value as ReviewConclusion)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50">
                <RadioGroupItem value="approved" id="approved" />
                <Label htmlFor="approved" className="flex items-center gap-2 cursor-pointer flex-1">
                  {getConclusionIcon('approved')}
                  <span className="font-medium">通过</span>
                  <span className="text-sm text-muted-foreground">无需修改，可直接进入下一阶段</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50">
                <RadioGroupItem value="conditional" id="conditional" />
                <Label htmlFor="conditional" className="flex items-center gap-2 cursor-pointer flex-1">
                  {getConclusionIcon('conditional')}
                  <span className="font-medium">有条件通过</span>
                  <span className="text-sm text-muted-foreground">需要补充完善后可通过</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50">
                <RadioGroupItem value="rejected" id="rejected" />
                <Label htmlFor="rejected" className="flex items-center gap-2 cursor-pointer flex-1">
                  {getConclusionIcon('rejected')}
                  <span className="font-medium">驳回</span>
                  <span className="text-sm text-muted-foreground">存在重大问题，需重新设计</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 条件说明 */}
          {conclusion === 'conditional' && (
            <div className="space-y-3">
              <Label className="text-base font-semibold text-warning">需要补充的内容</Label>
              <Textarea
                value={conditionalRequirements}
                onChange={(e) => setConditionalRequirements(e.target.value)}
                placeholder="请详细说明需要补充或修改的内容..."
                rows={3}
                className="border-warning/50 focus:border-warning"
              />
            </div>
          )}

          {/* 驳回原因 */}
          {conclusion === 'rejected' && (
            <div className="space-y-3">
              <Label className="text-base font-semibold text-danger">驳回原因</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="请详细说明驳回的具体原因..."
                rows={3}
                className="border-danger/50 focus:border-danger"
              />
            </div>
          )}

          {/* 详细评审意见 */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">详细评审意见 <span className="text-danger">*</span></Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="请填写详细的评审意见，包括优点、不足、建议等..."
              rows={4}
              className="min-h-[100px]"
            />
            <div className="text-xs text-muted-foreground">
              💡 建议包含：算法逻辑评估、技术可行性分析、性能预期、风险评估等
            </div>
          </div>

          {/* 评审结果预览 */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={conclusion === 'approved' ? 'default' : conclusion === 'conditional' ? 'secondary' : 'destructive'}>
                {getConclusionLabel(conclusion)}
              </Badge>
              <span className="text-sm text-muted-foreground">评审人：{reviewerName}</span>
            </div>
            <div className="text-sm space-y-1">
              {conclusion === 'conditional' && conditionalRequirements && (
                <div><strong>需补充：</strong>{conditionalRequirements}</div>
              )}
              {conclusion === 'rejected' && rejectionReason && (
                <div><strong>驳回原因：</strong>{rejectionReason}</div>
              )}
              {comments && (
                <div><strong>评审意见：</strong>{comments}</div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!comments.trim()}>
            提交评审结果
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}