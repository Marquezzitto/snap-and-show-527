import images from "./productImages.json";
import { MARGEM, precoFinal, valorParcela } from "@/lib/pricing";

export type Catalogo = 1 | 2;

export interface ProdutoBase {
  nome: string;
  desc: string;
  codigo?: string;
  base: number;
  categoria: string;
  catalogo: Catalogo;
}

export interface Produto extends ProdutoBase {
  id: string;
  imagem: string | null;
  precoVista: number;
  parcela: number;
  cores: string[];
  tamanhos: string[];
}

const imgMap = images as Record<string, string>;

/** Catálogo único — "produtos e valores" (margem de 40% + parcelamento 3x com taxa) */
const catalogo2: ProdutoBase[] = [
  { nome: "GS10 Mini", desc: "41mm | Watch faces Série 10", codigo: "0203", base: 49, categoria: "Smartwatches", catalogo: 2 },
  { nome: "S10 Microwear", desc: "ChatGPT em português | Tradutor | Capinha", codigo: "0200", base: 49, categoria: "Smartwatches", catalogo: 2 },
  { nome: "Ultra U3W", desc: "Microwear | ChatGPT | 1GB | Responde WhatsApp", codigo: "0232", base: 49, categoria: "Smartwatches", catalogo: 2 },
  { nome: "M9", desc: "GPS de alta precisão | AMOLED | ChatGPT | IP68", codigo: "0252", base: 134, categoria: "Premium", catalogo: 2 },
  { nome: "MA33", desc: "Séries 11 | Comando de voz | AMOLED | 1GB", codigo: "0254", base: 73, categoria: "Smartwatches", catalogo: 2 },
  { nome: "MA34", desc: "AMOLED | ChatGPT em português | Chamadas Bluetooth", codigo: "0255", base: 66, categoria: "Smartwatches", catalogo: 2 },
  { nome: "MA27 Microwear", desc: "1GB | Responde WhatsApp", codigo: "0231", base: 84, categoria: "Smartwatches", catalogo: 2 },
  { nome: "S11 Microwear", desc: "Séries 11 | WhatsApp | ChatGPT", codigo: "0247", base: 65, categoria: "Smartwatches", catalogo: 2 },
  { nome: "S11 Mini", desc: "ChatGPT | Chamadas Bluetooth | Compacto", codigo: "0264", base: 85, categoria: "Smartwatches", catalogo: 2 },
  { nome: "S11 Pro", desc: "Séries 11 | GPS | WhatsApp | ChatGPT | 2GB", codigo: "0246", base: 84, categoria: "Premium", catalogo: 2 },
  { nome: "S6", desc: "Smartwatch + TWS", codigo: "0106", base: 90, categoria: "Smartwatches", catalogo: 2 },
  { nome: "SU02 Microwear", desc: "AMOLED | WhatsApp | ChatGPT", codigo: "0267", base: 129, categoria: "Premium", catalogo: 2 },
  { nome: "SU04", desc: "ChatGPT | AMOLED | WhatsApp | IP68 | 1GB", codigo: "MW-SU4", base: 119, categoria: "Premium", catalogo: 2 },
  { nome: "GS11 Mini", desc: "GSWear | Chamadas Bluetooth | NFC | Saúde", codigo: "0263", base: 75, categoria: "Smartwatches", catalogo: 2 },
  { nome: "U4 Mini Pro", desc: "Microwear Ultra | IP68 | AMOLED HD | 1GB", codigo: "0265", base: 109, categoria: "Premium", catalogo: 2 },
  { nome: "U4 Mini", desc: "Microwear Ultra | IP68 | AMOLED | 1GB", codigo: "0253", base: 74, categoria: "Smartwatches", catalogo: 2 },
  { nome: "U4 Plus", desc: "Microwear Ultra | IP68 | AMOLED | 2GB", codigo: "0241", base: 88, categoria: "Smartwatches", catalogo: 2 },
  { nome: "U4 Pro Microwear", desc: "Ultra | 3ATM | AMOLED | 1GB", codigo: "0233", base: 82, categoria: "Smartwatches", catalogo: 2 },
  { nome: "U5 Plus", desc: "Microwear Ultra | 3ATM | AMOLED | 2GB", codigo: "0257", base: 105, categoria: "Premium", catalogo: 2 },
  { nome: "U5 Pro", desc: "Microwear Ultra | 3ATM | IPS HD | GPS pareado", codigo: "0262", base: 94, categoria: "Premium", catalogo: 2 },
  { nome: "USX", desc: "Microwear Ultra | 3ATM | AMOLED | 1GB", codigo: "0261", base: 74, categoria: "Smartwatches", catalogo: 2 },
  { nome: "W10", desc: "Microwear | ChatGPT em português | 1GB | Capinha", codigo: "0201", base: 69, categoria: "Smartwatches", catalogo: 2 },
  { nome: "W10 Pro", desc: "Séries 10 | 1GB | ChatGPT", codigo: "0225", base: 80, categoria: "Smartwatches", catalogo: 2 },
  { nome: "W10 Pro Mini", desc: "1GB | ChatGPT e tradutor", codigo: "0224", base: 74, categoria: "Smartwatches", catalogo: 2 },
  { nome: "W10T Mini", desc: "Microwear | 1GB | ChatGPT", codigo: "0234", base: 66, categoria: "Smartwatches", catalogo: 2 },
  { nome: "W11 Mini", desc: "Séries 11 | ChatGPT + Hey Michael | 1GB | IP68", codigo: "0249", base: 92, categoria: "Smartwatches", catalogo: 2 },
  { nome: "W11 Pro", desc: "Séries 11 | WhatsApp | AMOLED | 1GB", codigo: "0245", base: 114, categoria: "Premium", catalogo: 2 },
  { nome: "W11 Pro Mini", desc: "Séries 11 | WhatsApp | AMOLED | 1GB", codigo: "0244", base: 114, categoria: "Premium", catalogo: 2 },
  { nome: "W11G", desc: "GPS integrado | ChatGPT | AMOLED | IP68 | 400mAh", codigo: "MW-W1G", base: 149, categoria: "Premium", catalogo: 2 },
  { nome: "W11X", desc: "Séries 11 | WhatsApp | ChatGPT | 1GB", codigo: "025B", base: 89, categoria: "Smartwatches", catalogo: 2 },
  { nome: "W29s", desc: "Série 9 | Função 2 gestos | 47mm", codigo: "0148", base: 54, categoria: "Smartwatches", catalogo: 2 },
  { nome: "W59 Mini", desc: "2ª geração | Função dois gestos | 41mm", codigo: "0147", base: 64, categoria: "Smartwatches", catalogo: 2 },
  { nome: "XH9", desc: "Tradicional 48mm | Função dois gestos", codigo: "0152", base: 45, categoria: "Smartwatches", catalogo: 2 },
  { nome: "WS-79 Ultra 2", desc: "Kit 3 pulseiras | Couro e metal", codigo: "0221", base: 58, categoria: "Kits", catalogo: 2 },
  { nome: "WS-X10", desc: "Kit 3 pulseiras | Séries 10", codigo: "0223", base: 54, categoria: "Kits", catalogo: 2 },
  { nome: "WS-X11", desc: "Kit 7 pulseiras | Séries 10", codigo: "0230", base: 74, categoria: "Kits", catalogo: 2 },
  { nome: "WS10-5 Ultra", desc: "Kit 5 pulseiras | Toque duplo | 2ª geração", codigo: "0220", base: 70, categoria: "Kits", catalogo: 2 },
  { nome: "Ultra 4 AI 4G", desc: "Android 4G independente | Play Store | Chip | Wi-Fi", codigo: "0268", base: 219, categoria: "Celulares de pulso", catalogo: 2 },
  { nome: "W11 AI 5G", desc: "Android 5G | AMOLED | Chip | Câmera", codigo: "0260", base: 199, categoria: "Celulares de pulso", catalogo: 2 },
  { nome: "Wearzone Fênix", desc: "1ATM | GPS tracking | +100 modos esporte", codigo: "0210", base: 119, categoria: "Wearzone", catalogo: 2 },
  { nome: "Wearzone Action", desc: "3ATM | Alexa | GPS integrado | Strava", codigo: "0182", base: 199, categoria: "Wearzone", catalogo: 2 },
  { nome: "Wearzone Brave", desc: "5ATM | Resistência militar | GPS dupla frequência", codigo: "0228", base: 285, categoria: "Wearzone", catalogo: 2 },
  { nome: "Wearzone Dune", desc: "5ATM | Ideal para tênis | 6 dias de bateria", codigo: "WZ-DUN", base: 319, categoria: "Wearzone", catalogo: 2 },
  { nome: "Wearzone Easy", desc: "1ATM | Monitoramento de saúde | Bateria longa", codigo: "0205", base: 95, categoria: "Wearzone", catalogo: 2 },
  { nome: "Wearzone Flare", desc: "5ATM água do mar | IP69K | GPS", codigo: "0248", base: 285, categoria: "Wearzone", catalogo: 2 },
  { nome: "Wearzone Kron", desc: "3ATM | GPS integrado | AMOLED | 7 dias", codigo: "WZ-KRO", base: 170, categoria: "Wearzone", catalogo: 2 },
  { nome: "Wearzone Life", desc: "1ATM | Monitoramento de saúde | AMOLED", codigo: "0207", base: 140, categoria: "Wearzone", catalogo: 2 },
  { nome: "Wearzone Pulse", desc: "3ATM | Alexa integrada | 7 dias de bateria", codigo: "0185", base: 110, categoria: "Wearzone", catalogo: 2 },
  { nome: "Headset WZ08", desc: "Cancelamento de ruído | 60h | Chamadas HD", codigo: "0213", base: 150, categoria: "Áudio", catalogo: 2 },
  { nome: "TWS WZ06", desc: "ANC | ENC | Multi-point", codigo: "0211", base: 90, categoria: "Áudio", catalogo: 2 },
  { nome: "N11 Pro", desc: "Chamadas Bluetooth | Assistente de voz", codigo: "0271", base: 39.99, categoria: "Áudio", catalogo: 2 },
  { nome: "N11 Ultra", desc: "Chamadas Bluetooth | Assistente de voz", codigo: "0270", base: 39.99, categoria: "Áudio", catalogo: 2 },
  { nome: "Óculos W93 Pro", desc: "Com câmera | Microwear | ChatGPT | Tradução por IA", codigo: "MW-93P", base: 220, categoria: "Óculos IA", catalogo: 2 },
  { nome: "Óculos W94", desc: "ChatGPT | Tradução por IA | Chamadas Bluetooth", codigo: "MW-W94", base: 59.99, categoria: "Óculos IA", catalogo: 2 },
  { nome: "Capinha 360 com proteção de tela", desc: "Silicone com cobertura de tela", codigo: "0013", base: 2, categoria: "Acessórios", catalogo: 2 },
  { nome: "Capinha 360 sem proteção de tela", desc: "Silicone sem cobertura de tela", codigo: "0012", base: 2, categoria: "Acessórios", catalogo: 2 },
  { nome: "Película para smartwatches", desc: "Proteção de tela", codigo: "0010", base: 2, categoria: "Acessórios", catalogo: 2 },
  { nome: "Película reforçada", desc: "Proteção 3D reforçada", codigo: "0011", base: 2, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira Alpina", desc: "42mm/44mm/45mm/49mm", codigo: "0007", base: 7, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira Alpina fecho preto", desc: "38mm/40mm/41mm", codigo: "0411", base: 9, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira Alpina pino 22mm", desc: "Fecho fixo", codigo: "0412", base: 9, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira couro liso 22mm", desc: "Pino universal", codigo: "0095", base: 12, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de couro", desc: "42mm/44mm/45mm/47mm/49mm", codigo: "0083", base: 27, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de couro fit slim", desc: "38mm/40mm/41mm", codigo: "0428", base: 25, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de couro magnética dobrável", desc: "42mm/44mm/45mm/47mm/49mm", codigo: "0086", base: 12, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de couro microfibra", desc: "38mm/40mm/41mm", codigo: "0090", base: 25, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de couro microfibra pino 22mm", desc: "Universal", codigo: "0089", base: 25, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de couro slim", desc: "38mm/40mm/41mm", codigo: "0427", base: 22, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de aço 1 elo", desc: "42mm a 49mm", codigo: "0036", base: 20, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de aço 3 elos", desc: "42mm a 49mm", codigo: "0085", base: 23, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de aço 3 elos premium", desc: "42mm a 49mm", codigo: "0035", base: 28, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de aço 3.2 elos", desc: "42mm a 49mm", codigo: "0431", base: 23, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de aço 5 elos", desc: "42mm a 49mm", codigo: "0430", base: 23, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de aço 7 elos", desc: "38mm/41mm/42mm/49mm", codigo: "0429", base: 23, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira de aço elos pino", desc: "18mm/22mm", codigo: "0418", base: 30, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira elo magnético com fecho de laço", desc: "38mm/40mm/41mm", codigo: "0051", base: 19, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira elo magnético laço", desc: "42mm a 49mm", codigo: "0050", base: 19, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira elo magnético laço pino 22mm", desc: "Universal", codigo: "0075", base: 14, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira elo magnético fit", desc: "42mm/44mm/45mm/49mm", codigo: "0403", base: 13, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira elo magnético link pino 22mm", desc: "Universal", codigo: "0439", base: 15, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira milanesa", desc: "42mm/44mm/45mm/49mm", codigo: "0003", base: 8, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira milanesa", desc: "38mm/40mm/41mm", codigo: "0004", base: 8, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira milanesa com fecho magnético", desc: "38mm/40mm/41mm", codigo: "0097", base: 30, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira milanesa com fecho magnético", desc: "42mm/44mm/45mm/49mm", codigo: "0099", base: 30, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira milanesa de pino 18mm", desc: "Universal", codigo: "0417", base: 10, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira milanesa loop", desc: "42mm/44mm/45mm/49mm", codigo: "0061", base: 24, categoria: "Acessórios", catalogo: 2 },
  { nome: "Pulseira listrada pino", desc: "20mm/22mm", codigo: "0432", base: 2, categoria: "Acessórios", catalogo: 2 },
];

