import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";
import { markOrderPaid } from "@/lib/orders";
import { getPaymentsMode } from "@/lib/payments";
import { updateOrder } from "@/lib/orders";

/**
 * POST /api/checkout/dev-confirm
 * Dev driver only: simulate the customer paying or cancelling on the
 * test payment page. Rejected outright when a real provider is configured.
 */
export async function POST(req: Request) {
  if (getPaymentsMode() !== "dev") {
    return NextResponse.json(
      { error: "Test payments are disabled." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const { orderId, action } = body as { orderId?: string; action?: string };
  if (!orderId || !["pay", "cancel"].includes(action ?? "")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const order = await getOrder(orderId);
  if (!order || order.status !== "pending") {
    return NextResponse.json(
      { error: "Order not found or already processed." },
      { status: 404 }
    );
  }

  if (action === "pay") {
    await markOrderPaid(order.id);
  } else {
    await updateOrder(order.id, { status: "cancelled" });
  }
  return NextResponse.json({ ok: true });
}
