import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";
import { Outlet } from "react-router-dom";

export function MainLayout({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* La nouvelle barre latérale rangée */}
        <AppSidebar />

        {/* Contenu Principal */}
        <main className="flex-1 w-full bg-background relative">


          {/* Le contenu de la page s'affiche ici */}
          {children || <Outlet />}
        </main>
      </div>
    </SidebarProvider>
  );
}
