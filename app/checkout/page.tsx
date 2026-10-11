import { getPaymentsMode } from "@/lib/payments";
import CheckoutFlow from "@/components/CheckoutFlow";

export const metadata = {
  title: "Checkout",
  description: "Complete your Astralya order.",
};

/**
 * Server wrapper: determines the payments mode so the UI can show an
 * honest test-mode banner. The form itself is client-side (cart lives in
 * the browser).
 */
export default function CheckoutPage() {
  const mode = getPaymentsMode();
  return <CheckoutFlow mode={mode} />;
}
