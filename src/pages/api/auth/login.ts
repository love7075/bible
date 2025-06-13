import type { APIRoute } from 'astro';
import { generateToken } from '../../../lib/auth';
import clientPromise from '../../../lib/mongodb';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: '用户名和密码不能为空' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const client = await clientPromise;
    const db = client.db("bibleDB");
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // 在实际应用中，这里应该使用加密后的密码比较
    if (user.password !== password) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const token = generateToken(user._id.toString(), user.role);

    return new Response(JSON.stringify({ 
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '登录失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 