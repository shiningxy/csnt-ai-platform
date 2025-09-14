import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/ui/code-block';
import { Copy, Check, Code, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlgorithmAsset } from '@/types/algorithm';

interface CodeExampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  algorithm: AlgorithmAsset;
}

export function CodeExampleDialog({ open, onOpenChange, algorithm }: CodeExampleDialogProps) {
  const [copiedLanguage, setCopiedLanguage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = async (code: string, language: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedLanguage(language);
    setTimeout(() => setCopiedLanguage(null), 2000);
    toast({
      title: "代码已复制",
      description: `${getLanguageName(language)}代码已复制到剪贴板`,
    });
  };

  const getLanguageName = (lang: string) => {
    const names: Record<string, string> = {
      python: 'Python',
      javascript: 'JavaScript',
      curl: 'cURL',
      java: 'Java',
      cpp: 'C++'
    };
    return names[lang] || lang;
  };

  const generateCode = (language: string, apiKey: string = 'YOUR_API_KEY') => {
    const apiUrl = `https://api.example.com/algorithms/${algorithm.id}/invoke`;
    
    switch (language) {
      case 'python':
        return `import requests
import json

# API配置
API_KEY = "${apiKey}"
API_URL = "${apiUrl}"

# 请求头
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

# 请求数据
data = {
    "input": {
        "data": "your_input_data",
        "parameters": {
            "mode": "default"
        }
    }
}

# 发送请求
response = requests.post(API_URL, headers=headers, json=data)

# 处理响应
if response.status_code == 200:
    result = response.json()
    print("算法执行成功:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
else:
    print(f"请求失败: {response.status_code}")
    print(response.text)`;

      case 'javascript':
        return `// API配置
const API_KEY = "${apiKey}";
const API_URL = "${apiUrl}";

// 请求数据
const requestData = {
  input: {
    data: "your_input_data",
    parameters: {
      mode: "default"
    }
  }
};

// 发送请求
fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${API_KEY}\`
  },
  body: JSON.stringify(requestData)
})
.then(response => {
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  return response.json();
})
.then(result => {
  console.log('算法执行成功:', result);
})
.catch(error => {
  console.error('请求失败:', error);
});`;

      case 'curl':
        return `# 使用cURL调用算法API
curl -X POST "${apiUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "input": {
      "data": "your_input_data",
      "parameters": {
        "mode": "default"
      }
    }
  }'`;

      case 'java':
        return `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;

public class AlgorithmClient {
    private static final String API_KEY = "${apiKey}";
    private static final String API_URL = "${apiUrl}";
    
    public static void main(String[] args) throws Exception {
        // 创建HTTP客户端
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();
            
        // 构建请求数据
        Map<String, Object> input = new HashMap<>();
        input.put("data", "your_input_data");
        
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("mode", "default");
        input.put("parameters", parameters);
        
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("input", input);
        
        // 序列化为JSON
        ObjectMapper mapper = new ObjectMapper();
        String jsonData = mapper.writeValueAsString(requestData);
        
        // 构建请求
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(API_URL))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + API_KEY)
            .POST(HttpRequest.BodyPublishers.ofString(jsonData))
            .build();
            
        // 发送请求
        HttpResponse<String> response = client.send(request, 
            HttpResponse.BodyHandlers.ofString());
            
        // 处理响应
        if (response.statusCode() == 200) {
            System.out.println("算法执行成功:");
            System.out.println(response.body());
        } else {
            System.out.println("请求失败: " + response.statusCode());
            System.out.println(response.body());
        }
    }
}`;

      case 'cpp':
        return `#include <iostream>
#include <string>
#include <curl/curl.h>
#include <json/json.h>

// 回调函数用于接收响应数据
size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* response) {
    size_t totalSize = size * nmemb;
    response->append((char*)contents, totalSize);
    return totalSize;
}

int main() {
    CURL* curl;
    CURLcode res;
    std::string response;
    
    // API配置
    const std::string API_KEY = "${apiKey}";
    const std::string API_URL = "${apiUrl}";
    
    // 初始化curl
    curl = curl_easy_init();
    if(curl) {
        // 构建JSON数据
        Json::Value input;
        input["data"] = "your_input_data";
        input["parameters"]["mode"] = "default";
        
        Json::Value requestData;
        requestData["input"] = input;
        
        Json::StreamWriterBuilder builder;
        std::string jsonData = Json::writeString(builder, requestData);
        
        // 设置请求头
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        std::string authHeader = "Authorization: Bearer " + API_KEY;
        headers = curl_slist_append(headers, authHeader.c_str());
        
        // 配置curl选项
        curl_easy_setopt(curl, CURLOPT_URL, API_URL.c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonData.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
        
        // 发送请求
        res = curl_easy_perform(curl);
        
        // 检查结果
        if(res != CURLE_OK) {
            std::cerr << "请求失败: " << curl_easy_strerror(res) << std::endl;
        } else {
            long response_code;
            curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response_code);
            
            if(response_code == 200) {
                std::cout << "算法执行成功:" << std::endl;
                std::cout << response << std::endl;
            } else {
                std::cout << "请求失败: " << response_code << std::endl;
                std::cout << response << std::endl;
            }
        }
        
        // 清理
        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    }
    
    return 0;
}`;

      default:
        return '// 代码示例生成失败';
    }
  };

  const languages = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '📜' },
    { id: 'curl', name: 'cURL', icon: '🌐' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚡' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Code className="h-5 w-5 mr-2" />
            调用代码示例 - {algorithm.name}
          </DialogTitle>
          <DialogDescription>
            选择您偏好的编程语言，复制相应的API调用代码
          </DialogDescription>
        </DialogHeader>

        {/* API Key提示 */}
        <div className="bg-muted/50 border border-warning/20 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-2">
            <Key className="h-4 w-4 text-warning mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-foreground mb-1">API Key 说明</div>
              <div className="text-muted-foreground">
                请将代码中的 <code className="bg-muted px-1 rounded text-xs">YOUR_API_KEY</code> 替换为您的实际API Key。
                如需申请API Key，请前往 <span 
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => {
                    window.open('/admin?tab=api-keys', '_blank');
                  }}
                >
                  管理面板
                </span> 进行管理。
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="python" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            {languages.map((lang) => (
              <TabsTrigger key={lang.id} value={lang.id} className="text-xs">
                <span className="mr-1">{lang.icon}</span>
                {lang.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {languages.map((lang) => (
            <TabsContent key={lang.id} value={lang.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{lang.name} 调用示例</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(generateCode(lang.id), lang.id)}
                  className="h-8"
                >
                  {copiedLanguage === lang.id ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedLanguage === lang.id ? '已复制' : '复制代码'}
                </Button>
              </div>
              
              <CodeBlock
                code={generateCode(lang.id)}
                language={lang.id === 'cpp' ? 'cpp' : lang.id}
                showCopy={false}
              />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}