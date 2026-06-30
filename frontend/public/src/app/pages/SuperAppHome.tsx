import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { api } from "../utils/api";
import { Search, Bell, ShoppingCart, User, Heart, Star, Flame, Zap, Crown, ChevronRight, Package, Plus, Minus, X, CreditCard, Play, Calendar, MapPin, Clock, Award, Users, BookOpen, Video, Menu, Home as HomeIcon, Trophy, TrendingUp, Sparkles, ArrowRight, ArrowLeft, Check, ChevronDown, ChevronUp, Filter, Grid3x3, Eye, ShoppingBag, Building2, Tv, Handshake, Weight, Share2 } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { useOrders } from "../contexts/OrderContext";
import { toast } from "sonner";
import kkfLogo from "figma:asset/a66d0715b1669c88badc1b57f275bd3b2182d59e.png";
import eventPosterImage from 'figma:asset/76de12a848bf50a1769fa454bf2dab5cb85ea354.png';
import SponsorsSection from "../components/home/SponsorsSection";
import TrendingFightersSection from "../components/home/TrendingFightersSection";
import ClubDetailPage from "../components/home/ClubDetailPage";
import HeroSection from "../components/home/HeroSection";

/**
 * DATA SYNCHRONIZATION WITH KUN KHMER DIGITAL PLATFORM
 * ====================================================
 * This Super App uses the same data sources as the Digital Platform management system
 * to ensure consistency across the entire KUNKHMER ecosystem:
 * 
 * - MOCK_BATCHES: Match batches and fight cards (source of truth for all matches)
 * - MOCK_EVENTS: Event schedules and details
 * - MOCK_FIGHTERS: Fighter profiles and records
 * - MOCK_CLUBS: Training clubs and gym information
 * - BROADCAST_STATIONS: Official broadcast partners
 * - SPONSORS: Sponsorship and partnership data
 * 
 * Any updates to these data sources in /src/app/data/ will automatically
 * reflect in both the Digital Platform and Super App.
 */
import { MOCK_FIGHTERS, MOCK_CLUBS, MOCK_EVENTS } from "../data/mock";
import { BROADCAST_STATIONS, SPONSORS, getWeightRangeCategory, getFighterSlug } from "../data/masterData";
import { MOCK_BATCHES } from "../data/batches";
import { MatchBatchCard } from "../components/MatchBatchCard";
import { FighterFilters } from "../components/FighterFilters";
import { MatchFilters } from "../components/MatchFilters";

type Section = "home" | "news-events" | "fighters" | "matches" | "match-detail" | "media" | "shop" | "strategic-partners" | "club-detail" | "cart" | "checkout" | "orders" | "profile" | "subscription";
type Category = "all" | "gloves" | "shorts" | "equipment" | "apparel";
type SearchFilter = "all" | "fighters" | "events" | "products";
type NewsEventsTab = "news" | "media";
type StrategicPartnersTab = "clubs" | "broadcasts" | "sponsors";
type MatchesEventsTab = "matches" | "events" | "previous";
type FighterTypeFilter = "all" | "Professional" | "Amateur";
type MatchFilter = "all" | "weight-class" | "location" | "match-type";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  seller?: string;
  fighterId?: string;
  badge?: string;
  discount?: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Fighter {
  id: string;
  name: string;
  image: string;
  record: string;
  weight: string;
  weightClass: string;
  gym: string;
  wins: number;
  losses: number;
  draws: number;
  verified: boolean;
  followers: number;
  championships: number;
  age: number;
  type: "Professional" | "Amateur";
  clubId?: string;
}

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

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  image: string;
  matches: number;
  matchesCount: number;
  status: string;
  description: string;
  station: string;
  organizer: string;
  sponsors: string[];
}

interface Club {
  id: string;
  name: string;
  location: string;
  image: string;
  headCoach: string;
  activeFighters: number;
  rating: number;
  status: string;
}

interface BroadcastStation {
  id: string;
  name: string;
  logo: string;
  image: string; // Added for broadcast station thumbnail images
  description: string;
  eventsCount: number;
}

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  image: string; // Added for sponsor thumbnail images
  industry: string; // Added for sponsor industry display
  tier: "platinum" | "gold" | "silver";
  eventsSponsored: number;
}

interface MediaContent {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  date: string;
  youtubeId: string;
}

interface Match {
  id: string;
  eventName: string;
  fighterA: {
    name: string;
    image: string;
    record: string;
    weight: number;
    club: string;
  };
  fighterB: {
    name: string;
    image: string;
    record: string;
    weight: number;
    club: string;
  };
  date: string;
  time: string;
  venue: string;
  rounds: number;
  agreedWeight: number;
  status: string;
  result?: {
    winner: string;
    method: string;
    round: number;
    time: string;
  };
}

