import { useState } from "react";
import { Plus, Edit, Trash2, TrendingUp, Package, DollarSign, Eye, ShoppingCart, Search, Filter, Upload, Download, Tag, Percent, ImageIcon, Trash, X, AlertCircle, Info, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";

interface ProductVariant {
  size?: string;
  color?: string;
  stock: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: string;
  status: "active" | "inactive";
  labels: string[];
  views: number;
  sales: number;
  revenue: number;
  image: string;
  images: string[];
  description?: string;
  variants?: ProductVariant[];
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Everlast Powerlock Pro Fight Gloves",
    sku: "BXG-001",
    price: 89.99,
    discountPrice: 74.99,
    stock: 45,
    category: "Equipment",
    status: "active",
    labels: ["Best Seller", "Popular"],
    views: 1243,
    sales: 89,
    revenue: 6674.11,
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Professional boxing gloves with anatomical foam padding and wrist support. Premium leather construction for durability. Available in 12oz, 14oz, and 16oz weights.",
    variants: [
      { size: "12oz", color: "Black", stock: 15, sku: "BXG-001-12-BLK" },
      { size: "14oz", color: "Black", stock: 20, sku: "BXG-001-14-BLK" },
      { size: "16oz", color: "Red", stock: 10, sku: "BXG-001-16-RED" },
    ],
  },
  {
    id: "2",
    name: "Cleto Reyes Boxing Trunks",
    sku: "BXA-002",
    price: 64.99,
    stock: 120,
    category: "Apparel",
    status: "active",
    labels: ["New"],
    views: 2156,
    sales: 134,
    revenue: 8708.66,
    image: "https://images.unsplash.com/photo-1773738650504-baa1a40cc978?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1773738650504-baa1a40cc978?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Premium satin boxing trunks with elastic waistband and side slits for maximum mobility. Classic design favored by professional boxers.",
  },
  {
    id: "3",
    name: "Ringside Heavy Bag - 100lbs",
    sku: "BXE-103",
    price: 149.99,
    discountPrice: 129.99,
    stock: 28,
    category: "Equipment",
    status: "active",
    labels: ["Best Seller"],
    views: 1876,
    sales: 67,
    revenue: 8705.33,
    image: "https://images.unsplash.com/photo-1692731753575-6c1405e2479b?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1692731753575-6c1405e2479b?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Professional-grade heavy bag filled with shredded textile and sand. Reinforced webbing and heavy-duty chain. Perfect for developing punching power.",
  },
  {
    id: "4",
    name: "Venum Dry-Fit Boxing T-Shirt",
    sku: "BXA-104",
    price: 34.99,
    stock: 200,
    category: "Apparel",
    status: "active",
    labels: ["Popular"],
    views: 3245,
    sales: 198,
    revenue: 6928.02,
    image: "https://images.unsplash.com/photo-1726867644459-deee4d93e9a8?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1726867644459-deee4d93e9a8?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Quick-dry mesh fabric with anti-odor technology. Designed for high-intensity boxing training and sparring sessions.",
    variants: [
      { size: "S", color: "Black", stock: 50, sku: "BXA-104-S-BLK" },
      { size: "M", color: "Black", stock: 70, sku: "BXA-104-M-BLK" },
      { size: "L", color: "White", stock: 50, sku: "BXA-104-L-WHT" },
      { size: "XL", color: "White", stock: 30, sku: "BXA-104-XL-WHT" },
    ],
  },
  {
    id: "5",
    name: "Winning Hand Wraps - 180 inches",
    sku: "BXE-205",
    price: 14.99,
    stock: 350,
    category: "Equipment",
    status: "active",
    labels: ["Best Seller"],
    views: 4567,
    sales: 312,
    revenue: 4676.88,
    image: "https://images.unsplash.com/photo-1770734265410-0c686b750f0f?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1770734265410-0c686b750f0f?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Premium Mexican-style hand wraps with elastic blend for secure fit. 180 inches of protection for wrists and knuckles.",
    variants: [
      { size: "180in", color: "Black", stock: 150, sku: "BXE-205-180-BLK" },
      { size: "180in", color: "Red", stock: 100, sku: "BXE-205-180-RED" },
      { size: "180in", color: "White", stock: 100, sku: "BXE-205-180-WHT" },
    ],
  },
  {
    id: "6",
    name: "WBC Championship Belt Replica",
    sku: "BXC-306",
    price: 349.99,
    discountPrice: 299.99,
    stock: 15,
    category: "Collectibles",
    status: "active",
    labels: ["New", "Popular"],
    views: 892,
    sales: 12,
    revenue: 3599.88,
    image: "https://images.unsplash.com/photo-1564097147829-44f8c74a8549?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1564097147829-44f8c74a8549?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Official WBC Championship Belt replica with detailed gold plating, genuine leather strap, and presentation box. Full-size collectible.",
  },
  {
    id: "7",
    name: "Title Boxing Speed Rope",
    sku: "BXT-407",
    price: 24.99,
    stock: 85,
    category: "Training",
    status: "active",
    labels: ["Popular"],
    views: 1534,
    sales: 76,
    revenue: 1899.24,
    image: "https://images.unsplash.com/photo-1516876345887-6dd74f80787a?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1516876345887-6dd74f80787a?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Professional speed rope with ball bearing system and adjustable length. Essential for boxing footwork and cardio conditioning.",
  },
  {
    id: "8",
    name: "Grant Boxing Headgear",
    sku: "BXE-508",
    price: 119.99,
    discountPrice: 99.99,
    stock: 42,
    category: "Equipment",
    status: "active",
    labels: ["New"],
    views: 987,
    sales: 34,
    revenue: 3399.66,
    image: "https://images.unsplash.com/photo-1529025147382-f2d265c8149c?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1529025147382-f2d265c8149c?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Professional sparring headgear with full-face protection, cheek guards, and vision bar. USA Boxing approved for competition.",
    variants: [
      { size: "S/M", color: "Black", stock: 15, sku: "BXE-508-SM-BLK" },
      { size: "L/XL", color: "Black", stock: 17, sku: "BXE-508-LXL-BLK" },
      { size: "L/XL", color: "Red", stock: 10, sku: "BXE-508-LXL-RED" },
    ],
  },
  {
    id: "9",
    name: "Adidas Boxing Shorts",
    sku: "BXA-609",
    price: 44.99,
    stock: 156,
    category: "Apparel",
    status: "active",
    labels: ["Best Seller"],
    views: 2743,
    sales: 145,
    revenue: 6523.55,
    image: "https://images.unsplash.com/photo-1773738650497-69056f70a707?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1773738650497-69056f70a707?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Classic boxing shorts with wide waistband and side slits for full range of motion. Lightweight satin construction.",
    variants: [
      { size: "S", color: "Black", stock: 40, sku: "BXA-609-S-BLK" },
      { size: "M", color: "Black", stock: 50, sku: "BXA-609-M-BLK" },
      { size: "L", color: "Red", stock: 36, sku: "BXA-609-L-RED" },
      { size: "XL", color: "Blue", stock: 30, sku: "BXA-609-XL-BLU" },
    ],
  },
  {
    id: "10",
    name: "Boxing Resistance Band Set",
    sku: "BXT-710",
    price: 42.99,
    discountPrice: 36.99,
    stock: 92,
    category: "Training",
    status: "active",
    labels: ["New"],
    views: 1245,
    sales: 58,
    revenue: 2145.42,
    image: "https://images.unsplash.com/photo-1727528889601-0ea3d9ee2029?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1727528889601-0ea3d9ee2029?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Shadow boxing resistance bands for punching power and speed development. Includes door anchor and training guide.",
  },
  {
    id: "11",
    name: "Signed Mike Tyson Photo - Vintage",
    sku: "BXC-811",
    price: 149.99,
    stock: 8,
    category: "Collectibles",
    status: "active",
    labels: ["Popular"],
    views: 564,
    sales: 7,
    revenue: 1049.93,
    image: "https://images.unsplash.com/photo-1746911054630-b98d7fd47015?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1746911054630-b98d7fd47015?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Authentic autographed 8x10 photo from Tyson's championship era. Includes certificate of authenticity and protective sleeve.",
  },
  {
    id: "12",
    name: "Cleto Reyes Focus Mitts",
    sku: "BXE-912",
    price: 84.99,
    stock: 73,
    category: "Equipment",
    status: "active",
    labels: ["Best Seller"],
    views: 1678,
    sales: 89,
    revenue: 7564.11,
    image: "https://images.unsplash.com/photo-1711825052055-1b2534406bd3?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1711825052055-1b2534406bd3?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Premium leather curved focus mitts favored by professional trainers. Extra padding for high-impact training sessions.",
  },
  {
    id: "13",
    name: "Under Armour Boxing Hoodie",
    sku: "BXA-013",
    price: 64.99,
    discountPrice: 54.99,
    stock: 68,
    category: "Apparel",
    status: "active",
    labels: ["New"],
    views: 1834,
    sales: 52,
    revenue: 2859.48,
    image: "https://images.unsplash.com/photo-1762575910569-46971cd69df3?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1762575910569-46971cd69df3?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Performance fleece hoodie with moisture transport system. Perfect for pre-fight warm-ups and post-training recovery.",
    variants: [
      { size: "M", color: "Gray", stock: 25, sku: "BXA-013-M-GRY" },
      { size: "L", color: "Gray", stock: 23, sku: "BXA-013-L-GRY" },
      { size: "XL", color: "Black", stock: 20, sku: "BXA-013-XL-BLK" },
    ],
  },
  {
    id: "14",
    name: "Boxing Footwork Ladder",
    sku: "BXT-114",
    price: 22.99,
    stock: 134,
    category: "Training",
    status: "active",
    labels: ["Popular"],
    views: 2134,
    sales: 98,
    revenue: 2253.02,
    image: "https://images.unsplash.com/photo-1726867631904-a24d6094386f?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1726867631904-a24d6094386f?ixlib=rb-4.0.3&w=800&q=80"],
    description: "15-foot agility ladder designed specifically for boxing footwork drills. Includes carry bag and training manual with boxing-specific exercises.",
  },
  {
    id: "15",
    name: "Ali vs Frazier Fight Poster Print",
    sku: "BXC-215",
    price: 59.99,
    stock: 12,
    category: "Collectibles",
    status: "active",
    labels: [],
    views: 423,
    sales: 5,
    revenue: 299.95,
    image: "https://images.unsplash.com/photo-1500835166550-794ced762788?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1500835166550-794ced762788?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Thrilla in Manila vintage poster reproduction. High-quality print on archival paper, perfect for boxing enthusiasts and collectors.",
  },
  {
    id: "16",
    name: "SISU Max Mouth Guard",
    sku: "BXE-316",
    price: 24.99,
    stock: 245,
    category: "Equipment",
    status: "active",
    labels: ["Best Seller"],
    views: 3456,
    sales: 234,
    revenue: 5847.66,
    image: "https://images.unsplash.com/photo-1656623944690-9366fb1aba9b?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1656623944690-9366fb1aba9b?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Ultra-thin custom fit mouth guard with maximum protection. Allows for natural breathing and speaking during training.",
  },
  {
    id: "17",
    name: "Title Boxing Gear Bag",
    sku: "BXA-417",
    price: 79.99,
    stock: 54,
    category: "Apparel",
    status: "active",
    labels: ["New", "Popular"],
    views: 1567,
    sales: 45,
    revenue: 3599.55,
    image: "https://images.unsplash.com/photo-1762744828343-42b6d865dd8e?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1762744828343-42b6d865dd8e?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Heavy-duty boxing gym bag with ventilated glove compartment, water bottle holder, and reinforced straps. Fits all your boxing gear.",
  },
  {
    id: "18",
    name: "Boxing Reflex Ball Training Set",
    sku: "BXT-518",
    price: 29.99,
    stock: 67,
    category: "Training",
    status: "active",
    labels: [],
    views: 876,
    sales: 43,
    revenue: 1289.57,
    image: "https://images.unsplash.com/photo-1727529274342-2a35dc2045fc?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1727529274342-2a35dc2045fc?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Improve hand-eye coordination, reflexes, and punching accuracy. Includes 3 difficulty levels of balls and adjustable headband.",
  },
  {
    id: "19",
    name: "Ringside Apex Sparring Gloves - 16oz",
    sku: "BXE-619",
    price: 109.99,
    discountPrice: 94.99,
    stock: 38,
    category: "Equipment",
    status: "active",
    labels: ["New"],
    views: 1432,
    sales: 56,
    revenue: 5319.44,
    image: "https://images.unsplash.com/photo-1669500635486-53b02ec7919b?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1669500635486-53b02ec7919b?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Premium sparring gloves with IMF tech foam for optimal shock absorption. Designed for intense training sessions and partner work.",
  },
  {
    id: "20",
    name: "Fairtex Muay Thai Hand Wraps - 4.5m",
    sku: "BXE-720",
    price: 16.99,
    stock: 180,
    category: "Equipment",
    status: "active",
    labels: ["Popular"],
    views: 2845,
    sales: 167,
    revenue: 2837.33,
    image: "https://images.unsplash.com/photo-1765302931518-babde3b7f56c?ixlib=rb-4.0.3&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1765302931518-babde3b7f56c?ixlib=rb-4.0.3&w=800&q=80"],
    description: "Professional-grade elastic hand wraps at 4.5 meters length. Provides excellent wrist support and knuckle protection for boxing and Muay Thai.",
  },
];

