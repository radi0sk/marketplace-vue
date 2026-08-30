const PAGGO_API_BASE_URL = 'https://api.paggoapp.com/api';
const PAGGO_API_KEY = 'pagg_c0e76fbffd38588ac5c222f8cbbcb6be4abae209da8816b674c127abbd7f2d7d';

export interface CreatePaggoLinkParams {
  concept: string;
  amount: number;
  customerName: string;
  email: string;
}

export interface PaggoLinkResponse {
  link: string;
  expirationDate: string;
}

export interface PaggoStatusResponse {
  id: number;
  name: string;
  status: string; // 'pendiente' | 'pagado' | 'cancelado'
  date: string;
  expirationDate: string;
  paymentDate?: string | null;
  amount: string;
  link: string;
}

/**
 * Crea un enlace de pago único en Paggo Guatemala (para cobros con Visa/Mastercard)
 */
export const createPaggoLink = async (params: CreatePaggoLinkParams): Promise<PaggoLinkResponse> => {
  try {
    const response = await fetch(`${PAGGO_API_BASE_URL}/center/transactions/create-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': PAGGO_API_KEY
      },
      body: JSON.stringify({
        concept: params.concept,
        amount: Math.round(params.amount * 100) / 100, // Formato numérico de 2 decimales
        customerName: params.customerName || 'Cliente Agro Guate',
        email: params.email
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || errData.message || `Error Paggo HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.result && data.result.link) {
      return {
        link: data.result.link,
        expirationDate: data.result.expirationDate
      };
    }

    throw new Error('La respuesta de Paggo no contiene un enlace válido');
  } catch (error: any) {
    console.error('Error al comunicarse con Paggo API:', error);
    throw error;
  }
};

/**
 * Consulta el estado de un enlace de pago por su ID
 */
export const checkPaggoLinkStatus = async (linkId: string | number): Promise<PaggoStatusResponse> => {
  try {
    const response = await fetch(`${PAGGO_API_BASE_URL}/center/transactions/links/${linkId}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': PAGGO_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Error al consultar estado en Paggo: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error: any) {
    console.error('Error al consultar estado en Paggo:', error);
    throw error;
  }
};

/**
 * Obtiene la URL del voucher en PDF para un enlace pagado
 */
export const getPaggoVoucherUrl = async (linkId: string | number): Promise<string> => {
  try {
    const response = await fetch(`${PAGGO_API_BASE_URL}/center/transactions/links/${linkId}/voucher`, {
      method: 'GET',
      headers: {
        'X-API-KEY': PAGGO_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener voucher de Paggo: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.result.url;
  } catch (error: any) {
    console.error('Error al obtener voucher de Paggo:', error);
    throw error;
  }
};
