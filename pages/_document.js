import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        <meta name="description" content="扫雷游戏 - 带登录注册的在线扫雷" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%92%A3%3C/text%3E%3C/svg%3E" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
