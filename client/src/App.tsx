import { Switch, Route } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocationModal } from "@/components/LocationModal";
import Home from "@/pages/Home";
import Customize from "@/pages/Customize";
import Checkout from "@/pages/Checkout";
import Confirmation from "@/pages/Confirmation";
import { AdminLogin } from "@/pages/admin/Login";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { ProductsManagement } from "@/pages/admin/ProductsManagement";
import { OrdersManagement } from "@/pages/admin/OrdersManagement";
import { ReviewsManagement } from "@/pages/admin/ReviewsManagement";
import { TransactionsManagement } from "@/pages/admin/TransactionsManagement";
import NotFound from "@/pages/not-found";

interface LocationData {
  city: string;
  regionName: string;
  country: string;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/customize" component={Customize} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/confirmation/:orderId" component={Confirmation} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={ProductsManagement} />
      <Route path="/admin/orders" component={OrdersManagement} />
      <Route path="/admin/reviews" component={ReviewsManagement} />
      <Route path="/admin/transactions" component={TransactionsManagement} />
      <Route path="/admin" component={AdminLogin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  const handleLocationConfirmed = (location: LocationData) => {
    setUserLocation(location);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <LocationModal onLocationConfirmed={handleLocationConfirmed} />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