export function SuperAppHome() {
  const { balance, deductBalance } = useWallet();
  const { orders, createOrder } = useOrders();
  const params = useParams();
  const navigate = useNavigate();
  
  const [currentSection, setCurrentSection] = useState<Section>("home");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<SearchFilter>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [newsEventsTab, setNewsEventsTab] = useState<NewsEventsTab>("news");
  const [strategicPartnersTab, setStrategicPartnersTab] = useState<StrategicPartnersTab>("clubs");
  const [matchesEventsTab, setMatchesEventsTab] = useState<MatchesEventsTab>("matches");
  const [fighterTypeFilter, setFighterTypeFilter] = useState<FighterTypeFilter>("all");
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set()); // All batches collapsed by default

  // Fighter filters
  const [fighterFilter, setFighterFilter] = useState<"all" | "weight" | "club" | "grade">("all");
  const [selectedFighterWeightClass, setSelectedFighterWeightClass] = useState<string>("all");
  const [selectedFighterClub, setSelectedFighterClub] = useState<string>("all");
  const [selectedFighterGrade, setSelectedFighterGrade] = useState<string>("all");
  const [showFighterFilters, setShowFighterFilters] = useState<boolean>(false);
  const [showMatchFilters, setShowMatchFilters] = useState<boolean>(false);
  const [showProductFilters, setShowProductFilters] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaContent | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [newsCurrentPage, setNewsCurrentPage] = useState(1);
  const [mediaCurrentPage, setMediaCurrentPage] = useState(1);
  const [previousMatchesPage, setPreviousMatchesPage] = useState(1);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [selectedWeightClass, setSelectedWeightClass] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [sponsorSlideIndex, setSponsorSlideIndex] = useState(0);
  const [selectedMatchType, setSelectedMatchType] = useState<string>("all");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const newsPerPage = 6;
  const mediaPerPage = 6;
  const previousMatchesPerPage = 5;
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    phone: ""
  });

  const [fightersList, setFightersList] = useState<any[]>([]);
  const [loadingFighters, setLoadingFighters] = useState(true);

  useEffect(() => {
    const fetchFighters = async () => {
      try {
        const data = await api.fighters.list();
        setFightersList(data || []);
      } catch (err) {
        console.error("Failed to fetch fighters:", err);
      } finally {
        setLoadingFighters(false);
      }
    };
    fetchFighters();
  }, []);

  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoadingNews(true);
      try {
        const data = await api.news.list();
        if (data && data.length > 0) {
          const mapped = data.map((art: any) => ({
            id: art.id,
            title: art.title,
            excerpt: art.subtitle || "",
            image: art.featured_image || art.featuredImage || "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800",
            category: art.category || "General",
            author: art.author || "Admin",
            date: art.publish_date || art.publishDate || "",
            featured: Boolean(art.featured),
            content: art.content || ""
          }));
          setNewsArticles(mapped);
        } else {
          setNewsArticles([]);
        }
      } catch (err) {
        console.error("Failed to fetch news from database:", err);
        setNewsArticles([]);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  const [mediaContent, setMediaContent] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoadingMedia(true);
      try {
        const data = await api.videos.list();
        if (data && data.length > 0) {
          const mapped = data.map((vid: any) => {
            let youtubeId = "dQw4w9WgXcQ";
            if (vid.youtube_url || vid.youtubeUrl) {
              const url = vid.youtube_url || vid.youtubeUrl;
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
              const match = url.match(regExp);
              if (match && match[2].length === 11) {
                youtubeId = match[2];
              }
            }

            const viewsVal = vid.views || 0;
            let formattedViews = "0";
            if (viewsVal >= 1000000) {
              formattedViews = (viewsVal / 1000000).toFixed(1) + "M";
            } else if (viewsVal >= 1000) {
              formattedViews = (viewsVal / 1000).toFixed(1) + "K";
            } else {
              formattedViews = viewsVal.toString();
            }

            return {
              id: vid.id,
              title: vid.title,
              thumbnail: vid.thumbnail || "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600",
              duration: vid.duration || "00:00",
              views: formattedViews,
              date: vid.created_at ? new Date(vid.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Recently",
              youtubeId,
              category: vid.category || "Highlights",
              fighterId: vid.fighter_id || vid.fighterId || ""
            };
          });
          setMediaContent(mapped);
        } else {
          setMediaContent([]);
        }
      } catch (err) {
        console.error("Failed to load videos from database:", err);
        setMediaContent([]);
      } finally {
        setLoadingMedia(false);
      }
    };
    fetchMedia();
  }, []);
  const [newsCategoryFilter, setNewsCategoryFilter] = useState("All");
  const [newsSearchQuery, setNewsSearchQuery] = useState("");
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState("All");
  const [mediaFighterFilter, setMediaFighterFilter] = useState("All");
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");

  const [clubsList, setClubsList] = useState<any[]>([]);
  const [broadcastersList, setBroadcastersList] = useState<any[]>([]);
  const [sponsorsList, setSponsorsList] = useState<any[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const [clubsData, broadcastersData, sponsorsData] = await Promise.all([
          api.clubs.list(),
          api.settings.listBroadcastStations(),
          api.settings.listSponsors(),
        ]);
        setClubsList(clubsData || []);
        setBroadcastersList(broadcastersData || []);
        setSponsorsList(sponsorsData || []);
      } catch (err) {
        console.error("Failed to fetch strategic partners:", err);
      } finally {
        setLoadingPartners(false);
      }
    };
    fetchPartners();
  }, []);

  // Scroll detection for header
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync URL parameter with current section
  useEffect(() => {
    if (params.section) {
      const validSections: Section[] = ["home", "news-events", "fighters", "matches", "match-detail", "shop", "strategic-partners", "club-detail", "cart", "checkout", "orders", "profile", "subscription"];
      if (validSections.includes(params.section as Section)) {
        setCurrentSection(params.section as Section);
      }
    } else {
      setCurrentSection("home");
    }
  }, [params.section]);

  // Sync news & events sub-tab with query parameter (e.g. ?tab=media)
  useEffect(() => {
    if (currentSection === "news-events") {
      const queryParams = new URLSearchParams(window.location.search);
      const tabParam = queryParams.get("tab");
      if (tabParam === "media") {
        setNewsEventsTab("media");
      } else if (tabParam === "news") {
        setNewsEventsTab("news");
      }
    }
  }, [currentSection]);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentSection]);

  // Auto-slide sponsors every 4 seconds
  useEffect(() => {
    const sponsorCount = SPONSORS.filter(s => s.active).length;
    if (sponsorCount === 0) return;

    const interval = setInterval(() => {
      setSponsorSlideIndex((prev) => (prev + 1) % Math.ceil(sponsorCount / 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Scroll detection for header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Track if page is scrolled for background change
      setIsScrolled(currentScrollY > 20);

      // Always show header at the top of page
      if (currentScrollY < 10) {
        setShowHeader(true);
      }
      // Hide header when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      }
      // Show header when scrolling up
      else if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Update URL when section changes (without page reload)
  const handleSectionChange = (section: Section) => {
    setCurrentSection(section);
    if (section === "home") {
      navigate("/", { replace: true });
    } else {
      navigate(`/${section}`, { replace: true });
    }
  };

  // Toggle batch expansion
  const toggleBatchExpansion = (batchId: string) => {
    setExpandedBatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(batchId)) {
        newSet.delete(batchId);
      } else {
        newSet.add(batchId);
      }
      return newSet;
    });
  };

  const products: Product[] = [
    {
      id: "1",
      name: "Prom Samnang Signature Boxing Gloves",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600",
      category: "gloves",
      rating: 4.9,
      reviews: 324,
      inStock: true,
      seller: "Prom Samnang",
      fighterId: "1",
      badge: "Best Seller",
      discount: 15
    },
    {
      id: "2",
      name: "Traditional Khmer Muay Thai Shorts - Red",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600",
      category: "shorts",
      rating: 4.8,
      reviews: 256,
      inStock: true,
      badge: "Popular"
    },
    {
      id: "3",
      name: "Professional Hand Wraps (3-Pack)",
      price: 19.99,
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600",
      category: "equipment",
      rating: 4.7,
      reviews: 189,
      inStock: true
    },
    {
      id: "4",
      name: "Chan Rothana Training Gloves - Premium",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600",
      category: "gloves",
      rating: 4.9,
      reviews: 412,
      inStock: true,
      seller: "Chan Rothana",
      fighterId: "2",
      badge: "New"
    },
    {
      id: "5",
      name: "Traditional Khmer Shorts - Gold Edition",
      price: 54.99,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",
      category: "shorts",
      rating: 4.8,
      reviews: 198,
      inStock: true,
      discount: 10
    },
    {
      id: "6",
      name: "Professional Shin Guards - Carbon Fiber",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600",
      category: "equipment",
      rating: 4.6,
      reviews: 145,
      inStock: true,
      badge: "Premium"
    }
  ];

  // Fighter images pool
  const fighterImages = [
    "https://images.unsplash.com/photo-1575992877113-6a7dda2d1592?w=800",
    "https://images.unsplash.com/photo-1678542230173-8e2c3eb87c85?w=800",
    "https://images.unsplash.com/photo-1579178937321-3ac1437a28ae?w=800",
    "https://images.unsplash.com/photo-1729673517006-2ded8e258497?w=800",
    "https://images.unsplash.com/photo-1769095211600-9fd452993027?w=800",
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800",
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&sig=1",
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&sig=2",
  ];

  // Transform Digital Platform fighters data to Super APP format
  const fighters: Fighter[] = fightersList.map((fighter, index) => {
    const recordParts = (fighter.record || "0-0-0").split('-');
    const wins = parseInt(recordParts[0] || '0');
    const losses = parseInt(recordParts[1] || '0');
    const draws = parseInt(recordParts[2] || '0');

    const idStr = fighter.id || "";
    const charSum = idStr.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

    let calculatedAge = 22;
    const dob = fighter.dateOfBirth || fighter.date_of_birth;
    if (dob) {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      if (birthYear) {
        calculatedAge = currentYear - birthYear;
      }
    } else {
      calculatedAge = 20 + (charSum % 15);
    }

    const followersCount = 5000 + (charSum % 20000);
    const championshipsCount = fighter.grade === 'A' ? (charSum % 3) + 1 : fighter.grade === 'B' ? 1 : 0;

    return {
      id: fighter.id,
      name: fighter.name,
      image: fighter.image || fighterImages[index % fighterImages.length],
      record: fighter.record || "0-0-0",
      weight: parseFloat(fighter.currentWeight || fighter.current_weight || "0").toString(),
      weightClass: getWeightRangeCategory(parseFloat(fighter.currentWeight || fighter.current_weight || "0")),
      gym: fighter.clubName || fighter.club_name || "Club Name",
      wins,
      losses,
      draws,
      verified: fighter.status === 'Active',
      followers: followersCount,
      championships: championshipsCount,
      age: calculatedAge,
      type: (fighter.professionalStatus || fighter.professional_status || "Professional") as "Professional" | "Amateur",
      clubId: fighter.clubId || fighter.club_id
    };
  });

  // EVENTS: Transform event data from Digital Platform
  const events: Event[] = MOCK_EVENTS.map(event => {
    return {
      id: event.id,
      name: event.name,
      date: event.date,
      venue: event.location,
      image: event.image || "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800",
      matches: event.matchesCount || 0,
      matchesCount: event.matchesCount || 0,
      status: event.status,
      description: event.description || "",
      station: event.station,
      organizer: event.organizer,
      sponsors: event.sponsors || []
    };
  });

  // CLUBS & GYMS: Transform club data from Digital Platform
  const clubs: Club[] = clubsList.map((club, index) => {
    return {
      id: club.id,
      name: club.name,
      location: club.location || "Cambodia",
      // DB stores as snake_case: head_coach
      headCoach: club.head_coach || club.headCoach || "",
      // fighters_count is injected by withCount('fighters') in the API
      activeFighters: parseInt(club.fighters_count ?? club.active_fighters ?? club.activeFighters ?? "0"),
      rating: parseFloat(club.rating || "4.5"),
      status: club.status || "active",
      // image is stored directly in the DB column
      image: club.image || `https://images.unsplash.com/photo-1593375547549-29fe3bf5c94f?w=400&sig=${index % 10}`
    };
  });

  // BROADCAST PARTNERS: Transform broadcast station data from Digital Platform
  const broadcastStations: BroadcastStation[] = broadcastersList.map((station, index) => {
    const typeStr = station.type || "National TV";
    const reachStr = station.reach || "National";
    return {
      id: station.id,
      name: station.name,
      logo: station.logo || `https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=100&sig=${index % 10}`,
      image: station.image || `https://images.unsplash.com/photo-1650984661525-7e6b1b874e47?w=400&sig=${index % 10}`,
      description: `${typeStr} - ${reachStr}`,
      eventsCount: 0
    };
  });

  // SPONSORS: Transform sponsor data from Digital Platform
  const sponsors: Sponsor[] = sponsorsList.map((sponsor, index) => {
    const tier = (sponsor.tier || "platinum").toLowerCase() as "platinum" | "gold" | "silver";
    return {
      id: sponsor.id,
      name: sponsor.name,
      logo: sponsor.logoUrl || sponsor.logo_url || `https://images.unsplash.com/photo-1622543925917-763c34f1f161?w=100&sig=${index % 10}`,
      image: sponsor.image || `https://images.unsplash.com/photo-1771764678001-aa0f28e90f7f?w=400&sig=${index % 10}`,
      industry: sponsor.industry || "General Sponsor",
      tier,
      eventsSponsored: 0,
      website_url: sponsor.website_url || sponsor.websiteUrl || null,
      websiteUrl: sponsor.websiteUrl || sponsor.website_url || null,
    };
  });

  /**
   * SYNCHRONIZED DATA TRANSFORMATIONS
   * ==================================
   * Transform Digital Platform data structures to Super App format.
   * This ensures real-time synchronization between admin/organizer views
   * and public-facing Super App displays.
   */
  
  // MATCHES: Transform batch/match data from Digital Platform
  const matches: Match[] = MOCK_BATCHES.slice(0, 10).flatMap(batch => 
    batch.matches.slice(0, 3).map(match => {
      const fighterAClub = MOCK_CLUBS.find(c => c.id === match.fighterA.clubId);
      const fighterBClub = MOCK_CLUBS.find(c => c.id === match.fighterB.clubId);
      
      return {
        id: match.id,
        eventName: batch.eventName,
        fighterA: {
          name: match.fighterA.name,
          image: typeof match.fighterA.image === 'string' ? match.fighterA.image : "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600",
          record: match.fighterA.record,
          weight: match.fighterA.weight,
          club: fighterAClub?.name || match.fighterA.clubName || "Unknown Club"
        },
        fighterB: {
          name: match.fighterB.name,
          image: typeof match.fighterB.image === 'string' ? match.fighterB.image : "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600",
          record: match.fighterB.record,
          weight: match.fighterB.weight,
          club: fighterBClub?.name || match.fighterB.clubName || "Unknown Club"
        },
        date: match.date || batch.date,
        time: "20:00", // Default time
        venue: batch.location,
        rounds: match.rounds,
        agreedWeight: (match.fighterA.weight + match.fighterB.weight) / 2,
        status: match.status === "Completed" ? "Completed" : 
                match.status === "Ready" ? "Ready to Fight" : 
                match.status === "In Progress" ? "In Progress" : "Scheduled",
        ...(match.result && {
          result: {
            winner: match.result.winner,
            method: match.result.method,
            round: match.result.round,
            time: match.result.time
          }
        })
      };
    })
  );

  const subscriptionPlans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      features: [
        "Access to news & articles",
        "Fighter profiles",
        "Event calendar",
        "Shop access",
        "Standard support"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 9.99,
      features: [
        "All Free features",
        "Exclusive video content",
        "Early event access",
        "10% shop discount",
        "Ad-free experience",
        "Priority support"
      ],
      popular: true
    },
    {
      id: "vip",
      name: "VIP",
      price: 24.99,
      features: [
        "All Premium features",
        "Live streaming access",
        "Behind-the-scenes content",
        "20% shop discount",
        "Meet & greet events",
        "Exclusive merchandise",
        "VIP support"
      ]
    }
  ];

  // Shopping Functions
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success("Quantity updated in cart");
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast.success("Added to cart");
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success("Removed from cart");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const checkoutOrder = () => {
    const total = cart.reduce((sum, item) => {
      const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
      return sum + price * item.quantity;
    }, 0);
    
    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      toast.error("Please fill in all shipping information");
      return;
    }

    const pointsNeeded = Math.floor(total * 10);
    
    if (deductBalance(pointsNeeded, `Purchase: ${cart.length} items`, "purchase")) {
      const orderItems = cart.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.discount ? item.price * (1 - item.discount / 100) : item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const orderId = createOrder(orderItems, shippingInfo, total);
      
      setCart([]);
      setShippingInfo({ fullName: "", address: "", city: "", phone: "" });
      toast.success(`Order placed successfully! Order #${orderId}`);
      handleSectionChange("orders");
    } else {
      toast.error("Insufficient balance. Please add more points.");
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
    return sum + price * item.quantity;
  }, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products
  const filteredProducts = products.filter(p =>
    (selectedCategory === "all" || p.category === selectedCategory) &&
    (searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter fighters based on search
  const searchFilteredFighters = fighters.filter(fighter => {
    if (searchQuery === "") return true;
    const searchLower = searchQuery.toLowerCase();
    return (fighter.name?.toLowerCase().includes(searchLower) || false) ||
           (fighter.gym?.toLowerCase().includes(searchLower) || false);
  });

  // Filter events based on search
  const searchFilteredEvents = events.filter(event => {
    if (searchQuery === "") return true;
    const searchLower = searchQuery.toLowerCase();
    return (event.name?.toLowerCase().includes(searchLower) || false) ||
           (event.venue?.toLowerCase().includes(searchLower) || false);
  });

  // Combined search results based on active search filter
  const getSearchResults = () => {
    if (searchQuery === "") return null;

    switch (searchFilter) {
      case "fighters":
        return { type: "fighters", results: searchFilteredFighters };
      case "events":
        return { type: "events", results: searchFilteredEvents };
      case "products":
        return { type: "products", results: filteredProducts };
      case "all":
      default:
        return {
          type: "all",
          results: {
            fighters: searchFilteredFighters.slice(0, 4),
            events: searchFilteredEvents.slice(0, 4),
            products: filteredProducts.slice(0, 4)
          }
        };
    }
  };

  // Render Functions
  const renderHome = () => (
    <div className="space-y-8">
      <HeroSection 
        onExploreFighters={() => handleSectionChange("fighters")}
        onViewEvents={() => {
          handleSectionChange("news-events");
          setNewsEventsTab("events");
        }}
      />

      <SponsorsSection 
        sponsors={sponsors}
        onViewAllClick={() => {
          handleSectionChange("strategic-partners");
          setStrategicPartnersTab("sponsors");
        }}
      />
      <TrendingFightersSection 
        fighters={fighters}
        onViewAllClick={() => handleSectionChange("fighters")}
        onFighterClick={(fighterId) => {
          const f = fighters.find(x => x.id === fighterId);
          navigate(`/fighters/${f ? getFighterSlug(f) : fighterId}`);
        }}
      />
      {/* Upcoming Events Section */}
      <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-lg overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#0A3D91]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-500/5 to-transparent rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-600/10 to-green-700/10 rounded-full border border-green-600/20">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-xs font-black text-green-600 uppercase tracking-wider">Coming Soon</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Upcoming Events</h2>
            <p className="text-gray-600 font-medium">Don't miss these exciting championship matches</p>
          </div>
          <button
            onClick={() => {
              handleSectionChange("news-events");
              setNewsEventsTab("events");
            }}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl font-black text-sm text-gray-700 transition-all border border-gray-300 hover:shadow-lg"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.slice(0, 2).map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-500 border-2 border-gray-200 hover:border-[#0A3D91] cursor-pointer hover:-translate-y-2"
            >
              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4">
                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-xl border-2 border-white text-xs font-black uppercase ${
                    event.status === 'upcoming' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' :
                    event.status === 'live' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' :
                    event.status === 'completed' ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white' :
                    'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  }`}>
                    {event.status === 'upcoming' ? 'Upcoming' : event.status}
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-white to-gray-50">
                <h3 className="text-xl font-black text-gray-900 mb-4 line-clamp-2 group-hover:text-[#0A3D91] transition-colors">
                  {event.name}
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-[#0A3D91]/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#0A3D91]" />
                    </div>
                    <span className="font-semibold">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-[#0A3D91]/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#0A3D91]" />
                    </div>
                    <span className="line-clamp-1 font-semibold">{event.venue}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEventId(event.id);
                  }}
                  className="relative w-full px-4 py-3 bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white rounded-xl font-black text-sm uppercase tracking-wider hover:shadow-xl hover:shadow-[#0A3D91]/30 transition-all group/btn overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1565C0] to-[#0A3D91] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </button>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden mt-6 text-center">
          <button
            onClick={() => {
              handleSectionChange("news-events");
              setNewsEventsTab("events");
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl font-black text-sm text-gray-700 transition-all border border-gray-300 hover:shadow-lg"
          >
            View All Events <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Events & Streaming Section */}
      <div className="relative bg-gradient-to-br from-[#1A1A24] via-[#051C42] to-[#0A3D91] rounded-3xl p-4 md:p-6 overflow-hidden border-2 border-white/10 shadow-2xl">
        {/* Background texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8102E]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F2C94C]/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C8102E] to-red-600 rounded-xl flex items-center justify-center shadow-xl animate-pulse">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-1">Live Events & Streaming</h2>
                <p className="text-sm text-white/80 font-medium">Watch Kun Khmer matches live and on-demand</p>
              </div>
            </div>
            <button
              onClick={() => {
                handleSectionChange("strategic-partners");
                setStrategicPartnersTab("broadcasts");
              }}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl text-sm font-black text-white transition-all border border-white/20 hover:border-white/40"
            >
              All Broadcasts <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Live Now Banner */}
          <div className="mb-6 bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-2xl p-6 border-2 border-red-400/30 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 px-3 py-1 bg-white rounded-full text-red-600 text-xs font-black uppercase shadow-lg animate-pulse">
                    LIVE
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">Championship Night - Round 3</h3>
                  <p className="text-sm text-white/90 font-medium">Broadcasting now on {broadcastStations[0]?.name || "Official Channel"}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white/90">
                      <Eye className="w-3.5 h-3.5" />
                      12.4K viewers
                    </span>
                    <span className="text-white/60">•</span>
                    <span className="text-xs font-bold text-white/90">Started 45 min ago</span>
                  </div>
                </div>
              </div>
              <button className="w-full md:w-auto px-8 py-4 bg-white text-red-600 rounded-xl font-black text-base hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </button>
            </div>
          </div>

          {/* Upcoming Streams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upcoming Stream 1 */}
            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                <img
                  src={events[1]?.image || eventPosterImage}
                  alt="Event"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Stream Time Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1.5 bg-[#0A3D91]/90 backdrop-blur-sm text-white text-xs font-black uppercase rounded-lg shadow-lg border border-blue-400/30">
                    Tomorrow 8PM
                  </span>
                </div>

                {/* Duration Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white rounded-lg border border-white/20">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">2.5 hrs</span>
                </div>

                {/* Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="w-8 h-8 text-[#0A3D91] fill-current ml-1" />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h4 className="text-base font-black text-white mb-2 line-clamp-1 group-hover:text-[#F2C94C] transition-colors">
                  Warriors of Angkor Championship
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  <Tv className="w-4 h-4 text-[#C8102E]" />
                  <span className="text-sm text-white/70 font-medium line-clamp-1">{broadcastStations[0]?.name || "Official Channel"}</span>
                </div>
                <button className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all border border-white/20 hover:border-white/40">
                  Set Reminder
                </button>
              </div>
            </div>

            {/* Upcoming Stream 2 */}
            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                <img
                  src={events[2]?.image || eventPosterImage}
                  alt="Event"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1.5 bg-[#C8102E]/90 backdrop-blur-sm text-white text-xs font-black uppercase rounded-lg shadow-lg border border-red-400/30">
                    Friday 7PM
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white rounded-lg border border-white/20">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">3 hrs</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="w-8 h-8 text-[#C8102E] fill-current ml-1" />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h4 className="text-base font-black text-white mb-2 line-clamp-1 group-hover:text-[#F2C94C] transition-colors">
                  National Tournament Finals
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  <Tv className="w-4 h-4 text-[#C8102E]" />
                  <span className="text-sm text-white/70 font-medium line-clamp-1">{broadcastStations[1]?.name || "Sports Network"}</span>
                </div>
                <button className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all border border-white/20 hover:border-white/40">
                  Set Reminder
                </button>
              </div>
            </div>

            {/* Broadcast Partners Info */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tv className="w-6 h-6 text-[#F2C94C]" />
                  <h4 className="text-lg font-black text-white">Official Broadcast Partners</h4>
                </div>
                <p className="text-sm text-white/70 font-medium mb-6 leading-relaxed">
                  Watch live on our official TV and streaming networks broadcasting Kun Khmer events worldwide
                </p>

                {/* Partner Logos */}
                <div className="space-y-3 mb-6">
                  {broadcastStations.slice(0, 2).map((station) => (
                    <div key={station.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src={station.logo} alt={station.name} className="w-8 h-8 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white line-clamp-1">{station.name}</p>
                        <p className="text-xs text-white/60 line-clamp-1">{station.eventsCount} events broadcast</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  handleSectionChange("strategic-partners");
                  setStrategicPartnersTab("broadcasts");
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#F2C94C] to-yellow-600 text-[#1A1A24] rounded-xl font-black text-sm hover:shadow-xl hover:shadow-yellow-600/30 transition-all flex items-center justify-center gap-2 group"
              >
                View All Partners
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Latest News Section */}
      <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-lg overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#F2C94C]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#0A3D91]/5 to-transparent rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#F2C94C]/10 to-yellow-600/10 rounded-full border border-[#F2C94C]/20">
                <BookOpen className="w-4 h-4 text-[#F2C94C]" />
                <span className="text-xs font-black text-yellow-700 uppercase tracking-wider">Latest Updates</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Latest News</h2>
            <p className="text-gray-600 font-medium">Stay updated with the latest stories from Kun Khmer</p>
          </div>
          <button
            onClick={() => {
              handleSectionChange("news-events");
              setNewsEventsTab("news");
            }}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl font-black text-sm text-gray-700 transition-all border border-gray-300 hover:shadow-lg"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsArticles.slice(0, 2).map((article) => (
            <div
              key={article.id}
              className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-2 transition-all duration-500 border-2 border-gray-200 hover:border-[#F2C94C] cursor-pointer flex flex-col"
            >
              {/* Article Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-100 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Featured Badge */}
                {article.featured && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-[#C8102E] to-red-700 text-white text-xs font-black uppercase rounded-full shadow-xl border border-white/30">
                      Featured
                    </span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase shadow-xl border-2 backdrop-blur-sm ${
                    article.category === 'Events' ? 'bg-[#0A3D91]/90 text-white border-blue-400/50' :
                    article.category === 'News' ? 'bg-green-600/90 text-white border-green-400/50' :
                    article.category === 'Training' ? 'bg-purple-600/90 text-white border-purple-400/50' :
                    article.category === 'Fighter Spotlight' ? 'bg-[#F2C94C]/90 text-gray-900 border-yellow-400/50' :
                    'bg-gray-600/90 text-white border-gray-400/50'
                  }`}>
                    {article.category}
                  </span>
                </div>

                {/* Date Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl">
                  <Calendar className="w-3.5 h-3.5 text-[#0A3D91]" />
                  <span className="text-xs font-black text-gray-900">
                    {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#0A3D91] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">{article.excerpt}</p>
                
                <button className="mt-auto w-full px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-[#0A3D91] hover:to-blue-700 text-gray-700 hover:text-white rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                  <span>Read Article</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Decorative Corner */}
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-[#0A3D91]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-[50px]" />
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden mt-6 text-center">
          <button
            onClick={() => {
              handleSectionChange("news-events");
              setNewsEventsTab("news");
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl font-black text-sm text-gray-700 transition-all border border-gray-300 hover:shadow-lg"
          >
            View All News <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );

  const renderClubDetail = () => {
    if (!selectedClubId) return null;

    const club = clubs.find(c => c.id === selectedClubId);
    if (!club) return null;

    // Filter fighters from this club
    const clubFighters = fighters.filter(f => f.clubId === selectedClubId);

    return (
      <ClubDetailPage
        club={club}
        fighters={clubFighters}
        onBack={() => {
          setCurrentSection("strategic-partners");
          setStrategicPartnersTab("clubs");
          navigate("/strategic-partners");
        }}
        onFighterClick={(fighterId) => {
          const f = fighters.find(x => x.id === fighterId);
          navigate(`/fighters/${f ? getFighterSlug(f) : fighterId}`);
        }}
      />
    );
  };
  const renderNewsEvents = () => {
    const filteredNews = newsArticles.filter(article => {
      const matchesCategory = newsCategoryFilter === "All" || article.category === newsCategoryFilter;
      const matchesSearch = newsSearchQuery.trim() === "" || 
        article.title.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(newsSearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    const filteredMedia = mediaContent.filter(media => {
      const matchesCategory = mediaCategoryFilter === "All" || media.category === mediaCategoryFilter;
      const matchesFighter = mediaFighterFilter === "All" || media.fighterId === mediaFighterFilter;
      const matchesSearch = mediaSearchQuery.trim() === "" || 
        media.title.toLowerCase().includes(mediaSearchQuery.toLowerCase());
      return matchesCategory && matchesFighter && matchesSearch;
    });

    return (
      <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0A3D91] to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">News & Media</h2>
              <p className="text-base text-gray-600 font-semibold mt-1">Stay updated with latest stories and exclusive content</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <Sparkles className="w-5 h-5 text-[#F2C94C]" />
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-500">Updates</p>
              <p className="text-lg font-black leading-none text-gray-900">{newsArticles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tabs Above Content */}
      <div className="relative -mb-4">
        <div className="flex items-center justify-start gap-1 relative z-10">
          {/* News Tab */}
          <button
            onClick={() => setNewsEventsTab("news")}
            className={`group relative px-8 py-4 transition-all duration-300 flex items-center gap-3 ${
              newsEventsTab === "news"
                ? "bg-white text-gray-900 rounded-t-xl"
                : "bg-white/40 text-gray-500 hover:bg-white/60 rounded-t-xl"
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
              newsEventsTab === "news"
                ? "bg-[#0A3D91]/10"
                : "bg-gray-200/50"
            }`}>
              <BookOpen className={`w-4 h-4 ${newsEventsTab === "news" ? "text-[#0A3D91]" : ""}`} />
            </div>
            <span className={`font-bold text-xs tracking-wide uppercase ${newsEventsTab === "news" ? "text-gray-900" : ""}`}>Latest News</span>
            {newsArticles.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-[#0A3D91] text-[10px] font-black rounded-full">
                {newsArticles.length}
              </span>
            )}
          </button>

          {/* Media Tab */}
          <button
            onClick={() => setNewsEventsTab("media")}
            className={`group relative px-8 py-4 transition-all duration-300 flex items-center gap-3 ${
              newsEventsTab === "media"
                ? "bg-white text-gray-900 rounded-t-xl"
                : "bg-white/40 text-gray-500 hover:bg-white/60 rounded-t-xl"
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
              newsEventsTab === "media"
                ? "bg-yellow-500/10"
                : "bg-gray-200/50"
            }`}>
              <Video className={`w-4 h-4 ${newsEventsTab === "media" ? "text-yellow-600" : ""}`} />
            </div>
            <span className={`font-bold text-xs tracking-wide uppercase ${newsEventsTab === "media" ? "text-gray-900" : ""}`}>Media Hub</span>
            {mediaContent.length > 0 && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-black rounded-full">
                {mediaContent.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {newsEventsTab === "news" && !selectedArticle && (
        <div className="bg-white rounded-2xl rounded-tl-none p-6 md:p-8 border border-gray-100">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search latest stories, announcements or events..."
                value={newsSearchQuery}
                onChange={(e) => {
                  setNewsSearchQuery(e.target.value);
                  setNewsCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-[#0A3D91] rounded-xl text-sm font-semibold focus:outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            
            {/* Category Select Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category:</span>
              <div className="relative">
                <select
                  value={newsCategoryFilter}
                  onChange={(e) => {
                    setNewsCategoryFilter(e.target.value);
                    setNewsCurrentPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:border-[#0A3D91] transition-all text-gray-700 cursor-pointer min-w-[180px]"
                >
                  <option value="All">All News Categories</option>
                  {["News", "Events", "Training", "Fighter Spotlight", "Official Announcement"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold text-sm">No articles match your search criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredNews.slice((newsCurrentPage - 1) * newsPerPage, newsCurrentPage * newsPerPage).map((article, index) => {
                  return (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="group bg-white rounded-2xl border border-slate-100 hover:border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                    >
                      {/* Article Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                        
                        {/* Category overlay */}
                        <div className="absolute top-4 left-4">
                          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-white/20 text-gray-900 rounded-lg text-[10px] font-black uppercase shadow-sm tracking-wider">
                            {article.category}
                          </span>
                        </div>

                        {article.featured && (
                          <div className="absolute top-4 right-4">
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-[#C8102E] text-white text-[10px] font-black uppercase rounded-lg shadow-sm">
                              <Star className="w-3 h-3 fill-white" />
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Article Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Header info */}
                          <div className="flex items-center gap-2.5 text-[11px] text-gray-400 font-semibold mb-2.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {article.author}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-gray-900 leading-snug mb-2 group-hover:text-[#0A3D91] transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#0A3D91] uppercase tracking-wider group-hover:underline flex items-center gap-1">
                            <span>Read Article</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                          <span className="text-gray-400 font-semibold">5 min read</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {filteredNews.length > newsPerPage && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setNewsCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={newsCurrentPage === 1}
                    className="px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.ceil(filteredNews.length / newsPerPage) }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setNewsCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                          newsCurrentPage === page
                            ? 'bg-[#0A3D91] text-white shadow-md'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setNewsCurrentPage(prev => Math.min(Math.ceil(filteredNews.length / newsPerPage), prev + 1))}
                    disabled={newsCurrentPage === Math.ceil(filteredNews.length / newsPerPage)}
                    className="px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Article Detail View - Inline */}
      {newsEventsTab === "news" && selectedArticle && (
        <div className="bg-white rounded-2xl rounded-tl-none border border-gray-100">
          {/* Back Button */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl text-gray-700 font-bold transition-all border border-gray-200 hover:border-[#0A3D91] shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Latest News</span>
            </button>
          </div>

          {/* Article Content */}
          <div className="p-6 md:p-8">
            {/* Article Header Image */}
            <div className="relative h-96 bg-gray-900 overflow-hidden rounded-2xl mb-8">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Category Badge */}
              <div className="absolute top-6 left-6">
                <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase shadow-xl backdrop-blur-sm ${
                  selectedArticle.category === 'Events' ? 'bg-[#0A3D91]/95 text-white' :
                  selectedArticle.category === 'News' ? 'bg-green-600/95 text-white' :
                  selectedArticle.category === 'Training' ? 'bg-purple-600/95 text-white' :
                  selectedArticle.category === 'Fighter Spotlight' ? 'bg-[#F2C94C]/95 text-gray-900' :
                  'bg-gray-700/95 text-white'
                }`}>
                  {selectedArticle.category}
                </span>
              </div>

              {/* Featured Badge */}
              {selectedArticle.featured && (
                <div className="absolute top-6 right-6">
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#C8102E] to-red-700 text-white text-sm font-black uppercase rounded-lg shadow-xl">
                    <Star className="w-4 h-4 fill-white" />
                    Featured
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              {selectedArticle.title}
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
                  <p className="text-base font-bold text-gray-900">{selectedArticle.author}</p>
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
                    {new Date(selectedArticle.date).toLocaleDateString('en-US', {
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
                  <p className="text-base font-bold text-gray-900">5 min read</p>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none mb-12">
              {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg text-gray-700 leading-relaxed mb-6 font-normal">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Share Section */}
            <div className="pt-8 border-t-2 border-gray-100 mb-12">
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

            {/* Related Articles */}
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0A3D91] to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">Read More</h2>
                  <p className="text-base text-gray-600 font-semibold mt-1">Other latest news</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsArticles.filter(a => a.id !== selectedArticle.id).map((relatedArticle) => (
                  <button
                    key={relatedArticle.id}
                    onClick={() => setSelectedArticle(relatedArticle)}
                    className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-[#0A3D91]/30 text-left"
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
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {newsEventsTab === "media" && (
        <div className="bg-white rounded-2xl rounded-tl-none p-6 md:p-8 border border-gray-100">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos, highlights or interviews..."
                value={mediaSearchQuery}
                onChange={(e) => {
                  setMediaSearchQuery(e.target.value);
                  setMediaCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-yellow-600 rounded-xl text-sm font-semibold focus:outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            
            {/* Category Select & Fighter Select */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              {/* Category Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category:</span>
                <div className="relative">
                  <select
                    value={mediaCategoryFilter}
                    onChange={(e) => {
                      setMediaCategoryFilter(e.target.value);
                      setMediaCurrentPage(1);
                    }}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:border-yellow-600 transition-all text-gray-700 cursor-pointer min-w-[180px]"
                  >
                    <option value="All">All Video Categories</option>
                    {["Highlights", "Full Fights", "Interviews", "Behind the Scenes", "Training & Workouts", "Documentary"].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-2 pointer-events-none text-gray-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Fighter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fighter:</span>
                <div className="relative">
                  <select
                    value={mediaFighterFilter}
                    onChange={(e) => {
                      setMediaFighterFilter(e.target.value);
                      setMediaCurrentPage(1);
                    }}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:border-yellow-600 transition-all text-gray-700 cursor-pointer min-w-[160px]"
                  >
                    <option value="All">All Fighters</option>
                    {fightersList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-2 pointer-events-none text-gray-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold text-sm">No videos match your search criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredMedia.slice((mediaCurrentPage - 1) * mediaPerPage, mediaCurrentPage * mediaPerPage).map((media) => {
                  return (
                    <div
                      key={media.id}
                      onClick={() => setSelectedVideo(media)}
                      className="group bg-white rounded-2xl border border-slate-100 hover:border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={media.thumbnail}
                          alt={media.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-550 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        
                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-5 h-5 text-[#C8102E] ml-0.5 fill-[#C8102E]" />
                          </div>
                        </div>

                        {/* Duration overlay badge */}
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/75 text-white text-[10px] font-bold rounded">
                          {media.duration}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-base font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-[#0A3D91] transition-colors mb-4">
                            {media.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[11px] text-gray-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {media.date}
                          </span>
                          <span className="flex items-center gap-1 text-[#0A3D91]">
                            <Eye className="w-3.5 h-3.5" />
                            {media.views} views
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {filteredMedia.length > mediaPerPage && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setMediaCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={mediaCurrentPage === 1}
                    className="px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.ceil(filteredMedia.length / mediaPerPage) }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setMediaCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                          mediaCurrentPage === page
                            ? 'bg-[#0A3D91] text-white shadow-md'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setMediaCurrentPage(prev => Math.min(Math.ceil(filteredMedia.length / mediaPerPage), prev + 1))}
                    disabled={mediaCurrentPage === Math.ceil(filteredMedia.length / mediaPerPage)}
                    className="px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20 hover:border-white/40"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Video Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-white/10">
              <h3 className="text-xl font-black text-white pr-12">{selectedVideo.title}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">{selectedVideo.date}</span>
              </div>
            </div>

            {/* YouTube Video */}
            <div className="relative aspect-video bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

  const renderClubs = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Partner Clubs</h2>
          <p className="text-gray-500">Explore official Kun Khmer training clubs and gyms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div
            key={club.id}
            className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
          >
            <div className="relative h-48 overflow-hidden bg-gray-200">
              <img
                src={club.image}
                alt={club.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  club.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {club.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{club.name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-[#C8102E]" />
                  <span className="line-clamp-1">{club.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-[#0A3D91]" />
                  <span>{club.activeFighters} Active Fighters</span>
                </div>
              </div>
              <Link to={`/clubs/${club.id}`} className="block w-full">
                <button className="w-full py-2.5 bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all">
                  View Club Details
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBroadcasts = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Broadcast Partners</h2>
          <p className="text-gray-500">Official TV & streaming networks broadcasting Kun Khmer</p>
        </div>
      </div>

      {/* Broadcast Partners Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Broadcast Partners</h2>
            </div>
            <p className="text-base text-gray-500 ml-13">Official TV & streaming networks</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {broadcastStations.map((station) => (
            <div
              key={station.id}
              className="group bg-white rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:bg-[#0A3D91] transition-colors">
                  <img src={station.logo} alt={station.name} className="w-12 h-12 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-[#0A3D91] transition-colors">{station.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{station.description}</p>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#0A3D91]" />
                    <span className="text-sm font-bold text-gray-700">{station.eventsCount} Events Broadcast</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Highlights Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Fight Highlights</h2>
            </div>
            <p className="text-base text-gray-500 ml-13">Watch the best moments</p>
          </div>
          <button
            onClick={() => handleSectionChange("media")}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm text-gray-700 transition-all"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="group bg-gradient-to-b from-gray-50 to-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 cursor-pointer"
            >
              <div className="relative aspect-video bg-gray-200 overflow-hidden">
                <img
                  src={`https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&sig=${i}`}
                  alt="Video"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-300 shadow-2xl">
                    <Play className="w-7 h-7 text-[#C8102E] ml-1 fill-[#C8102E]" />
                  </div>
                </div>
                <span className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-bold rounded-lg">
                  12:34
                </span>
              </div>
              <div className="p-5">
                <h4 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
                  Championship Fight Highlights - Round {i}
                </h4>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>2.4M views</span>
                  <span>2 days ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFighters = () => {
    if (loadingFighters) {
      return (
        <div className="flex items-center justify-center min-h-[400px] py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3D91]"></div>
        </div>
      );
    }

    // Filter fighters based on selected type and search query
    const filteredFighters = fighters.filter(fighter => {
      // Type filter
      const matchesType = fighterTypeFilter === "all" || fighter.type === fighterTypeFilter;

      // Weight class filter
      const matchesWeight = selectedFighterWeightClass === "all" ||
        fighter.weight === selectedFighterWeightClass;

      // Club/Gym filter
      const matchesClub = selectedFighterClub === "all" ||
        fighter.gym === selectedFighterClub;

      // Grade filter
      const matchesGrade = selectedFighterGrade === "all" ||
        (selectedFighterGrade === "A" && fighter.verified) ||
        (selectedFighterGrade === "B" && !fighter.verified);

      // Search filter
      if (searchQuery !== "") {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          (fighter.name?.toLowerCase().includes(searchLower) || false) ||
          (fighter.gym?.toLowerCase().includes(searchLower) || false);

        return matchesType && matchesWeight && matchesClub && matchesGrade && matchesSearch;
      }

      return matchesType && matchesWeight && matchesClub && matchesGrade;
    });

    return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0A3D91] to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">All Fighters</h2>
              <p className="text-sm text-gray-600 font-medium">Official Kun Khmer Athletes</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0A3D91] to-blue-700 text-white rounded-xl shadow-md">
            <Trophy className="w-5 h-5" />
            <div className="text-left">
              <p className="text-xs font-semibold opacity-90">Total Athletes</p>
              <p className="text-lg font-black leading-none">{fighters.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fighters List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <FighterFilters
          fighters={fighters}
          fighterFilter={fighterFilter}
          setFighterFilter={setFighterFilter}
          selectedFighterWeightClass={selectedFighterWeightClass}
          setSelectedFighterWeightClass={setSelectedFighterWeightClass}
          selectedFighterClub={selectedFighterClub}
          setSelectedFighterClub={setSelectedFighterClub}
          selectedFighterGrade={selectedFighterGrade}
          setSelectedFighterGrade={setSelectedFighterGrade}
          isVisible={showFighterFilters}
          onToggleVisibility={() => setShowFighterFilters(!showFighterFilters)}
        />

        {/* Fighters Content */}
        <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Official Athletes
            </p>
            <p className="text-3xl font-black text-gray-900">
              {filteredFighters.length} <span className="text-lg font-bold text-gray-500">Fighters</span>
            </p>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFighters.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Fighters Found</h3>
            <p className="text-gray-600 mb-6">Try a different search term or filter</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFighterTypeFilter("all");
              }}
              className="px-6 py-2.5 bg-[#0A3D91] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredFighters.map((fighter) => (
          <Link
            to={`/fighters/${getFighterSlug(fighter)}`}
            key={fighter.id}
            className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#0A3D91]/50 cursor-pointer"
          >
            {/* Card Layout */}
            <div className="flex h-full">
              {/* Fighter Image - Left Side (45%) */}
              <div className="relative w-[45%] flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                  src={fighter.image}
                  alt={fighter.name}
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-white/10" />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 right-3 flex flex-col gap-2">
                  {fighter.verified && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#0A3D91] to-blue-700 rounded-lg shadow-lg w-fit">
                      <Zap className="w-3.5 h-3.5 text-white fill-white" />
                      <span className="text-xs font-black text-white uppercase">Verified</span>
                    </div>
                  )}
                  {fighter.championships > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#F2C94C] to-yellow-500 rounded-lg shadow-lg w-fit">
                      <Trophy className="w-3.5 h-3.5 text-gray-900" />
                      <span className="text-xs font-black text-gray-900">{fighter.championships}x Champion</span>
                    </div>
                  )}
                </div>

                {/* Weight Badge - Bottom */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                    <Weight className="w-4 h-4 text-[#0A3D91]" />
                    <span className="text-sm font-black text-gray-900">{fighter.weightClass} ({fighter.weight} kg)</span>
                  </div>
                </div>
              </div>

              {/* Fighter Info - Right Side (55%) */}
              <div className="relative w-[55%] p-6 flex flex-col justify-between">
                {/* Top Section */}
                <div>
                  {/* Fighter Name */}
                  <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-[#0A3D91] transition-colors">
                    {fighter.name}
                  </h3>

                  {/* Details */}
                  <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold truncate">{fighter.gym}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">{fighter.age} years old</span>
                    </div>
                  </div>

                  {/* Stats Grid - Horizontal */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-3 border border-green-200/50 text-center">
                      <p className="text-2xl font-black text-green-600 mb-0.5">{fighter.wins}</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Wins</p>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-3 border border-red-200/50 text-center">
                      <p className="text-2xl font-black text-red-600 mb-0.5">{fighter.losses}</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Losses</p>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-3 border border-yellow-200/50 text-center">
                      <p className="text-2xl font-black text-yellow-600 mb-0.5">{fighter.draws}</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Draws</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="space-y-3">

                  {/* View Profile Button */}
                  <button className="w-full px-5 py-3 bg-gradient-to-r from-[#0A3D91] to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn">
                    <span>View Profile</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Hover Accent */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#0A3D91] via-[#C8102E] to-[#F2C94C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          ))
        )}
      </div>
        </div>
      </div>
    </div>
    );
  };


  const renderStrategicPartners = () => {
    if (loadingPartners) {
      return (
        <div className="flex items-center justify-center min-h-[400px] py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3D91]"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Strategic Partners</h2>
        <p className="text-gray-500">Official partners supporting Kun Khmer</p>
      </div>

      {/* Floating Tabs Above Content */}
      <div className="relative -mb-4">
        <div className="flex items-center justify-start gap-1 relative z-10">
          {/* Clubs Tab */}
          <button
            onClick={() => setStrategicPartnersTab("clubs")}
            className={`group relative px-8 py-4 transition-all duration-300 flex items-center gap-3 ${
              strategicPartnersTab === "clubs"
                ? "bg-white text-gray-900 rounded-t-xl"
                : "bg-white/40 text-gray-500 hover:bg-white/60 rounded-t-xl"
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
              strategicPartnersTab === "clubs"
                ? "bg-[#0A3D91]/10"
                : "bg-gray-200/50"
            }`}>
              <Building2 className={`w-4 h-4 ${strategicPartnersTab === "clubs" ? "text-[#0A3D91]" : ""}`} />
            </div>
            <span className={`font-bold text-xs tracking-wide uppercase ${strategicPartnersTab === "clubs" ? "text-gray-900" : ""}`}>Clubs & Gyms</span>
          </button>

          {/* Broadcasts Tab */}
          <button
            onClick={() => setStrategicPartnersTab("broadcasts")}
            className={`group relative px-8 py-4 transition-all duration-300 flex items-center gap-3 ${
              strategicPartnersTab === "broadcasts"
                ? "bg-white text-gray-900 rounded-t-xl"
                : "bg-white/40 text-gray-500 hover:bg-white/60 rounded-t-xl"
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
              strategicPartnersTab === "broadcasts"
                ? "bg-purple-500/10"
                : "bg-gray-200/50"
            }`}>
              <Tv className={`w-4 h-4 ${strategicPartnersTab === "broadcasts" ? "text-purple-600" : ""}`} />
            </div>
            <span className={`font-bold text-xs tracking-wide uppercase ${strategicPartnersTab === "broadcasts" ? "text-gray-900" : ""}`}>Broadcast Partners</span>
          </button>

          {/* Sponsors Tab */}
          <button
            onClick={() => setStrategicPartnersTab("sponsors")}
            className={`group relative px-8 py-4 transition-all duration-300 flex items-center gap-3 ${
              strategicPartnersTab === "sponsors"
                ? "bg-white text-gray-900 rounded-t-xl"
                : "bg-white/40 text-gray-500 hover:bg-white/60 rounded-t-xl"
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
              strategicPartnersTab === "sponsors"
                ? "bg-yellow-500/10"
                : "bg-gray-200/50"
            }`}>
              <Handshake className={`w-4 h-4 ${strategicPartnersTab === "sponsors" ? "text-yellow-600" : ""}`} />
            </div>
            <span className={`font-bold text-xs tracking-wide uppercase ${strategicPartnersTab === "sponsors" ? "text-gray-900" : ""}`}>Official Sponsors</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {strategicPartnersTab === "clubs" && (
        <div className="bg-white rounded-2xl rounded-tl-none p-8 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <div
                key={club.id}
                onClick={() => {
                  setSelectedClubId(club.id);
                  setCurrentSection("club-detail");
                  navigate(`/club-detail`);
                }}
                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:-translate-y-1 hover:border-[#0A3D91]/30 cursor-pointer flex flex-col"
              >
                {/* Banner — full width, respects uploaded image proportions */}
                <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden flex-shrink-0">
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Status Badge — top left */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase backdrop-blur-sm border shadow ${
                      club.status === "active"
                        ? "bg-green-500/90 text-white border-white/30"
                        : "bg-gray-500/90 text-white border-white/30"
                    }`}>
                      {club.status}
                    </span>
                  </div>

                  {/* Rating — bottom right over banner */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                    <Star className="w-3.5 h-3.5 text-[#F2C94C] fill-[#F2C94C]" />
                    <span className="text-sm font-bold text-white">{club.rating}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-col gap-3 p-5 flex-1">
                  {/* Name & Location */}
                  <div>
                    <h3 className="text-base font-black text-gray-900 group-hover:text-[#0A3D91] transition-colors leading-tight line-clamp-2 mb-1">
                      {club.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-xs font-semibold truncate">{club.location}</span>
                    </div>
                  </div>

                  {/* Head Coach (left) + Active Fighters (right) — one row */}
                  <div className="flex items-stretch gap-2">
                    {/* Head Coach */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0A3D91]/10 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-[#0A3D91]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Head Coach</p>
                        <p className="text-xs font-black text-gray-900 truncate">
                          {club.headCoach || <span className="text-gray-300 font-medium italic">—</span>}
                        </p>
                      </div>
                    </div>
                    {/* Active Fighters */}
                    <div className="flex flex-col items-center justify-center px-3 py-2 bg-gradient-to-b from-[#0A3D91]/5 to-blue-50 rounded-xl border border-[#0A3D91]/10 flex-shrink-0 min-w-[64px]">
                      <span className="text-xl font-black text-[#0A3D91] leading-none">{club.activeFighters}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 whitespace-nowrap">Fighters</span>
                    </div>
                  </div>

                  {/* View Details CTA */}
                  <div className="mt-auto pt-1">
                    <div className="w-full py-2.5 bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-wider text-center group-hover:shadow-lg group-hover:shadow-[#0A3D91]/30 transition-all relative overflow-hidden">
                      <span className="relative z-10">View Details</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {strategicPartnersTab === "broadcasts" && (
        <div className="bg-white rounded-2xl rounded-tl-none rounded-tr-none p-8 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {broadcastStations.map((station) => (
              <div
                key={station.id}
                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-purple-100 hover:-translate-y-1 hover:border-purple-300/50 cursor-pointer flex flex-col"
              >
                {/* Banner */}
                <div className="relative w-full aspect-[16/9] bg-purple-900 overflow-hidden flex-shrink-0">
                  <img
                    src={station.image}
                    alt={station.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded-full shadow">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[11px] font-black text-white uppercase">Live</span>
                  </div>
                  {/* Logo — bottom right */}
                  <div className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-purple-100 overflow-hidden">
                    <img src={station.logo} alt={station.name} className="w-full h-full object-contain p-1" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-col gap-3 p-5 flex-1">
                  <div>
                    <h3 className="text-base font-black text-gray-900 group-hover:text-purple-600 transition-colors leading-tight line-clamp-1 mb-1">
                      {station.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{station.description}</p>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="text-xs font-bold text-gray-600">Events Broadcast</span>
                    <span className="text-base font-black text-purple-600">{station.eventsCount}</span>
                  </div>

                  <div className="mt-auto pt-1">
                    <div className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-wider text-center group-hover:shadow-lg group-hover:shadow-purple-600/30 transition-all relative overflow-hidden">
                      <span className="relative z-10">View Schedule</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {strategicPartnersTab === "sponsors" && (
        <div className="bg-white rounded-2xl rounded-tr-none p-8 border border-gray-100">
          <div className="space-y-8">
            {/* Tier helper */}
            {(['platinum', 'gold', 'silver', 'bronze'] as const).map((tier) => {
              const tierSponsors = sponsors.filter(s => s.tier === tier);
              if (tierSponsors.length === 0) return null;
              const tierMeta: Record<string, { label: string; badge: string; btn: string; stat: string; border: string }> = {
                platinum: { label: 'Platinum', badge: 'from-slate-400 to-slate-500', btn: 'from-slate-600 to-slate-700', stat: 'bg-slate-50 border-slate-200 text-slate-700', border: 'border-slate-200 hover:border-slate-400/60' },
                gold:     { label: 'Gold',     badge: 'from-amber-400 to-yellow-500', btn: 'from-amber-500 to-yellow-600', stat: 'bg-amber-50 border-amber-100 text-amber-700', border: 'border-amber-200 hover:border-amber-400/60' },
                silver:   { label: 'Silver',   badge: 'from-gray-300 to-gray-400',   btn: 'from-gray-500 to-gray-600',   stat: 'bg-gray-50 border-gray-200 text-gray-600',   border: 'border-gray-200 hover:border-gray-400/50'  },
                bronze:   { label: 'Bronze',   badge: 'from-orange-400 to-amber-600', btn: 'from-orange-500 to-amber-700', stat: 'bg-orange-50 border-orange-100 text-orange-700', border: 'border-orange-200 hover:border-orange-400/60' },
              };
              const m = tierMeta[tier];
              return (
                <div key={tier}>
                  {/* Tier heading */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${m.badge} rounded-full shadow`}>
                      <Crown className="w-4 h-4 text-white" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">{m.label} Sponsors</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  {/* Cards grid — same portrait pattern as Clubs & Gyms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tierSponsors.map((sponsor) => (
                      <div
                        key={sponsor.id}
                        className={`group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border hover:-translate-y-1 cursor-pointer flex flex-col ${m.border}`}
                      >
                        {/* Banner */}
                        <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden flex-shrink-0">
                          <img
                            src={sponsor.image}
                            alt={sponsor.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          {/* Tier badge */}
                          <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${m.badge} shadow`}>
                            <Crown className="w-3 h-3 text-white" />
                            <span className="text-[11px] font-black text-white uppercase">{m.label}</span>
                          </div>
                          {/* Logo — bottom right */}
                          <div className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-white/60 overflow-hidden">
                            <img src={sponsor.logo} alt={sponsor.name} className="w-full h-full object-contain p-1" />
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="flex flex-col gap-3 p-5 flex-1">
                          <div>
                            <h3 className="text-base font-black text-gray-900 group-hover:text-[#0A3D91] transition-colors leading-tight line-clamp-1 mb-1">
                              {sponsor.name}
                            </h3>
                            <p className="text-xs text-gray-400 truncate">{sponsor.industry}</p>
                          </div>

                          <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${m.stat}`}>
                            <span className="text-xs font-bold">Events Sponsored</span>
                            <span className="text-base font-black">{sponsor.eventsSponsored}</span>
                          </div>

                          <div className="mt-auto pt-1">
                            <div className={`w-full py-2.5 bg-gradient-to-r ${m.btn} text-white rounded-xl font-black text-xs uppercase tracking-wider text-center group-hover:shadow-lg transition-all relative overflow-hidden`}>
                              <span className="relative z-10">View Details</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
  };

  const renderSponsors = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Official Sponsors</h2>
          <p className="text-gray-500">Leading brands supporting Kun Khmer</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl p-6 text-white">
          <Crown className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-3xl font-black mb-1">{sponsors.filter(s => s.tier === 'platinum').length}</p>
          <p className="text-sm opacity-90">Platinum</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-white">
          <Crown className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-3xl font-black mb-1">{sponsors.filter(s => s.tier === 'gold').length}</p>
          <p className="text-sm opacity-90">Gold</p>
        </div>
        <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-6 text-gray-700">
          <Star className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-3xl font-black mb-1">{sponsors.filter(s => s.tier === 'silver').length}</p>
          <p className="text-sm opacity-90">Silver</p>
        </div>
        <div className="bg-gradient-to-br from-[#0A3D91] to-blue-600 rounded-2xl p-6 text-white">
          <Handshake className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-black mb-1">{sponsors.reduce((sum, s) => sum + s.eventsSponsored, 0)}</p>
          <p className="text-sm opacity-90">Total Events</p>
        </div>
      </div>

      {/* Sponsors by Tier */}
      <div className="space-y-8">
        {/* Platinum Sponsors */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full">
              <Crown className="w-5 h-5 text-white" />
              <span className="text-sm font-black text-white uppercase">Platinum Sponsors</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sponsors.filter(s => s.tier === 'platinum').map((sponsor) => (
              <div
                key={sponsor.id}
                className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-300 hover:border-gray-400"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 group-hover:shadow-xl transition-all overflow-hidden">
                  <img src={sponsor.logo} alt={sponsor.name} className="w-20 h-20 object-contain" />
                </div>
                <h3 className="text-lg font-black text-gray-900 text-center mb-3">{sponsor.name}</h3>
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                    <Trophy className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-bold text-gray-700">{sponsor.eventsSponsored} Events</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gold Sponsors */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full">
              <Crown className="w-5 h-5 text-white" />
              <span className="text-sm font-black text-white uppercase">Gold Sponsors</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sponsors.filter(s => s.tier === 'gold').map((sponsor) => (
              <div
                key={sponsor.id}
                className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-yellow-200 hover:border-yellow-300"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 group-hover:shadow-xl transition-all overflow-hidden">
                  <img src={sponsor.logo} alt={sponsor.name} className="w-20 h-20 object-contain" />
                </div>
                <h3 className="text-lg font-black text-gray-900 text-center mb-3">{sponsor.name}</h3>
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-full">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-bold text-yellow-700">{sponsor.eventsSponsored} Events</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Silver Sponsors */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full">
              <Star className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-black text-gray-700 uppercase">Silver Sponsors</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sponsors.filter(s => s.tier === 'silver').map((sponsor) => (
              <div
                key={sponsor.id}
                className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 group-hover:shadow-xl transition-all overflow-hidden">
                  <img src={sponsor.logo} alt={sponsor.name} className="w-20 h-20 object-contain" />
                </div>
                <h3 className="text-lg font-black text-gray-900 text-center mb-3">{sponsor.name}</h3>
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                    <Trophy className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-bold text-gray-700">{sponsor.eventsSponsored} Events</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMatches = () => {
    // Show event detail if an event is selected
    if (selectedEventId && matchesEventsTab === "events") {
      return renderEventDetail();
    }

    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Matches & Events</h2>
          <p className="text-gray-500">Official Kun Khmer championship bouts and upcoming events</p>
        </div>
      </div>

      {/* Floating Tabs Above Content */}
      <div className="relative -mb-4">
        <div className="flex items-center justify-start gap-1 relative z-10">
          {/* Fight Matches Tab */}
          <button
            onClick={() => {
              setMatchesEventsTab("matches");
              setSelectedEventId(null);
              setMatchFilter("all");
              setSelectedWeightClass("all");
              setSelectedLocation("all");
            }}
            className={`group relative px-8 py-4 transition-all duration-300 flex items-center gap-3 ${
              matchesEventsTab === "matches"
                ? "bg-white text-gray-900 rounded-t-xl"
                : "bg-white/40 text-gray-500 hover:bg-white/60 rounded-t-xl"
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
              matchesEventsTab === "matches"
                ? "bg-[#0A3D91]/10"
                : "bg-gray-200/50"
            }`}>
              <Trophy className={`w-4 h-4 ${matchesEventsTab === "matches" ? "text-[#0A3D91]" : ""}`} />
            </div>
            <span className={`font-bold text-xs tracking-wide uppercase ${matchesEventsTab === "matches" ? "text-gray-900" : ""}`}>Fight Matches</span>
          </button>

          {/* All Matches Tab */}
          <button
            onClick={() => {
              setMatchesEventsTab("previous");
              setSelectedEventId(null);
              setPreviousMatchesPage(1);
              setMatchFilter("all");
              setSelectedWeightClass("all");
              setSelectedLocation("all");
              setSelectedMatchType("all");
            }}
            className={`group relative px-8 py-4 transition-all duration-300 flex items-center gap-3 ${
              matchesEventsTab === "previous"
                ? "bg-white text-gray-900 rounded-t-xl"
                : "bg-white/40 text-gray-500 hover:bg-white/60 rounded-t-xl"
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
              matchesEventsTab === "previous"
                ? "bg-[#0A3D91]/10"
                : "bg-gray-200/50"
            }`}>
              <Trophy className={`w-4 h-4 ${matchesEventsTab === "previous" ? "text-[#0A3D91]" : ""}`} />
            </div>
            <span className={`font-bold text-xs tracking-wide uppercase ${matchesEventsTab === "previous" ? "text-gray-900" : ""}`}>All Matches</span>
          </button>

          {/* Upcoming Events Tab */}
          <button
            onClick={() => {
              setMatchesEventsTab("events");
              setSelectedEventId(null);
            }}
            className={`group relative px-8 py-4 transition-all duration-300 flex items-center gap-3 ${
              matchesEventsTab === "events"
                ? "bg-white text-gray-900 rounded-t-xl"
                : "bg-white/40 text-gray-500 hover:bg-white/60 rounded-t-xl"
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
              matchesEventsTab === "events"
                ? "bg-[#0A3D91]/10"
                : "bg-gray-200/50"
            }`}>
              <Calendar className={`w-4 h-4 ${matchesEventsTab === "events" ? "text-[#0A3D91]" : ""}`} />
            </div>
            <span className={`font-bold text-xs tracking-wide uppercase ${matchesEventsTab === "events" ? "text-gray-900" : ""}`}>Upcoming Events</span>
          </button>
        </div>
      </div>

      {matchesEventsTab === "matches" && (
        <>
      <div className="bg-white rounded-2xl rounded-tr-xl border border-gray-200 shadow-sm">
        <MatchFilters
          batches={MOCK_BATCHES}
          matchFilter={matchFilter}
          setMatchFilter={setMatchFilter}
          selectedWeightClass={selectedWeightClass}
          setSelectedWeightClass={setSelectedWeightClass}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedMatchType={selectedMatchType}
          setSelectedMatchType={setSelectedMatchType}
          isVisible={showMatchFilters}
          onToggleVisibility={() => setShowMatchFilters(!showMatchFilters)}
        />

      {/* Batches & Fight Cards List */}
      <div className="p-6 md:p-8 space-y-8">
        {(() => {
          const filteredBatches = MOCK_BATCHES.slice(0, 10)
            .filter(batch => {
              if (batch.status !== 'Approved') return false;

              // Filter by location
              if (selectedLocation !== "all" && batch.location !== selectedLocation) {
                return false;
              }

              // Filter by weight class
              if (selectedWeightClass !== "all") {
                const hasMatchInWeightClass = batch.matches.some(m => m.weightClass === selectedWeightClass);
                if (!hasMatchInWeightClass) return false;
              }

              // Filter by match type
              if (selectedMatchType !== "all") {
                const hasMatchType = batch.matches.some(m => m.matchType === selectedMatchType);
                if (!hasMatchType) return false;
              }

              return true;
            });

          if (filteredBatches.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Matches Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
                <button
                  onClick={() => {
                    setSelectedWeightClass("all");
                    setSelectedLocation("all");
                    setSelectedMatchType("all");
                  }}
                  className="px-6 py-2.5 bg-[#0A3D91] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            );
          }

          return filteredBatches.map((batch) => (
          <MatchBatchCard
            key={batch.id}
            batch={batch}
            events={events}
            isExpanded={expandedBatches.has(batch.id)}
            onToggleExpansion={toggleBatchExpansion}
            onViewMatch={(matchId) => {
              setSelectedMatchId(matchId);
              handleSectionChange("match-detail");
            }}
            onViewDetails={(matchId) => {
              setSelectedMatchId(matchId);
              handleSectionChange("match-detail");
            }}
            variant="upcoming"
          />
          ));
        })()}

      </div>
      </div>
        </>
      )}

      {matchesEventsTab === "events" && (
        <>
          {/* Events List - Clean Professional Layout */}
          <div className="bg-white rounded-2xl rounded-tl-none p-6 md:p-8 border border-gray-100">
            <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className="group relative bg-gradient-to-br from-white to-gray-50/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-[#0A3D91]/30 cursor-pointer"
              >
                {/* Event Header with gradient background */}
                <div className="relative bg-gradient-to-r from-[#0A3D91] via-blue-700 to-blue-800 px-6 py-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Event Title & Date */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-white/90" />
                        <span className="text-sm font-bold text-white/90">
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-1 leading-tight">
                        {event.name}
                      </h3>
                      <p className="text-sm text-white/80 line-clamp-1">{event.description}</p>
                    </div>

                    {/* Status & Bout Count */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                        <Trophy className="w-4 h-4 text-white" />
                        <span className="text-sm font-black text-white">{event.matchesCount} Bouts</span>
                      </div>
                      <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase ${
                        event.status === 'upcoming' ? 'bg-green-500 text-white' :
                        event.status === 'live' ? 'bg-red-500 text-white animate-pulse' :
                        event.status === 'completed' ? 'bg-gray-700 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6">
                  {/* Event Details - Clean Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Venue */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Venue</span>
                        <p className="text-sm font-black text-gray-900 leading-tight">{event.venue}</p>
                      </div>
                    </div>

                    {/* Organizer */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Organizer</span>
                        <p className="text-sm font-black text-gray-900 leading-tight">{event.organizer}</p>
                      </div>
                    </div>

                    {/* Broadcast */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tv className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Broadcast</span>
                        <p className="text-sm font-black text-gray-900 leading-tight">{event.station}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sponsors Section */}
                  {event.sponsors && event.sponsors.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5 text-[#F2C94C]" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Official Sponsors</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.sponsors.map((sponsor, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-900 text-sm font-bold rounded-lg border border-gray-200">
                            {sponsor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Trophy className="w-4 h-4" />
                      <span className="font-bold">{event.matchesCount} championship bouts scheduled</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEventId(event.id);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0A3D91] to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Event</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#0A3D91] via-blue-600 to-[#C8102E] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
            </div>
          </div>
        </>
      )}

      {matchesEventsTab === "previous" && (
        <>
      <div className="bg-white rounded-2xl rounded-tr-xl border border-gray-200 shadow-sm">
        <MatchFilters
          batches={MOCK_BATCHES.filter(b => b.status === 'Completed')}
          matchFilter={matchFilter}
          setMatchFilter={setMatchFilter}
          selectedWeightClass={selectedWeightClass}
          setSelectedWeightClass={setSelectedWeightClass}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedMatchType={selectedMatchType}
          setSelectedMatchType={setSelectedMatchType}
          isVisible={showMatchFilters}
          onToggleVisibility={() => setShowMatchFilters(!showMatchFilters)}
        />

      {/* All Matches with Pagination */}
      <div className="p-6 md:p-8 space-y-8">
        {(() => {
          const completedBatches = MOCK_BATCHES.filter(batch => {
            if (batch.status !== 'Completed') return false;

            // Filter by location
            if (selectedLocation !== "all" && batch.location !== selectedLocation) {
              return false;
            }

            // Filter by weight class
            if (selectedWeightClass !== "all") {
              const hasMatchInWeightClass = batch.matches.some(m => m.weightClass === selectedWeightClass);
              if (!hasMatchInWeightClass) return false;
            }

            // Filter by match type
            if (selectedMatchType !== "all") {
              const hasMatchType = batch.matches.some(m => m.matchType === selectedMatchType);
              if (!hasMatchType) return false;
            }

            return true;
          });
          const totalPages = Math.ceil(completedBatches.length / previousMatchesPerPage);
          const paginatedBatches = completedBatches.slice(
            (previousMatchesPage - 1) * previousMatchesPerPage,
            previousMatchesPage * previousMatchesPerPage
          );

          return (
            <>
              {paginatedBatches.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-gray-900 mb-2">No Matches Found</h3>
                  <p className="text-gray-500">There are no matches matching your filters.</p>
                </div>
              ) : (
                <>
                  {paginatedBatches.map((batch) => (
                    <MatchBatchCard
                      key={batch.id}
                      batch={batch}
                      events={events}
                      isExpanded={expandedBatches.has(batch.id)}
                      onToggleExpansion={toggleBatchExpansion}
                      onViewMatch={(matchId) => {
                        setSelectedMatchId(matchId);
                        handleSectionChange("match-detail");
                      }}
                      onViewDetails={(matchId) => {
                        setSelectedMatchId(matchId);
                        handleSectionChange("match-detail");
                      }}
                      variant="previous"
                    />
                  ))}
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-8">
                      <button
                        onClick={() => setPreviousMatchesPage(prev => Math.max(1, prev - 1))}
                        disabled={previousMatchesPage === 1}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                          previousMatchesPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-[#0A3D91]'
                        }`}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setPreviousMatchesPage(page)}
                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                              previousMatchesPage === page
                                ? 'bg-[#0A3D91] text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-[#0A3D91]'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setPreviousMatchesPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={previousMatchesPage === totalPages}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                          previousMatchesPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-[#0A3D91]'
                        }`}
                      >
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          );
        })()}
      </div>
      </div>
        </>
      )}
    </div>
    );
  };

  const renderMatchDetail = () => {
    const match = matches.find(m => m.id === selectedMatchId);
    if (!match) return null;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => handleSectionChange("matches")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#0A3D91] font-bold transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          Back to Matches
        </button>

        {/* Match Hero Card */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Event Info */}
            <div className="text-center mb-8">
              <span className={`inline-block px-6 py-2 rounded-full text-sm font-bold uppercase mb-4 ${
                match.status === 'Ready to Fight' ? 'bg-green-500 text-white' :
                match.status === 'Scheduled' ? 'bg-blue-500 text-white' :
                match.status === 'Completed' ? 'bg-gray-500 text-white' :
                'bg-yellow-500 text-white'
              }`}>
                {match.status}
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-white mb-2">{match.eventName}</h1>
              <div className="flex items-center justify-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(match.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{match.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{match.venue}</span>
                </div>
              </div>
            </div>

            {/* Fighters Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Fighter A */}
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={match.fighterA.image}
                    alt={match.fighterA.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover ring-8 ring-[#0A3D91] mx-auto"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#0A3D91] rounded-full">
                    <span className="text-sm font-black text-white">CORNER A</span>
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{match.fighterA.name}</h2>
                <p className="text-white/80 mb-3">{match.fighterA.club}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="px-3 py-1 bg-white/10 text-white text-sm font-bold rounded-lg backdrop-blur-md">
                    {match.fighterA.record}
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-white text-sm font-bold rounded-lg backdrop-blur-md">
                    {match.fighterA.weight}kg
                  </span>
                </div>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 bg-gradient-to-br from-[#C8102E] to-red-600 rounded-full flex items-center justify-center shadow-2xl mb-4">
                  <span className="text-4xl font-black text-white">VS</span>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
                  <p className="text-3xl font-black text-white mb-1">{match.rounds}</p>
                  <p className="text-sm text-white/80 mb-2">Rounds</p>
                  <p className="text-lg font-bold text-[#F2C94C]">{match.agreedWeight}kg</p>
                </div>
              </div>

              {/* Fighter B */}
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={match.fighterB.image}
                    alt={match.fighterB.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover ring-8 ring-[#C8102E] mx-auto"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#C8102E] rounded-full">
                    <span className="text-sm font-black text-white">CORNER B</span>
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{match.fighterB.name}</h2>
                <p className="text-white/80 mb-3">{match.fighterB.club}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="px-3 py-1 bg-white/10 text-white text-sm font-bold rounded-lg backdrop-blur-md">
                    {match.fighterB.record}
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-white text-sm font-bold rounded-lg backdrop-blur-md">
                    {match.fighterB.weight}kg
                  </span>
                </div>
              </div>
            </div>

            {/* Result */}
            {match.result && (
              <div className="mt-8 pt-8 border-t border-white/20 text-center">
                <div className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl">
                  <p className="text-sm font-bold text-gray-900 uppercase mb-1">Winner</p>
                  <p className="text-3xl font-black text-gray-900 mb-1">{match.result.winner}</p>
                  <p className="text-sm text-gray-800">
                    {match.result.method} • Round {match.result.round} • {match.result.time}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Match Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fighter A Details */}
          <div className="bg-white rounded-2xl p-6 border-2 border-[#0A3D91]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#0A3D91] rounded-xl flex items-center justify-center">
                <span className="text-xl font-black text-white">A</span>
              </div>
              <h3 className="text-xl font-black text-gray-900">{match.fighterA.name}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-600">Record</span>
                <span className="text-sm font-black text-gray-900">{match.fighterA.record}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-600">Weight</span>
                <span className="text-sm font-black text-gray-900">{match.fighterA.weight}kg</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-600">Club</span>
                <span className="text-sm font-black text-gray-900">{match.fighterA.club}</span>
              </div>
            </div>
          </div>

          {/* Fighter B Details */}
          <div className="bg-white rounded-2xl p-6 border-2 border-[#C8102E]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#C8102E] rounded-xl flex items-center justify-center">
                <span className="text-xl font-black text-white">B</span>
              </div>
              <h3 className="text-xl font-black text-gray-900">{match.fighterB.name}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-600">Record</span>
                <span className="text-sm font-black text-gray-900">{match.fighterB.record}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-600">Weight</span>
                <span className="text-sm font-black text-gray-900">{match.fighterB.weight}kg</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-600">Club</span>
                <span className="text-sm font-black text-gray-900">{match.fighterB.club}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-xl font-black text-gray-900 mb-6">Match Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#0A3D91]" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Date & Time</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(match.date).toLocaleDateString()} • {match.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#C8102E]" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Venue</p>
                  <p className="text-sm font-bold text-gray-900">{match.venue}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-[#F2C94C]" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Match Format</p>
                  <p className="text-sm font-bold text-gray-900">{match.rounds} Rounds • {match.agreedWeight}kg</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                  <p className="text-sm font-bold text-gray-900">{match.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  const renderEventDetail = () => {
    const event = events.find(e => e.id === selectedEventId);
    if (!event) return null;

    // Get all batches for this event
    const eventBatches = MOCK_BATCHES.filter(batch => batch.eventName === event.name);
    const totalMatches = eventBatches.reduce((sum, batch) => sum + batch.matches.length, 0);

    return (
      <div className="space-y-8">
        {/* Back Button */}
        <button
          onClick={() => setSelectedEventId(null)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-white bg-white hover:bg-[#0A3D91] rounded-xl font-bold transition-all border border-gray-200 hover:border-[#0A3D91]"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Events
        </button>

        {/* Event Hero Section - Clean Design */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-[#0A3D91] via-blue-700 to-blue-800 px-6 md:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Event Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase ${
                    event.status === 'upcoming' ? 'bg-green-500 text-white' :
                    event.status === 'live' ? 'bg-red-500 text-white animate-pulse' :
                    event.status === 'completed' ? 'bg-gray-700 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {event.status}
                  </span>
                  {eventBatches.some(batch => batch.status === 'Completed') && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase bg-white/20 text-white border border-white/30">
                      Results Available
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                  {event.name}
                </h1>
                <p className="text-base text-white/90 leading-relaxed max-w-2xl">
                  {event.description}
                </p>
              </div>

              {/* Bout Count Badge */}
              <div className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Trophy className="w-8 h-8 text-white" />
                <div>
                  <p className="text-xs font-bold text-white/70 uppercase">Total Bouts</p>
                  <p className="text-3xl font-black text-white">{totalMatches}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 md:p-8">
            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Date</span>
                <p className="text-sm font-black text-gray-900">
                  {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Venue</span>
                <p className="text-sm font-black text-gray-900 leading-tight">{event.venue}</p>
              </div>
            </div>

            {/* Organizer */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Organizer</span>
                <p className="text-sm font-black text-gray-900 leading-tight">{event.organizer}</p>
              </div>
            </div>

            {/* Broadcast */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Broadcast</span>
                <p className="text-sm font-black text-gray-900 leading-tight">{event.station}</p>
              </div>
            </div>
          </div>

          {/* Sponsors Section */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-5 h-5 text-[#F2C94C]" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Official Sponsors</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.sponsors.map((sponsor, idx) => (
                  <span key={idx} className="px-4 py-2 bg-gray-50 text-gray-900 text-sm font-bold rounded-lg border border-gray-200">
                    {sponsor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fight Card */}
        {eventBatches.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
            {/* Fight Card Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 md:px-8 py-6 border-b-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C8102E] to-red-600 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">Official Fight Card</h2>
                    <p className="text-sm text-gray-600 font-semibold">{totalMatches} championship bouts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Batches List */}
            <div className="p-6 md:p-8 space-y-10">
              {eventBatches.map((batch, batchIdx) => (
                <div key={batch.id}>
                  {/* Batch Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="px-5 py-2.5 bg-gradient-to-r from-[#0A3D91] to-blue-700 text-white text-sm font-black rounded-xl shadow-md">
                        {batch.batchNumber}
                      </span>
                      <span className={`px-4 py-2 rounded-xl text-sm font-black ${
                        batch.status === 'Approved' ? 'bg-green-500 text-white' :
                        batch.status === 'Completed' ? 'bg-gray-700 text-white' :
                        'bg-yellow-500 text-gray-900'
                      }`}>
                        {batch.status}
                      </span>
                      <span className="text-sm text-gray-500 font-bold">• {batch.matches.length} Bouts</span>
                    </div>
                  </div>

                  {/* Matches List */}
                  <div className="space-y-5">
                    {batch.matches.map((match, idx) => {
                      const isCompleted = batch.status === 'Completed';
                      const hasWinner = isCompleted && match.winner;

                      return (
                        <div
                          key={match.id}
                          className="relative bg-white rounded-2xl border-2 border-gray-100 hover:border-[#0A3D91]/30 hover:shadow-lg transition-all overflow-hidden"
                        >
                          {/* Match Header */}
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="px-3 py-1.5 bg-[#0A3D91] text-white text-xs font-black rounded-lg">
                                  BOUT #{match.matchOrder}
                                </span>
                                <span className="text-sm font-black text-gray-900">{match.matchType}</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                                <span className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg">
                                  {match.weightClass}
                                </span>
                                <span className="px-2.5 py-1 bg-blue-50 text-[#0A3D91] text-xs font-bold rounded-lg">
                                  {match.rounds} Rounds
                                </span>
                              </div>
                              {hasWinner && (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-black rounded-lg flex items-center gap-1.5">
                                  <Trophy className="w-3.5 h-3.5" />
                                  RESULT
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Fighters Section */}
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {/* Fighter A */}
                              <div className={`relative rounded-xl p-5 transition-all ${
                                hasWinner && match.winner === match.fighterA.name
                                  ? 'bg-gradient-to-br from-yellow-50 via-yellow-100/50 to-yellow-50 border-2 border-yellow-400 shadow-md'
                                  : 'bg-gray-50 border-2 border-gray-200'
                              }`}>
                                {hasWinner && match.winner === match.fighterA.name && (
                                  <div className="absolute -top-3 -right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center gap-1.5 shadow-xl z-10">
                                    <Trophy className="w-4 h-4 text-white" />
                                    <span className="text-xs font-black text-white uppercase">Winner</span>
                                  </div>
                                )}
                                <div className="mb-4">
                                  <h4 className={`text-xl font-black mb-2 leading-tight ${
                                    hasWinner && match.winner === match.fighterA.name
                                      ? 'text-yellow-900'
                                      : 'text-gray-900'
                                  }`}>
                                    {match.fighterA.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {match.fighterA.clubName}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-lg border border-gray-300 shadow-sm">
                                    {match.fighterA.record}
                                  </span>
                                  <span className="px-3 py-1.5 bg-blue-100 text-[#0A3D91] text-xs font-bold rounded-lg">
                                    {match.fighterA.weight}kg
                                  </span>
                                </div>
                              </div>

                              {/* Fighter B */}
                              <div className={`relative rounded-xl p-5 transition-all ${
                                hasWinner && match.winner === match.fighterB.name
                                  ? 'bg-gradient-to-br from-yellow-50 via-yellow-100/50 to-yellow-50 border-2 border-yellow-400 shadow-md'
                                  : 'bg-gray-50 border-2 border-gray-200'
                              }`}>
                                {hasWinner && match.winner === match.fighterB.name && (
                                  <div className="absolute -top-3 -right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center gap-1.5 shadow-xl z-10">
                                    <Trophy className="w-4 h-4 text-white" />
                                    <span className="text-xs font-black text-white uppercase">Winner</span>
                                  </div>
                                )}
                                <div className="mb-4">
                                  <h4 className={`text-xl font-black mb-2 leading-tight ${
                                    hasWinner && match.winner === match.fighterB.name
                                      ? 'text-yellow-900'
                                      : 'text-gray-900'
                                  }`}>
                                    {match.fighterB.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {match.fighterB.clubName}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-lg border border-gray-300 shadow-sm">
                                    {match.fighterB.record}
                                  </span>
                                  <span className="px-3 py-1.5 bg-blue-100 text-[#0A3D91] text-xs font-bold rounded-lg">
                                    {match.fighterB.weight}kg
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Result Info */}
                            {hasWinner ? (
                              <div className="mt-5 pt-5 border-t-2 border-gray-200">
                                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Trophy className="w-5 h-5 text-white" />
                                      <span className="text-sm font-bold text-white uppercase">Official Result</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-black text-white">
                                        {match.winner}
                                      </div>
                                      <div className="text-sm font-bold text-white/90">
                                        {match.winnerMethod} • Round {match.winnerRound}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-5 pt-5 border-t border-gray-200">
                                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-bold text-blue-900">Scheduled bout - Results pending</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderShop = () => (
    <div className="space-y-6 max-w-4xl mx-auto py-12 px-4 text-center">
      {/* Decorative Accent */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl mb-2">
        <Sparkles className="w-4 h-4 text-[#0A3D91]" />
        <span className="text-xs font-black text-[#0A3D91] uppercase tracking-wider">Official Merch &amp; Gear</span>
      </div>

      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase leading-none">
          Kun Khmer Store <br/>
          <span className="bg-gradient-to-r from-[#0A3D91] to-blue-600 bg-clip-text text-transparent">Coming Soon</span>
        </h2>
        <p className="text-base text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
          We are currently building a world-class shopping experience. Soon, you will be able to purchase authentic Kun Khmer equipment, official fighter signature apparel, training gear, and limited-edition merchandise delivered directly to your doorstep.
        </p>
      </div>

      {/* Illustrative Card */}
      <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-8 md:p-12 max-w-xl mx-auto mt-8 space-y-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-10 h-10 text-[#0A3D91]" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-gray-900">Get Notified On Launch</h3>
          <p className="text-sm text-gray-500 font-semibold">Be the first to know when the shop goes live and get exclusive early-bird discounts.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); toast.success("Thank you! We've saved your spot."); }} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A3D91]/50 focus:border-[#0A3D91] transition-all text-sm font-semibold text-gray-800"
          />
          <button
            type="submit"
            className="px-6 py-3.5 bg-[#0A3D91] hover:bg-blue-800 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            Notify Me
          </button>
        </form>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Stay connected</span>
          <div className="flex gap-2">
            <a
              href="https://www.facebook.com/kkfcambodia"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0A3D91] text-xs font-black rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Kun Khmer Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Shopping Cart</h2>
        <p className="text-gray-500">{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in your cart</p>
      </div>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Add some products to get started!</p>
          <button
            onClick={() => handleSectionChange("shop")}
            className="px-8 py-3.5 bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-base font-bold text-gray-900 mb-1">{item.name}</h4>
                          {item.seller && (
                            <p className="text-sm text-gray-500">by {item.seller}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        >
                          <X className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        {item.discount ? (
                          <>
                            <span className="text-xl font-black text-[#C8102E]">
                              ${finalPrice.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              ${item.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-black text-[#C8102E]">
                            ${item.price}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-base font-bold text-gray-900 min-w-[30px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-black text-gray-900 mb-6">Order Summary</h3>
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal ({cartItemCount} items)</span>
                  <span className="font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-[#C8102E]">${cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Points needed: {Math.floor(cartTotal * 10)}
                </p>
              </div>
              <button
                onClick={() => handleSectionChange("checkout")}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCheckout = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Checkout</h2>
        <p className="text-gray-500">Complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={shippingInfo.fullName}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-[#0A3D91] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  placeholder="123 Main Street"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-[#0A3D91] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  placeholder="Phnom Penh"
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-[#0A3D91] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+855 12 345 678"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-[#0A3D91] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cart.map((item) => {
                const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-black text-[#C8102E]">
                      ${(finalPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-[#C8102E]">${cartTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">Payment: {Math.floor(cartTotal * 10)} points</p>
            </div>
            <button
              onClick={checkoutOrder}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#C8102E] to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Complete Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">My Orders</h2>
        <p className="text-gray-500">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <button
            onClick={() => handleSectionChange("shop")}
            className="px-8 py-3.5 bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div className="space-y-3 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white">
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-black text-[#C8102E]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-[#C8102E]">${order.total.toFixed(2)}</p>
                </div>
                {order.trackingNumber && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Tracking Number</p>
                    <p className="text-sm font-bold text-[#0A3D91]">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSubscription = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Choose Your Plan</h2>
        <p className="text-lg text-gray-500">Unlock exclusive content and benefits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-3xl overflow-hidden border-2 transition-all hover:scale-105 ${
              plan.popular ? "border-[#0A3D91] shadow-2xl" : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <div className="bg-gradient-to-r from-[#0A3D91] to-blue-600 py-2.5 text-center">
                <span className="text-white font-black text-sm flex items-center justify-center gap-1">
                  <Crown className="w-4 h-4" />
                  MOST POPULAR
                </span>
              </div>
            )}
            <div className="p-8">
              <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-black text-gray-900">${plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full px-6 py-4 rounded-xl font-bold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white hover:shadow-lg"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">My Profile</h2>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0A3D91] to-blue-600 rounded-2xl flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">John Doe</h3>
            <p className="text-sm text-gray-500">Member since 2026</p>
            <span className="inline-block mt-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
              FREE PLAN
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl">
            <p className="text-sm text-gray-600 mb-2 font-medium">Wallet Balance</p>
            <p className="text-3xl font-black text-gray-900">{balance}</p>
            <p className="text-xs text-gray-500">points</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
            <p className="text-sm text-gray-600 mb-2 font-medium">Total Orders</p>
            <p className="text-3xl font-black text-gray-900">{orders.length}</p>
            <p className="text-xs text-gray-500">completed</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSectionChange("subscription")}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#C8102E] to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-between"
          >
            <span>Upgrade to Premium</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          <Link
            to="/home"
            className="block w-full px-6 py-4 bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all text-center"
          >
            Go to Admin Platform
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header - Sticky */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm transition-all duration-300 ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled ? 'bg-white border-gray-200' : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Logo - Bigger */}
            <Link to="/" className="group flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A3D91]/20 to-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src={kkfLogo}
                  alt="KKF Logo"
                  className="relative w-14 h-14 md:w-16 md:h-16 object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight">KUNKHMER</h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium leading-tight">Official Platform</p>
              </div>
            </Link>

            {/* Enhanced Search Bar with Integrated Filter Dropdown */}
            <div className="hidden md:block flex-1 max-w-2xl">
              <div className="relative flex items-center gap-2 bg-gradient-to-r from-gray-50 to-white border border-gray-200/80 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0A3D91]/30 focus-within:border-[#0A3D91]/50 focus-within:shadow-lg transition-all duration-300 hover:shadow-md">
                {/* Search Icon */}
                <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-[#0A3D91]/10 to-blue-500/10 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-[#0A3D91] flex-shrink-0" />
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fighters, products, events..."
                  className="flex-1 bg-transparent outline-none font-medium text-sm placeholder:text-gray-400"
                />

                {/* Divider */}
                <div className="w-px h-5 bg-gradient-to-b from-transparent via-gray-300 to-transparent flex-shrink-0" />

                {/* Filter Dropdown Button */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all hover:bg-white text-gray-700 border border-transparent hover:border-gray-200"
                  >
                    {searchFilter === "all" && "All"}
                    {searchFilter === "fighters" && "Fighters"}
                    {searchFilter === "events" && "Events"}
                    {searchFilter === "products" && "Products"}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${filterDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {filterDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50 overflow-hidden">
                      {[
                        { id: "all", label: "All" },
                        { id: "fighters", label: "Fighters" },
                        { id: "events", label: "Events" },
                        { id: "products", label: "Products" }
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => {
                            setSearchFilter(filter.id as SearchFilter);
                            setFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all ${
                            searchFilter === filter.id
                              ? "bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              <button className="relative p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-[#0A3D91] transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#C8102E] rounded-full ring-2 ring-white animate-pulse" />
              </button>
              
              {/* Cart with Dropdown Preview */}
              <div className="relative">
                <button
                  onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                  onMouseEnter={() => setCartDropdownOpen(true)}
                  onMouseLeave={() => setCartDropdownOpen(false)}
                  className="relative p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all group"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-[#0A3D91] transition-colors" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-[#C8102E] to-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      {cartItemCount}
                    </span>
                  )}
                </button>
                
                {/* Cart Dropdown */}
                {cartDropdownOpen && cartItemCount > 0 && (
                  <div
                    className="absolute right-0 top-full mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-5 animate-fadeIn"
                    onMouseEnter={() => setCartDropdownOpen(true)}
                    onMouseLeave={() => setCartDropdownOpen(false)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-gray-900">Shopping Cart</h4>
                      <span className="px-2.5 py-1 bg-[#0A3D91]/10 text-[#0A3D91] text-xs font-bold rounded-full">
                        {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                      {cart.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex gap-3 items-center p-2 rounded-xl hover:bg-gray-50 transition-colors">
                          <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover ring-1 ring-gray-200" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-black text-[#C8102E]">
                            ${((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                        <span className="text-2xl font-black text-gray-900">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleSectionChange("cart");
                        setCartDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-[#0A3D91] to-blue-600 hover:from-[#0B4AAD] hover:to-blue-700 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      View Full Cart
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSectionChange("profile")}
                className="p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all group"
              >
                <User className="w-5 h-5 text-gray-600 group-hover:text-[#0A3D91] transition-colors" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all group"
              >
                <Menu className="w-5 h-5 text-gray-600 group-hover:text-[#0A3D91] transition-colors" />
              </button>
            </div>
          </div>

          {/* Bottom Navigation with Icons */}
          <nav className="hidden md:flex items-center gap-2 pb-4 border-t border-gray-100/80 pt-4 overflow-x-auto">
            {[
              { id: "home", label: "Home", icon: HomeIcon },
              { id: "matches", label: "Matches & Events", icon: Trophy },
              { id: "news-events", label: "News & Media", icon: BookOpen },
              { id: "fighters", label: "Fighters", icon: Users },
              { id: "strategic-partners", label: "Strategic Partners", icon: Handshake },
              { id: "shop", label: "Shop", icon: ShoppingCart }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleSectionChange(id as Section)}
                className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold transition-all duration-300 ${
                  currentSection === id
                    ? "bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 ${
                  currentSection === id
                    ? "bg-white/20"
                    : "bg-gray-100 group-hover:bg-gray-200"
                }`}>
                  <Icon className={`w-4 h-4 ${currentSection === id ? "text-white" : "text-gray-600 group-hover:text-gray-900"}`} />
                </div>
                <span className="text-sm font-bold tracking-wide">{label}</span>
                {currentSection === id && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/40 rounded-full"></div>
                )}
              </button>
            ))}
          </nav>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 bg-gradient-to-br from-[#0A3D91]/10 to-blue-500/10 rounded-lg">
                <Search className="w-3.5 h-3.5 text-[#0A3D91]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fighters, products, events..."
                className="w-full pl-12 pr-4 py-2.5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl font-medium text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D91]/30 focus:border-[#0A3D91]/50 transition-all"
              />
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 animate-fadeIn">
              {[
                { id: "home", label: "Home", icon: HomeIcon },
                { id: "matches", label: "Matches & Events", icon: Trophy },
                { id: "news-events", label: "News & Media", icon: BookOpen },
                { id: "fighters", label: "Fighters", icon: Users },
                { id: "strategic-partners", label: "Strategic Partners", icon: Handshake },
                { id: "shop", label: "Shop", icon: ShoppingCart }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    handleSectionChange(id as Section);
                    setMobileMenuOpen(false);
                  }}
                  className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-base transition-all ${
                    currentSection === id
                      ? "bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                    currentSection === id
                      ? "bg-white/20"
                      : "bg-gray-100 group-hover:bg-gray-200"
                  }`}>
                    <Icon className={`w-5 h-5 ${currentSection === id ? "text-white" : "text-gray-600 group-hover:text-gray-900"}`} />
                  </div>
                  <span className="font-bold">{label}</span>
                  {currentSection === id && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {currentSection === "home" && renderHome()}
        {currentSection === "news-events" && renderNewsEvents()}
        {currentSection === "fighters" && renderFighters()}
        {currentSection === "matches" && renderMatches()}
        {currentSection === "match-detail" && renderMatchDetail()}
        {currentSection === "strategic-partners" && renderStrategicPartners()}
        {currentSection === "club-detail" && renderClubDetail()}
        {currentSection === "shop" && renderShop()}
        {currentSection === "cart" && renderCart()}
        {currentSection === "checkout" && renderCheckout()}
        {currentSection === "orders" && renderOrders()}
        {currentSection === "subscription" && renderSubscription()}
        {currentSection === "profile" && renderProfile()}
      </main>

      {/* Modern Compact Footer */}
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
                  <button
                    onClick={() => handleSectionChange("home")}
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSectionChange("matches")}
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    Matches & Events
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSectionChange("news-events")}
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    News & Media
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSectionChange("fighters")}
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    Fighters
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSectionChange("strategic-partners")}
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    Strategic Partners
                  </button>
                </li>
              </ul>
            </div>

            {/* Shop Column */}
            <div>
              <h4 className="font-bold text-[13px] mb-3 text-[#F2C94C] tracking-wide uppercase">Shop</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleSectionChange("shop")}
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    All Products
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSectionChange("cart")}
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    Cart
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSectionChange("orders")}
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    My Orders
                  </button>
                </li>
              </ul>
            </div>

            {/* Account Column */}
            <div>
              <h4 className="font-bold text-[13px] mb-3 text-[#F2C94C] tracking-wide uppercase">Account</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleSectionChange("profile")}
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    My Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSectionChange("subscription")}
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    Subscription
                  </button>
                </li>
                <li>
                  <Link
                    to="/home"
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    Admin Platform
                  </Link>
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
