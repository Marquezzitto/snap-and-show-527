/** Cálculo de frete via Melhor Envio. Medidas padrão por item (ajuste se necessário). */
const PACOTE = { width: 12, height: 8, length: 16, weightPorItem: 0.3 };

export interface OpcaoFrete {
  id: string;
  nome: string;
  preco: number;
  prazo: number;
}

export async function cotarFrete(cepDestino: string, qtdItens: number, valor: number): Promise<OpcaoFrete[] | null> {
  const token = process.env["MELHOR_ENVIO_TOKEN"];
  const origem = process.env["CEP_ORIGEM"];
  if (!token || !origem) return null;
  try {
    const res = await fetch("https://www.melhorenvio.com.br/api/v2/me/shipment/calculate", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Marks Imports (marksimportssp@gmail.com)",
      },
      body: JSON.stringify({
        from: { postal_code: origem.replace(/\D/g, "") },
        to: { postal_code: cepDestino.replace(/\D/g, "") },
        package: {
          width: PACOTE.width,
          height: Math.min(PACOTE.height * Math.max(1, Math.ceil(qtdItens / 2)), 100),
          length: PACOTE.length,
          weight: Math.max(0.3, PACOTE.weightPorItem * qtdItens),
        },
        options: { insurance_value: valor, receipt: false, own_hand: false },
      }),
    });
    if (!res.ok) {
      console.error("Melhor Envio", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as Array<{ id: number; name: string; price?: string; delivery_time?: number; error?: string; company?: { name: string } }>;
    return data
      .filter((d) => !d.error && d.price)
      .map((d) => ({
        id: String(d.id),
        nome: `${d.company?.name ?? ""} ${d.name}`.trim(),
        preco: Number(d.price),
        prazo: d.delivery_time ?? 0,
      }))
      .sort((a, b) => a.preco - b.preco);
  } catch (e) {
    console.error("Melhor Envio erro", e);
    return null;
  }
}
