import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { bookMap } from '../src/lib/bibledata.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const outputDir = path.join(__dirname, '../public/version');


// 确保输出目录存在
if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

fs.readdir(dataDir, (err, files) => {
    if (err) {
        console.error('无法读取数据目录:', err);
        return;
    }

    files.forEach(file => {
        if (path.extname(file) === '.txt') {
            const filePath = path.join(dataDir, file);
            const fileName = path.basename(file, '.txt'); // 例如 'kjv'
            console.log(`解析文件: ${fileName}`);

            const versionOutputDir = path.join(outputDir, fileName);
            if (!fs.existsSync(versionOutputDir)) {
                fs.mkdirSync(versionOutputDir, { recursive: true });
            }

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`无法读取文件 ${file}:`, err);
                    return;
                }

                const lines = data.split('\n').filter(line => line.trim() !== '');
                const bibleChunks = {}; // 存储按chunk分组的圣经数据

                // 初始化9个chunk
                for (let i = 1; i <= 9; i++) {
                    bibleChunks[i] = [];
                }

                let currentBookKey = '';
                let currentChapterNum = '';
                let chapterContent = [];

                lines.forEach(line => {
                    const bookMatch = line.match(/^(\d?\s?[A-Za-z\s]+?)\s*(\d+):(\d+)\s*(.*)$/);
                    if (bookMatch) {
                        const bookName = bookMatch[1].trim();
                        const chapterNum = bookMatch[2];
                        const verseNum = bookMatch[3];
                        const verseText = bookMatch[4].trim();

                        // 查找bookMap获取bookKey和chunk
                        const bookInfo = bookMap.find(book => book.name === bookName || book.key === bookName.toLowerCase().replace(/\s/g, ''));

                        if (!bookInfo) {
                            console.warn(`未找到书名 "${bookName}" 对应的chunk信息，跳过此行: "${line}"`);
                            return;
                        }

                        const bookKey = bookInfo.key;
                        const chunkNum = bookInfo.chunk;

                        if (currentBookKey !== bookKey || currentChapterNum !== chapterNum) {
                            // 如果是新书或新章节，保存之前的章节内容到对应的chunk
                            if (currentBookKey && currentChapterNum && chapterContent.length > 0) {
                                const prevBookInfo = bookMap.find(book => book.key === currentBookKey);
                                if (prevBookInfo && prevBookInfo.chunk) {
                                    bibleChunks[prevBookInfo.chunk].push({
                                        book: currentBookKey,
                                        chapter: parseInt(currentChapterNum),
                                        verses: chapterContent
                                    });
                                }
                            }
                            // 重置当前书名和章节号，并清空章节内容
                            currentBookKey = bookKey;
                            currentChapterNum = chapterNum;
                            chapterContent = [];
                        }
                        chapterContent.push({ num: parseInt(verseNum), verse: verseText });
                    } else {
                        console.error(`无法解析的行: "${line}"`);
                    }
                });

                // 保存最后一个章节的内容
                if (currentBookKey && currentChapterNum && chapterContent.length > 0) {
                    const prevBookInfo = bookMap.find(book => book.key === currentBookKey);
                    if (prevBookInfo && prevBookInfo.chunk) {
                        bibleChunks[prevBookInfo.chunk].push({
                            book: currentBookKey,
                            chapter: parseInt(currentChapterNum),
                            verses: chapterContent
                        });
                    }
                }

                // 将每个chunk的数据写入文件
                for (const chunkNum in bibleChunks) {
                    const chunkOutputPath = path.join(versionOutputDir, `chunk${chunkNum}.json`);
                    fs.writeFile(chunkOutputPath, JSON.stringify(bibleChunks[chunkNum], null, 2), 'utf8', (err) => {
                        if (err) {
                            console.error(`无法写入 JSON 文件 ${chunkOutputPath}:`, err);
                        } else {
                            console.log(`成功保存 ${fileName}/chunk${chunkNum}.json`);
                        }
                    });
                }
                console.log(`完成转换文件: ${file}`);
            });
        }
    });
});
