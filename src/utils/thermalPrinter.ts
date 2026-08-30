export interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  subtotal?: number;
  vendorId?: string;
}

export interface OrderData {
  id: string;
  fecha: any;
  cliente: {
    name: string;
    email?: string;
    telefono?: string;
  };
  direccion?: {
    direccion?: string;
    ciudad?: string;
    departamento?: string;
  };
  items: OrderItem[];
  subtotal?: number;
  envio?: number;
  recargo?: number;
  total: number;
  metodoPago?: string;
  estado?: string;
}

export const printThermalTicket = (order: OrderData) => {
  if (!order) return;

  const fechaStr = order.fecha
    ? new Date(order.fecha.toDate ? order.fecha.toDate() : order.fecha).toLocaleString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('es-GT');

  const metodoStr = (method?: string) => {
    switch (method) {
      case 'deposito':
        return 'DEPÓSITO BANCARIO';
      case 'contra-entrega':
      case 'contraentrega':
        return 'PAGO CONTRA ENTREGA';
      case 'tarjeta':
        return 'TARJETA DE CRÉDITO/DÉBITO';
      case 'efectivo':
        return 'EFECTIVO';
      default:
        return method?.toUpperCase() || 'CONTADO';
    }
  };

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="text-align: left; padding: 3px 0; font-weight: bold;">
        ${item.quantity}x ${item.name.toUpperCase()}
      </td>
      <td style="text-align: right; padding: 3px 0; font-weight: bold; white-space: nowrap;">
        Q${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="font-size: 10px; color: #555; padding-bottom: 4px; border-bottom: 1px dashed #ccc;">
        @ Q${item.price.toFixed(2)} c/u
      </td>
    </tr>
  `
    )
    .join('');

  const subtotalVal = order.subtotal || order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const envioVal = order.envio || 0;
  const recargoVal = order.recargo || 0;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Ticket POS #${order.id}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', Courier, monospace, sans-serif;
          width: 76mm;
          margin: 0 auto;
          padding: 8px 4px;
          color: #000;
          background: #fff;
          font-size: 12px;
          line-height: 1.25;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        .divider {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
        .double-divider {
          border-top: 2px solid #000;
          margin: 6px 0;
        }
        .header-title {
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 1px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        .totals-table td {
          padding: 2px 0;
        }
        .grand-total {
          font-size: 15px;
          font-weight: 900;
        }
        @media print {
          body {
            width: 100%;
            margin: 0;
            padding: 2mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="header-title">AGRO GUATE</div>
        <div style="font-size: 10px;" class="uppercase">El Marketplace Agrícola de Guatemala</div>
        <div style="font-size: 10px;">www.agroguate.shop</div>
      </div>

      <div class="double-divider"></div>

      <div class="text-center bold" style="font-size: 13px;">
        TICKET DE COMPRA / COMPROBANTE POS
      </div>

      <div class="divider"></div>

      <div>
        <div><span class="bold">ORDEN #:</span> ${order.id.slice(0, 12).toUpperCase()}</div>
        <div><span class="bold">FECHA:</span> ${fechaStr}</div>
        <div><span class="bold">ESTADO:</span> <span class="uppercase">${order.estado || 'PENDIENTE'}</span></div>
      </div>

      <div class="divider"></div>

      <div>
        <div class="bold uppercase">CLIENTE: ${order.cliente?.name || 'Cliente'}</div>
        ${order.cliente?.telefono ? `<div>TEL: ${order.cliente.telefono}</div>` : ''}
        ${
          order.direccion?.direccion
            ? `<div style="font-size: 11px;">ENVÍO: ${order.direccion.direccion}, ${order.direccion.ciudad || ''}</div>`
            : ''
        }
      </div>

      <div class="double-divider"></div>

      <table>
        <thead>
          <tr style="border-bottom: 1px solid #000;">
            <th style="text-align: left; padding-bottom: 4px;">DESCRIPCIÓN</th>
            <th style="text-align: right; padding-bottom: 4px;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="divider"></div>

      <table class="totals-table">
        <tr>
          <td>SUBTOTAL:</td>
          <td class="text-right">Q${subtotalVal.toFixed(2)}</td>
        </tr>
        ${
          envioVal > 0
            ? `<tr><td>ENVÍO:</td><td class="text-right">Q${envioVal.toFixed(2)}</td></tr>`
            : ''
        }
        ${
          recargoVal > 0
            ? `<tr><td>RECARGO (3%):</td><td class="text-right">Q${recargoVal.toFixed(2)}</td></tr>`
            : ''
        }
        <tr class="grand-total">
          <td style="padding-top: 4px;">TOTAL:</td>
          <td class="text-right" style="padding-top: 4px;">Q${order.total.toFixed(2)}</td>
        </tr>
      </table>

      <div class="double-divider"></div>

      <div>
        <div><span class="bold">FORMA DE PAGO:</span></div>
        <div class="bold" style="font-size: 11px;">${metodoStr(order.metodoPago)}</div>
      </div>

      <div class="divider"></div>

      <div class="text-center" style="margin-top: 8px; font-size: 11px;">
        <div class="bold">¡GRACIAS POR TU COMPRA!</div>
        <div>Tu aliado experto en el campo</div>
        <div style="font-size: 9px; margin-top: 4px;">*** Conserva este comprobante ***</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};
