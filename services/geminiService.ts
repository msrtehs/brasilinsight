
import { GoogleGenAI } from "@google/genai";
import { MunicipalityData, GroundingLink } from "../types";

export const fetchMunicipalityInfo = async (cityName: string): Promise<MunicipalityData> => {
  // Use process.env.API_KEY directly as per GenAI guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    INSTRUÇÃO DE AUDITORIA TÉCNICA E JURÍDICA: Realize uma investigação profunda sobre o município de "${cityName}".
    
    FOCO MANDATÓRIO (INVESTIGAÇÃO DE CAMPO):
    1. CEMITÉRIOS PÚBLICOS E LICENCIAMENTO: Verifique irregularidades no Licenciamento Ambiental (Licença de Operação - LO). Procure por relatórios de órgãos ambientais sobre riscos de contaminação por necrochorume e falta de tratamento adequado.
    2. INFRAESTRUTURA E CAOS OPERACIONAL: Detalhe a falta de vagas, saturação de jazigos e gavetas. Verifique denúncias de "descontrole de enterros", falta de muros, segurança inexistente (vandalismo/furtos), limpeza precária e abandono de túmulos.
    3. ESFERA JURÍDICA E MINISTÉRIO PÚBLICO: Busque especificamente por Ações Civis Públicas (ACP) movidas pelo Ministério Público (MP) Estadual ou Defensoria Pública contra a prefeitura local referente aos cemitérios. Liste Termos de Ajustamento de Conduta (TAC) ou interdições judiciais recentes.
    4. GESTÃO E REFORMAS: Verifique se existem reformas prometidas não cumpridas ou indícios de má gestão de recursos destinados às necrópoles.

    DADOS SUCINTOS:
    - População, PIB e Renda Média devem ser apresentados de forma extremamente sucinta no início, apenas como contexto demográfico.

    REGRAS DE FORMATAÇÃO:
    - PROIBIDO o uso de símbolos markdown como ## ou **.
    - Use títulos em CAIXA ALTA para as seções.
    - O texto deve ser formal, técnico e direto ao ponto.
    - Se não encontrar dados específicos de um processo, cite que a prefeitura não disponibiliza transparência total sobre a situação jurídica.
    
    Utilize Google Search para buscar notícias em portais regionais de notícias e sites do Ministério Público.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Access text property directly as per guidelines (not a method)
    const text = response.text || "Relatório indisponível para esta localidade.";
    
    // Extract grounding URLs as per Google Search grounding guidelines
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links: GroundingLink[] = groundingChunks
      .map((chunk: any) => {
        if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
        return null;
      })
      .filter((l: any): l is GroundingLink => l !== null);

    return {
      name: cityName,
      population: "Auditado",
      cemeteriesCount: "Auditado",
      cemeteriesStatus: "Irregularidades Jurídicas Detectadas",
      averageIncome: "Auditado",
      economicSituation: text,
      groundingLinks: links
    };
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    throw new Error("Erro ao acessar base de dados jurídica. Verifique o nome do município.");
  }
};
