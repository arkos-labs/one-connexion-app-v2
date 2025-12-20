import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";

// --- IMPORTS DES PAGES ---
import { DriverHomeScreen } from "./features/driver/components/DriverHomeScreen";
import { EarningsPage } from "./features/driver/pages/EarningsPage"; // Page Revenus
import { DocumentsPage } from "./features/driver/pages/DocumentsPage"; // Page Documents
import { VehiclePage } from "./features/driver/pages/VehiclePage"; // Page Véhicule
import NotFound from "./pages/NotFound";
import { RideHistorySheet } from "./features/driver/components/RideHistorySheet"; // Pour l'historique (Note: c'est un sheet, on peut faire une page wrapper si besoin)
import { HistoryPage } from "./features/driver/pages/HistoryPage"; // Page Historique
import Login from "./pages/Login";
import { AuthGuard } from "./features/auth/components/AuthGuard";
import { SettingsPage } from "./features/driver/pages/SettingsPage";
import { SupportPage } from "./features/driver/pages/SupportPage";

const queryClient = new QueryClient();

// Composant Wrapper pour afficher l'Historique comme une page si nécessaire
const HistoryPageWrapper = () => {
  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {/* On force l'ouverture du Sheet en mode 'page' ou on crée une vraie page liste */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Historique des courses</h1>
        <p className="text-muted-foreground">L'historique détaillé est accessible via le tableau de bord.</p>
        {/* Ici, idéalement, on réutiliserait le contenu de RideHistorySheet mais sans le Sheet wrapper */}
      </div>
    </div>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* 1. Route Publique : Login */}
          <Route path="/login" element={<Login />} />

          {/* 2. Routes Protégées (Tout le reste) */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }
          >
            {/* Redirection racine -> Driver */}
            <Route index element={<Navigate to="/driver" replace />} />

            {/* --- ROUTES CHAUFFEUR --- */}
            <Route path="driver">
              <Route index element={<DriverHomeScreen />} />         {/* /driver (Accueil) */}
              <Route path="map" element={<DriverHomeScreen />} />    {/* /driver/map */}

              {/* Les nouvelles pages fonctionnelles */}
              <Route path="earnings" element={<EarningsPage />} />   {/* /driver/earnings */}
              <Route path="documents" element={<DocumentsPage />} /> {/* /driver/documents */}
              <Route path="vehicle" element={<VehiclePage />} />     {/* /driver/vehicle */}

              <Route path="history" element={<HistoryPage />} /> {/* Page Historique dédiée */}
            </Route>

            {/* --- AUTRES ROUTES --- */}
            <Route path="settings" element={<SettingsPage />} />
            <Route path="support" element={<SupportPage />} />
          </Route>

          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
