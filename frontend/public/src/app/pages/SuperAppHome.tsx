import { useState, useEffect, Fragment } from "react";
import { MatchesAndEvents } from "./MatchesAndEvents";
import { NewsAndMedia } from "./NewsAndMedia";
import { Partners } from "./Partners";
import { FightersDirectory } from "./FightersDirectory";
import { Link, useParams, useNavigate, useLocation } from "react-router";
import { api } from "../utils/api";
import { Search, Bell, ShoppingCart, User, Heart, Star, Flame, Zap, Crown, ChevronRight, Package, Plus, Minus, X, CreditCard, Play, Calendar, MapPin, Clock, Award, Users, BookOpen, Video, Menu, Home as HomeIcon, Trophy, TrendingUp, Sparkles, ArrowRight, ArrowLeft, Check, ChevronDown, ChevronUp, Filter, Grid3x3, Eye, ShoppingBag, Building2, Tv, Handshake, Weight, Share2, Mail, Swords } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { useOrders } from "../contexts/OrderContext";
import { toast } from "sonner";
import ClubDetailPage from "../components/home/ClubDetailPage";
import SponsorDetailPage from "../components/home/SponsorDetailPage";
import BroadcastDetailPage from "../components/home/BroadcastDetailPage";
import HomePage from "../components/home/HomePage";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { PublicStatusBadge } from "../components/PublicStatusBadge";
import { usePageTitle } from "../hooks/usePageTitle";
import { useI18n } from "../i18n/LanguageContext";
import { latestResults, useFanData } from "../data/fanData";
import { DemoBanner, ResultRow } from "../components/fan/FanWidgets";
import { publicName, readTimeMinutes, formatVideoDuration, formatViews } from "../utils/publicDisplay";

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
import { BROADCAST_STATIONS, SPONSORS, getFighterSlug } from "../data/masterData";
import { useWeightClasses, weightClassFor } from "../data/weightClasses";
import { MOCK_BATCHES } from "../data/batches";
import { MatchBatchCard } from "../components/MatchBatchCard";
import { MatchFilters } from "../components/MatchFilters";

type Section = "home" | "news-events" | "fighters" | "matches" | "match-detail" | "media" | "shop" | "strategic-partners" | "club-detail" | "sponsor-detail" | "broadcast-detail" | "cart" | "checkout" | "orders" | "profile" | "subscription";
type Category = "all" | "gloves" | "shorts" | "equipment" | "apparel";
type MatchesEventsTab = "matches" | "events" | "previous";
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
  nameKhmer?: string;
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
  age: number | null;
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
  description?: string;
  phone?: string;
  email?: string;
  established?: string;
}

