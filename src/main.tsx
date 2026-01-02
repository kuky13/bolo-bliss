
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'


// Create a root for concurrent mode rendering
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

// Render with StrictMode disabled in production for better performance
root.render(<App />);
