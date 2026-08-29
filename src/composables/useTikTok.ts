declare global {
  interface Window {
    ttq: any;
  }
}

export function useTikTok() {
  const track = (eventName: string, params: any = {}) => {
    if (typeof window !== 'undefined' && window.ttq && window.ttq.track) {
      window.ttq.track(eventName, params);
      console.log(`[TikTok Pixel] Evento Disparado: ${eventName}`, params);
    } else {
      console.warn(`[TikTok Pixel] No encontrado o bloqueado, ignorando evento: ${eventName}`);
    }
  };

  const trackViewContent = (product: any) => {
    if (!product) return;
    track('ViewContent', {
      content_type: 'product',
      content_id: product.id,
      content_name: product.name,
      currency: 'GTQ',
      value: product.price
    });
  };

  const trackAddToCart = (product: any, quantity: number = 1) => {
    if (!product) return;
    track('AddToCart', {
      content_type: 'product',
      content_id: product.id,
      content_name: product.name,
      currency: 'GTQ',
      value: product.price * quantity,
      quantity
    });
  };

  const trackAddToWishlist = (product: any) => {
    if (!product) return;
    track('AddToWishlist', {
      content_type: 'product',
      content_id: product.id,
      content_name: product.name,
      currency: 'GTQ',
      value: product.price
    });
  };

  const trackInitiateCheckout = (cartTotal: number, cartItems: any[] = []) => {
    track('InitiateCheckout', {
      content_type: 'product_group',
      currency: 'GTQ',
      value: cartTotal,
      contents: cartItems.map(item => ({
        content_id: item.id || item.productId,
        content_name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    });
  };

  const trackPurchase = (orderId: string, orderTotal: number, items: any[] = []) => {
    track('PlaceAnOrder', {
      content_type: 'product_group',
      currency: 'GTQ',
      value: orderTotal,
      order_id: orderId,
      contents: items.map(item => ({
        content_id: item.id || item.productId,
        content_name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    });
  };

  const trackSearch = (query: string) => {
    if (!query) return;
    track('Search', {
      query
    });
  };

  const trackCompleteRegistration = () => {
    track('CompleteRegistration', {});
  };

  return {
    track,
    trackViewContent,
    trackAddToCart,
    trackAddToWishlist,
    trackInitiateCheckout,
    trackPurchase,
    trackSearch,
    trackCompleteRegistration
  };
}
