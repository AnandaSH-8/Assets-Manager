import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import AddParticulars from "./pages/AddParticulars";
import Statistics from "./pages/Statistics";
import Comparison from "./pages/Comparison";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="assets-manager-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <BrowserRouter>
            <div className="flex min-h-screen w-full bg-background">
              <AppSidebar />
              <main className="flex-1 flex flex-col">
                {/* Header with trigger for mobile */}
                <header className="lg:hidden h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                  <SidebarTrigger />
                  <h1 className="ml-4 text-lg font-semibold">AssetsManager</h1>
                </header>
                
                {/* Main content */}
                <div className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/add-particulars" element={<AddParticulars />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/comparison" element={<Comparison />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
            </div>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
