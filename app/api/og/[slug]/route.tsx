import { projectBySlug } from "@/lib/portfolio";
export function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return params.then(({ slug }) => {
    if (slug !== "home" && !projectBySlug(slug))
      return new Response("Not found", { status: 404 });
    const locale =
      new URL(request.url).searchParams.get("lang") === "zh" ? "zh" : "en";
    return Response.redirect(
      new URL(`/og/${slug}-${locale}.png`, request.url),
      307,
    );
  });
}
