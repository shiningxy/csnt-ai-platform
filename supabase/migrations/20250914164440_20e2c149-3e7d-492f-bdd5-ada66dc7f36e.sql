-- Insert sample user profiles with proper UUIDs
INSERT INTO public.profiles (user_id, name, email, avatar, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '张三', 'zhangsan@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', '李四', 'lisi@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi', 'team_lead'),
('550e8400-e29b-41d4-a716-446655440003', '王五', 'wangwu@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu', 'algorithm_engineer');