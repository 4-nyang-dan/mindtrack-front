// App.tsx
import React from "react";
import { AuthProvider } from "./components/auth/AuthContext";
import Main from "./components/Main";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

export default App;
