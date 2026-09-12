import { PortfolioDocument } from "@/components/portfolio-shell";
export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortfolioDocument locale="en">{children}</PortfolioDocument>;
}
