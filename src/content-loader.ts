import type { Loader, LoaderContext } from 'astro/loaders';
import fs from 'fs';
import path from 'path';
import { z } from 'astro:content';

export function bibleLoader(options: { dataDir: string }) {
  const { dataDir } = options;

  return {
    name: 'bible-loader',
    load: async (context: LoaderContext) => {
      // 获取所有版本目录
      const versions = fs.readdirSync(dataDir).filter(file =>
        fs.statSync(path.join(dataDir, file)).isDirectory()
      );
      console.log(versions);
      // 遍历每个版本
      for (const version of versions) {
        const versionDir = path.join(dataDir, version);
        const chunkFiles = fs.readdirSync(versionDir).filter(file =>
          file.endsWith('.json')
        );

        // 加载每个 chunk 文件
        for (const chunkFile of chunkFiles) {
          const chunkPath = path.join(versionDir, chunkFile);
          const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));

          // 为每个章节创建或更新条目
          chunkData.forEach((chapter: { book: string; chapter: number; verses: { num: number; verse: string; }[] }) => {
            const id = `${version}/${chapter.book}/${chapter.chapter}`;
            context.store.set({
              id,
              data: chapter,

            });
          });
        }
      }
    },
    // 可选的默认模式定义
    schema: async () => z.object({
      book: z.string(),
      chapter: z.number(),
      verses: z.array(z.object({
        num: z.number(),
        verse: z.string(),
      })),
    }),
  };
}