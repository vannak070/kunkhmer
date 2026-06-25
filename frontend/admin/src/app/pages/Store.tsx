import { useState } from "react";
import { ShoppingCart, Package, TrendingUp, Users, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  views?: number;
  addToCartCount?: number;
}

const products: Product[] = [
  {
    id: "1",
    name: "Emily Rodriguez Signature Fight Gloves",
    price: 79.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=400&fit=crop",
    category: "All products",
    views: 1243,
    addToCartCount: 89,
  },
  {
    id: "2",
    name: "Traditional Khmer Shorts - Gold Edition",
    price: 44.99,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop",
    category: "Apparel",
    views: 2156,
    addToCartCount: 134,
  },
  {
    id: "3",
    name: "KKF Premium Hand Wraps Set",
    price: 19.99,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
    category: "All products",
    views: 987,
    addToCartCount: 67,
  },
  {
    id: "4",
    name: "Cobra Stadium Training Headgear",
    price: 89.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop",
    category: "Training",
    views: 1567,
    addToCartCount: 92,
  },
  {
    id: "5",
    name: "Championship Belt Replica",
    price: 149.99,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop",
    category: "Collectibles",
    views: 3421,
    addToCartCount: 201,
  },
  {
    id: "6",
    name: "Professional Shin Guards",
    price: 64.99,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=400&fit=crop",
    category: "Training",
    views: 876,
    addToCartCount: 54,
  },
  {
    id: "7",
    name: "KKF Official Jersey 2026",
    price: 39.99,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    category: "Apparel",
    views: 2890,
    addToCartCount: 178,
  },
  {
    id: "8",
    name: "Heavy Bag - Professional Grade",
    price: 199.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
    category: "Equipment",
    views: 1234,
    addToCartCount: 43,
  },
];

export function Store() {
  const [selectedCategory, setSelectedCategory] = useState("All products");
  const [benchmarkData, setBenchmarkData] = useState({
    totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
    totalAddToCarts: products.reduce((sum, p) => sum + (p.addToCartCount || 0), 0),
    conversionRate: 0,
    topProduct: products.reduce((max, p) =>
      (p.addToCartCount || 0) > (max.addToCartCount || 0) ? p : max
    ),
  });

  const categories = [
    "All products",
    "Apparel",
    "Training",
    "Equipment",
    "Collectibles",
  ];

  const filteredProducts =
    selectedCategory === "All products"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    // Update benchmark data
    setBenchmarkData((prev) => {
      const newAddToCarts = prev.totalAddToCarts + 1;
      const conversionRate = ((newAddToCarts / prev.totalViews) * 100).toFixed(
        2
      );
      return {
        ...prev,
        totalAddToCarts: newAddToCarts,
        conversionRate: parseFloat(conversionRate),
      };
    });

    toast.success(`${product.name} added to cart`);
  };

  const handleProductView = (product: Product) => {
    // Simulate view tracking
    setBenchmarkData((prev) => ({
      ...prev,
      totalViews: prev.totalViews + 1,
      conversionRate: parseFloat(
        ((prev.totalAddToCarts / (prev.totalViews + 1)) * 100).toFixed(2)
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold">Official Store</h1>
              <p className="text-gray-600 mt-1">
                Premium fight gear, apparel, and collectibles
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Cart (0)
            </Button>
          </div>
        </div>
      </div>

      {/* Benchmark Dashboard */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Store Benchmark Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="font-bold">{benchmarkData.totalViews}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Add to Carts</p>
                  <p className="font-bold">{benchmarkData.totalAddToCarts}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="font-bold">{benchmarkData.conversionRate}%</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Top Product</p>
                  <p className="text-sm font-bold truncate">
                    {benchmarkData.topProduct.name.slice(0, 20)}...
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleProductView(product)}
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.addToCartCount && product.addToCartCount > 100 && (
                  <Badge className="absolute top-2 right-2 bg-red-600">
                    Popular
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{product.rating}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold">${product.price}</p>
                  {product.views && (
                    <span className="text-xs text-gray-500">
                      {product.views} views
                    </span>
                  )}
                </div>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
