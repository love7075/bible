// 动态生成图书和章节
const books = [
    { value: 'gen', name: '创世纪', chapters: 50 },
    { value: 'exo', name: '出埃及记', chapters: 40 },
    { value: 'lvs', name: '利未记', chapters: 27 },
    { value: 'num', name: '民数记', chapters: 36 },
    { value: 'deu', name: '申命记', chapters: 34 },
    { value: 'jos', name: '约书亚记', chapters: 24 },
    { value: 'jdg', name: '士师记', chapters: 21 },
    { value: 'rut', name: '路得记', chapters: 4 },
    { value: '1sa', name: '撒母耳记上', chapters: 31 },
    { value: '2sa', name: '撒母耳记下', chapters: 24 },
    { value: '1ki', name: '列王纪上', chapters: 22 },
    { value: '2ki', name: '列王纪下', chapters: 25 },
    { value: '1ch', name: '历代志上', chapters: 29 },
    { value: '2ch', name: '历代志下', chapters: 36 },
    { value: 'ezr', name: '以斯拉记', chapters: 10 },
    { value: 'neh', name: '尼希米记', chapters: 13 },
    { value: 'est', name: '以斯帖记', chapters: 10 },
    { value: 'job', name: '约伯记', chapters: 42 },
    { value: 'psa', name: '诗篇', chapters: 150 },
    { value: 'pro', name: '箴言', chapters: 31 },
    { value: 'ecc', name: '传道书', chapters: 12 },
    { value: 'sng', name: '雅歌', chapters: 8 },
    { value: 'isa', name: '以赛亚书', chapters: 66 },
    { value: 'jer', name: '耶利米书', chapters: 52 },
    { value: 'lam', name: '耶利米哀歌', chapters: 5 },
    { value: 'ezk', name: '以西结书', chapters: 48 },
    { value: 'dan', name: '但以理书', chapters: 12 },
    { value: 'hos', name: '何西阿书', chapters: 14 },
    { value: 'jol', name: '约珥书', chapters: 3 },
    { value: 'amo', name: '阿摩司书', chapters: 9 },
    { value: 'oba', name: '俄巴底亚书', chapters: 1 },
    { value: 'jon', name: '约拿书', chapters: 4 },
    { value: 'mic', name: '弥迦书', chapters: 7 },
    { value: 'nam', name: '那鸿书', chapters: 3 },
    { value: 'hab', name: '哈巴谷书', chapters: 3 },
    { value: 'zep', name: '西番雅书', chapters: 3 },
    { value: 'hag', name: '哈该书', chapters: 2 },
    { value: 'zec', name: '撒迦利亚书', chapters: 14 },
    { value: 'mal', name: '玛拉基书', chapters: 4 },
    { value: 'mat', name: '马太福音', chapters: 28 },
    { value: 'mrk', name: '马可福音', chapters: 16 },
    { value: 'luk', name: '路加福音', chapters: 24 },
    { value: 'jhn', name: '约翰福音', chapters: 21 },
    { value: 'act', name: '使徒行传', chapters: 28 },
    { value: 'rom', name: '罗马书', chapters: 16 },
    { value: '1co', name: '哥林多前书', chapters: 16 },
    { value: '2co', name: '哥林多后书', chapters: 13 },
    { value: 'gal', name: '加拉太书', chapters: 6 },
    { value: 'eph', name: '以弗所书', chapters: 6 },
    { value: 'php', name: '腓立比书', chapters: 4 },
    { value: 'col', name: '歌罗西书', chapters: 4 },
    { value: '1th', name: '帖撒罗尼迦前书', chapters: 5 },
    { value: '2th', name: '帖撒罗尼迦后书', chapters: 3 },
    { value: '1ti', name: '提摩太前书', chapters: 6 },
    { value: '2ti', name: '提摩太后书', chapters: 4 },
    { value: 'tit', name: '提多书', chapters: 3 },
    { value: 'phm', name: '腓利门书', chapters: 1 },
    { value: 'heb', name: '希伯来书', chapters: 13 },
    { value: 'jas', name: '雅各书', chapters: 5 },
    { value: '1pe', name: '彼得前书', chapters: 5 },
    { value: '2pe', name: '彼得后书', chapters: 3 },
    { value: '1jn', name: '约翰一书', chapters: 5 },
    { value: '2jn', name: '约翰二书', chapters: 1 },
    { value: '3jn', name: '约翰三书', chapters: 1 },
    { value: 'jud', name: '犹大书', chapters: 1 },
    { value: 'rev', name: '启示录', chapters: 22 }
];

