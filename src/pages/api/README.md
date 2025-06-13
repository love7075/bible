# API 路由

此目录包含所有需要服务器端渲染的 API 路由。

每个 API 文件都需要：
1. 添加 `export const prerender = false;`
2. 使用 `APIRoute` 类型
3. 返回 `Response` 对象

## 目录结构

```
api/
├── verses/           # 经文相关 API
│   ├── update.ts     # 更新经文
│   └── get.ts        # 获取经文
├── books/            # 书卷相关 API
└── versions/         # 版本相关 API
```

## 使用示例

```typescript
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  return new Response(JSON.stringify({ message: 'Hello' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
``` 