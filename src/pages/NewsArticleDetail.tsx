import { PublicLayout } from '@/layouts/PublicLayout';
import { newsBySlug, newsArticles } from '@/data/newsArticles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function NewsArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = slug ? newsBySlug.get(slug) : undefined;

  if (!article) {
    return (
      <PublicLayout>
        <section className="bg-[hsl(var(--navy))] py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
            <p className="text-gray-300 mb-8">The requested news article does not exist.</p>
            <Button
              className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--gold-light))]"
              onClick={() => navigate('/news')}
            >
              Back to News
            </Button>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const related = newsArticles.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <PublicLayout>
      <section className="relative min-h-[420px] overflow-hidden flex items-end">
        <img src={article.image} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy))]/95 via-[hsl(var(--navy))]/80 to-[hsl(var(--navy))]/45" />
        <div className="container mx-auto px-4 relative z-10 pb-12 pt-20">
          <Link to="/news" className="inline-flex items-center gap-2 text-[hsl(var(--gold))] mb-6 hover:text-[hsl(var(--gold-light))]">
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>
          <Badge className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] mb-4">{article.category}</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white max-w-4xl leading-tight">{article.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-5 text-gray-300 text-sm">
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[hsl(var(--gold))]" />
              {article.date}
            </span>
            {article.location ? (
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[hsl(var(--gold))]" />
                {article.location}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[2fr,1fr] gap-10 items-start">
            <article className="bg-card border border-border rounded-xl p-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">{article.excerpt}</p>
              <div className="space-y-6">
                {article.body.map((paragraph, index) => (
                  <p key={index} className="text-foreground/90 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            <aside className="space-y-6">
              <div className="bg-secondary border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Key Highlights</h2>
                <ul className="space-y-3">
                  {article.highlights.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex gap-3">
                      <ChevronRight className="h-4 w-4 text-[hsl(var(--gold))] mt-[2px] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[hsl(var(--navy))] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Explore More Updates</h3>
                <p className="text-gray-300 text-sm mb-5">
                  Follow DIL missions, trade delegations, and partnership milestones.
                </p>
                <Button
                  className="w-full bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--gold-light))]"
                  onClick={() => navigate('/news')}
                >
                  View All News
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="pb-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Related Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.slug}`}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-44 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-2">{item.date}</p>
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-[hsl(var(--gold))] transition-colors">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
