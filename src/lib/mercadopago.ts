import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { appUrl } from "@/lib/money";

export function mpConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

function getClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });
}

export type PreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
};

export async function createCheckoutPreference(params: {
  orderId: string;
  email: string;
  items: PreferenceItem[];
}): Promise<{ id: string; initPoint: string }> {
  if (!mpConfigured()) {
    throw new Error("Mercado Pago não configurado");
  }

  const preference = new Preference(getClient());
  const result = await preference.create({
    body: {
      external_reference: params.orderId,
      payer: { email: params.email },
      items: params.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: "BRL",
      })),
      back_urls: {
        success: appUrl(`/pedido/${params.orderId}?status=success`),
        failure: appUrl(`/pedido/${params.orderId}?status=failure`),
        pending: appUrl(`/pedido/${params.orderId}?status=pending`),
      },
      auto_return: "approved",
      notification_url: appUrl("/api/webhooks/mercadopago"),
      statement_descriptor: "FOTOSSSURF",
    },
  });

  if (!result.id || !result.init_point) {
    throw new Error("Falha ao criar preferência Mercado Pago");
  }

  return { id: result.id, initPoint: result.init_point };
}

export async function getPayment(paymentId: string) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}
