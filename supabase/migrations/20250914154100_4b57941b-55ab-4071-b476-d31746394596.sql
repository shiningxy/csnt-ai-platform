-- First, modify algorithms table to allow owner_name as string instead of requiring profile reference
ALTER TABLE public.algorithms ADD COLUMN owner_name TEXT;
ALTER TABLE public.algorithms ALTER COLUMN owner_id DROP NOT NULL;

-- Insert sample algorithms with string owner names instead of profile references
INSERT INTO public.algorithms (
  name, 
  category_id, 
  sub_category_id, 
  description, 
  status, 
  owner_name,
  applicable_scenarios, 
  target_users, 
  interaction_method, 
  input_data_source, 
  input_data_type, 
  output_schema, 
  resource_requirements, 
  deployment_process, 
  pseudo_code, 
  api_example, 
  call_count, 
  rating, 
  popularity
) 
SELECT * FROM (
  VALUES 
    (
      '港口拥堵预测模型V2',
      (SELECT id FROM public.categories WHERE name = '智能运营' LIMIT 1),
      (SELECT id FROM public.sub_categories WHERE name = '港口拥堵分析' LIMIT 1),
      '预测未来24小时堆场拥堵等级，辅助调度员提前调配资源',
      'live',
      '张三',
      '用于港口运营中心预测堆场拥堵等级，辅助调度员提前调配资源。可应用于繁忙港口的智能调度系统，帮助预测未来24小时内的货物堆放情况。',
      ARRAY['港口调度员', '运营分析师', '大屏值班员'],
      'api',
      '港口IoT实时数据库 congestion_raw',
      'json',
      '{"congestion_level": 0-5, "confidence": 0.0-1.0, "reason": "string"}',
      'CPU: 4核, 内存: 8GB, 存储: 无状态',
      'Docker容器部署，支持K8s水平扩展',
      E'1. 数据预处理：滑动窗口 + MinMax标准化\n2. 模型结构：LSTM (hidden_size=128, layers=2)\n3. 后处理：概率→等级映射表',
      E'curl -X POST https://ai-platform.corp/api/v1/congestion/predict \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "location_id": "PORT_SH_01",\n    "hours": 24\n  }\'',
      2456,
      4.8,
      95
    ),
    (
      '船舶货载优化算法',
      (SELECT id FROM public.categories WHERE name = '智能运营' LIMIT 1),
      (SELECT id FROM public.sub_categories WHERE name = '船舶货载' LIMIT 1),
      '基于货物特性和船舶结构，计算最优装载方案',
      'pending_frontend',
      '王五',
      '船舶装载计划制定，提高装载效率和安全性',
      ARRAY['船舶调度员', '货运规划师'],
      'batch',
      '货物清单Excel文件',
      'csv',
      '{"cargo_plan": [...], "efficiency_score": 0.0-1.0}',
      NULL,
      NULL,
      NULL,
      NULL,
      0,
      0,
      20
    ),
    (
      '气象导航路径规划',
      (SELECT id FROM public.categories WHERE name = '智能运营' LIMIT 1),
      (SELECT id FROM public.sub_categories WHERE name = '气象导航' LIMIT 1),
      '结合实时气象数据，为船舶规划最优航行路径',
      'pending_frontend',
      '张三',
      '海上航行路径规划，考虑天气因素优化航行时间和安全性',
      ARRAY['船长', '航海员', '调度中心'],
      'api',
      '气象数据API + 船舶位置数据',
      'json',
      '{"route": [...], "estimated_time": "hours", "weather_risk": 0.0-1.0}',
      NULL,
      NULL,
      NULL,
      NULL,
      0,
      0,
      35
    ),
    (
      '港口设备预测性维护',
      (SELECT id FROM public.categories WHERE name = '智能运营' LIMIT 1),
      (SELECT id FROM public.sub_categories WHERE name = '设备维护' LIMIT 1),
      '基于设备传感器数据，预测设备故障时间',
      'draft',
      '王五',
      '港口起重机、传送带等关键设备的预防性维护',
      ARRAY['设备工程师', '维护人员'],
      'api',
      '设备传感器实时数据',
      'stream',
      '{"failure_probability": 0.0-1.0, "recommended_action": "string"}',
      NULL,
      NULL,
      NULL,
      NULL,
      0,
      0,
      10
    ),
    (
      '节能减排分析模型',
      (SELECT id FROM public.categories WHERE name = '智能运营' LIMIT 1),
      (SELECT id FROM public.sub_categories WHERE name = '节能减排' LIMIT 1),
      '分析港口作业的碳排放，提供减排建议',
      'live',
      '李四',
      '港口环保合规监测，绿色港口建设支持',
      ARRAY['环保专员', '港口管理层', '政府监管部门'],
      'api',
      '港口作业数据 + 能耗监测',
      'json',
      '{"carbon_emission": "tons", "reduction_suggestions": [...]}',
      NULL,
      NULL,
      NULL,
      NULL,
      1823,
      4.6,
      78
    )
) AS v(name, category_id, sub_category_id, description, status, owner_name, applicable_scenarios, target_users, interaction_method, input_data_source, input_data_type, output_schema, resource_requirements, deployment_process, pseudo_code, api_example, call_count, rating, popularity);

-- Add algorithm tags
WITH algorithm_tag_mappings AS (
  SELECT a.id as algo_id, t.id as tag_id
  FROM public.algorithms a
  CROSS JOIN public.tags t
  WHERE 
    (a.name = '港口拥堵预测模型V2' AND t.name IN ('时序预测', 'API服务', '生产级', '热门')) OR
    (a.name = '船舶货载优化算法' AND t.name IN ('优化算法', '批处理', '试验阶段')) OR
    (a.name = '气象导航路径规划' AND t.name IN ('路径规划', 'API服务', '研发中')) OR
    (a.name = '港口设备预测性维护' AND t.name IN ('预测维护', '机器学习', '草稿')) OR
    (a.name = '节能减排分析模型' AND t.name IN ('环保', 'API服务', '生产级'))
)
INSERT INTO public.algorithm_tags (algorithm_id, tag_id)
SELECT algo_id, tag_id FROM algorithm_tag_mappings;