import type { PaymentProvider, CreatePaymentInput, PaymentResult } from "./types";

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(_input: CreatePaymentInput): Promise<PaymentResult> {
    // Simulate a short network delay
    await new Promise((r) => setTimeout(r, 600));

    return {
      provider: "mock",
      paymentId: `mock_${Math.random().toString(36).slice(2, 10)}`,
      status: "paid",
    };
  }
}