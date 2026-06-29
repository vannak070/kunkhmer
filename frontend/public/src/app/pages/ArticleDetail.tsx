import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Calendar, User, Share2, BookOpen, Clock, Bell, ShoppingCart, Menu, Home, Trophy, Users, Handshake, Search } from "lucide-react";
import { useState } from "react";
import kkfLogo from "figma:asset/a66d0715b1669c88badc1b57f275bd3b2182d59e.png";

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

const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "Prom Samnang vs Chan Rothana: Championship Fight Set for April 15",
    excerpt: "The highly anticipated championship bout between two of Cambodia's finest warriors has been officially confirmed for next month at the Olympic Stadium.",
    image: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800",
    category: "Events",
    author: "KKF Official",
    date: "2026-03-25",
    featured: true,
    content: "The Kun Khmer Federation is thrilled to announce the highly anticipated championship bout between Prom Samnang and Chan Rothana, scheduled for April 15th at the Olympic Stadium in Phnom Penh.\n\nThis showdown brings together two of Cambodia's most accomplished fighters, each with an impressive track record. Prom Samnang, the current champion, has successfully defended his title three times and boasts an outstanding record of 45-3-2. His opponent, Chan Rothana, is the top-ranked contender with a remarkable 42-5-1 record and a reputation for devastating knockout power.\n\nThe event is expected to draw over 15,000 spectators and will be broadcast live on multiple networks across Southeast Asia. Both fighters have completed their training camps and are in peak condition for what promises to be an unforgettable night of world-class Kun Khmer action.\n\nTickets go on sale next week, with prices ranging from $20 to $150. VIP packages including meet-and-greet opportunities with the fighters are also available."
  },
  {
    id: "2",
    title: "New State-of-the-Art Training Facility Opens in Phnom Penh",
    excerpt: "The Kun Khmer Federation unveils a world-class training center equipped with modern facilities for fighters.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
    category: "News",
    author: "Sports Desk",
    date: "2026-03-24",
    featured: false,
    content: "The Kun Khmer Federation officially opened its new state-of-the-art training facility in Phnom Penh yesterday, marking a significant milestone in the development of Cambodian martial arts.\n\nThe 5,000 square meter facility features multiple training rings, strength and conditioning areas, medical treatment rooms, and recovery facilities including ice baths and massage therapy rooms. The center also houses video analysis equipment and a performance tracking system to help fighters optimize their training.\n\n'This facility represents our commitment to developing world-class athletes,' said KKF President Sok Panha during the opening ceremony. 'We want to provide our fighters with the best possible training environment to compete on the international stage.'\n\nThe facility will be open to all registered KKF fighters and will host regular training camps led by top coaches from around the world. Applications for membership are now being accepted through the KKF website."
  },
  {
    id: "3",
    title: "Rising Star: Meet Thun Chanthy, Cambodia's Next Champion",
    excerpt: "An exclusive interview with the young fighter making waves in the Kun Khmer circuit.",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800",
    category: "Fighter Spotlight",
    author: "Maya Chen",
    date: "2026-03-22",
    featured: false,
    content: "At just 21 years old, Thun Chanthy is already being hailed as one of the most promising talents in Kun Khmer. With an undefeated record of 15-0, including 10 knockouts, the young fighter from Siem Reap has captured the attention of fans and experts alike.\n\n'I've been training since I was 8 years old,' Chanthy told us during our exclusive interview. 'Kun Khmer is not just a sport for me, it's a way of life and a connection to my heritage.'\n\nUnder the guidance of renowned coach Pich Sarun at the Angkor Warriors gym, Chanthy has developed a unique fighting style that blends traditional techniques with modern training methods. His combination of speed, power, and technical precision has made him a nightmare for opponents.\n\nNext month, Chanthy will face his toughest test yet when he takes on veteran fighter Sok Pisey for the lightweight championship. A win would make him the youngest champion in KKF history.\n\n'I'm ready for this challenge,' Chanthy says with quiet confidence. 'I've worked hard for this opportunity, and I won't let it pass me by.'"
  }
];

