import jwt from 'jsonwebtoken';
import type { APIRoute } from 'astro';

const JWT_SECRET = import.meta.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const withAuth = (handler: APIRoute): APIRoute => {
  return async (context) => {
    const authHeader = context.request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: '未授权访问' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return new Response(JSON.stringify({ error: '无效的令牌' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // 将用户信息添加到请求对象中
    (context.request as AuthenticatedRequest).user = decoded as { id: string; role: string };
    
    return handler(context);
  };
}; 