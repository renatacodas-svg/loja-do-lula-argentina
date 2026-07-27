const kindTitles: Record<string, string> = {
  orders: "Nova reserva da Loja do Lula",
  pack_requests: "Novo pedido de pack de apoio",
  support_packs: "Novo interesse em pack de apoio",
  nudos: "Novo cadastro de ponto de apoio",
  contacts: "Nova mensagem de contato"
};

const fieldLabels: Record<string, string> = {
  product_name_snapshot: "Produto",
  variation: "Tamanho/variação",
  quantity: "Quantidade",
  first_name: "Nome",
  last_name: "Sobrenome",
  name: "Nome",
  responsible_name: "Pessoa responsável",
  email: "E-mail",
  whatsapp: "WhatsApp",
  city: "Cidade",
  delivery_preference: "Entrega preferida",
  amount_reference: "Valor de referência",
  support_type: "Tipo de apoio",
  group_reference: "Rede de referência",
  estimated_people: "Quantidade estimada de pessoas",
  can_coordinate_delivery: "Pode coordenar entrega",
  can_coordinate_orders_payments: "Pode organizar reservas/pagamentos",
  notes: "Observações",
  message: "Mensagem"
};

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value ?? "");
}

function buildMessage(kind: string, payload: Record<string, unknown>) {
  const title = kindTitles[kind] ?? "Novo envio pelo site";
  const isStoreMessage = kind === "orders" || kind === "pack_requests";
  const source = isStoreMessage ? "Loja do Lula" : "Núcleo PT Argentina";
  const lines = Object.entries(payload)
    .filter(([key, value]) => key !== "status" && key !== "product_id" && value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${fieldLabels[key] ?? key}: ${displayValue(value)}`);

  return {
    subject: `[${source}] ${title}`,
    text: [title, "", ...lines, "", "Consulte o painel admin para acompanhar e atualizar o status."].join("\n")
  };
}

export async function sendFormNotification(kind: string, payload: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  const isStoreMessage = kind === "orders" || kind === "pack_requests";
  const recipientList = isStoreMessage
    ? process.env.STORE_TEAM_EMAIL
    : process.env.TEAM_EMAIL;
  const recipients = (recipientList ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (!apiKey || recipients.length === 0) return false;

  const { subject, text } = buildMessage(kind, payload);
  const from = isStoreMessage
    ? process.env.STORE_RESEND_FROM_EMAIL || "Loja do Lula <onboarding@resend.dev>"
    : process.env.RESEND_FROM_EMAIL || "Núcleo PT Argentina <onboarding@resend.dev>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to: recipients, subject, text }),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) throw new Error(`Serviço de e-mail respondeu com status ${response.status}.`);
  return true;
}
