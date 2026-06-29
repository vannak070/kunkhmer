import { createContext, useContext, useState, ReactNode } from "react";

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  phone: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  shipping: ShippingInfo;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  trackingNumber?: string;
}

interface OrderContextType {
  orders: Order[];
  createOrder: (items: OrderItem[], shipping: ShippingInfo, total: number) => string;
  getOrder: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const createOrder = (items: OrderItem[], shipping: ShippingInfo, total: number): string => {
    const orderId = `ORD-${Date.now()}`;
    const trackingNumber = `KK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    const newOrder: Order = {
      id: orderId,
      items,
      total,
      shipping,
      status: "pending",
      createdAt: new Date().toISOString(),
      trackingNumber
    };

    setOrders(prev => [newOrder, ...prev]);
    
    setTimeout(() => {
      updateOrderStatus(orderId, "processing");
    }, 2000);

    return orderId;
  };

  const getOrder = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, getOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
}
