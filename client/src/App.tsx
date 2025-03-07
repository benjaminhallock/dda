import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Tasks } from "./pages/Tasks";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { Wallet } from "./pages/Wallet";
import { Inbox } from "./pages/Inbox";
import { Union } from "./pages/Union";
import { Discussions } from "./pages/Discussions";
import { Marketplace } from "./pages/Marketplace";
import { DataMonetization } from "./pages/DataMonetization";
import { Wellness } from "./pages/Wellness";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/union" element={<Union />} />
              <Route path="/discussions" element={<Discussions />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/data-monetization" element={<DataMonetization />} />
              <Route path="/wellness" element={<Wellness />} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;