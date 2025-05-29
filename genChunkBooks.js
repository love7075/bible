// 生成圣经txt分块首书名数组
// 用法：node genChunkBooks.js data/hgb.txt
const fs = require('fs');
const path = process.argv[2] || 'data/hgb.txt';
const CHUNK_SIZE = 300 * 1024; // 300k
const MAX_CHUNKS = 10;

if (!fs.existsSync(path)) {
    console.error('文件不存在:', path);
    process.exit(1);
}

const fd = fs.openSync(path, 'r');
const stat = fs.statSync(path);
const chunkBooks = [];

for (let i = 0; i < MAX_CHUNKS && i * CHUNK_SIZE < stat.size; i++) {
    const buf = Buffer.alloc(Math.min(CHUNK_SIZE, stat.size - i * CHUNK_SIZE));
    fs.readSync(fd, buf, 0, buf.length, i * CHUNK_SIZE);
    const lines = buf.toString('utf8').split(/\r?\n/);
    const booksSet = new Set();
    for (const line of lines) {
        const m = line.match(/^(\w{3,4}) (\d+):(\d+)/);
        if (m) booksSet.add(m[1]);
    }
    chunkBooks.push(Array.from(booksSet));
}
fs.closeSync(fd);
console.log('chunkBooks =', JSON.stringify(chunkBooks, null, 2));
