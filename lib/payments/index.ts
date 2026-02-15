import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mock";

// Later: swap this to StripePaymentProvider (we’ll keep it modular)
export function getPaymentProvider(): PaymentProvider {
  return new MockPaymentProvider();
}