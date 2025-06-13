import type { APIRoute } from 'astro';
import { withAuth } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = withAuth(async ({ request }) => {
  try {
    // 检查请求体是否为空
    const text = await request.text();
    console.log('原始请求体:', text);

    if (!text) {
      return new Response(JSON.stringify({ 
        error: '请求体不能为空',
        debug: {
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          url: request.url
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // 尝试解析 JSON
    let data;
    try {
      data = JSON.parse(text);
      console.log('解析后的数据:', data);
    } catch (e) {
      console.error('JSON 解析错误:', e);
      return new Response(JSON.stringify({ 
        error: '无效的 JSON 格式',
        details: e instanceof Error ? e.message : '未知错误',
        rawText: text
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { version, refId, content } = data;

    // 验证必要参数
    if (!version || !refId || !content) {
      return new Response(JSON.stringify({ 
        error: '缺少必要参数',
        details: {
          version: !version ? '缺少 version' : 'ok',
          refId: !refId ? '缺少 refId' : 'ok',
          content: !content ? '缺少 content' : 'ok'
        },
        receivedData: data
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // 验证 refId 格式
    if (!/^[a-z]+_\d+_\d+$/.test(refId)) {
      return new Response(JSON.stringify({ 
        error: '无效的 refId 格式',
        details: {
          refId,
          expectedFormat: 'gen_1_1',
          example: 'gen_1_1, exo_2_3, etc.'
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // 导入 MongoDB 客户端
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(import.meta.env.MONGODB_URI);
    
    try {
      await client.connect();
      console.log('MongoDB 连接成功');
      
      const db = client.db("bibleDB");
      const result = await db.collection("verses").updateOne(
        { 
          version: version,
          refId: refId.toLowerCase() // 确保 refId 是小写的
        },
        { 
          $set: { 
            content: content,
            updatedAt: new Date()
          }
        }
      );

      console.log('更新结果:', result);

      if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ 
          error: '未找到匹配的经文记录',
          details: {
            version,
            refId,
            query: {
              version,
              refId: refId.toLowerCase()
            }
          }
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      return new Response(JSON.stringify({ 
        message: '经文更新成功',
        modifiedCount: result.modifiedCount,
        details: {
          version,
          refId,
          updatedAt: new Date()
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (dbError) {
      console.error('数据库操作错误:', dbError);
      return new Response(JSON.stringify({ 
        error: '数据库操作失败',
        details: dbError instanceof Error ? dbError.message : '未知错误'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } finally {
      await client.close();
      console.log('MongoDB 连接已关闭');
    }
  } catch (error) {
    console.error('更新经文失败:', error);
    return new Response(JSON.stringify({ 
      error: '更新经文失败',
      details: error instanceof Error ? error.message : '未知错误'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}) 