import React, { useState } from 'react';
import {
  Camera,
  Upload,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  MapPin,
  Image as ImageIcon,
  Check,
  X,
  Phone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { storage } from '../../services/storage';
import { Cliente, CotizacionItem, OrigenCliente } from '../../types';
import { openWhatsAppChat, TAPIZ_FRESH_PHONE, TAPIZ_FRESH_PHONE_FORMATTED } from '../../services/whatsapp';
import { sendLeadNotificationToOmaira } from '../../services/emailService';

interface QuoteCalculatorProps {
  onCotizacionCreada?: () => void;
}

interface FurnitureCategory {
  id: string;
  name: string;
  image: string;
}

const FURNITURE_TYPES: FurnitureCategory[] = [
  {
    id: 'sofa-l',
    name: 'Sofá en L / Seccional',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'sofa-3',
    name: 'Sofá 3 Puestos',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'sofa-2',
    name: 'Sofá 2 Puestos',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'colchon-king',
    name: 'Colchón Queen / King',
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'colchon-doble',
    name: 'Colchón Doble / Sencillo',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'sillas-comedor',
    name: 'Sillas de Comedor / Poltronas',
    image: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=400&q=80',
  },
];

export const QuoteCalculator: React.FC<QuoteCalculatorProps> = ({ onCotizacionCreada }) => {
  const [config, setConfig] = useState(storage.getConfig());

  React.useEffect(() => {
    return storage.subscribe(() => {
      setConfig(storage.getConfig());
    });
  }, []);

  const [selectedFurniture, setSelectedFurniture] = useState<string[]>(['sofa-3']);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Form Fields
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [origen, setOrigen] = useState<OrigenCliente>('WhatsApp');
  const [notas, setNotas] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedRequest, setCompletedRequest] = useState<{
    cliente: Cliente;
    mueblesText: string;
  } | null>(null);

  const toggleFurniture = (id: string) => {
    setSelectedFurniture((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingPhoto(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !telefono.trim() || !direccion.trim() || !barrio.trim()) {
      alert('Por favor completa tu nombre, teléfono, dirección y barrio en Bogotá.');
      return;
    }

    if (selectedFurniture.length === 0) {
      alert('Por favor selecciona al menos un mueble que deseas lavar.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Sync / Deduplicate customer in CRM (only Bogotá)
      const cliente = storage.saveOrUpdateClienteFromForm({
        nombre,
        telefono,
        correo: correo || `${telefono.replace(/\D/g, '')}@cliente.tapizfresh.com`,
        direccion,
        barrio,
        ciudad: 'Bogotá',
        origen,
        notas: `Solicitud de cotización con foto. Muebles: ${selectedFurniture.join(', ')}. ${notas ? 'Detalle: ' + notas : ''}`,
      });

      // 2. Prepare items list
      const itemsList: CotizacionItem[] = selectedFurniture.map((id) => {
        const itemInfo = FURNITURE_TYPES.find((f) => f.id === id);
        return {
          id,
          mueble: itemInfo ? itemInfo.name : id,
          cantidad: 1,
          precioUnitario: 0,
          subtotal: 0,
          detalles: 'Pendiente de cotizar por foto',
        };
      });

      // 3. Register quotation in CRM
      storage.createCotizacionFromPublicForm(
        cliente,
        itemsList,
        0, // Valued manually by Omaira upon photo inspection
        photos,
        `Muebles a cotizar por foto: ${selectedFurniture.map((id) => FURNITURE_TYPES.find((f) => f.id === id)?.name).join(', ')}. ${notas || ''}`
      );

      // 4. Send email notification to Omaira (tapizoma2026@gmail.com)
      sendLeadNotificationToOmaira({
        nombre,
        telefono,
        correo,
        direccion,
        barrio,
        muebles: selectedFurniture.map((id) => FURNITURE_TYPES.find((f) => f.id === id)?.name).join(', '),
        fotos: photos,
        notas,
      }).catch((e) => console.warn('Email notification notice:', e));

      // 5. Confetti celebration
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#78BDC4', '#4F9DA6', '#10B981'],
        });
      } catch (err) {
        // ignore
      }

      const mueblesText = selectedFurniture
        .map((id) => FURNITURE_TYPES.find((f) => f.id === id)?.name)
        .join(', ');

      setCompletedRequest({
        cliente,
        mueblesText,
      });

      setIsSubmitting(false);

      if (onCotizacionCreada) {
        onCotizacionCreada();
      }
    }, 500);
  };

  const handleOpenWhatsAppFromSuccess = () => {
    if (!completedRequest) return;
    const msg = `¡Hola Omaira! 👋 Mi nombre es *${completedRequest.cliente.nombre}*.\n\nVivo en Bogotá, barrio *${completedRequest.cliente.barrio}* (Dirección: ${completedRequest.cliente.direccion}).\n\n🛋️ Deseo cotizar el lavado de: *${completedRequest.mueblesText}*.\n\n📸 Ya te adjunto la foto completa de mi mueble por este chat para que me des el valor exacto. ¡Muchas gracias!`;

    openWhatsAppChat(TAPIZ_FRESH_PHONE, msg);
  };

  return (
    <section id="cotizador" className="py-14 sm:py-20 bg-gradient-to-b from-white via-[#F4FAF9] to-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF7F8] border border-[#78BDC4]/40 text-[#2F6F77] text-xs font-bold uppercase tracking-wider mb-3">
            <Camera className="w-3.5 h-3.5 text-[#4F9DA6]" />
            Cotización Personalizada en Bogotá
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            Envíanos una Foto de tu Mueble y te Cotizamos
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            Cada mueble es único. Con una <strong>foto completa de tu mueble o colchón</strong> evaluamos su tamaño y tela para darte el <strong>valor exacto</strong> sin costos ocultos.
          </p>
        </div>

        {/* Modal on success */}
        {completedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-black text-slate-800">
                ¡Solicitud Recibida, {completedRequest.cliente.nombre}!
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Tus datos para el barrio <strong className="text-slate-800">{completedRequest.cliente.barrio} (Bogotá)</strong> ya están registrados en el sistema de Omaira.
              </p>

              <div className="my-5 p-4 rounded-2xl bg-[#EBF7F8] border border-[#78BDC4]/30 text-left text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-[#2F6F77] text-sm">Paso final: Envía la foto por WhatsApp</div>
                <p>
                  Para responderte con el precio de inmediato, pulsa el botón verde para abrir el chat con Omaira y enviarle la foto de tu mueble.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleOpenWhatsAppFromSuccess}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-98 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Enviar Foto a Omaira por WhatsApp ({TAPIZ_FRESH_PHONE_FORMATTED})</span>
                </button>

                <button
                  onClick={() => setCompletedRequest(null)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Select Furniture & Photo Upload */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
                <span>1. Elige el Mueble o Colchón a Lavar</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Puedes seleccionar uno o varios tipos de muebles.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FURNITURE_TYPES.map((item) => {
                  const isSelected = selectedFurniture.includes(item.id);
                  const config = storage.getConfig();
                  const customImg = (config.fotosMuebles && config.fotosMuebles[item.id]) || item.image;
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleFurniture(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#78BDC4] bg-[#EBF7F8]/50 ring-2 ring-[#78BDC4]/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2 relative">
                        <img
                          src={customImg}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#78BDC4] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight text-center">
                        {item.name}
                      </h4>
                    </div>
                  );
                })}
              </div>

              {/* PHOTO UPLOAD INSTRUCTION BOX */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 mb-4 flex items-start gap-3">
                  <Camera className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <span className="font-extrabold block text-sm mb-0.5">
                      📸 Envíanos una imagen completa de tu mueble
                    </span>
                    Tómale una foto donde se aprecie el mueble entero o la zona que deseas limpiar. Así Omaira te dará el precio exacto por WhatsApp o teléfono.
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-[#78BDC4] bg-[#EBF7F8]/40 hover:bg-[#EBF7F8] text-xs font-bold text-[#2F6F77] cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-[#4F9DA6]" />
                    <span>
                      {isUploadingPhoto ? 'Cargando foto...' : 'Seleccionar foto de tu mueble o mancha'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Photos list preview */}
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {photos.map((img, idx) => (
                        <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                          <img src={img} alt="Foto mueble" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-xs"
                            title="Eliminar foto"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Details (Bogotá Only, No Legalese) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 sticky top-28">
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1">
                2. Tus Datos en Bogotá
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Para coordinar la visita a domicilio en tu barrio.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre y apellido"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp / Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 321 991 8147"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dirección en Bogotá *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Calle 140 # 15-22, Torre 3 Apto 502"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Barrio en Bogotá *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Cedritos, Suba, etc."
                      value={barrio}
                      onChange={(e) => setBarrio(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Bogotá D.C."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-700 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ¿Cómo nos conociste?
                  </label>
                  <select
                    value={origen}
                    onChange={(e) => setOrigen(e.target.value as OrigenCliente)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Recomendación">Recomendación</option>
                    <option value="Google">Búsqueda en Google</option>
                    <option value="Otro">Otro medio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detalles adicionales (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Cuéntanos si tiene alguna mancha especial o requerimiento..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || selectedFurniture.length === 0}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#78BDC4]/30 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>{isSubmitting ? 'Registrando solicitud...' : 'Solicitar Cotización con mi Foto'}</span>
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Omaira revisará tu foto y te responderá al WhatsApp en minutos.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