interface BroadcastStation {
  id: string;
  name: string;
  logo: string;
  image: string; // Added for broadcast station thumbnail images
  description: string;
  eventsCount: number;
  contactPerson?: string;
  contactEmail?: string;
  type?: string;
  reach?: string;
}

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  image: string; // Added for sponsor thumbnail images
  industry: string; // Added for sponsor industry display
  tier: "platinum" | "gold" | "silver";
  eventsSponsored: number;
  contactPerson?: string;
  contactEmail?: string;
  websiteUrl?: string | null;
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
    id: string;
    name: string;
    image: string;
    record: string;
    weight: number;
    club: string;
    clubId?: string;
  };
  fighterB: {
    id: string;
    name: string;
    image: string;
    record: string;
    weight: number;
    club: string;
    clubId?: string;
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
  const { t, tn, formatDate, formatWeight, localName } = useI18n();
  // Official weight classes (System Settings); shown in the page language.
  const weightClasses = useWeightClasses();
  const weightClassLabel = (kg: number) => {
    const c = weightClassFor(kg, weightClasses);
    return c ? localName(c.name, c.name_khmer) : "";
  };
  const fanData = useFanData();
  const { balance, deductBalance } = useWallet();
  const { orders, createOrder } = useOrders();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentSection, setCurrentSection] = useState<Section>("home");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [matchesEventsTab, setMatchesEventsTab] = useState<MatchesEventsTab>("matches");
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set()); // All batches collapsed by default

  // Fighter filters
  const [showMatchFilters, setShowMatchFilters] = useState<boolean>(false);
  const [showProductFilters, setShowProductFilters] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaContent | null>(null);
  const [previousMatchesPage, setPreviousMatchesPage] = useState(1);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [selectedWeightClass, setSelectedWeightClass] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [sponsorSlideIndex, setSponsorSlideIndex] = useState(0);
  const [selectedMatchType, setSelectedMatchType] = useState<string>("all");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<any | null>(null);
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<string | null>(null);
  const previousMatchesPerPage = 5;
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    phone: ""
  });

  const formatEventDate = (dateStr: any, isShort: boolean = false) =>
    formatDate(dateStr, isShort ? "weekday" : "long") || "—";

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

  const [dbBatches, setDbBatches] = useState<any[]>([]);
  const [dbMatches, setDbMatches] = useState<any[]>([]);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [loadingDbData, setLoadingDbData] = useState(true);

  useEffect(() => {
    const fetchDbData = async () => {
      try {
        const [batchesList, matchesList, eventsList] = await Promise.all([
          api.batches.list(),
          api.matches.list(),
          api.events.list()
        ]);
        setDbBatches(batchesList || []);
        setDbMatches(matchesList || []);
        setDbEvents(eventsList || []);
      } catch (err) {
        console.error("Failed to load matches/batches/events from API:", err);
      } finally {
        setLoadingDbData(false);
      }
    };
    fetchDbData();
  }, []);

  const mappedBatches = (dbBatches || []).map((b: any) => {
    const batchMatches = (dbMatches || []).filter((m: any) => m.sub_event_id === b.id).map((m: any) => {
      const isChampionship = m.isTitleMatch || m.is_title_match || false;
      const fA = fightersList.find((f: any) => f.id === m.fighter_a_id);
      const fB = fightersList.find((f: any) => f.id === m.fighter_b_id);

      return {
        id: m.id,
        status: m.status,
        rounds: m.rounds,
        weightClass: m.agreed_weight ? `${m.agreed_weight} kg` : "Catchweight",
        agreedWeight: m.agreed_weight ? parseFloat(m.agreed_weight) : null,
        matchType: isChampionship ? "Championship Bout" : "Ranking Fight",
        isChampionshipBout: isChampionship,
        winnerId: m.winner_id,
        winnerMethod: m.winner_method,
        winnerRound: m.winner_round,
        // The API calls it winner_duration; the admin saves "0:00" when no time was recorded.
        winnerTime: m.winner_duration && !/^0{1,2}:00$/.test(m.winner_duration) ? m.winner_duration : null,
        fighterA: {
          id: m.fighter_a_id,
          name: m.fighter_a_name || fA?.name || "TBD",
          nameKhmer: fA?.nameKhmer || "",
          image: m.fighter_a_image || fA?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
          clubName: m.club_a_name || fA?.clubName || "Independent",
          record: m.fighter_a_record || fA?.record || "",
          grade: m.fighter_a_grade || fA?.grade || "C",
          weight: parseFloat(m.fighter_a_weight || m.agreed_weight || fA?.currentWeight || 0)
        },
        fighterB: {
          id: m.fighter_b_id,
          name: m.fighter_b_name || fB?.name || "TBD",
          nameKhmer: fB?.nameKhmer || "",
          image: m.fighter_b_image || fB?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
          clubName: m.club_b_name || fB?.clubName || "Independent",
          record: m.fighter_b_record || fB?.record || "",
          grade: m.fighter_b_grade || fB?.grade || "C",
          weight: parseFloat(m.fighter_b_weight || m.agreed_weight || fB?.currentWeight || 0)
        }
      };
    });

    return {
      id: b.id,
      eventId: b.event_id,
      event_id: b.event_id,
      batchNumber: b.name || b.batch_number || `BATCH-${b.week_number}`,
      eventName: b.event_name || b.event?.name || "Weekly Fight Card",
      location: b.location || (dbEvents || []).find((e: any) => e.id === b.event_id)?.location || "Venue to be announced",
      date: b.date ? b.date.split("T")[0] : "",
      status: b.status || "Draft",
      totalMatches: batchMatches.length,
      matches: batchMatches,
      organizerClub: publicName(b.creator_name, null),
      createdBy: b.creator_name
    };
  });

  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoadingNews(true);
      try {
        const data = await api.news.list();
        if (data && data.length > 0) {
          const mapped = data.filter((art: any) => !art.status || art.status === "Published").map((art: any) => ({
            id: art.id,
            title: art.title,
            excerpt: art.subtitle || "",
            image: art.featured_image || art.featuredImage || "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800",
            category: art.category || "General",
            author: publicName(art.author),
            date: art.publish_date || art.publishDate || "",
            featured: Boolean(art.featured),
            content: art.content || ""
          }));
          const sorted = mapped.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
          setNewsArticles(sorted);
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
            // Empty when the link can't be read: the player then says so instead of playing another video.
            let youtubeId = "";
            if (vid.youtube_url || vid.youtubeUrl) {
              const url = vid.youtube_url || vid.youtubeUrl;
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
              const match = url.match(regExp);
              if (match && match[2].length === 11) {
                youtubeId = match[2];
              }
            }

            return {
              id: vid.id,
              title: vid.title,
              thumbnail: vid.thumbnail || "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600",
              duration: formatVideoDuration(vid.duration),
              views: formatViews(vid.views),
              date: vid.created_at || "",
              created_at: vid.created_at || "",
              youtubeId,
              category: vid.category || "Highlights",
              fighterId: vid.fighter_id || vid.fighterId || ""
            };
          });
          const sorted = mapped.sort((a: any, b: any) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime());
          setMediaContent(sorted);
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

  // Sync URL parameter with current section
  useEffect(() => {
    if (params.section) {
      // Cart, checkout, orders, profile and subscription stay unreachable until accounts and the shop launch.
      const validSections: Section[] = ["home", "news-events", "fighters", "matches", "match-detail", "shop", "strategic-partners", "club-detail", "sponsor-detail", "broadcast-detail"];
      if (validSections.includes(params.section as Section)) {
        setCurrentSection(params.section as Section);
      } else {
        navigate("/", { replace: true });
      }
    } else {
      setCurrentSection("home");
    }
  }, [params.section]);

  // Sync matches sub-tab with query parameter (e.g. ?tab=events or ?tab=previous)
  useEffect(() => {
    if (currentSection === "matches") {
      const queryParams = new URLSearchParams(location.search);
      const tabParam = queryParams.get("tab");
      const eventParam = queryParams.get("event") || queryParams.get("eventId");
      
      if (tabParam === "events") {
        setMatchesEventsTab("events");
      } else if (tabParam === "previous" || tabParam === "results") {
        setMatchesEventsTab("previous");
      } else if (tabParam === "matches" || tabParam === "batches") {
        setMatchesEventsTab("matches");
      }
      
      // Event pages moved to /events/:id; keep old shared links working.
      if (eventParam) navigate(`/events/${eventParam}`, { replace: true });
    }
  }, [currentSection, location.search]);

  const openEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
    window.scrollTo(0, 0);
  };

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

  // Update URL when section changes (without page reload)
  const handleSectionChange = (section: Section) => {
    setCurrentSection(section);
    if (section === "matches") {
      setSelectedMatchId(null);
    }
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

    // Age comes only from the recorded date of birth; never estimate it.
    let calculatedAge: number | null = null;
    const dob = fighter.dateOfBirth || fighter.date_of_birth;
    if (dob && !isNaN(new Date(dob).getTime())) {
      const birth = new Date(dob);
      const now = new Date();
      calculatedAge = now.getFullYear() - birth.getFullYear() -
        (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    }

    return {
      id: fighter.id,
      name: fighter.name,
      nameKhmer: fighter.nameKhmer || fighter.name_khmer || "",
      image: fighter.image || fighterImages[index % fighterImages.length],
      record: fighter.record || "0-0-0",
      weight: parseFloat(fighter.currentWeight || fighter.current_weight || "0").toString(),
      weightClass: weightClassLabel(parseFloat(fighter.currentWeight || fighter.current_weight || "0")),
      gym: fighter.clubName || fighter.club_name || "Independent",
      wins,
      losses,
      draws,
      verified: fighter.status === 'Active',
      followers: 0,
      // TODO: use the championships API once titles are linked to fighters.
      championships: parseInt(fighter.championships ?? fighter.titles_count ?? "0") || 0,
      age: calculatedAge,
      type: (fighter.professionalStatus || fighter.professional_status || "Professional") as "Professional" | "Amateur",
      clubId: fighter.clubId || fighter.club_id
    };
  });

  // EVENTS: Transform event data from Digital Platform
  const events: Event[] = (dbEvents || [])
    .filter(event => event.status !== 'Draft')
    .map(event => {
    const eventBatches = (dbBatches || []).filter((b: any) => b.event_id === event.id);
    const eventBatchIds = eventBatches.map((b: any) => b.id);
    const matchesCount = (dbMatches || []).filter((m: any) => eventBatchIds.includes(m.sub_event_id)).length;

    return {
      id: event.id,
      name: event.name,
      date: event.date,
      venue: event.location || "Venue to be announced",
      image: event.banner_image_url || event.image || "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800",
      matches: matchesCount,
      matchesCount: matchesCount,
      status: event.status || "upcoming",
      description: event.description || "",
      station: typeof event.station === 'object' && event.station !== null
        ? (event.station.name || "")
        : (event.broadcast_station_name || event.station || ""),
      // Hide system/admin accounts; only show a real organising body.
      organizer: publicName(
        event.organizer_name ||
        (typeof event.organizer === 'object' && event.organizer !== null
          ? (event.organizer.full_name || event.organizer.username)
          : event.organizer),
        ""
      ) || "",
      sponsors: event.main_sponsor_name ? [event.main_sponsor_name] : []
    };
  });

  // Events are stored as calendar days; anything from today onwards counts as upcoming.
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const isUpcomingEvent = (e: Event) => !e.date || new Date(e.date).getTime() >= todayStart;
  const upcomingEvents = events.filter(isUpcomingEvent)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = events.filter((e) => !isUpcomingEvent(e))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
      image: club.image || `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop&sig=${index % 10}`,
      description: club.description || "",
      phone: club.phone || "",
      email: club.email || "",
      established: club.established || ""
    };
  });

  // BROADCAST PARTNERS: Transform broadcast station data from Digital Platform
  const broadcastStations: BroadcastStation[] = broadcastersList.map((station, index) => {
    const typeStr = station.type || "National TV";
    const reachStr = station.reach || "National";
    const eventsCount = (dbEvents || []).filter(e => e.broadcast_station_id === station.id).length;
    return {
      id: station.id,
      name: station.name,
      logo: station.logo_url || station.logoUrl || station.logo || `https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=100&sig=${index % 10}`,
      image: station.image || `https://images.unsplash.com/photo-1650984661525-7e6b1b874e47?w=400&sig=${index % 10}`,
      description: `${typeStr} - ${reachStr}`,
      eventsCount,
      contactPerson: station.contact_person || station.contactPerson || "",
      contactEmail: station.contact_email || station.contactEmail || "",
      type: typeStr,
      reach: reachStr
    };
  });

  // SPONSORS: Transform sponsor data from Digital Platform
  const sponsors: Sponsor[] = sponsorsList.map((sponsor, index) => {
    const tier = (sponsor.tier || "platinum").toLowerCase() as "platinum" | "gold" | "silver";
    const eventsSponsored = (dbEvents || []).filter(e => 
      e.main_sponsor_id === sponsor.id || (e.sponsorIds && e.sponsorIds.includes(sponsor.id))
    ).length;
    return {
      id: sponsor.id,
      name: sponsor.name,
      logo: sponsor.logoUrl || sponsor.logo_url || `https://images.unsplash.com/photo-1622543925917-763c34f1f161?w=100&sig=${index % 10}`,
      image: sponsor.image || `https://images.unsplash.com/photo-1771764678001-aa0f28e90f7f?w=400&sig=${index % 10}`,
      industry: sponsor.industry || "General Sponsor",
      tier,
      eventsSponsored,
      website_url: sponsor.website_url || sponsor.websiteUrl || null,
      websiteUrl: sponsor.websiteUrl || sponsor.website_url || null,
      contactPerson: sponsor.contact_person || sponsor.contactPerson || "",
      contactEmail: sponsor.contact_email || sponsor.contactEmail || "",
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
  const matches: Match[] = (mappedBatches || []).flatMap(batch => 
    batch.matches.map(match => {
      const fA = fightersList.find((f: any) => f.id === match.fighterA.id);
      const fB = fightersList.find((f: any) => f.id === match.fighterB.id);
      const fighterAClub = clubsList.find((c: any) => c.id === (fA?.club_id || fA?.clubId));
      const fighterBClub = clubsList.find((c: any) => c.id === (fB?.club_id || fB?.clubId));
      
      return {
        id: match.id,
        eventName: batch.eventName,
        fighterA: {
          id: match.fighterA.id,
          name: match.fighterA.name,
          image: typeof match.fighterA.image === 'string' ? match.fighterA.image : "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600",
          record: match.fighterA.record,
          weight: match.fighterA.weight,
          club: fighterAClub?.name || match.fighterA.clubName || "Unknown Club",
          clubId: fA?.club_id || fA?.clubId
        },
        fighterB: {
          id: match.fighterB.id,
          name: match.fighterB.name,
          image: typeof match.fighterB.image === 'string' ? match.fighterB.image : "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600",
          record: match.fighterB.record,
          weight: match.fighterB.weight,
          club: fighterBClub?.name || match.fighterB.clubName || "Unknown Club",
          clubId: fB?.club_id || fB?.clubId
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
    selectedCategory === "all" || p.category === selectedCategory
  );

  const SECTION_TITLES: Partial<Record<Section, string>> = {
    matches: t("nav.matches"),
    "match-detail": t("nav.matches"),
    "news-events": t("nav.news"),
    fighters: t("nav.fighters"),
    "strategic-partners": t("nav.partners"),
    "club-detail": t("nav.partners"),
    "sponsor-detail": t("nav.partners"),
    "broadcast-detail": t("nav.partners"),
    shop: t("footer.shop"),
  };
  usePageTitle(SECTION_TITLES[currentSection]);

  // Render Functions

  const renderClubDetail = () => {
    if (!selectedClubId) return null;

    const club = clubs.find(c => c.id === selectedClubId);
    if (!club) return null;

    // Filter fighters from this club
    const clubFighters = fighters.filter(f => f.clubId === selectedClubId);

    // Filter matches involving fighters of this club
    const clubFighterIds = clubFighters.map(f => f.id);
    const clubMatches = matches.filter(m => 
      clubFighterIds.includes(m.fighterA.id) || clubFighterIds.includes(m.fighterB.id)
    );

    return (
      <ClubDetailPage
        club={club}
        fighters={clubFighters}
        matches={clubMatches}
        onBack={() => {
          setCurrentSection("strategic-partners");
          navigate("/strategic-partners?tab=clubs");
        }}
        onFighterClick={(fighterId) => {
          const f = fighters.find(x => x.id === fighterId);
          navigate(`/fighters/${f ? getFighterSlug(f) : fighterId}`);
        }}
      />
    );
  };

  const renderSponsorDetail = () => {
    if (!selectedSponsor) return null;

    // Filter events sponsored by this sponsor
    const sponsorEvents = events.filter(e => {
      const dbEvent = dbEvents.find(de => de.id === e.id);
      return dbEvent && (dbEvent.main_sponsor_id === selectedSponsor.id || (dbEvent.sponsorIds && dbEvent.sponsorIds.includes(selectedSponsor.id)));
    });

    return (
      <SponsorDetailPage
        sponsor={selectedSponsor}
        events={sponsorEvents}
        onBack={() => {
          setCurrentSection("strategic-partners");
          navigate("/strategic-partners");
        }}
        onEventClick={(eventId) => {
          openEvent(eventId);
        }}
      />
    );
  };

  const renderBroadcastDetail = () => {
    if (!selectedBroadcastId) return null;

    const station = broadcastStations.find(s => s.id === selectedBroadcastId);
    if (!station) return null;

    // Filter events broadcasted by this station
    const stationEvents = events.filter(e => {
      const dbEvent = dbEvents.find(de => de.id === e.id);
      return dbEvent && dbEvent.broadcast_station_id === selectedBroadcastId;
    });

    return (
      <BroadcastDetailPage
        station={station}
        events={stationEvents}
        onBack={() => {
          setCurrentSection("strategic-partners");
          navigate("/strategic-partners?tab=broadcasters");
        }}
        onEventClick={(eventId) => {
          openEvent(eventId);
        }}
      />
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
                  <span>{formatDate(match.date)}</span>
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
                  <p className="text-sm font-bold text-gray-900">{formatDate(match.date)} • {match.time}</p>
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
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
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
      <SiteHeader activeSection={currentSection} onSectionChange={(s) => handleSectionChange(s as Section)} />

      {/* Main Content */}
      {currentSection === "home" && (
        <HomePage
          articles={newsArticles}
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
          fighters={fighters}
          videos={mediaContent}
          sponsors={sponsorsList}
          onOpenEvent={openEvent}
          onPlayVideo={(id) => setSelectedVideo(mediaContent.find((v) => v.id === id) ?? null)}
          onNavigate={(section) => handleSectionChange(section)}
        />
      )}

      {currentSection !== "home" && (
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {currentSection === "news-events" && <NewsAndMedia articles={newsArticles} videos={mediaContent} fighters={fightersList} loading={loadingNews || loadingMedia} />}
        {currentSection === "fighters" && <FightersDirectory />}
        {currentSection === "matches" && <MatchesAndEvents />}
        {currentSection === "match-detail" && renderMatchDetail()}
        {currentSection === "strategic-partners" && (
          <Partners
            clubs={clubsList}
            broadcasters={broadcastersList}
            sponsors={sponsorsList}
            events={dbEvents}
            loading={loadingPartners}
            onOpenClub={(id) => {
              setSelectedClubId(id);
              setCurrentSection("club-detail");
              navigate("/club-detail");
            }}
            onOpenBroadcaster={(id) => {
              setSelectedBroadcastId(id);
              setCurrentSection("broadcast-detail");
              navigate("/broadcast-detail");
            }}
            onOpenSponsor={(id) => {
              const sponsor = sponsors.find((x) => x.id === id);
              if (!sponsor) return;
              setSelectedSponsor(sponsor);
              setCurrentSection("sponsor-detail");
              navigate("/sponsor-detail");
            }}
          />
        )}
        {currentSection === "club-detail" && renderClubDetail()}
        {currentSection === "sponsor-detail" && renderSponsorDetail()}
        {currentSection === "broadcast-detail" && renderBroadcastDetail()}
        {currentSection === "shop" && renderShop()}
        {currentSection === "cart" && renderCart()}
        {currentSection === "checkout" && renderCheckout()}
        {currentSection === "orders" && renderOrders()}
        {currentSection === "subscription" && renderSubscription()}
        {currentSection === "profile" && renderProfile()}
      </main>
      )}

      <SiteFooter flush={currentSection === "home"} onSectionChange={(s) => handleSectionChange(s as Section)} />
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
                <span className="font-semibold">{formatDate(selectedVideo.date)}</span>
              </div>
            </div>

            {/* YouTube Video */}
            <div className="relative aspect-video bg-black">
              {selectedVideo.youtubeId ? (
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
              ) : (
                <p className="absolute inset-0 flex items-center justify-center text-white/80 text-sm px-6 text-center">{t("news.videoUnavailable")}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
