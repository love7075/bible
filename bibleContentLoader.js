/*
文件源是一个txt文件，内容格式如下：
Gen 1:1 起初神创造天地。
Gen 1:2 地是空虚混沌。渊面黑暗。神的灵运行在水面上。
Gen 1:3 神说，要有光，就有了光。
Gen 1:4 神看光是好的，就把光暗分开了。

其中：Gen是书名简写 1:1是章节和节的组合，文件比较大，一次加载一部分txt
然后对加载的内容，每行如“Gen 1:1 起初神创造天地”进行解析获取书名、章节和节的内容。
组合成html字符串
*/
const data = {}; //版本：书名：章节：[行]

//数组的索引即为块索引，比如Gen第0个子数组，则块索引是0
chunkBooks = [["Gen", "Exo", "Lev"], ["Lev", "Num", "Deu"],
["Deu", "Jos", "Jug", "Rut", "1Sa"], ["1Sa", "2Sa", "1Ki",
    "2Ki", "1Ch"], ["1Ch", "2Ch", "Ezr", "Neh", "Est", "Job"],
["Job", "Psm", "Pro"], ["Pro", "Ecc", "Son", "Isa", "Jer"],
["Jer", "Lam", "Eze", "Dan"], ["Dan", "Hos", "Joe", "Amo", "Oba",
    "Jon", "Mic", "Nah", "Hab", "Zep", "Hag", "Zec", "Mal", "Mat", "Mak"],
["Mak", "Luk", "Jhn", "Act"]]


// 浏览器端fetch整文件并解析
async function loadTxtFileBrowser(bibleId, bookId, chapterId) {
    const fileMap = {
        hgb: 'data/hgb.txt',
        kjv: 'data/kjv.txt',
    };
    const filePath = fileMap[bibleId] || fileMap['hgb'];
    if (!window.__bibleTxtCache) window.__bibleTxtCache = {};
    if (!window.__bibleTxtCache[filePath]) {
        const resp = await fetch(filePath);
        if (!resp.ok) throw new Error('无法加载圣经文本文件');
        window.__bibleTxtCache[filePath] = await resp.text();
    }
    const txt = window.__bibleTxtCache[filePath];
    const lines = txt.split(/\r?\n/);
    let resultLines = [];
    let found = false;
    for (let line of lines) {
        const match = line.match(/^(\w{3,4})\s(\d+):(\d+)\s(.+)/);
        if (match) {
            const [_, book, chapter, verse, text] = match;
            if (book.toLowerCase() === bookId.toLowerCase() && chapter === String(chapterId)) {
                resultLines.push(`<span class='verse'><b>${chapter}:${verse}</b> ${text}</span>`);
                found = true;
            } else if (found && (book.toLowerCase() !== bookId.toLowerCase() || chapter !== String(chapterId))) {
                break;
            } else if (found) {
                resultLines.push(`<span class='verse'><b>${chapter}:${verse}</b> ${text}</span>`);
            }
        }
    }
    return resultLines;
}

// 浏览器端分块fetch（支持Range）
async function fetchChunk(url, start, end) {
    const response = await fetch(url, {
        headers: {
            'Range': `bytes=${start}-${end}`
        }
    });
    if (response.status === 206) {
        return await response.text();
    } else if (response.status === 200 && start === 0) {
        // 某些本地服务器不支持Range但返回全文件
        return await response.text();
    } else {
        throw new Error('服务器不支持Range请求或出错:' + response.status);
    }
}

// 分块查找章节内容（根据chunkBooks定位块）
async function loadTxtFileChunkedBrowser(bibleId, bookId, chapterId) {
    const fileMap = {
        hgb: 'data/hgb.txt',
        kjv: 'data/kjv.txt',
    };
    const filePath = fileMap[bibleId] || fileMap['hgb'];
    const CHUNK_SIZE = 300 * 1024; // 300k
    const MAX_CHUNKS = 10;
    // 1. 查找bookId在哪个块
    let targetIdx = chunkBooks.findIndex(arr => arr.map(b => b.toLowerCase()).includes(bookId.toLowerCase()));
    if (targetIdx === -1) {
        // 没找到，fallback全量
        console.log(`[LOAD] 未找到 ${bibleId} ${bookId}，加载全量文件`);
        return loadTxtFileBrowser(bibleId, bookId, chapterId);
    }
    // 2. 只加载目标块及前后1块
    let chunks = [];
    for (let i = Math.max(0, targetIdx - 1); i <= targetIdx + 1 && i < MAX_CHUNKS; i++) {
        let chunk = '';
        try {
            chunk = await fetchChunk(filePath, i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE - 1);
        } catch (e) {
            // fallback: 服务器不支持Range，直接全量加载
            return loadTxtFileBrowser(bibleId, bookId, chapterId);
        }
        chunks.push(chunk);
    }
    const allText = chunks.join('\n');
    const lines = allText.split(/\r?\n/);
    let resultLines = [];
    let found = false;
    for (let line of lines) {
        const match = line.match(/^(\w{3,4})\s(\d+):(\d+)\s(.+)/);
        if (match) {
            const [_, book, chapter, verse, text] = match;
            if (book.toLowerCase() === bookId.toLowerCase() && chapter === String(chapterId)) {
                resultLines.push(`<span class='verse'><b>${chapter}:${verse}</b> ${text}</span>`);
                found = true;
            } else if (found && (book.toLowerCase() !== bookId.toLowerCase() || chapter !== String(chapterId))) {
                break;
            } else if (found) {
                resultLines.push(`<span class='verse'><b>${chapter}:${verse}</b> ${text}</span>`);
            }
        }
    }
    return resultLines;
}

// 兼容异步，优先分块fetch
function loadBibleContentImpl(bibleId, bookId, chapterId) {
    return (async () => {
        if (data[bibleId] && data[bibleId][bookId] && data[bibleId][bookId][chapterId]) {
            return data[bibleId][bookId][chapterId];
        }
        console.log(`[LOAD] 加载 ${bibleId} ${bookId} ${chapterId} 的内容`);
        const lines = await loadTxtFileChunkedBrowser(bibleId, bookId, chapterId);
        if (!data[bibleId]) data[bibleId] = {};
        if (!data[bibleId][bookId]) data[bibleId][bookId] = {};
        data[bibleId][bookId][chapterId] = lines.length ? `<div class='bible-chapter'>${lines.join('<br>')}</div>` : '未找到内容';
        return data[bibleId][bookId][chapterId];
    })();
}

// 测试分块加载
async function testChunkLoad() {
    const file = 'data/hgb.txt';
    const CHUNK_SIZE = 300 * 1024;
    for (let i = 0; i < 3; i++) {
        const start = i * CHUNK_SIZE;
        const end = start + CHUNK_SIZE - 1;
        try {
            const text = await fetchChunk(file, start, end);
            console.log(`[TEST] fetchChunk(${start},${end}) length=${text.length}`);
            console.log('[TEST] 内容片段:', text.slice(0, 100).replace(/\n/g, ' '), '...');
        } catch (e) {
            console.error('[TEST] fetchChunk error:', e);
            break;
        }
    }
}
// 调用测试（可在控制台手动调用 testChunkLoad()）
// testChunkLoad();