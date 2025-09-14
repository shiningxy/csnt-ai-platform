import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { FilterOptions, AlgorithmStatus } from '@/types/algorithm';
import { categories, allTags } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface SearchFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

export function SearchFilter({ filters, onFiltersChange, className }: SearchFilterProps) {
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = { 
      ...filters, 
      category: value,
      subCategory: '' // Reset subcategory when category changes
    };
    onFiltersChange(newFilters);
  };

  const handleSubCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, subCategory: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      status: value === 'all' ? '' : value as AlgorithmStatus 
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      sortBy: value as FilterOptions['sortBy']
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: '',
      subCategory: '',
      tags: [],
      status: '',
      sortBy: 'latest'
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.tags.length > 0 || filters.status;
  
  // Get subcategories for selected category
  const selectedCategory = categories.find(cat => cat.name === filters.category);
  const subCategories = selectedCategory?.subCategories || [];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索算法名称、场景或标签..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4 h-12 bg-background border-border/50 focus:border-primary"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3">
        {/* Category Filter */}
        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="业务大类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部分类</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.name} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Subcategory Filter */}
        <Select 
          value={filters.subCategory} 
          onValueChange={handleSubCategoryChange}
          disabled={!filters.category}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="小方向" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部方向</SelectItem>
            {subCategories.map((subCat) => (
              <SelectItem key={subCat} value={subCat}>
                {subCat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tags Filter */}
        <Popover open={isTagsOpen} onOpenChange={setIsTagsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="justify-between min-w-32"
            >
              标签 {filters.tags.length > 0 && `(${filters.tags.length})`}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput placeholder="搜索标签..." />
              <CommandEmpty>没有找到标签</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {allTags.map((tag) => (
                  <CommandItem key={tag} onSelect={() => handleTagToggle(tag)}>
                    <Checkbox
                      checked={filters.tags.includes(tag)}
                      className="mr-2"
                    />
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="live">已上线</SelectItem>
            <SelectItem value="in_development">开发中</SelectItem>
            <SelectItem value="approved">已通过</SelectItem>
            <SelectItem value="pending_review">待评审</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="deprecated">已下线</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Filter */}
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="排序" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">最新上线</SelectItem>
            <SelectItem value="popular">最常调用</SelectItem>
            <SelectItem value="rating">最高评分</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            清除筛选
          </Button>
        )}
      </div>

      {/* Active Tags Display */}
      {filters.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="bg-primary/10 text-primary border-primary/20 gap-1"
            >
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-danger" 
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}