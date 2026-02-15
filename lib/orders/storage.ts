import type { Order } from "./types";

const ORDERS_KEY = "orders-v1";

export function addOrder(order: Order) {
  if (typeof window === "undefined") return;
  const orders = getOrders();
  orders.unshift(order); // newest first
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(ORDERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getOrderById(id: string): Order | null {
  const orders = getOrders();
  return orders.find((o) => o.id === id) ?? null;
}

export function getLastOrder(): Order | null {
  const orders = getOrders();
  return orders.length ? orders[0] : null;
}

export function clearOrders() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ORDERS_KEY);
}