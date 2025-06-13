import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/mongodb';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const version = url.searchParams.get('version');
    const book = url.searchParams.get('book');
    const chapter = url.searchParams.get('chapter');

    if (!version || !book || !chapter) {
      return new Response(JSON.stringify({ 
        error: '缺少必要参数',
        details: {
          version: !version ? '缺少 version' : 'ok',
          book: !book ? '缺少 book' : 'ok',
          chapter: !chapter ? '缺少 chapter' : 'ok'
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // 验证参数格式
    if (!/^\d+$/.test(chapter)) {
      return new Response(JSON.stringify({ 
        error: '无效的章节格式',
        details: {
          chapter,
          expectedFormat: '数字',
          example: '1, 2, 3, etc.'
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    try {
      const db = await getDb("bibleDB");
      const verses = await db.collection("verses")
        .find(
          { 
            version: version,
            book: book.toLowerCase(),
            chapter: parseInt(chapter)
          }
        )
        .sort({ verse: 1 })
        .toArray();

      if (!verses || verses.length === 0) {
        return new Response(JSON.stringify({ 
          error: '未找到经文记录',
          details: {
            version,
            book,
            chapter
          }
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      return new Response(JSON.stringify(verses), {
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
    }
  } catch (error) {
    console.error('获取经文失败:', error);
    return new Response(JSON.stringify({ 
      error: '获取经文失败',
      details: error instanceof Error ? error.message : '未知错误'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 