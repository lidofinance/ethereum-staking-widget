import Document, {
  Head,
  Html,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';
import { Fonts, LidoUIHead } from '@lidofinance/lido-ui';
import { ServerStyleSheet } from 'styled-components';

import { dynamics } from 'config';

let host = 'https://stake.lido.fi';

export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    if (ctx?.req?.headers?.host) {
      host = `https://${ctx?.req?.headers?.host}`;
    }

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);

      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  get metaTitle(): string {
    return 'Stake with Lido | Lido';
  }

  get metaDescription(): string {
    return (
      'Liquid staking with Lido. ' +
      'Stake Ether with Lido to get daily rewards while keeping full control of your staked tokens. ' +
      'Start receiving rewards in just a few clicks.'
    );
  }

  get metaPreviewImgUrl(): string {
    return `${host}/lido-preview.png`;
  }

  render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" type="image/svg+xml" href="/favicon-1080x1080.svg" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/favicon-192x192.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={this.metaTitle} />
          <meta property="og:description" content={this.metaDescription} />
          <meta property="og:image" content={this.metaPreviewImgUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={this.metaTitle} />
          <meta name="twitter:description" content={this.metaDescription} />
          <meta name="twitter:image:src" content={this.metaPreviewImgUrl} />
          <meta name="twitter:site" content="@lidofinance" />
          <meta name="twitter:creator" content="@lomashuk" />
          <meta name="description" content={this.metaDescription} />
          <meta name="currentChain" content={String(dynamics.defaultChain)} />
          <Fonts />
          <LidoUIHead />
          <script src="/runtime/window-env.js" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