// 加载对应内容的函数，参数为目标section、书卷、章节、版本
async function loadBibleContent(target, book, chapter, version) {
    const bookNames = {};
    books.forEach(b => { bookNames[b.value] = b.name; });
    const chapterNum = chapter ? chapter.replace('chapter-', '') : '1';
    const versionNames = {
        hgb: '和合本',
        kjv: 'kjv版',
    };
    // 加载内容并渲染
    const content = await loadBibleContentImpl(version, book, chapterNum);
    target.innerHTML = `<h2>${bookNames[book] || ''} 第${chapterNum}章 - ${versionNames[version] || ''}</h2>` + content;
}
// 主版本切换
const versionSelect = document.getElementById('version-select');
const bibleText = document.getElementById('bible-text');

// 将 renderChapterOptions 提升到文件顶部，确保 setupMainContentEvents 能访问
function renderChapterOptions(bookValue) {
    const chapterSelect = document.getElementById('chapter-select');
    chapterSelect.innerHTML = '';
    const book = books.find(b => b.value === bookValue);
    if (book) {
        for (let i = 1; i <= book.chapters; i++) {
            const option = document.createElement('option');
            option.value = `chapter-${i}`;
            option.textContent = i;
            chapterSelect.appendChild(option);
        }
    }
}

// 初始化和事件绑定
function setupMainContentEvents() {
    const bookSelect = document.getElementById('book-select');
    const chapterSelect = document.getElementById('chapter-select');
    const versionSelect = document.getElementById('version-select');
    const bibleText = document.getElementById('bible-text');
    const prevBtn = document.getElementById('prev-chapter');
    const nextBtn = document.getElementById('next-chapter');
    function updateMainContent() {
        loadBibleContent(bibleText, bookSelect.value, chapterSelect.value, versionSelect.value);
    }
    bookSelect.addEventListener('change', function () {
        renderChapterOptions(this.value); // 重新渲染章节选项
        chapterSelect.selectedIndex = 0;
        updateMainContent();
    });
    chapterSelect.addEventListener('change', updateMainContent);
    versionSelect.addEventListener('change', updateMainContent);
    // 上一页按钮
    prevBtn.addEventListener('click', function () {
        let chapterIdx = chapterSelect.selectedIndex;
        let changed = false;
        if (chapterIdx > 0) {
            chapterSelect.selectedIndex = chapterIdx - 1;
            changed = true;
        } else {
            // 当前是第一章，切换到上一本书的最后一章
            let bookIdx = bookSelect.selectedIndex;
            if (bookIdx > 0) {
                bookSelect.selectedIndex = bookIdx - 1;
                renderChapterOptions(bookSelect.value);
                chapterSelect.selectedIndex = chapterSelect.options.length - 1;
                changed = true;
            }
        }
        updateMainContent();
        // 对照模式下同步章节
        const compareCheckbox = document.getElementById('compare-checkbox');
        const compareSection = document.getElementById('bible-text-compare');
        const compareSelect = document.getElementById('version-select-compare');
        if (compareCheckbox && compareCheckbox.checked && compareSection && compareSelect) {
            loadBibleContent(compareSection, bookSelect.value, chapterSelect.value, compareSelect.value);
        }
    });
    // 下一页按钮
    nextBtn.addEventListener('click', function () {
        let chapterIdx = chapterSelect.selectedIndex;
        let changed = false;
        if (chapterIdx < chapterSelect.options.length - 1) {
            chapterSelect.selectedIndex = chapterIdx + 1;
            changed = true;
        } else {
            // 当前是最后一章，切换到下一本书的第一章
            let bookIdx = bookSelect.selectedIndex;
            if (bookIdx < bookSelect.options.length - 1) {
                bookSelect.selectedIndex = bookIdx + 1;
                renderChapterOptions(bookSelect.value);
                chapterSelect.selectedIndex = 0;
                changed = true;
            }
        }
        updateMainContent();
        // 对照模式下同步章节
        const compareCheckbox = document.getElementById('compare-checkbox');
        const compareSection = document.getElementById('bible-text-compare');
        const compareSelect = document.getElementById('version-select-compare');
        if (compareCheckbox && compareCheckbox.checked && compareSection && compareSelect) {
            loadBibleContent(compareSection, bookSelect.value, chapterSelect.value, compareSelect.value);
        }
    });
    // 初始化内容
    updateMainContent();
}

