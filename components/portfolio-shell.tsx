import Link from "next/link";
import { Instrument_Sans, Geist_Mono } from "next/font/google";
import {
  contactEmail,
  githubUrl,
  pagePath,
  ui,
  type Locale,
} from "@/lib/portfolio";
import "@/app/globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export function PortfolioDocument({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      className={`${sans.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

export function PortfolioHeader({
  locale,
  slug,
}: {
  locale: Locale;
  slug?: string;
}) {
  const t = ui[locale];
  const home = pagePath(locale);
  return (
    <>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <header className="site-header wrap">
        <Link
          href={home}
          className="wordmark"
          aria-label={locale === "en" ? "ZhiChao Pan home" : "潘志超 首页"}
        >
          ZP<span className="brand-dot">.</span>
          <span className="wordmark-caption">PERSONAL LAB</span>
        </Link>
        <nav aria-label={locale === "en" ? "Main navigation" : "主导航"}>
          <Link href={`${home}#work`}>{t.work}</Link>
          <Link href={`${home}#about`}>{t.about}</Link>
          <a
            href={pagePath(locale === "en" ? "zh" : "en", slug)}
            hrefLang={locale === "en" ? "zh-CN" : "en"}
            className="language-link"
            lang={locale === "en" ? "zh-CN" : "en"}
          >
            {locale === "en" ? "中文" : "EN"}
            <span aria-hidden="true"> ↗</span>
          </a>
        </nav>
      </header>
    </>
  );
}

export function PortfolioFooter({ locale }: { locale: Locale }) {
  const t = ui[locale];
  return (
    <footer className="site-footer wrap" id="contact">
      <div className="section-meta">
        <span className="eyebrow">
          {locale === "en" ? "A CONVERSATION STARTS HERE" : "从一次交流开始"}
        </span>
        <span className="availability">
          <i aria-hidden="true" />
          {locale === "en"
            ? "Open to thoughtful collaboration"
            : "欢迎有具体问题的合作交流"}
        </span>
      </div>
      <div className="contact-row">
        <h2>
          {locale === "en" ? (
            <>
              Have a useful
              <br />
              problem in mind?
            </>
          ) : (
            <>
              有一个值得
              <br />
              认真解决的问题？
            </>
          )}
        </h2>
        <a
          className="circle-link"
          href={`mailto:${contactEmail}`}
          aria-label={locale === "en" ? "Email ZhiChao Pan" : "发邮件给潘志超"}
        >
          ↗
        </a>
      </div>
      <div className="footer-links">
        <a href={`mailto:${contactEmail}`}>{t.contact} ↗</a>
        <a href={`mailto:${contactEmail}?subject=CV%20request`}>
          {locale === "en" ? "Request a CV by email" : "邮件索取简历"} ↗
        </a>
        <a href={githubUrl}>GitHub ↗</a>
      </div>
      <div className="footer-bottom">
        <span>© 2026 ZhiChao Pan · 潘志超</span>
        <span>
          {locale === "en"
            ? "Product judgment. Visible evidence."
            : "产品判断，有据可查。"}
        </span>
        <a href="#top">{locale === "en" ? "Back to top ↑" : "回到顶部 ↑"}</a>
      </div>
    </footer>
  );
}
