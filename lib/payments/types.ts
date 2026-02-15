export type Money = {
  amount: number; // cents
  currency: "INR";
};

export type PaymentLineItem = {
  id: string;
  name: string;
  unitPrice: number; // cents
  qty: number;
};

export type CreatePaymentInput = {
  orderId: string;
  total: Money;
  items: PaymentLineItem[];
  customer: {
    name: string;
    email: string;
  };
};

export type PaymentResult = {
  provider: "mock" | "stripe";
  paymentId: string;
  status: "paid" | "requires_action" | "failed";
};

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
}