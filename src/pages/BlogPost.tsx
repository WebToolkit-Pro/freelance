import React from "react";
import { Layout } from "@/components/Layout";
import { useSeo, useJsonLd, absoluteUrl } from "@/lib/seo";
import { getPostBySlug, POSTS, type PostBlock } from "@/lib/blog";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TocDesktop, TocMobile, slugifyHeading, type TocItem } from "@/components/TableOfContents";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug || "");

  useSeo({
    title: post ? `${post.title} | Tax For Freelancers Blog` : "Post Not Found | Tax For Freelancers",
    description: post ? post.description : "This blog post could not be found.",
    path: post ? `/blog/${post.slug}` : "/blog",
    ogType: "article"
  });

  useJsonLd(post ? [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.description,
      "datePublished": post.publishedAt,
      "dateModified": post.publishedAt,
      "author": {
        "@type": "Person",
        "name": "Abu Sufyan",
        "url": absoluteUrl("/about")
      },
      "publisher": {
        "@type": "Organization",
        "name": "Tax For Freelancers",
        "logo": {
          "@type": "ImageObject",
          "url": absoluteUrl("/favicon.svg")
        }
      },
      "image": absoluteUrl("/opengraph.jpg"),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": absoluteUrl(`/blog/${post.slug}`)
      },
      "articleSection": post.category,
      "wordCount": post.content
        .filter(b => b.type === "p" || b.type === "h2" || b.type === "h3" || b.type === "callout" || b.type === "cta")
        .reduce((sum, b) => sum + ((b as { text: string }).text?.split(/\s+/).length ?? 0), 0)
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": absoluteUrl("/")
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": absoluteUrl("/blog")
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": absoluteUrl(`/blog/${post.slug}`)
        }
      ]
    }
  ] : null);

  if (!post) {
    return (
      <Layout title="Post Not Found" description="We couldn't find the article you were looking for.">
        <div className="text-center py-12">
          <p className="mb-8">It may have been moved or deleted.</p>
          <Link href="/blog">
            <Button>Return to Blog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const relatedPosts = POSTS
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);
  
  if (relatedPosts.length < 3) {
    const more = POSTS.filter(p => p.slug !== post.slug && p.category !== post.category).slice(0, 3 - relatedPosts.length);
    relatedPosts.push(...more);
  }

  // Build TOC from h2 blocks with unique slugified IDs
  const tocItems: TocItem[] = [];
  const seen = new Map<string, number>();
  const blockIds = post.content.map((block) => {
    if (block.type !== "h2") return null;
    const base = slugifyHeading(block.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;
    tocItems.push({ id, text: block.text });
    return id;
  });

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <span className="mr-2">←</span> Back to blog
        </Link>

        <div className="mb-10 border-b border-border pb-10">
          <Badge variant="outline" className="mb-6 bg-primary/5 text-primary border-primary/20">
            {post.category}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-foreground leading-tight">
            {post.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            {post.description}
          </p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span>{post.readTime} min read</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_220px] gap-12">
          <div className="min-w-0">
            <TocMobile items={tocItems} />

            <article className="prose prose-gray dark:prose-invert prose-h2:text-2xl prose-h2:font-semibold prose-h3:text-xl prose-h3:font-medium prose-p:text-muted-foreground max-w-none">
              {post.content.map((block: PostBlock, idx: number) => {
                switch (block.type) {
                  case 'h2':
                    return <h2 key={idx} id={blockIds[idx] ?? undefined} className="text-2xl font-semibold mt-12 mb-5 scroll-mt-24">{block.text}</h2>;
                  case 'h3':
                    return <h3 key={idx} className="text-xl font-medium mt-8 mb-4">{block.text}</h3>;
                  case 'p':
                    return <p key={idx} className="text-muted-foreground leading-relaxed mb-6">{block.text}</p>;
                  case 'ul':
                    return (
                      <ul key={idx} className="my-6 space-y-2 text-muted-foreground">
                        {block.items.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
                      </ul>
                    );
                  case 'callout':
                    return (
                      <div key={idx} className="my-8 p-6 bg-muted/30 border-l-4 border-primary rounded-r-lg text-foreground italic">
                        {block.text}
                      </div>
                    );
                  case 'cta':
                    return (
                      <div key={idx} className="my-10 text-center not-prose">
                        <Link href="/">
                          <Button size="lg" className="w-full sm:w-auto shadow-sm">
                            <Calculator className="mr-2 h-5 w-5" />
                            {block.text}
                          </Button>
                        </Link>
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </article>
          </div>

          <TocDesktop items={tocItems} />
        </div>

        <div className="mt-20 pt-16 border-t border-border">
          <h3 className="text-2xl font-bold mb-8">Keep Reading</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map(rp => (
              <Link key={rp.slug} href={`/blog/${rp.slug}`}>
                <Card className="h-full flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-border/60 bg-card cursor-pointer group">
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-3">
                      {rp.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 flex-1">
                  </CardContent>
                  <CardFooter className="p-5 pt-0 mt-auto flex justify-between items-center text-xs text-muted-foreground">
                    <span>{rp.readTime} min read</span>
                    <ArrowRight className="h-3 w-3 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <Card className="bg-primary/5 border-primary/20 text-center p-8 sm:p-12">
            <CardContent className="space-y-4 p-0">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold">Calculate your take-home pay</h3>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                Stop guessing. Use our free tool to figure out exactly how much you need to set aside for taxes.
              </p>
              <Link href="/">
                <Button size="lg" className="px-8 shadow-sm">
                  Open Calculator
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
