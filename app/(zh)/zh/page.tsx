import { PortfolioHome } from "@/components/portfolio-home";
import { pageMetadata } from "@/lib/portfolio";
export const metadata = pageMetadata("zh");
export default function Home() {
  return <PortfolioHome locale="zh" />;
}
