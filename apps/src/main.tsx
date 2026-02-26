import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GameStateProvider } from "./game-state/GameStateProvider";
import "./global.css";
import "./renderers/register";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GameStateProvider>
        <App />
      </GameStateProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
