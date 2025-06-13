// 1. 从 `astro:content` 导入工具函数
import { defineCollection, z } from 'astro:content';

// 2. 导入加载器
import { glob, file } from 'astro/loaders';
import { bibleLoader } from './content-loader.ts';
const verseSchema = z.object({
    num: z.number(),
    verse: z.string()
});

const chapterSchema = z.object({
    book: z.string(),
    chapter: z.number(),
    verses: z.array(verseSchema)
}
);

const chapter = defineCollection({
    loader: bibleLoader({ dataDir: "public/version" }),
    schema: chapterSchema,
})
const chunkSchema = z.array(chapterSchema);
const books = defineCollection({
    type: 'data',
    schema: chapterSchema,
});

// 为每个版本定义一个 Collection
// 注意：因为是 JSON 文件，所以 `type` 必须是 'data'
// const chapter = defineCollection({
//     loader: glob({ pattern: '**/*.json', base: 'public/version' }),
//     schema: chapterSchema,
// });

const chunk = defineCollection({
    loader: glob({ pattern: '**/*.json', base: 'public/version' }),
    schema: chunkSchema,
});

export const collections = { chapter };
