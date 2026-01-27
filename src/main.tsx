import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

console.log('App initializing...');
const root = document.getElementById("root");
console.log('Root element:', root ? '✓ Found' : '❌ Missing');

if (root) {
  createRoot(root).render(<App />);
  console.log('App rendered');
} else {
  console.error('Root element not found!');
}

