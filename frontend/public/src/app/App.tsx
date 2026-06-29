import { RouterProvider } from "react-router";
import { router } from "./routes";
import { WalletProvider } from "./contexts/WalletContext";
import { OrderProvider } from "./contexts/OrderContext";

export default function App() {
  return (
    <WalletProvider>
      <OrderProvider>
        <RouterProvider router={router} />
      </OrderProvider>
    </WalletProvider>
  );
}