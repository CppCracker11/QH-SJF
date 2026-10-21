import { StrictMode as Mod } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <Mod>
    <App />
  </Mod>,
);

// Glossary: Mod=React strict-mode wrapper; createRoot=mount React tree; App=main interface; root=mount point.
