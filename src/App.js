// import logo from "./logo.svg";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Mainroute from "./routes/Mainroute";
// import AnimatedCursor from "./componant/Cursor/AnimatedCursor";
import { AuthProvider } from "./contexts/AuthContext";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { registerServiceWorker } from "./utils/pwaUtils";
import { useEffect } from "react";


function App() {
  const queryClient = new QueryClient();
  // const [hide ,setHide]=useState(false)

  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();
  }, []);

  return (
    <div className="App no-select">
      {/* <AnimatedCursor /> */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Mainroute/>
          <PWAInstallPrompt />
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
