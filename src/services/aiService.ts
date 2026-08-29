import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

const API_KEY = "AIzaSyCMyS9390mvyqD9wVckhST3BsMKrN1hHsw";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `
Eres "AgroAsesor", el asistente virtual experto de Agro Guate, el marketplace agrícola líder en Guatemala. 
Tu objetivo es ayudar a agricultores, ganaderos y entusiastas del campo guatemalteco.

DIRECTRICES DE PERSONALIDAD:
1. Habla con un tono profesional pero cercano, conocedor de las costumbres de Guatemala. Puedes usar términos locales como "cuerda", "manzana", "invierno" (refiriéndote a la época de lluvia), etc.
2. Eres un experto en agronomía, veterinaria y maquinaria pesada.
3. Si no sabes algo, admítelo y sugiere contactar a un asesor humano de Agro Guate.

TUS FUNCIONES:
1. RECOMENDAR PRODUCTOS: Utiliza la lista de productos que se te proporciona para sugerir soluciones específicas a los problemas del usuario. Siempre menciona por qué ese producto es ideal para su situación.
2. ACLARAR DUDAS: Explica cómo usar insumos, dosis recomendadas (basadas en ficha técnica) y mejores prácticas agrícolas en Guatemala.
3. GENERAR LISTAS DE COMPRAS: Si un usuario tiene un proyecto, genera una lista sugerida de productos que puede encontrar en la tienda.
4. EXPERIENCIA GUIADA: Acompaña al comprador durante su proceso, preguntando por su ubicación en Guatemala.

FORMATO VISUAL DE PRODUCTOS:
Cuando recomiendes un producto, DEBES usar este formato exacto para que el usuario pueda verlo:
![Nombre del Producto](URL_IMAGEN)
[Ver detalles del producto](https://celularesatitlan.web.app/product/ID)

IMPORTANTE: Solo recomienda productos que estén en el catálogo que se te proporciona a continuación.
`;

export const chatWithAgroAsesor = async (userMessage: string, chatHistory: any[] = []) => {
  try {
    // 1. Obtener catálogo de productos para contexto (limitado para no saturar tokens)
    const productsSnap = await getDocs(query(collection(db, "products"), limit(40)));
    const productCatalog = productsSnap.docs.map(doc => {
      const data = doc.data();
      const imageUrl = data.mainImage || (data.images && data.images[0]) || "";
      return `- ${data.name}: Q${data.price} (ID: ${doc.id}, Imagen: ${imageUrl}, Categoría: ${data.categoria})`;
    }).join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT + "\n\nCATÁLOGO DE PRODUCTOS ACTUAL:\n" + productCatalog }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido. Soy AgroAsesor y estoy listo para ayudar a los productores guatemaltecos con el catálogo de Agro Guate." }],
        },
        ...chatHistory
      ],
    });

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        attempts++;
        const isTransientError = error?.message?.includes('503') || error?.message?.includes('high demand');
        
        if (isTransientError && attempts < maxAttempts) {
          console.warn(`AgroAsesor: Servidor de Google saturado (503). Reintentando ${attempts}/${maxAttempts}...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        console.error("Error en AgroAsesor:", error);
        if (isTransientError) {
          return "¡Ay caramba! Mis servidores están algo saturados por la alta demanda en este momento. Por favor, intenta enviarme el mensaje de nuevo en unos segundos, ¡aquí sigo para ayudarte!";
        }
        return "Lo siento, tuve un pequeño problema técnico. ¿Podrías repetirme tu duda? Soy un experto en el campo, ¡no me rindo fácil!";
      }
    }
    return "No pude conectar con el servicio de IA tras varios intentos. Por favor, intenta de nuevo en un momento.";
  } catch (error) {
    console.error("Error crítico en AgroAsesor:", error);
    return "Lo siento, el sistema del AgroAsesor está experimentando dificultades técnicas. Por favor, intenta más tarde.";
  }
};
