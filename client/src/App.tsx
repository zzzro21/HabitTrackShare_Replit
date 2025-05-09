import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HabitProvider } from "@/lib/HabitContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FriendsPage from "@/pages/FriendsPage";
import RankingPage from "@/pages/RankingPage";
import SettingsPage from "@/pages/SettingsPage";
import NotePage from "@/pages/NotePage";
import InsightsPage from "@/pages/InsightsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/friends" component={FriendsPage} />
      <Route path="/ranking" component={RankingPage} />
      <Route path="/insights" component={InsightsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/notes" component={NotePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <HabitProvider>
          <Router />
        </HabitProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