document.addEventListener('DOMContentLoaded', function () {
    const compareCheckbox = document.getElementById('compare-checkbox');
    const versionSelect = document.getElementById('version-select');
    const bibleTextSection = document.getElementById('bible-text');

    let outer = null;
    let wrapper1 = null;
    let wrapper2 = null;
    let compareSelect = null;
    let compareSection = null;

    compareCheckbox.addEventListener('change', function () {
        if (this.checked) {
            if (!outer) {
                // 创建外层flex容器
                outer = document.createElement('div');
                outer.id = 'bible-parallel-outer';
                // 创建主内容wrapper
                wrapper1 = document.createElement('div');
                wrapper1.className = 'bible-parallel-wrapper';
                // 创建对照内容wrapper
                wrapper2 = document.createElement('div');
                wrapper2.className = 'bible-parallel-wrapper';
                // 复制select
                compareSelect = versionSelect.cloneNode(true);
                compareSelect.id = 'version-select-compare';
                // 复制bible-text
                compareSection = document.createElement('section');
                compareSection.id = 'bible-text-compare';
                compareSection.className = 'bible-text';
                // 将主select和bibleText移入wrapper1
                wrapper1.appendChild(versionSelect);
                wrapper1.appendChild(bibleTextSection);
                // 将对照select和section放入wrapper2
                wrapper2.appendChild(compareSelect);
                wrapper2.appendChild(compareSection);
                // 插入到outer
                outer.appendChild(wrapper1);
                outer.appendChild(wrapper2);
                // 插入outer到页面原位置
                const main = document.querySelector('main');
                main.appendChild(outer);
                // 渲染初始内容
                const book = document.getElementById('book-select').value;
                const chapter = document.getElementById('chapter-select').value;
                loadBibleContent(compareSection, book, chapter, compareSelect.value);
                // 监听对照select（避免变量重复声明）
                compareSelect.addEventListener('change', function () {
                    var bookVal = document.getElementById('book-select').value;
                    var chapterVal = document.getElementById('chapter-select').value;
                    loadBibleContent(compareSection, bookVal, chapterVal, compareSelect.value);
                });
                // 监听主book/chapter变化时，同步对照区块内容
                document.getElementById('book-select').addEventListener('change', function () {
                    const book = this.value;
                    const chapter = document.getElementById('chapter-select').value;
                    loadBibleContent(compareSection, book, chapter, compareSelect.value);
                });
                document.getElementById('chapter-select').addEventListener('change', function () {
                    const book = document.getElementById('book-select').value;
                    const chapter = this.value;
                    loadBibleContent(compareSection, book, chapter, compareSelect.value);
                });

            }
        } else {
            if (outer && wrapper1 && wrapper2 && compareSelect && compareSection) {
                // 恢复主select和bibleText到main
                const main = document.querySelector('main');
                main.insertBefore(versionSelect, outer);
                main.insertBefore(bibleTextSection, outer);
                // 移除outer
                outer.remove();
                // 清空引用
                outer = null;
                wrapper1 = null;
                wrapper2 = null;
                compareSelect = null;
                compareSection = null;
            }
        }
    });


    function renderBookOptions() {
        const bookSelect = document.getElementById('book-select');
        bookSelect.innerHTML = '';
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.value;
            option.textContent = book.name;
            bookSelect.appendChild(option);
        });
    }

    renderBookOptions();
    // 读取本地存储
    const selections = loadUserSelections();
    // 设置书卷
    if (selections.book) {
        document.getElementById('book-select').value = selections.book;
    }
    // 渲染章节选项
    renderChapterOptions(document.getElementById('book-select').value);
    // 设置章节
    if (selections.chapter) {
        document.getElementById('chapter-select').value = selections.chapter;
    } else {
        document.getElementById('chapter-select').selectedIndex = 0;
    }
    // 设置版本
    if (selections.version) {
        document.getElementById('version-select').value = selections.version;
    }
    // 初始化主内容
    setupMainContentEvents();
    // 移除多余的事件绑定，初始化后事件绑定已在 setupMainContentEvents 内完成

    // 绑定保存事件
    document.getElementById('version-select').addEventListener('change', saveUserSelections);
    document.getElementById('book-select').addEventListener('change', saveUserSelections);
    document.getElementById('chapter-select').addEventListener('change', saveUserSelections);
});

// 保存用户选择到localStorage
function saveUserSelections() {
    localStorage.setItem('bible_version', document.getElementById('version-select').value);
    localStorage.setItem('bible_book', document.getElementById('book-select').value);
    localStorage.setItem('bible_chapter', document.getElementById('chapter-select').value);
}

// 读取用户选择
function loadUserSelections() {
    return {
        version: localStorage.getItem('bible_version'),
        book: localStorage.getItem('bible_book'),
        chapter: localStorage.getItem('bible_chapter')
    };
}