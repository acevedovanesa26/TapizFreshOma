import { Cliente, Cita, Cotizacion } from '../types';

/**
 * Exports data to CSV with UTF-8 BOM so Microsoft Excel in Spanish displays
 * accents, ñ, and special characters properly.
 */
export function exportClientesToCsv(clientes: Cliente[]): void {
  const headers = [
    'ID',
    'Nombre',
    'Teléfono',
    'Correo',
    'Dirección',
    'Barrio',
    'Ciudad',
    'Origen',
    'Estado',
    'Etiquetas',
    'Notas',
    'Fecha Registro',
  ];

  const rows = clientes.map((c) => [
    `"${c.id}"`,
    `"${c.nombre.replace(/"/g, '""')}"`,
    `"${c.telefono}"`,
    `"${c.correo}"`,
    `"${(c.direccion || '').replace(/"/g, '""')}"`,
    `"${(c.barrio || '').replace(/"/g, '""')}"`,
    `"${(c.ciudad || '').replace(/"/g, '""')}"`,
    `"${c.origen}"`,
    `"${c.estado}"`,
    `"${c.etiquetas.join(', ')}"`,
    `"${(c.notas || '').replace(/"/g, '""')}"`,
    `"${c.creado_en.substring(0, 10)}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  downloadBlob(csvContent, `clientes_tapizfresh_${new Date().toISOString().substring(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportReportesToCsv(
  reportData: {
    meses: string[];
    ingresos: number[];
    servicios: number[];
    clientesNuevos: number[];
  },
  origenes: { origen: string; total: number }[],
  mueblesPopulares: { mueble: string; total: number }[]
): void {
  const lines: string[] = ['\uFEFF=== INFORME GENERAL TAPIZ FRESH ===', ''];

  lines.push('RESUMEN MENSUAL;');
  lines.push('Mes;Ingresos ($ COP);Servicios Realizados;Clientes Nuevos');
  reportData.meses.forEach((mes, idx) => {
    lines.push(
      `"${mes}";${reportData.ingresos[idx]};${reportData.servicios[idx]};${reportData.clientesNuevos[idx]}`
    );
  });

  lines.push('');
  lines.push('ORIGEN DE CLIENTES;');
  lines.push('Canal;Total Clientes');
  origenes.forEach((o) => {
    lines.push(`"${o.origen}";${o.total}`);
  });

  lines.push('');
  lines.push('MUEBLES MÁS SOLICITADOS;');
  lines.push('Tipo de Mueble;Total Solicitudes');
  mueblesPopulares.forEach((m) => {
    lines.push(`"${m.mueble}";${m.total}`);
  });

  const content = lines.join('\r\n');
  downloadBlob(content, `informe_tapizfresh_${new Date().toISOString().substring(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportClienteDataJson(cliente: Cliente, cotizaciones: Cotizacion[], citas: Cita[]): void {
  const data = {
    titular: 'Tapiz Fresh - Ejercicio de Derechos Ley 1581 de 2012 (Habeas Data)',
    fecha_exportacion: new Date().toISOString(),
    datos_personales: cliente,
    historial_cotizaciones: cotizaciones,
    historial_visitas_y_citas: citas,
  };

  const jsonContent = JSON.stringify(data, null, 2);
  downloadBlob(jsonContent, `datos_personales_${cliente.nombre.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.json`, 'application/json');
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
