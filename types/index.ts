export type PlaygroundId =
  | "legacy"
  | "api-services"
  | "event-pipeline"
  | "ai-quality"
  | "flaky"
  | "accessibility"
  | "release-risk";

export interface PlaygroundAccount {
  email: string;
  password: string;
  playground: PlaygroundId;
  label: string;
  description: string;
  route: string;
}

export interface SessionUser {
  email: string;
  playground: PlaygroundId;
}

export type BugSeverity = "low" | "medium" | "high";
export type BugType =
  | "visual"
  | "copy"
  | "accessibility"
  | "analytics"
  | "sorting"
  | "state"
  | "responsive"
  | "data"
  | "api"
  | "event"
  | "flaky"
  | "validation";

export interface Bug {
  id: string;
  playground: string;
  type: BugType;
  description: string;
  expectedBehavior: string;
  actualBehavior: string;
  severity: BugSeverity;
  detectable: boolean;
  testHint: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  price: number;
  salePrice: number | null;
  inventory: number;
  rating: number;
  vendor: string;
  active: boolean;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  priceAtAdd: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface AppEvent {
  eventId: string;
  userId: string;
  type: EventType;
  productId?: string;
  cartId?: string;
  orderId?: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export type EventType =
  | "PRODUCT_VIEWED"
  | "PRODUCT_SEARCHED"
  | "PRODUCT_FILTER_APPLIED"
  | "ITEM_ADDED_TO_CART"
  | "CART_QUANTITY_UPDATED"
  | "ORDER_SUBMITTED"
  | "ORDER_FAILED";
