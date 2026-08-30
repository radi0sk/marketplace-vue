import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || "AIzaSyCMyS9390mvyqD9wVckhST3BsMKrN1hHsw";
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

const generateLocalAgroResponse = (userMessage: string, products: any[]) => {
  const queryLower = userMessage.toLowerCase();
  
  // Buscar productos coincidentes en el catálogo local
  const matchingProducts = products.filter(p => {
    const text = `${p.name} ${p.categoria || ''} ${p.description || ''}`.toLowerCase();
    const keywords = queryLower.split(' ').filter(k => k.length > 2);
    return keywords.some(k => text.includes(k));
  }).slice(0, 3);

  if (matchingProducts.length > 0) {
    let resp = `¡Hola! Como AgroAsesor de Agro Guate, analicé tu consulta ("${userMessage}") y te sugiero las siguientes opciones especializadas de nuestro catálogo:\n\n`;
    matchingProducts.forEach(p => {
      resp += `🌱 **${p.name}**\n- **Precio:** Q${p.price.toFixed(2)}\n`;
      if (p.imageUrl) {
        resp += `![${p.name}](${p.imageUrl})\n`;
      }
      resp += `[Ver detalles del producto](https://celularesatitlan.web.app/product/${p.id})\n\n`;
    });
    resp += `¿Necesitas asesoría en dosis por manzana o algún otro insumo agrícola? ¡Con gusto te ayudo!`;
    return resp;
  }

  // Respuesta general agrícola si no hay coincidencia exacta de palabra clave
  if (products.length > 0) {
    const sample = products.slice(0, 2);
    let resp = `¡Bienvenido al campo con Agro Guate! En respuesta a tu duda sobre "${userMessage}", aquí tienes algunos de nuestros productos destacados para el sector agrícola:\n\n`;
    sample.forEach(p => {
      resp += `📦 **${p.name}** - Q${p.price.toFixed(2)}\n`;
      if (p.imageUrl) {
        resp += `![${p.name}](${p.imageUrl})\n`;
      }
      resp += `[Ver detalles del producto](https://celularesatitlan.web.app/product/${p.id})\n\n`;
    });
    resp += `Si buscas insumos, fertilizantes o semillas específicas para tu cultivo o zona en Guatemala, dímelo y te orientaré.`;
    return resp;
  }

  return `¡Hola! Soy AgroAsesor de Agro Guate. Cuéntame qué cultivo estás trabajando o qué producto agrícola buscas (fertilizantes, semillas, insecticidas, herramientas) y te daré la mejor recomendación para tu producción.`;
};

export const chatWithAgroAsesor = async (userMessage: string, chatHistory: any[] = []) => {
  let productsList: any[] = [];
  try {
    const productsSnap = await getDocs(query(collection(db, "products"), limit(40)));
    productsList = productsSnap.docs.map(doc => {
      const data = doc.data();
      const imageUrl = data.mainImage || (data.images && data.images[0]) || "";
      return {
        id: doc.id,
        name: data.name || "Producto Agrícola",
        price: data.price || 0,
        categoria: data.categoria || "",
        imageUrl: imageUrl,
        description: data.description || ""
      };
    });

    const productCatalog = productsList.map(p => `- ${p.name}: Q${p.price} (ID: ${p.id}, Imagen: ${p.imageUrl}, Categoría: ${p.categoria})`).join("\n");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      return response.text();
    } catch (apiError: any) {
      console.warn("AgroAsesor: Fallo en API Gemini (usando motor inteligente de catálogo local):", apiError?.message || apiError);
      return generateLocalAgroResponse(userMessage, productsList);
    }
  } catch (error) {
    console.error("Error crítico en AgroAsesor:", error);
    return generateLocalAgroResponse(userMessage, productsList);
  }
};
