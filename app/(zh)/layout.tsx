import { PortfolioDocument } from "@/components/portfolio-shell";
export default function ChineseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortfolioDocument locale="zh">{children}</PortfolioDocument>;
}
