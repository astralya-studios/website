import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";

/** GET /api/orders/[id] — public-safe order lookup for the confirmation page. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
