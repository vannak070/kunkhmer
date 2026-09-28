import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { LanguageProvider } from "./i18n/LanguageContext";
import { FanProvider } from "./contexts/FanContext";

export default function App() {
  return (
    <LanguageProvider>
      <FanProvider>
        <RouterProvider router={router} />
        <Toaster position="bottom-center" richColors closeButton />
      </FanProvider>
    </LanguageProvider>
  );
}
