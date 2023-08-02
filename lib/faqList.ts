import matter from 'gray-matter';
import remark from 'remark';
import html from 'remark-html';
import externalLinks from 'remark-external-links';

export interface FAQItem {
  id: string;
  content: string;
  title: string;
}

export const getFaqList = async (list: string[]): Promise<FAQItem[]> => {
  return Promise.all(
    list.map(async (id) => {
      const fileContents = await import(`faq/${id}.md`);
      const matterResult = matter(fileContents.default);

      const processedContent = await remark()
        .use(externalLinks, { target: '_blank', rel: ['nofollow', 'noopener'] })
        .use(html)
        .process(matterResult.content);

      const content = processedContent.toString();
      const title = String(matterResult.data.title || id);

      return {
        id,
        content,
        title,
      };
    }),
  );
};
