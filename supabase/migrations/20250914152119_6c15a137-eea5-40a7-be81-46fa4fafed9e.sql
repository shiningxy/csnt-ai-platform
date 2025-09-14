-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'algorithm_engineer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sub_categories table
CREATE TABLE public.sub_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, category_id)
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create algorithms table
CREATE TABLE public.algorithms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  sub_category_id UUID REFERENCES public.sub_categories(id),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  applicable_scenarios TEXT,
  target_users TEXT[],
  interaction_method TEXT NOT NULL DEFAULT 'api',
  input_data_source TEXT,
  input_data_type TEXT NOT NULL DEFAULT 'json',
  output_schema TEXT,
  resource_requirements TEXT,
  deployment_process TEXT,
  pseudo_code TEXT,
  api_example TEXT,
  call_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  popularity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create algorithm_tags junction table
CREATE TABLE public.algorithm_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  algorithm_id UUID NOT NULL REFERENCES public.algorithms(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(algorithm_id, tag_id)
);

-- Create approval_records table
CREATE TABLE public.approval_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  algorithm_id UUID NOT NULL REFERENCES public.algorithms(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES public.profiles(id),
  result TEXT NOT NULL,
  comment TEXT,
  meeting_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drafts table
CREATE TABLE public.drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithm_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for categories and subcategories (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Sub categories are viewable by everyone" ON public.sub_categories FOR SELECT USING (true);

-- Create RLS policies for tags (public read)
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);

-- Create RLS policies for algorithms (public read, owners can manage)
CREATE POLICY "Algorithms are viewable by everyone" ON public.algorithms FOR SELECT USING (true);
CREATE POLICY "Users can insert algorithms" ON public.algorithms FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = owner_id));
CREATE POLICY "Algorithm owners can update their algorithms" ON public.algorithms FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = owner_id));

-- Create RLS policies for algorithm_tags
CREATE POLICY "Algorithm tags are viewable by everyone" ON public.algorithm_tags FOR SELECT USING (true);
CREATE POLICY "Users can manage tags for their algorithms" ON public.algorithm_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.algorithms a 
    JOIN public.profiles p ON a.owner_id = p.id 
    WHERE a.id = algorithm_id AND p.user_id = auth.uid()
  )
);

-- Create RLS policies for approval_records
CREATE POLICY "Approval records are viewable by everyone" ON public.approval_records FOR SELECT USING (true);
CREATE POLICY "Users can create approval records" ON public.approval_records FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = approver_id));

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = user_id));
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = user_id));

-- Create RLS policies for drafts
CREATE POLICY "Users can manage their own drafts" ON public.drafts FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = user_id));

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_algorithms_updated_at BEFORE UPDATE ON public.algorithms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON public.drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial categories and subcategories
INSERT INTO public.categories (name) VALUES ('智能运营');

INSERT INTO public.sub_categories (name, category_id) 
SELECT subcategory, c.id FROM (
  VALUES 
    ('港口拥堵分析'),
    ('船舶货载'),
    ('气象导航'),
    ('节能减排'),
    ('设备维护')
) AS t(subcategory)
CROSS JOIN public.categories c WHERE c.name = '智能运营';

-- Insert initial tags
INSERT INTO public.tags (name) VALUES 
  ('时序预测'), ('API服务'), ('生产级'), ('热门'), ('优化算法'), ('批处理'), 
  ('试验阶段'), ('路径规划'), ('研发中'), ('预测维护'), ('机器学习'), 
  ('草稿'), ('环保'), ('Docker'), ('K8s'), ('LSTM'), ('实时数据');