-- Create API keys table for managing system API keys
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  key_value TEXT NOT NULL UNIQUE,
  permissions TEXT NOT NULL DEFAULT 'read',
  expires_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (for now allowing all operations)
-- In a real implementation, you'd want to restrict this to authenticated admin users
CREATE POLICY "Allow all operations on api_keys" 
ON public.api_keys 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_api_keys_updated_at
BEFORE UPDATE ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.api_keys (name, key_value, permissions, expires_at, description) VALUES
('生产环境密钥', 'sk-' || replace(gen_random_uuid()::text, '-', ''), 'write', now() + interval '1 year', '用于生产环境的API调用'),
('测试环境密钥', 'sk-' || replace(gen_random_uuid()::text, '-', ''), 'read', now() + interval '6 months', '用于测试环境的API调用'),
('开发环境密钥', 'sk-' || replace(gen_random_uuid()::text, '-', ''), 'read', now() + interval '3 months', '用于开发环境的API调用');