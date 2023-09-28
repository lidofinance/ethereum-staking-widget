import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const getAllPagesRoutes = () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const directory = path.join(__dirname, '../../.next/server/pages');

  const items = fs.readdirSync(directory);
  const routes: string[] = [];
  let item: string | undefined;
  while ((item = items.pop())) {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);
    if (
      stats.isFile() &&
      path.extname(item) === '.html' &&
      !item.endsWith('404.html') &&
      !item.endsWith('500.html')
    ) {
      //console.log(item, path.basename(item));
      const routePath = path.join('/', item.replace(/(index)?\.html/, ''));
      routes.push(routePath);
    } else if (stats.isDirectory()) {
      const files = fs
        .readdirSync(itemPath)
        .map((files) => path.join(item as string, files));
      items.push(...files);
    }
  }
  return routes;
};
