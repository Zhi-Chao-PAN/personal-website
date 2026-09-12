import { PortfolioHome } from "@/components/portfolio-home";
import { pageMetadata } from "@/lib/portfolio";
export const metadata = pageMetadata("en");
export default function Home() {
  return <PortfolioHome locale="en" />;
}
