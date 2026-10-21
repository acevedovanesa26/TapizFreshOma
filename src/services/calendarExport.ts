import { Cita } from '../types';

/**
 * Generates an iCalendar (.ics) string for a single appointment or multiple appointments
 * Compatible with Google Calendar, Apple Calendar, and Outlook.
 */
function formatIcsDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function generateIcsForCita(cita: Cita, clientName: string, clientPhone?: string): string {
  const dtStamp = formatIcsDate(new Date().toISOString());
  const dtStart = formatIcsDate(cita.fecha_inicio);
  const dtEnd = formatIcsDate(cita.fecha_fin);
  const summary = `Tapiz Fresh: ${cita.titulo} - ${clientName}`;
  const location = `${cita.direccion}, ${cita.barrio}, ${cita.ciudad}`;
  const description = `Servicio: ${cita.servicio}\\nCliente: ${clientName}\\nTeléfono: ${clientPhone || 'No especificado'}\\nValor: $${cita.valor.toLocaleString('es-CO')}\\nNotas: ${cita.notas || 'Sin notas especiales'}`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tapiz Fresh//Agenda Omaira//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:tapizfresh-${cita.id}@tapizfresh.com`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio de servicio Tapiz Fresh mañana',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return icsLines.join('\r\n');
}

export function downloadIcsFile(cita: Cita, clientName: string, clientPhone?: string): void {
  const icsContent = generateIcsForCita(cita, clientName, clientPhone);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeTitle = cita.titulo.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  link.download = `cita_tapizfresh_${safeTitle}_${cita.fecha_inicio.substring(0, 10)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
