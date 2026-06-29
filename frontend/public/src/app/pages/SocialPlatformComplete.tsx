import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Target, ShoppingCart, Users, Wallet, TrendingUp, Trophy, Star, Heart, MessageCircle, Share2, Plus, Minus, CreditCard, MapPin, Phone, Package, CheckCircle, Clock, Flame, Zap } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { useOrders } from "../contexts/OrderContext";
import { toast } from "sonner";

type View = "home" | "betting" | "shop" | "cart" | "checkout" | "wallet" | "orders" | "feed";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
  seller?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Bet {
  matchId: string;
  fighter1: string;
  fighter2: string;
  selectedFighter: string;
  amount: number;
  odds: number;
  potentialWin: number;
}

export function SocialPlatformComplete() {
  const { balance, deductBalance, addBalance, transactions } = useWallet();
  const { orders, createOrder } = useOrders();
  
  const [currentView, setCurrentView] = useState<View>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    phone: ""
  });

  const products: Product[] = [
    {
      id: "1",
      name: "Prom Samnang Signature Gloves",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400",
      category: "Gloves",
      rating: 4.9,
      inStock: true,
      seller: "Prom Samnang"
    },
    {
      id: "2",
      name: "Traditional Khmer Shorts - Red",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400",
      category: "Shorts",
      rating: 4.8,
      inStock: true
    },
    {
      id: "3",
      name: "Professional Hand Wraps",
      price: 19.99,
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
      category: "Equipment",
      rating: 4.7,
      inStock: true
    },
    {
      id: "4",
      name: "Chan Rothana Training Gloves",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400",
      category: "Gloves",
      rating: 4.9,
      inStock: true,
      seller: "Chan Rothana"
    },
    {
      id: "5",
      name: "Traditional Khmer Shorts - Gold",
      price: 54.99,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      category: "Shorts",
      rating: 4.8,
      inStock: true
    },
    {
      id: "6",
      name: "Shin Guards - Premium",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400",
      category: "Equipment",
      rating: 4.6,
      inStock: true
    }
  ];

  const matches = [
    {
      id: "1",
      fighter1: { name: "Prom Samnang", image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400", odds: 1.8 },
      fighter2: { name: "Chan Rothana", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400", odds: 2.2 },
      event: "KKF Championship",
      date: "2026-04-15",
      status: "upcoming"
    },
    {
      id: "2",
      fighter1: { name: "Thun Chanthy", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400", odds: 1.5 },
      fighter2: { name: "Sok Pisey", image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400", odds: 2.8 },
      event: "KKF Championship",
      date: "2026-04-15",
      status: "upcoming"
    }
  ];

  const feedPosts = [
    {
      id: "1",
      author: "Prom Samnang",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400",
      content: "Training hard for the championship fight! 💪 Who's ready for April 15th?",
      image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600",
      likes: 2453,
      comments: 187,
      timestamp: "2 hours ago"
    },
    {
      id: "2",
      author: "KKF Official",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      content: "Championship tickets now available! Limited seats remaining. 🎟️",
      likes: 1876,
      comments: 234,
      timestamp: "4 hours ago"
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
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      toast.error("Please fill in all shipping information");
      return;
    }

    const pointsNeeded = Math.floor(total * 10); // 10 points per dollar
    
    if (deductBalance(pointsNeeded, `Purchase: ${cart.length} items`, "purchase")) {
      const orderItems = cart.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const orderId = createOrder(orderItems, shippingInfo, total);
      
      setCart([]);
      setShippingInfo({ fullName: "", address: "", city: "", phone: "" });
      toast.success(`Order placed! Order #${orderId}`);
      setCurrentView("orders");
    } else {
      toast.error("Insufficient points. Please deposit more points.");
    }
  };

  // Betting Functions
  const placeBet = (matchId: string, fighter: string, amount: number, odds: number) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    if (deductBalance(amount, `Bet on ${fighter}`, "bet_placed")) {
      const potentialWin = Math.floor(amount * odds);
      const newBet: Bet = {
        matchId,
        fighter1: match.fighter1.name,
        fighter2: match.fighter2.name,
        selectedFighter: fighter,
        amount,
        odds,
        potentialWin
      };
      setActiveBets([...activeBets, newBet]);
      toast.success(`Bet placed: ${amount} pts on ${fighter}`);
    } else {
      toast.error("Insufficient balance");
    }
  };

  const calculateOdds = (baseOdds: number) => {
    return baseOdds.toFixed(2);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Render Functions
  const renderHome = () => (
    <div className="space-y-6 pb-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-[#F2C94C] to-yellow-600 rounded-2xl p-4 text-center">
          <Wallet className="w-6 h-6 text-white mx-auto mb-2" />
          <p className="text-xs text-white/80 font-bold">Balance</p>
          <p className="text-xl font-black text-white">{balance} pts</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-center">
          <Target className="w-6 h-6 text-white mx-auto mb-2" />
          <p className="text-xs text-white/80 font-bold">Bets</p>
          <p className="text-xl font-black text-white">{activeBets.length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#C8102E] to-red-600 rounded-2xl p-4 text-center">
          <ShoppingCart className="w-6 h-6 text-white mx-auto mb-2" />
          <p className="text-xs text-white/80 font-bold">Cart</p>
          <p className="text-xl font-black text-white">{cartItemCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setCurrentView("betting")}
          className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all text-center"
        >
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <span className="text-xs font-bold text-green-700">Place Bet</span>
        </button>
        <button
          onClick={() => setCurrentView("shop")}
          className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border-2 border-red-200 hover:border-red-400 transition-all text-center"
        >
          <ShoppingCart className="w-8 h-8 text-[#C8102E] mx-auto mb-2" />
          <span className="text-xs font-bold text-[#C8102E]">Shop</span>
        </button>
        <button
          onClick={() => setCurrentView("feed")}
          className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all text-center"
        >
          <Users className="w-8 h-8 text-[#0A3D91] mx-auto mb-2" />
          <span className="text-xs font-bold text-[#0A3D91]">Feed</span>
        </button>
      </div>

      {/* Featured Section */}
      <div className="bg-gradient-to-r from-[#C8102E] to-[#E91E3A] rounded-2xl p-6 text-white">
        <h3 className="text-xl font-black mb-2">Championship Week!</h3>
        <p className="text-sm mb-4">Place your bets and shop exclusive fighter gear</p>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentView("betting")}
            className="flex-1 px-4 py-2 bg-white text-[#C8102E] rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Bet Now
          </button>
          <button
            onClick={() => setCurrentView("shop")}
            className="flex-1 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-all"
          >
            Shop Gear
          </button>
        </div>
      </div>
    </div>
  );

  const renderBetting = () => (
    <div className="space-y-4 pb-6">
      <h2 className="text-2xl font-black text-[#1A1A24]">Match Betting</h2>
      {matches.map((match) => (
        <div key={match.id} className="bg-white rounded-2xl shadow-xl border-2 border-[#E0E0E0] p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#707070]">{match.event}</span>
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              LIVE BETTING
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Fighter 1 */}
            <div className="text-center">
              <img
                src={match.fighter1.image}
                alt={match.fighter1.name}
                className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-[#0A3D91] object-cover"
              />
              <h4 className="text-sm font-black text-[#1A1A24] mb-1">{match.fighter1.name}</h4>
              <span className="px-3 py-1 bg-[#0A3D91] text-white text-sm font-bold rounded-lg">
                {calculateOdds(match.fighter1.odds)}x
              </span>
            </div>

            {/* Fighter 2 */}
            <div className="text-center">
              <img
                src={match.fighter2.image}
                alt={match.fighter2.name}
                className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-[#C8102E] object-cover"
              />
              <h4 className="text-sm font-black text-[#1A1A24] mb-1">{match.fighter2.name}</h4>
              <span className="px-3 py-1 bg-[#C8102E] text-white text-sm font-bold rounded-lg">
                {calculateOdds(match.fighter2.odds)}x
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => placeBet(match.id, match.fighter1.name, 100, match.fighter1.odds)}
              className="px-4 py-3 bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Bet 100 pts
            </button>
            <button
              onClick={() => placeBet(match.id, match.fighter2.name, 100, match.fighter2.odds)}
              className="px-4 py-3 bg-gradient-to-r from-[#C8102E] to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Bet 100 pts
            </button>
          </div>
        </div>
      ))}

      {/* Active Bets */}
      {activeBets.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-[#E0E0E0] p-4">
          <h3 className="text-lg font-black text-[#1A1A24] mb-3">Your Active Bets</h3>
          <div className="space-y-3">
            {activeBets.map((bet, idx) => (
              <div key={idx} className="p-3 bg-[#F8F9FA] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#1A1A24]">{bet.selectedFighter}</span>
                  <span className="text-xs font-bold text-green-600">{bet.odds}x odds</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#707070]">
                  <span>Bet: {bet.amount} pts</span>
                  <span>Potential: {bet.potentialWin} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderShop = () => (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#1A1A24]">Equipment Store</h2>
        <button
          onClick={() => setCurrentView("cart")}
          className="relative p-3 bg-[#C8102E] rounded-xl hover:shadow-lg transition-all"
        >
          <ShoppingCart className="w-5 h-5 text-white" />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#F2C94C] rounded-full flex items-center justify-center text-xs font-black text-[#1A1A24]">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-square bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h4 className="text-sm font-black text-[#1A1A24] mb-1 line-clamp-2">
                {product.name}
              </h4>
              {product.seller && (
                <p className="text-xs text-[#707070] mb-2">by {product.seller}</p>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-black text-[#C8102E]">${product.price}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#F2C94C] text-[#F2C94C]" />
                  <span className="text-xs font-bold text-[#707070]">{product.rating}</span>
                </div>
              </div>
              <button
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
                className="w-full px-4 py-2 bg-[#C8102E] text-white rounded-lg font-bold hover:bg-[#A00D24] transition-all disabled:bg-gray-300"
              >
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="space-y-4 pb-6">
      <h2 className="text-2xl font-black text-[#1A1A24]">Shopping Cart</h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-[#707070] mx-auto mb-4" />
          <p className="text-lg font-bold text-[#707070]">Your cart is empty</p>
          <button
            onClick={() => setCurrentView("shop")}
            className="mt-4 px-6 py-3 bg-[#C8102E] text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-[#1A1A24] mb-1">{item.name}</h4>
                    <p className="text-lg font-black text-[#C8102E] mb-2">${item.price}</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-xs font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-[#1A1A24]">Total</span>
              <span className="text-2xl font-black text-[#C8102E]">${cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-sm text-[#707070] mb-4">Cost: {Math.floor(cartTotal * 10)} points</p>
            <button
              onClick={() => setCurrentView("checkout")}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#C8102E] to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderCheckout = () => (
    <div className="space-y-4 pb-6">
      <h2 className="text-2xl font-black text-[#1A1A24]">Checkout</h2>

      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-lg font-black text-[#1A1A24] mb-4">Shipping Information</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            value={shippingInfo.fullName}
            onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
            className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl text-[#1A1A24] font-medium placeholder:text-[#707070] focus:ring-2 focus:ring-[#0A3D91]"
          />
          <input
            type="text"
            placeholder="Address"
            value={shippingInfo.address}
            onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
            className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl text-[#1A1A24] font-medium placeholder:text-[#707070] focus:ring-2 focus:ring-[#0A3D91]"
          />
          <input
            type="text"
            placeholder="City"
            value={shippingInfo.city}
            onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
            className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl text-[#1A1A24] font-medium placeholder:text-[#707070] focus:ring-2 focus:ring-[#0A3D91]"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={shippingInfo.phone}
            onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
            className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl text-[#1A1A24] font-medium placeholder:text-[#707070] focus:ring-2 focus:ring-[#0A3D91]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-lg font-black text-[#1A1A24] mb-4">Order Summary</h3>
        <div className="space-y-2 mb-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-[#707070]">{item.name} x{item.quantity}</span>
              <span className="font-bold text-[#1A1A24]">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-[#E0E0E0] pt-4">
          <div className="flex justify-between mb-2">
            <span className="text-lg font-bold text-[#1A1A24]">Total</span>
            <span className="text-2xl font-black text-[#C8102E]">${cartTotal.toFixed(2)}</span>
          </div>
          <p className="text-sm text-[#707070] mb-4">
            Payment: {Math.floor(cartTotal * 10)} points from wallet
          </p>
          <button
            onClick={checkoutOrder}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#C8102E] to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Complete Order
          </button>
        </div>
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="space-y-4 pb-6">
      <h2 className="text-2xl font-black text-[#1A1A24]">Wallet</h2>

      <div className="bg-gradient-to-r from-[#0A3D91] to-blue-600 rounded-2xl p-6 text-white">
        <p className="text-sm mb-2">Available Balance</p>
        <p className="text-4xl font-black mb-4">{balance} pts</p>
        <div className="grid grid-cols-2 gap-3">
          <button className="px-4 py-2 bg-white text-[#0A3D91] rounded-xl font-bold hover:shadow-lg transition-all">
            Deposit
          </button>
          <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-all">
            Withdraw
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-lg font-black text-[#1A1A24] mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.slice(0, 10).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-xl">
              <div>
                <p className="text-sm font-bold text-[#1A1A24]">{tx.description}</p>
                <p className="text-xs text-[#707070]">{new Date(tx.timestamp).toLocaleString()}</p>
              </div>
              <span className={`text-lg font-black ${
                tx.type.includes('deposit') || tx.type.includes('won') ? 'text-green-600' : 'text-[#C8102E]'
              }`}>
                {tx.type.includes('deposit') || tx.type.includes('won') ? '+' : '-'}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4 pb-6">
      <h2 className="text-2xl font-black text-[#1A1A24]">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-[#707070] mx-auto mb-4" />
          <p className="text-lg font-bold text-[#707070]">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black text-[#1A1A24]">{order.id}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-[#707070] mb-2">{order.items.length} items</p>
              <p className="text-lg font-black text-[#C8102E] mb-3">${order.total.toFixed(2)}</p>
              {order.trackingNumber && (
                <p className="text-xs text-[#707070]">Tracking: {order.trackingNumber}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFeed = () => (
    <div className="space-y-4 pb-6">
      <h2 className="text-2xl font-black text-[#1A1A24]">Social Feed</h2>

      {feedPosts.map((post) => (
        <div key={post.id} className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={post.avatar}
              alt={post.author}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-[#1A1A24]">{post.author}</h4>
                {post.verified && (
                  <Zap className="w-4 h-4 text-[#0A3D91]" />
                )}
              </div>
              <p className="text-xs text-[#707070]">{post.timestamp}</p>
            </div>
          </div>

          <p className="text-sm text-[#1A1A24] mb-3">{post.content}</p>

          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="w-full rounded-xl mb-3 object-cover"
            />
          )}

          <div className="flex items-center gap-6 text-[#707070]">
            <button className="flex items-center gap-2 hover:text-[#C8102E] transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-bold">{post.likes}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-[#0A3D91] transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-bold">{post.comments}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-[#F2C94C] transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-white to-[#F8F9FA]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#C8102E] to-[#E91E3A] border-b-4 border-red-700 shadow-xl">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <Flame className="w-6 h-6" />
                Social Platform
              </h1>
              <p className="text-xs text-red-100 font-medium">
                Bet • Shop • Connect
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
          {[
            { id: "home", label: "Home", icon: Trophy },
            { id: "betting", label: "Betting", icon: Target },
            { id: "shop", label: "Shop", icon: ShoppingCart },
            { id: "feed", label: "Feed", icon: Users },
            { id: "wallet", label: "Wallet", icon: Wallet },
            { id: "orders", label: "Orders", icon: Package }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id as View)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                currentView === id
                  ? "bg-white text-[#C8102E]"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {currentView === "home" && renderHome()}
        {currentView === "betting" && renderBetting()}
        {currentView === "shop" && renderShop()}
        {currentView === "cart" && renderCart()}
        {currentView === "checkout" && renderCheckout()}
        {currentView === "wallet" && renderWallet()}
        {currentView === "orders" && renderOrders()}
        {currentView === "feed" && renderFeed()}
      </div>
    </div>
  );
}
