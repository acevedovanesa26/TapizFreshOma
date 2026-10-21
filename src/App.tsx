import React, { useState, useEffect } from 'react';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { QuoteCalculator } from './components/public/QuoteCalculator';
import { WorkCarousel } from './components/public/WorkCarousel';
import { ServicesSection } from './components/public/ServicesSection';
import { TestimonialsSection } from './components/public/TestimonialsSection';
import { PublicContactSection } from './components/public/PublicContactSection';
import { Footer } from './components/public/Footer';

// Admin Components
import { AdminAuthView } from './components/admin/AdminAuthView';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { DashboardTab } from './components/admin/DashboardTab';
import { IncomingRequestsTab } from './components/admin/IncomingRequestsTab';
import { ClientsCRMTab } from './components/admin/ClientsCRMTab';
import { KanbanPipelineTab } from './components/admin/KanbanPipelineTab';
import { CalendarAgendaTab } from './components/admin/CalendarAgendaTab';
import { ReportsTab } from './components/admin/ReportsTab';
import { SettingsTab } from './components/admin/SettingsTab';

// Services
import { auth, AuthState } from './services/auth';
import { Administrador } from './types';
import { MessageSquare, Sparkles } from 'lucide-react';
import { openWhatsAppChat } from './services/whatsapp';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [authState, setAuthState] = useState<AuthState>(auth.getCurrentSession());
  const [activeTab, setActiveTab] = useState<AdminTab>('resumen');
  const [inactivityNotice, setInactivityNotice] = useState<string | null>(null);

  // Sync route and auth state
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        setIsAdminRoute(true);
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);

    const unsubAuth = auth.subscribe((newState) => {
      setAuthState(newState);
    });

    const handleInactivityLogout = (e: any) => {
      if (e.detail?.reason) {
        setInactivityNotice(e.detail.reason);
        setTimeout(() => setInactivityNotice(null), 6000);
      }
    };
    window.addEventListener('tapiz_fresh_logout', handleInactivityLogout);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('tapiz_fresh_logout', handleInactivityLogout);
      unsubAuth();
    };
  }, []);

  const handleGoToAdmin = () => {
    setIsAdminRoute(true);
    window.history.pushState({}, '', '/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToPublic = () => {
    setIsAdminRoute(false);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToQuote = () => {
    const el = document.getElementById('cotizador');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginSuccess = (admin: Administrador) => {
    setAuthState({
      isAuthenticated: true,
      admin,
      sessionExpiry: Date.now() + 30 * 60 * 1000,
    });
    setActiveTab('resumen');
  };

  const handleLogout = () => {
    auth.logout();
    setAuthState({
      isAuthenticated: false,
      admin: null,
      sessionExpiry: null,
    });
  };

  // ADMIN VIEW
  if (isAdminRoute) {
    if (!authState.isAuthenticated || !authState.admin) {
      return (
        <div>
          {inactivityNotice && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold animate-in fade-in">
              {inactivityNotice}
            </div>
          )}
          <AdminAuthView
            onSuccess={handleLoginSuccess}
            onBackToPublic={handleGoToPublic}
          />
        </div>
      );
    }

    return (
      <AdminLayout
        currentAdmin={authState.admin}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onGoToPublic={handleGoToPublic}
      >
        {activeTab === 'resumen' && (
          <DashboardTab
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'solicitudes' && <IncomingRequestsTab />}
        {activeTab === 'clientes' && <ClientsCRMTab />}
        {activeTab === 'embudo' && <KanbanPipelineTab />}
        {activeTab === 'agenda' && <CalendarAgendaTab />}
        {activeTab === 'reportes' && <ReportsTab />}
        {activeTab === 'configuracion' && (
          <SettingsTab currentAdmin={authState.admin} />
        )}
      </AdminLayout>
    );
  }

  // PUBLIC CUSTOMER PORTAL
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#78BDC4]/30 selection:text-[#2F6F77]">
      <Navbar onGoToAdmin={handleGoToAdmin} onGoToQuote={handleScrollToQuote} />

      <main className="flex-1">
        <Hero onCotizarClick={handleScrollToQuote} />
        <QuoteCalculator />
        <WorkCarousel />
        <ServicesSection />
        <TestimonialsSection />
        <PublicContactSection />
      </main>

      <Footer onGoToAdmin={handleGoToAdmin} />

      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() =>
            openWhatsAppChat(
              '3219918147',
              '¡Hola Omaira! Quiero cotizar el lavado de mis muebles con Tapiz Fresh en Bogotá. Te adjunto una foto.'
            )
          }
          className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/35 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer relative group"
          title="Escríbenos por WhatsApp"
        >
          <MessageSquare className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          </span>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            WhatsApp: 321 991 8147
          </span>
        </button>
      </div>
    </div>
  );
}
