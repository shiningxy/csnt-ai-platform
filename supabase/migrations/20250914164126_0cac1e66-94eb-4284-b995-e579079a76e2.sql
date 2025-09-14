-- Insert sample user profiles
INSERT INTO public.profiles (user_id, name, email, avatar, role) VALUES 
('mock-user-id-1', '张三', 'zhangsan@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan', 'admin'),
('mock-user-id-2', '李四', 'lisi@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi', 'team_lead'),
('mock-user-id-3', '王五', 'wangwu@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu', 'algorithm_engineer');