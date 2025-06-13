import { MongoClient } from 'mongodb';

// // 添加调试信息
// console.log('环境变量检查:', {
//   MONGODB_URI: import.meta.env.MONGODB_URI,
//   NODE_ENV: import.meta.env.NODE_ENV,
//   // 检查所有环境变量
//   allEnv: Object.keys(import.meta.env)
// });

if (!import.meta.env.MONGODB_URI) {
  throw new Error('请在环境变量中设置 MONGODB_URI');
}

const uri = import.meta.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (import.meta.env.NODE_ENV === 'development') {
  // 在开发环境中，使用全局变量来保存连接
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise!;
} else {
  // 在生产环境中，使用连接池
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// 导出连接池
export default clientPromise;

// 导出数据库实例获取函数
export async function getDb(dbName: string) {
  const client = await clientPromise;
  return client.db(dbName);
} 