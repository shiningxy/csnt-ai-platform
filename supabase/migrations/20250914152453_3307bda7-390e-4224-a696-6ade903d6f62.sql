-- Insert sample profiles (users)
INSERT INTO public.profiles (user_id, name, email, role, avatar) VALUES 
  (gen_random_uuid(), '张三', 'zhangsan@company.com', 'algorithm_engineer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan'),
  (gen_random_uuid(), '李四', 'lisi@company.com', 'team_lead', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi'),
  (gen_random_uuid(), '王五', 'wangwu@company.com', 'product_manager', 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu');

-- Insert sample algorithms
WITH profile_ids AS (
  SELECT id as zhang_id FROM public.profiles WHERE name = '张三'
  UNION ALL
  SELECT id as li_id FROM public.profiles WHERE name = '李四'
  UNION ALL
  SELECT id as wang_id FROM public.profiles WHERE name = '王五'
),
category_id AS (
  SELECT id FROM public.categories WHERE name = '智能运营' LIMIT 1
),
subcategory_ids AS (
  SELECT id as congestion_id FROM public.sub_categories WHERE name = '港口拥堵分析'
  UNION ALL
  SELECT id as cargo_id FROM public.sub_categories WHERE name = '船舶货载'
  UNION ALL
  SELECT id as weather_id FROM public.sub_categories WHERE name = '气象导航'
  UNION ALL
  SELECT id as maintenance_id FROM public.sub_categories WHERE name = '设备维护'
  UNION ALL
  SELECT id as energy_id FROM public.sub_categories WHERE name = '节能减排'
)
INSERT INTO public.algorithms (
  name, 
  category_id, 
  sub_category_id, 
  description, 
  status, 
  owner_id, 
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
      (SELECT id FROM category_id),
      (SELECT congestion_id FROM subcategory_ids WHERE congestion_id IS NOT NULL LIMIT 1),
      '预测未来24小时堆场拥堵等级，辅助调度员提前调配资源',
      'live',
      (SELECT zhang_id FROM profile_ids WHERE zhang_id IS NOT NULL LIMIT 1),
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
      (SELECT id FROM category_id),
      (SELECT cargo_id FROM subcategory_ids WHERE cargo_id IS NOT NULL LIMIT 1),
      '基于货物特性和船舶结构，计算最优装载方案',
      'pending_frontend',
      (SELECT wang_id FROM profile_ids WHERE wang_id IS NOT NULL LIMIT 1),
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
      (SELECT id FROM category_id),
      (SELECT weather_id FROM subcategory_ids WHERE weather_id IS NOT NULL LIMIT 1),
      '结合实时气象数据，为船舶规划最优航行路径',
      'pending_frontend',
      (SELECT zhang_id FROM profile_ids WHERE zhang_id IS NOT NULL LIMIT 1),
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
      (SELECT id FROM category_id),
      (SELECT maintenance_id FROM subcategory_ids WHERE maintenance_id IS NOT NULL LIMIT 1),
      '基于设备传感器数据，预测设备故障时间',
      'draft',
      (SELECT wang_id FROM profile_ids WHERE wang_id IS NOT NULL LIMIT 1),
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
      (SELECT id FROM category_id),
      (SELECT energy_id FROM subcategory_ids WHERE energy_id IS NOT NULL LIMIT 1),
      '分析港口作业的碳排放，提供减排建议',
      'live',
      (SELECT li_id FROM profile_ids WHERE li_id IS NOT NULL LIMIT 1),
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
) AS v(name, category_id, sub_category_id, description, status, owner_id, applicable_scenarios, target_users, interaction_method, input_data_source, input_data_type, output_schema, resource_requirements, deployment_process, pseudo_code, api_example, call_count, rating, popularity);

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

-- Add some approval records
WITH algo_approval_data AS (
  SELECT 
    a.id as algo_id,
    p.id as approver_id,
    a.name as algo_name
  FROM public.algorithms a
  CROSS JOIN public.profiles p
  WHERE p.name = '李四' AND a.status IN ('live', 'pending_frontend')
)
INSERT INTO public.approval_records (algorithm_id, approver_id, result, comment, meeting_notes)
SELECT 
  algo_id,
  approver_id,
  'approved',
  CASE 
    WHEN algo_name = '港口拥堵预测模型V2' THEN '补充异常处理逻辑后上线'
    WHEN algo_name = '船舶货载优化算法' THEN '算法逻辑清晰，准备进入开发阶段'
    WHEN algo_name = '节能减排分析模型' THEN '环保算法，符合国家政策要求'
    ELSE '审批通过'
  END,
  CASE 
    WHEN algo_name = '港口拥堵预测模型V2' THEN '会议讨论了边界条件处理和监控方案'
    ELSE NULL
  END
FROM algo_approval_data;