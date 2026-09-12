import { notFound } from "next/navigation";
import { PortfolioCase } from "@/components/portfolio-case";
import { portfolio, projectBySlug, pageMetadata } from "@/lib/portfolio";
type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return portfolio.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();
  return pageMetadata("en", project);
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();
  return <PortfolioCase project={project} locale="en" />;
}
