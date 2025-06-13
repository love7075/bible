import type { APIRoute } from 'astro';
import clientPromise from '../../lib/mongodb';

export const GET: APIRoute = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("your_database_name");
    const users = await db.collection("users").find({}).toArray();

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '数据库操作失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db("your_database_name");
    
    const result = await db.collection("users").insertOne(data);

    return new Response(JSON.stringify({ 
      message: '用户创建成功',
      id: result.insertedId 
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '创建用户失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 