import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="flex">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1">
            {/* Optional toggle button anywhere */}
            <SidebarTrigger className="p-2">Menu</SidebarTrigger>
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