const CORES: Record<string, string[]> = {
  Smartwatches: ["Preto", "Prata", "Rosa"],
  Premium: ["Preto", "Prata", "Rosa"],
  Wearzone: ["Preto", "Prata", "Rosa"],
  "Celulares de pulso": ["Preto", "Prata"],
  Kits: ["Preto", "Prata", "Rosa"],
  "Áudio": ["Preto", "Branco"],
};

function coresDe(p: ProdutoBase): string[] {
  if (p.nome.startsWith("Pulseira")) return ["Preto", "Prata", "Dourado"];
  if (p.nome.startsWith("Capinha")) return ["Transparente", "Preto", "Rosa"];
  return CORES[p.categoria] ?? [];
}

/** Agrupa itens com o mesmo nome (ex.: tamanhos diferentes) em um único produto. */
function montar(itens: ProdutoBase[]): Produto[] {
  const grupos = new Map<string, ProdutoBase[]>();
  for (const p of itens) {
    const k = p.nome.toLowerCase();
    grupos.set(k, [...(grupos.get(k) ?? []), p]);
  }
  return Array.from(grupos.values()).map((g, i) => {
    const p = g[0]!;
    const precoVista = precoFinal(p.base, MARGEM);
    const imagem = g.map((x) => (x.codigo ? imgMap[x.codigo] : undefined)).find(Boolean) ?? null;
    return {
      ...p,
      id: `p-${p.codigo ?? i}-${i}`,
      imagem,
      precoVista,
      parcela: valorParcela(precoVista),
      cores: coresDe(p),
      tamanhos: g.length > 1 ? g.map((x) => x.desc) : [],
    };
  });
}

export const produtos: Produto[] = montar(catalogo2);

export const categorias: string[] = Array.from(new Set(produtos.map((p) => p.categoria)));
