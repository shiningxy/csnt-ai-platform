import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SearchFilter } from '@/components/algorithm/SearchFilter';
import { AlgorithmCard } from '@/components/algorithm/AlgorithmCard';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, Brain, TrendingUp } from 'lucide-react';
import { AlgorithmAsset, FilterOptions } from '@/types/algorithm';
import { mockAlgorithms } from '@/data/mockData';
import { DraftStorage, ApplicationStorage } from '@/lib/storage';

const ITEMS_PER_PAGE = 9;

// Mock current user role for conditional rendering
const currentUserRole: 'admin' | 'algorithm_engineer' | 'team_lead' = 'admin'; // This would come from auth context

export default function AlgorithmList() {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    subCategory: '',
    tags: [],
    status: '',
    sortBy: 'latest'
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort algorithms
  const filteredAlgorithms = useMemo(() => {
    // 合并草稿、已提交申请与已发布的算法
    const drafts = DraftStorage.getAllDrafts().map(draft => ({
      id: draft.id,
      name: draft.name,
      category: draft.category,
      subCategory: draft.subCategory,
      tags: draft.tags,
      description: draft.description,
      status: 'draft' as const,
      owner: '当前用户',
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      applicableScenarios: draft.applicableScenarios,
      targetUsers: draft.targetUsers,
      interactionMethod: (draft.interactionMethod || 'api') as 'api' | 'batch' | 'component',
      inputDataSource: draft.inputDataSource,
      inputDataType: (draft.inputDataType || 'json') as 'json' | 'csv' | 'image' | 'stream',
      outputSchema: draft.outputSchema,
      resourceRequirements: draft.resourceRequirements,
      deploymentProcess: draft.deploymentMethod?.join(', ') || '',
      pseudoCode: '',
      apiExample: '',
      approvalRecords: [],
      callCount: 0,
      rating: 0,
      popularity: 0,
    }));

    const submitted = ApplicationStorage.getAllApplications().map(app => ({
      id: app.id,
      name: app.name,
      category: app.category,
      subCategory: app.subCategory,
      tags: app.tags,
      description: app.description,
      status: app.status as any,
      owner: app.owner,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      applicableScenarios: app.applicableScenarios,
      targetUsers: app.targetUsers,
      interactionMethod: app.interactionMethod as any,
      inputDataSource: app.inputDataSource,
      inputDataType: app.inputDataType as any,
      outputSchema: app.outputSchema,
      resourceRequirements: app.resourceRequirements,
      deploymentProcess: app.deploymentMethod?.join(', ') || app.deploymentProcess || '',
      pseudoCode: app.pseudoCode || '',
      apiExample: app.apiExample || '',
      approvalRecords: app.approvalRecords || [],
      callCount: app.callCount || 0,
      rating: app.rating || 0,
      popularity: app.popularity || 0,
    }));
    
    let filtered = [...mockAlgorithms, ...drafts, ...submitted];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(algorithm => 
        algorithm.name.toLowerCase().includes(searchLower) ||
        algorithm.description.toLowerCase().includes(searchLower) ||
        algorithm.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        algorithm.applicableScenarios.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(algorithm => algorithm.category === filters.category);
    }

    // Subcategory filter
    if (filters.subCategory) {
      filtered = filtered.filter(algorithm => algorithm.subCategory === filters.subCategory);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(algorithm => 
        filters.tags.some(tag => algorithm.tags.includes(tag))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(algorithm => algorithm.status === filters.status);
    }

    // Sort
    switch (filters.sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.callCount || 0) - (a.callCount || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return filtered;
  }, [filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAlgorithms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAlgorithms = filteredAlgorithms.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const statsData = {
    total: mockAlgorithms.length,
    live: mockAlgorithms.filter(a => a.status === 'live').length,
    inDevelopment: mockAlgorithms.filter(a => a.status === 'pending_frontend').length,
    totalCalls: mockAlgorithms.reduce((sum, a) => sum + (a.callCount || 0), 0)
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden h-screen">
        
        {/* Gradient Overlay */}
        
        
        <div className="relative container mx-auto px-4 py-16 z-20 h-full flex items-center">
          <div className="text-center text-white w-full">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Brain className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              AI算法资产中心
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              集中管理、标准化展示、场景化引导的智能算法赋能平台
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{statsData.total}</div>
                <div className="text-sm text-white/80">总算法数</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{statsData.live}</div>
                <div className="text-sm text-white/80">已上线</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{statsData.inDevelopment}</div>
                <div className="text-sm text-white/80">开发中</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{statsData.totalCalls.toLocaleString()}</div>
                <div className="text-sm text-white/80">总调用数</div>
              </div>
            </div>

            {/* CTA Button */}
            {(currentUserRole === 'algorithm_engineer' || currentUserRole === 'admin') && (
              <Link to="/apply">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  申请新算法
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <SearchFilter 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold">
              算法列表
            </h2>
            <span className="text-muted-foreground">
              共 {filteredAlgorithms.length} 个算法
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>按{filters.sortBy === 'latest' ? '最新' : filters.sortBy === 'popular' ? '热度' : '评分'}排序</span>
          </div>
        </div>

        {/* Algorithm Grid */}
        {paginatedAlgorithms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedAlgorithms.map((algorithm) => (
              <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              暂无匹配的算法
            </h3>
            <p className="text-muted-foreground">
              请尝试调整筛选条件或{' '}
              <Button variant="link" onClick={() => setFilters({
                search: '',
                category: '',
                subCategory: '',
                tags: [],
                status: '',
                sortBy: 'latest'
              })}>
                清除所有筛选
              </Button>
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <span className="px-4">...</span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                        className="cursor-pointer"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}