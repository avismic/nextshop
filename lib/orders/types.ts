export type OrderItem = {
  id: string;
  name: string;
  unitPrice: number; // cents
  qty: number;
};

export type ShippingAddress = {
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

export type Order = {
  id: string;
  createdAt: number;
  customer: {
    name: string;
    email: string;
  };
  address: ShippingAddress;
  items: OrderItem[];
  pricing: {
    subtotal: number; // cents
    shipping: number; // cents
    total: number; // cents
    currency: "INR";
  };
  payment: {
    provider: "mock" | "stripe";
    paymentId: string;
    status: "paid" | "requires_action" | "failed";
  };
};