export function StoreManagement() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    discountPrice: "",
    stock: "",
    category: "Equipment",
    status: "active" as "active" | "inactive",
    labels: [] as string[],
    image: "",
    description: "",
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariant, setNewVariant] = useState({ size: "", color: "", stock: "", sku: "" });

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "popularity":
          return b.sales - a.sales;
        case "latest":
          return b.id.localeCompare(a.id);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
  const totalViews = products.reduce((sum, p) => sum + p.views, 0);
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
      stock: parseInt(formData.stock),
      category: formData.category,
      status: formData.status,
      labels: formData.labels,
      views: 0,
      sales: 0,
      revenue: 0,
      image: formData.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
      images: [formData.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop"],
      description: formData.description,
      variants: variants.length > 0 ? variants : undefined,
    };

    setProducts([...products, newProduct]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Product added successfully");
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    setProducts(
      products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name,
              sku: formData.sku,
              price: parseFloat(formData.price),
              discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
              stock: parseInt(formData.stock),
              category: formData.category,
              status: formData.status,
              labels: formData.labels,
              image: formData.image || p.image,
              description: formData.description,
              variants: variants.length > 0 ? variants : undefined,
            }
          : p
      )
    );

    setEditingProduct(null);
    resetForm();
    toast.success("Product updated successfully");
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success("Product deleted successfully");
  };

  const handleBulkExport = () => {
    toast.success("Products exported successfully");
  };

  const handleBulkImport = () => {
    toast.info("Bulk import feature - Upload CSV/Excel file");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      price: "",
      discountPrice: "",
      stock: "",
      category: "Equipment",
      status: "active",
      labels: [],
      image: "",
      description: "",
    });
    setVariants([]);
    setNewVariant({ size: "", color: "", stock: "", sku: "" });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() || "",
      stock: product.stock.toString(),
      category: product.category,
      status: product.status,
      labels: product.labels,
      image: product.image,
      description: product.description || "",
    });
    setVariants(product.variants || []);
  };

  const toggleLabel = (label: string) => {
    setFormData({
      ...formData,
      labels: formData.labels.includes(label)
        ? formData.labels.filter((l) => l !== label)
        : [...formData.labels, label],
    });
  };

  const addVariant = () => {
    if (!newVariant.sku || !newVariant.stock) {
      toast.error("Please fill in variant SKU and stock");
      return;
    }

    setVariants([...variants, {
      size: newVariant.size,
      color: newVariant.color,
      stock: parseInt(newVariant.stock),
      sku: newVariant.sku,
    }]);
    setNewVariant({ size: "", color: "", stock: "", sku: "" });
    toast.success("Variant added");
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
    toast.success("Variant removed");
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="default" className="bg-green-600">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const ProductForm = () => (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-xl">
          <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Info className="w-4 h-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="variants" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Package className="w-4 h-4 mr-2" />
            Variants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-5 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Product Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Professional Fight Gloves"
                  className="mt-2 border-blue-200 focus:border-blue-400 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    SKU Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., FG-001"
                    className="mt-2 border-blue-200 focus:border-blue-400 bg-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-400 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Equipment">🥊 Equipment</SelectItem>
                      <SelectItem value="Apparel">👕 Apparel</SelectItem>
                      <SelectItem value="Collectibles">🏆 Collectibles</SelectItem>
                      <SelectItem value="Training">💪 Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700">Product Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your product features, benefits, and specifications..."
              rows={4}
              className="mt-2 border-gray-200 focus:border-blue-400 resize-none"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700">Product Image</Label>
            <div className="mt-2 space-y-3">
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="border-gray-200 focus:border-blue-400"
              />
              {formData.image && (
                <div className="relative group">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border-2 border-dashed border-gray-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="mt-2 border-gray-200 focus:border-blue-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">✅ Active</SelectItem>
                <SelectItem value="inactive">⏸️ Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-5 mt-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Pricing Details</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  Regular Price <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="pl-8 border-green-200 focus:border-green-400 bg-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Discount Price</Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="0.00"
                    className="pl-8 border-green-200 focus:border-green-400 bg-white"
                  />
                </div>
              </div>
            </div>

            {formData.price && formData.discountPrice && parseFloat(formData.discountPrice) < parseFloat(formData.price) && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-900">
                    You save: ${(parseFloat(formData.price) - parseFloat(formData.discountPrice)).toFixed(2)}
                  </span>
                </div>
                <Badge className="bg-orange-600 text-white">
                  {((1 - parseFloat(formData.discountPrice) / parseFloat(formData.price)) * 100).toFixed(0)}% OFF
                </Badge>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              Stock Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="0"
              className="mt-2 border-gray-200 focus:border-blue-400"
            />
            {formData.stock && parseInt(formData.stock) < 20 && parseInt(formData.stock) > 0 && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-900">Low stock warning - Consider restocking soon</span>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Product Labels</Label>
            <div className="flex flex-wrap gap-2">
              {["Best Seller", "New", "Popular"].map((label) => (
                <Button
                  key={label}
                  type="button"
                  variant={formData.labels.includes(label) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleLabel(label)}
                  className={formData.labels.includes(label)
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                    : "border-2 hover:border-blue-400"
                  }
                >
                  <Tag className="w-3 h-3 mr-1.5" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="variants" className="space-y-5 mt-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Add New Variant</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Input
                placeholder="Size (S, M, L)"
                value={newVariant.size}
                onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                className="border-purple-200 focus:border-purple-400 bg-white"
              />
              <Input
                placeholder="Color"
                value={newVariant.color}
                onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                className="border-purple-200 focus:border-purple-400 bg-white"
              />
              <Input
                placeholder="Stock"
                type="number"
                value={newVariant.stock}
                onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                className="border-purple-200 focus:border-purple-400 bg-white"
              />
              <Input
                placeholder="SKU *"
                value={newVariant.sku}
                onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                className="border-purple-200 focus:border-purple-400 bg-white font-mono"
              />
            </div>
            <Button
              type="button"
              onClick={addVariant}
              className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Variant
            </Button>
          </div>

          {variants.length > 0 && (
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Color</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {variants.map((variant, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{variant.size || "-"}</td>
                      <td className="px-4 py-3 text-sm">{variant.color || "-"}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{variant.stock}</td>
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">{variant.sku}</td>
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {variants.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">No variants added yet</h3>
              <p className="text-gray-600 text-sm">
                Add variants to offer different sizes or colors for this product
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold">Product Management</h1>
              <p className="text-gray-600 mt-1">
                Manage products, inventory, and pricing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Add New Product
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the product details below to add a new item to your inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <ProductForm />
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddProduct}
                      disabled={!formData.name || !formData.sku || !formData.price || !formData.stock}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="gap-2" onClick={handleBulkImport}>
                <Upload className="w-4 h-4" />
                Import
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleBulkExport}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-green-500">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                  <p className="font-bold text-2xl text-green-600">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Sales</p>
                  <p className="font-bold text-2xl text-blue-600">{totalSales}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-purple-500">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Views</p>
                  <p className="font-bold text-2xl text-purple-600">{totalViews.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-orange-500">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Products</p>
                  <p className="font-bold text-2xl text-orange-600">{activeProducts}/{totalProducts}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="p-4 shadow-md">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or SKU..."
                    className="pl-10 border-gray-300"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Apparel">Apparel</SelectItem>
                  <SelectItem value="Collectibles">Collectibles</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                  <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="latest">Latest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Products Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-2xl transition-all group cursor-pointer border-2 hover:border-blue-400"
                onClick={() => setViewingProduct(product)}
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {product.labels.map((label) => (
                      <Badge key={label} className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs shadow-lg">
                        {label}
                      </Badge>
                    ))}
                  </div>
                  {product.discountPrice && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg">
                        -{((1 - product.discountPrice / product.price) * 100).toFixed(0)}% OFF
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold line-clamp-2 text-sm leading-tight">{product.name}</h3>
                    {getStatusBadge(product.status)}
                  </div>

                  <p className="text-xs text-gray-500 font-mono mb-2 bg-gray-100 px-2 py-1 rounded inline-block">{product.sku}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">{product.category}</Badge>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    {product.discountPrice ? (
                      <>
                        <span className="font-bold text-xl text-green-600">${product.discountPrice}</span>
                        <span className="text-sm line-through text-gray-400">${product.price}</span>
                      </>
                    ) : (
                      <span className="font-bold text-xl text-gray-900">${product.price}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3 pb-3 border-b">
                    <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                      <Package className="w-3 h-3 text-blue-600" />
                      <span className="font-semibold">{product.stock}</span>
                    </span>
                    <span className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                      <ShoppingCart className="w-3 h-3 text-green-600" />
                      <span className="font-semibold">{product.sales}</span>
                    </span>
                    <span className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded">
                      <Eye className="w-3 h-3 text-purple-600" />
                      <span className="font-semibold">{product.views}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-blue-200 hover:bg-blue-50 hover:border-blue-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(product);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Edit Product
                          </DialogTitle>
                          <DialogDescription>
                            Update the product information below.
                          </DialogDescription>
                        </DialogHeader>
                        <ProductForm />
                        <DialogFooter className="gap-2">
                          <Button variant="outline" onClick={() => { setEditingProduct(null); resetForm(); }}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateProduct}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Update Product
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.id);
                      }}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Product Detail Dialog */}
          <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {viewingProduct && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{viewingProduct.name}</DialogTitle>
                    <DialogDescription>Product Details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <img
                          src={viewingProduct.image}
                          alt={viewingProduct.name}
                          className="w-full h-96 object-cover rounded-xl border-2"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-600 mb-1">SKU</h3>
                          <p className="font-mono text-lg">{viewingProduct.sku}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-600 mb-1">Category</h3>
                          <Badge variant="outline">{viewingProduct.category}</Badge>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-600 mb-1">Status</h3>
                          {getStatusBadge(viewingProduct.status)}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-600 mb-1">Price</h3>
                          <div className="flex items-baseline gap-2">
                            {viewingProduct.discountPrice ? (
                              <>
                                <span className="font-bold text-2xl text-green-600">${viewingProduct.discountPrice}</span>
                                <span className="text-lg line-through text-gray-400">${viewingProduct.price}</span>
                                <Badge className="bg-green-600">
                                  -{((1 - viewingProduct.discountPrice / viewingProduct.price) * 100).toFixed(0)}% OFF
                                </Badge>
                              </>
                            ) : (
                              <span className="font-bold text-2xl">${viewingProduct.price}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-600 mb-1">Labels</h3>
                          <div className="flex gap-2">
                            {viewingProduct.labels.map((label) => (
                              <Badge key={label} className="bg-red-600">{label}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {viewingProduct.description && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Description</h3>
                        <p className="text-gray-700 leading-relaxed">{viewingProduct.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-4 text-center">
                        <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Stock</p>
                        <p className="text-2xl font-bold">{viewingProduct.stock}</p>
                      </Card>
                      <Card className="p-4 text-center">
                        <ShoppingCart className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Sales</p>
                        <p className="text-2xl font-bold">{viewingProduct.sales}</p>
                      </Card>
                      <Card className="p-4 text-center">
                        <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Views</p>
                        <p className="text-2xl font-bold">{viewingProduct.views}</p>
                      </Card>
                    </div>

                    {viewingProduct.variants && viewingProduct.variants.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-3">Product Variants</h3>
                        <div className="border rounded-xl overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Size</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Color</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">SKU</th>
                              </tr>
                            </thead>
                            <tbody>
                              {viewingProduct.variants.map((variant, index) => (
                                <tr key={index} className="border-b last:border-0">
                                  <td className="px-4 py-3 text-sm font-medium">{variant.size || "-"}</td>
                                  <td className="px-4 py-3 text-sm">{variant.color || "-"}</td>
                                  <td className="px-4 py-3 text-sm font-semibold">{variant.stock}</td>
                                  <td className="px-4 py-3 text-sm font-mono text-blue-600">{variant.sku}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setViewingProduct(null)}>
                      Close
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {filteredProducts.length === 0 && (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 text-lg mb-2">No products found</h3>
              <p className="text-gray-600 text-sm mb-4">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}>
                Clear Filters
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
