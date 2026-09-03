import { readdir } from 'node:fs/promises';

/** Recursively collect every `index.html` under `dir` (post-build dist/). */
export const walkIndexHtml = async (dir: string): Promise<string[]> => {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      out.push(...(await walkIndexHtml(path)));
    } else if (entry.name === 'index.html') {
      out.push(path);
    }
  }
  return out;
};
