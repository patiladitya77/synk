import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1">
          <SidebarTrigger className="p-2">Menu</SidebarTrigger>
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
