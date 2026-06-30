import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Calendar, User, Share2, BookOpen, Clock, Bell, ShoppingCart, Menu, Home, Trophy, Users, Handshake, Search } from "lucide-react";
import { useState, useEffect } from "react";
import kkfLogo from "figma:asset/a66d0715b1669c88badc1b57f275bd3b2182d59e.png";
import { api } from "../utils/api";

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
  const [readTime] = useState("5 min read");

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleAndRelated = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [specificArticle, allArticles] = await Promise.all([
          api.news.get(id),
          api.news.list()
        ]);
        
        if (specificArticle) {
          const mappedSpecific: NewsArticle = {
            id: specificArticle.id,
            title: specificArticle.title,
            excerpt: specificArticle.subtitle || "",
            image: specificArticle.featured_image || specificArticle.featuredImage || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80",
            category: specificArticle.category || "General",
            author: specificArticle.author || "Admin",
            date: specificArticle.publish_date || specificArticle.publishDate || "",
            featured: Boolean(specificArticle.featured),
            content: specificArticle.content || ""
          };
          setArticle(mappedSpecific);
        }

        if (allArticles) {
          const mappedAll = allArticles
            .filter((art: any) => art.id !== id)
            .map((art: any) => ({
              id: art.id,
              title: art.title,
              excerpt: art.subtitle || "",
              image: art.featured_image || art.featuredImage || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80",
              category: art.category || "General",
              author: art.author || "Admin",
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3D91] mb-4" />
        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Loading article details…</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Article Not Found</h2>
          <Link to="/news-events" className="text-[#0A3D91] font-bold hover:underline">
            Back to News & Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img
                src={kkfLogo}
                alt="KKF Logo"
                className="w-14 h-14 md:w-16 md:h-16 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">KUNKHMER</h1>
                <p className="text-sm md:text-base text-gray-600 font-semibold leading-tight">Official Platform</p>
              </div>
            </Link>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:block flex-1 max-w-3xl">
              <div className="relative flex items-center gap-3 bg-white border border-gray-300 rounded-full px-5 py-3">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search fighters, products, events..."
                  className="flex-1 bg-transparent outline-none font-medium text-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button className="p-2.5 hover:bg-gray-50 rounded-full transition-all relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#C8102E] rounded-full" />
              </button>

              <button className="p-2.5 hover:bg-gray-50 rounded-full transition-all relative">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
              </button>

              <Link to="/profile" className="p-2.5 hover:bg-gray-50 rounded-full transition-all">
                <User className="w-5 h-5 text-gray-600" />
              </Link>

              <button className="md:hidden p-2.5 hover:bg-gray-50 rounded-full transition-all">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Bottom Navigation */}
          <nav className="hidden md:flex items-center gap-1 pb-4 border-t border-gray-100 pt-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              to="/matches"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50"
            >
              <Trophy className="w-4 h-4" />
              Matches & Events
            </Link>
            <Link
              to="/news-events"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-semibold text-sm transition-all bg-[#0A3D91] text-white shadow-md"
            >
              <BookOpen className="w-4 h-4" />
              News & Media
            </Link>
            <Link
              to="/fighters"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50"
            >
              <Users className="w-4 h-4" />
              Fighters
            </Link>
            <Link
              to="/strategic-partners"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50"
            >
              <Handshake className="w-4 h-4" />
              Strategic Partners
            </Link>
            <Link
              to="/shop"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50"
            >
              <ShoppingCart className="w-4 h-4" />
              Shop
            </Link>
          </nav>
        </div>
      </header>

      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
          <button
            onClick={() => navigate("/news-events")}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl text-gray-700 font-bold transition-all border border-gray-200 hover:border-[#0A3D91] shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to News & Events</span>
          </button>
        </div>
      </div>

      {/* Article Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
        <article className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 mb-12">
          {/* Article Header Image */}
          <div className="relative h-96 bg-gray-900 overflow-hidden">
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
          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
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
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>By {article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{readTime}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="prose max-w-none text-gray-700 leading-relaxed text-base space-y-6">
              {article.content.split('\n').map((para, i) => (
                para.trim() && <p key={i}>{para.trim()}</p>
              ))}
            </div>
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 uppercase">
              <BookOpen className="w-6 h-6 text-primary" />
              <span>Related Articles</span>
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
                      <span>{rel.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto border-t-4 border-[#C8102E]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/10 pb-10 mb-10">
            <div className="flex items-center gap-3">
              <img
                src={kkfLogo}
                alt="KKF Logo"
                className="w-16 h-16 object-contain filter brightness-0 invert"
              />
              <div>
                <h3 className="text-xl font-black tracking-wider leading-none">KUNKHMER</h3>
                <p className="text-xs text-white/50 font-semibold tracking-wider mt-1">FEDERATION OF CAMBODIA</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              <Link to="/news-events" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">News & Events</Link>
              <Link to="/fighters" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Fighters</Link>
              <Link to="/matches" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Matches & Cards</Link>
              <Link to="/shop" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Official Shop</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40 font-semibold">
            <p>© 2026 Kun Khmer Federation of Cambodia. All rights reserved.</p>
            <p>Built for the Athlete Portal System Ecosystem</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
