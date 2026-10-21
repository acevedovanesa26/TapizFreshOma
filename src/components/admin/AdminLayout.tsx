import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Kanban,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Clock,
  Menu,
  X,
} from 'lucide-react';
import { Administrador, NotificacionSistema } from '../../types';
import { storage } from '../../services/storage';

export type AdminTab =
  | 'resumen'
  | 'solicitudes'
  | 'clientes'
  | 'embudo'
  | 'agenda'
  | 'reportes'
  | 'configuracion';

interface AdminLayoutProps {
  currentAdmin: Administrador;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  onGoToPublic: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentAdmin,
  activeTab,
  onTabChange,
  onLogout,
  onGoToPublic,
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificacionSistema[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync notifications
  useEffect(() => {
    const update = () => {
      const list = storage.getNotifications();
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.leida).length);
    };
    update();
    return storage.subscribe(update);
  }, []);

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'resumen',
      label: 'Resumen',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'solicitudes',
      label: 'Solicitudes',
      icon: <Inbox className="w-5 h-5" />,
      badge: unreadCount,
    },
    {
      id: 'clientes',
      label: 'Clientes (CRM)',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'embudo',
      label: 'Embudo de Ventas',
      icon: <Kanban className="w-5 h-5" />,
    },
    {
      id: 'agenda',
      label: 'Agenda de Visitas',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleOpenNotifications = () => {
    setShowNotificationsModal(!showNotificationsModal);
    if (!showNotificationsModal && unreadCount > 0) {
      storage.markNotificationsAsRead();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20 md:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#78BDC4] to-[#4F9DA6] flex items-center justify-center text-white font-black text-sm shadow-sm">
                TF
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-800">Tapiz Fresh</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EBF7F8] text-[#2F6F77] border border-[#78BDC4]/40">
                    PANEL CRM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Public Website */}
            <button
              onClick={onGoToPublic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Ver sitio web de clientes"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#4F9DA6]" />
              <span className="hidden md:inline">Sitio Público</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={handleOpenNotifications}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative cursor-pointer"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotificationsModal && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Notificaciones Recientes
                    </span>
                    <button
                      onClick={() => setShowNotificationsModal(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">
                        No hay notificaciones nuevas
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#EBF7F8] border border-slate-100 text-xs transition-colors"
                        >
                          <div className="font-bold text-slate-800">{n.titulo}</div>
                          <div className="text-slate-600 mt-0.5">{n.mensaje}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.fecha).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Avatar Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#78BDC4] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {currentAdmin.nombre.substring(0, 2)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-none">
                  {currentAdmin.nombre}
                </div>
                <div className="text-[10px] font-semibold text-[#4F9DA6] uppercase mt-0.5">
                  {currentAdmin.rol === 'propietaria' ? 'Propietaria' : 'Administrador'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Cerrar Sesión Segura"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-3xl p-3 shadow-xs border border-slate-200/80 sticky top-24 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Módulos del Sistema
            </div>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#78BDC4] text-white shadow-md shadow-[#78BDC4]/25'
                      : 'text-slate-600 hover:bg-[#EBF7F8] hover:text-[#2F6F77]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white text-[#2F6F77]' : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Inactivity Security Badge */}
            <div className="pt-4 mt-3 border-t border-slate-100 px-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#4F9DA6]" />
                <span>Cierre auto por inactividad: 30 min</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-down Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex flex-col">
            <div className="bg-white p-5 rounded-b-3xl shadow-2xl space-y-2 border-b border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800">Menú del Administrador</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold ${
                    activeTab === item.id
                      ? 'bg-[#78BDC4] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar (Large thumb-friendly touch targets) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors relative cursor-pointer ${
                isActive ? 'text-[#2F6F77] font-black' : 'text-slate-500 font-medium'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-emerald-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#78BDC4] mt-0.5"></div>
              )}
            </button>
          );
        })}
        {/* More icon on mobile leading to remaining tabs */}
        <button
          onClick={() => onTabChange('configuracion')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl cursor-pointer ${
            activeTab === 'configuracion' || activeTab === 'reportes'
              ? 'text-[#2F6F77] font-black'
              : 'text-slate-500 font-medium'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Ajustes</span>
        </button>
      </nav>
    </div>
  );
};