export function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [readTime] = useState("5 min read");

  const article = newsArticles.find(a => a.id === id);

  // Get related articles (exclude current article)
  const relatedArticles = newsArticles.filter(a => a.id !== id);

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

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 pb-6 mb-8 border-b-2 border-gray-100">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0A3D91] to-blue-700 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Author</p>
                  <p className="text-base font-bold text-gray-900">{article.author}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Published</p>
                  <p className="text-base font-bold text-gray-900">
                    {new Date(article.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Read Time */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Read Time</p>
                  <p className="text-base font-bold text-gray-900">{readTime}</p>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg text-gray-700 leading-relaxed mb-6 font-normal">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t-2 border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Share this article</h3>
                  <p className="text-sm text-gray-600">Spread the word about Kun Khmer</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all">
                    <span>Facebook</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-all">
                    <span>Twitter</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-xl font-bold transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0A3D91] to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">Related Articles</h2>
                <p className="text-base text-gray-600 font-semibold mt-1">Continue reading latest news</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  to={`/article/${relatedArticle.id}`}
                  className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-[#0A3D91]/30"
                >
                  {/* Article Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase shadow-lg backdrop-blur-sm ${
                        relatedArticle.category === 'Events' ? 'bg-[#0A3D91]/95 text-white' :
                        relatedArticle.category === 'News' ? 'bg-green-600/95 text-white' :
                        relatedArticle.category === 'Training' ? 'bg-purple-600/95 text-white' :
                        relatedArticle.category === 'Fighter Spotlight' ? 'bg-[#F2C94C]/95 text-gray-900' :
                        'bg-gray-700/95 text-white'
                      }`}>
                        {relatedArticle.category}
                      </span>
                    </div>
                  </div>

                  {/* Article Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#0A3D91] transition-colors">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 font-medium leading-relaxed">
                      {relatedArticle.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-bold text-gray-700">{relatedArticle.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-bold text-gray-700">
                          {new Date(relatedArticle.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-[#0A3D91] via-[#0B4AAD] to-[#0A3D91] text-white py-8 mt-20 overflow-hidden">
        {/* Subtle Background Effect */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(200, 16, 46, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(242, 201, 76, 0.1) 0%, transparent 50%)'
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex items-center justify-center p-1.5 bg-white rounded-lg">
                  <img
                    src={kkfLogo}
                    alt="KKF Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight leading-tight">KUNKHMER</h3>
                  <p className="text-[9px] text-[#F2C94C] font-bold tracking-[0.1em] uppercase leading-tight">Official Platform</p>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed mb-4">
                Official digital platform for Cambodian Martial Arts excellence and tradition.
              </p>

              {/* Social Media Icons */}
              <div className="flex gap-2">
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h4 className="font-bold text-[13px] mb-3 text-[#F2C94C] tracking-wide uppercase">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/news-events" className="text-white/60 hover:text-white transition-colors text-xs">
                    News & Events
                  </Link>
                </li>
                <li>
                  <Link to="/fighters" className="text-white/60 hover:text-white transition-colors text-xs">
                    Fighters
                  </Link>
                </li>
              </ul>
            </div>

            {/* Shop Column */}
            <div>
              <h4 className="font-bold text-[13px] mb-3 text-[#F2C94C] tracking-wide uppercase">Shop</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/shop" className="text-white/60 hover:text-white transition-colors text-xs">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="text-white/60 hover:text-white transition-colors text-xs">
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-bold text-[13px] mb-3 text-[#F2C94C] tracking-wide uppercase">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/home" className="text-white/60 hover:text-white transition-colors text-xs">
                    Admin Platform
                  </Link>
                </li>
                <li>
                  <button className="text-white/60 hover:text-white transition-colors text-xs">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="text-white/60 hover:text-white transition-colors text-xs">
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-5" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
            <div className="text-white/40">
              © 2026 KUNKHMER. All rights reserved.
            </div>

            <div className="flex gap-5 text-white/40">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
              <button className="hover:text-white transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
