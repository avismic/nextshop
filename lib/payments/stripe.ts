import type { PaymentProvider, CreatePaymentInput, PaymentResult } from "./types";

export class StripePaymentProvider implements PaymentProvider {
  async createPayment(_input: CreatePaymentInput): Promise<PaymentResult> {
    // TODO: Integrate Stripe Checkout / Payment Intents later
    throw new Error("Stripe provider not implemented yet.");
  }
}
