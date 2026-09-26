import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { LanguageProvider } from "./i18n/LanguageContext";
import { WalletProvider } from "./contexts/WalletContext";
import { OrderProvider } from "./contexts/OrderContext";

export default function App() {
  return (
    <LanguageProvider>
      <WalletProvider>
        <OrderProvider>
          <RouterProvider router={router} />
          <Toaster position="bottom-center" richColors closeButton />
        </OrderProvider>
      </WalletProvider>
    </LanguageProvider>
  );
}
