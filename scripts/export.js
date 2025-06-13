import 'dotenv/config'; // 加载 .env 文件
import { MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const url = process.env.local_uri;
console.log('正在连接到本地MongoDB...');
const dbName = 'bibleDB';
const collectionName = 'verses';

async function main() {
    // 创建MongoDB客户端
    const client = new MongoClient(url);
    try {
        // 连接到MongoDB服务器
        await client.connect();
        console.log('成功连接到MongoDB服务器');

        const db = client.db(dbName);
        const versesCollection = db.collection(collectionName);
        const bookMapCollection = db.collection('bookmap');

        // 获取书卷映射数据
        const bookMap = await bookMapCollection.find({}).sort({ order: 1 }).toArray();

        // 在获取 bookMap 后，打印 bookMap 的 key 值
        // console.log('bookMap keys:', bookMap.map(b => b.key));

        // 获取所有经文数据
        const verses = await versesCollection.find({}).toArray();

        // 在获取 verses 后，打印 verses 中 book 字段的唯一值
        const uniqueBooks = [...new Set(verses.map(v => v.book))];
        // console.log('Unique books in verses:', uniqueBooks);

        // 创建输出目录
        const outputDir = path.join(__dirname, 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // 准备输出内容
        let outputContent = '';

        // 按照书卷顺序处理经文
        for (const book of bookMap) {
            const bookVerses = verses.filter(v => v.book === book.key)
                .sort((a, b) => {
                    if (a.chapter !== b.chapter) {
                        return a.chapter - b.chapter;
                    }
                    return a.verse - b.verse;
                });

            for (const verse of bookVerses) {
                outputContent += `${book.key} ${verse.chapter}:${verse.verse} ${verse.content}\n`;
            }
        }

        // 写入文件
        const outputPath = path.join(outputDir, 'bible.txt');
        fs.writeFileSync(outputPath, outputContent, 'utf8');
        console.log(`文件已成功导出到: ${outputPath}`);

        // 移动文件到 data/zyb.txt
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        const targetPath = path.join(dataDir, 'zyb.txt');
        fs.renameSync(outputPath, targetPath);
        console.log(`文件已成功移动到: ${targetPath}`);

    } catch (err) {
        console.error('发生错误:', err);
    } finally {
        // 关闭连接
        await client.close();
        console.log('已断开与MongoDB的连接');
    }
}

main().catch(console.error);
