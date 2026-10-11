import { NextResponse } from "next/server";
import { getSign, effectiveStatus } from "@/lib/catalog";
import {
  createOrder,
  updateOrder,
  getRemaining,
  shippingFor,
} from "@/lib/orders";
import type { OrderItem, ShippingAddress } from "@/lib/orders";
import { getPaymentDriver } from "@/lib/payments";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * POST /api/checkout
 * Creates a pending order, then asks the payment driver for a hosted
 * checkout session and returns its URL. All prices are computed
 * server-side from the catalog — client totals are ignored.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request body.");
  }

  const { items, customer, shippingAddress } = body as {
    items?: Array<{ signId?: string; qty?: number }>;
    customer?: { email?: string; name?: string };
    shippingAddress?: ShippingAddress;
  };

  // --- Validate items ---
  if (!Array.isArray(items) || items.length === 0) {
    return bad("Your cart is empty.");
  }
  const orderItems: OrderItem[] = [];
  for (const raw of items) {
    const signId = String(raw?.signId ?? "");
    const qty = Number(raw?.qty);
    const sign = getSign(signId);
    if (!sign) return bad("One of your items is no longer available.");
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return bad("Invalid quantity.");
    }
    const remaining = await getRemaining(sign.id);
    const status = effectiveStatus(sign, remaining);
    if (status === "waitlist") {
      return bad(
        `${sign.name} isn't available for purchase yet — join the waitlist instead.`
      );
    }
    if (
      status === "available" &&
      remaining !== null &&
      qty > remaining
    ) {
      return bad(`Only ${remaining} × ${sign.name} left in stock.`);
    }
    orderItems.push({
      signId: sign.id,
      name: sign.characterName ?? `${sign.name} Plush`,
      qty,
      unitPrice: sign.price,
    });
  }

  // --- Validate customer + address ---
  const email = String(customer?.email ?? "").trim();
  const name = String(customer?.name ?? "").trim();
  if (!EMAIL_RE.test(email)) return bad("Enter a valid email address.");
  if (!name) return bad("Enter your name.");
  const addr = shippingAddress;
  for (const field of ["address1", "city", "region", "postalCode", "country"] as const) {
    if (!addr || !String(addr[field] ?? "").trim()) {
      return bad("Please complete the shipping address.");
    }
  }

  // --- Totals (server-side) ---
  const subtotal = orderItems.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  // --- Create the pending order ---
  const driver = getPaymentDriver();
  const order = await createOrder({
    items: orderItems,
    subtotal,
    shipping,
    total,
    currency: "USD",
    customer: { name, email },
    shippingAddress: {
      name,
      address1: String(addr!.address1).trim(),
      address2: String(addr!.address2 ?? "").trim() || undefined,
      city: String(addr!.city).trim(),
      region: String(addr!.region).trim(),
      postalCode: String(addr!.postalCode).trim(),
      country: String(addr!.country).trim(),
    },
    payment: { driver: driver.name, mode: driver.mode, sessionId: null },
  });

  // --- Ask the driver for a checkout session ---
  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const lineItems = orderItems.map((i) => ({
    name: i.name,
    description: `${getSign(i.signId)?.name} — Astralya 12 Sun Signs`,
    unitAmount: Math.round(i.unitPrice * 100),
    currency: "USD",
    quantity: i.qty,
  }));
  if (shipping > 0) {
    lineItems.push({
      name: "Shipping",
      description: "Standard shipping",
      unitAmount: Math.round(shipping * 100),
      currency: "USD",
      quantity: 1,
    });
  }

  try {
    const session = await driver.createCheckoutSession({
      orderId: order.id,
      customerEmail: email,
      items: lineItems,
      successUrl: `${origin}/checkout/success?order=${encodeURIComponent(order.id)}`,
      cancelUrl: `${origin}/checkout?cancelled=1`,
      metadata: { orderId: order.id },
    });
    await updateOrder(order.id, {
      payment: { driver: driver.name, mode: driver.mode, sessionId: session.id },
    });
    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (err) {
    await updateOrder(order.id, { status: "cancelled" });
    console.error("Checkout session failed:", err);
    return bad(
      "Couldn't start checkout. Please try again.",
      500
    );
  }
}
