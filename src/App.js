// import logo from "./logo.svg";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Mainroute from "./routes/Mainroute";
// import AnimatedCursor from "./componant/Cursor/AnimatedCursor";
import { AuthProvider } from "./contexts/AuthContext";
// import { useState } from "react";


function App() {
  const queryClient = new QueryClient();
  // const [hide ,setHide]=useState(false)

  return (
    <div className="App no-select">
      {/* <AnimatedCursor /> */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Mainroute/>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
