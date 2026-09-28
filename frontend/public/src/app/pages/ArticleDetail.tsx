import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Calendar, User, BookOpen, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { ShareButtons } from "../components/ShareButtons";
import { HubAskAbout } from "../components/hub/HubAskAbout";
import { usePageMeta } from "../hooks/usePageTitle";
import { useI18n } from "../i18n/LanguageContext";
import { publicName, readTimeMinutes } from "../utils/publicDisplay";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  featured: boolean;
  content: string;
}

export function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const { t, formatDate, formatNumber } = useI18n();
  usePageMeta({
    title: article?.title ?? (loading ? null : t("news.notFound")),
    description: article?.excerpt || article?.content,
    image: article?.image,
    type: "article",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchArticleAndRelated = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [specificArticle, allArticles] = await Promise.all([
          api.news.get(id),
          api.news.list()
        ]);
        
        if (specificArticle && (!specificArticle.status || specificArticle.status === "Published")) {
          const mappedSpecific: NewsArticle = {
            id: specificArticle.id,
            title: specificArticle.title,
            excerpt: specificArticle.subtitle || "",
            image: specificArticle.featured_image || specificArticle.featuredImage || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80",
            category: specificArticle.category || "General",
            author: publicName(specificArticle.author) || "",
            date: specificArticle.publish_date || specificArticle.publishDate || "",
            featured: Boolean(specificArticle.featured),
            content: specificArticle.content || ""
          };
          setArticle(mappedSpecific);
        }

        if (allArticles) {
          const mappedAll = allArticles
            .filter((art: any) => art.id !== id && (!art.status || art.status === "Published"))
            .map((art: any) => ({
              id: art.id,
              title: art.title,
              excerpt: art.subtitle || "",
              image: art.featured_image || art.featuredImage || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80",
              category: art.category || "General",
              author: publicName(art.author) || "",
              date: art.publish_date || art.publishDate || "",
              featured: Boolean(art.featured),
              content: art.content || ""
            }));
          setRelatedArticles(mappedAll.slice(0, 3)); // show top 3 related
        }
      } catch (err) {
        console.error("Failed to load article detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleAndRelated();
  }, [id]);

  if (loading || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <SiteHeader activeSection="news-events" />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3D91] mb-4" />
              <p className="text-sm text-slate-500 font-semibold">{t("common.loading")}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black text-gray-900 mb-2">{t("news.notFound")}</h1>
              <p className="text-gray-500 mb-6">{t("news.notFoundText")}</p>
              <Link to="/news-events" className="px-5 py-2.5 bg-[#0A3D91] text-white rounded-xl font-bold hover:bg-blue-800 transition-colors">
                {t("news.browseAll")}
              </Link>
            </>
          )}
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="news-events" />

      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
          <button
            onClick={() => navigate("/news-events")}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl text-gray-700 font-bold transition-all border border-gray-200 hover:border-[#0A3D91] shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("news.allNews")}</span>
          </button>
        </div>
      </div>

      {/* Article Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
        <article className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 mb-12">
          {/* Article Header Image */}
          <div className="relative h-64 md:h-96 bg-gray-900 overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Category Badge */}
            <div className="absolute top-6 left-6">
              <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase shadow-xl backdrop-blur-sm ${
                article.category === 'Events' ? 'bg-[#0A3D91]/95 text-white' :
                article.category === 'News' ? 'bg-green-600/95 text-white' :
                article.category === 'Training' ? 'bg-purple-600/95 text-white' :
                article.category === 'Fighter Spotlight' ? 'bg-[#F2C94C]/95 text-gray-900' :
                'bg-gray-700/95 text-white'
              }`}>
                {article.category}
              </span>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-6 md:p-12">
            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt Summary */}
            {article.excerpt && (
              <p className="text-lg text-gray-600 font-medium border-l-4 border-slate-300 pl-4 py-1.5 mb-8 italic">
                {article.excerpt}
              </p>
            )}

            {/* Author / Date Details */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-semibold pb-8 border-b border-gray-150 mb-8">
              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{t("common.by", { name: article.author })}</span>
                </div>
              )}
              {formatDate(article.date) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <time dateTime={article.date}>{formatDate(article.date, "long")}</time>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{t("common.minRead", { n: formatNumber(readTimeMinutes(article.content)) })}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="prose max-w-none text-gray-700 leading-relaxed text-base space-y-6">
              {article.content.split('\n').map((para, i) => (
                para.trim() && <p key={i}>{para.trim()}</p>
              ))}
            </div>

            {/* Share */}
            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-base font-black text-gray-900">{t("common.shareArticle")}</p>
                <p className="text-sm text-gray-500">{t("common.shareArticleText")}</p>
              </div>
              <ShareButtons title={article.title} />
            </div>
          </div>
        </article>

        <HubAskAbout
          className="mb-12"
          questions={[t("hub.askArticleSummary", { title: article.title }), t("hub.askLatestNews")]}
        />

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 uppercase">
              <BookOpen className="w-6 h-6 text-primary" />
              <span>{t("news.moreNews")}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/article/${rel.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-primary/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                >
                  <div className="h-44 relative bg-gray-900 overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-550"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-2.5 py-1 bg-white/90 border border-white text-gray-900 rounded-md text-[10px] font-bold uppercase shadow-sm">
                        {rel.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-2">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {rel.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mt-4 pt-3 border-t border-gray-100">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(rel.date)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
