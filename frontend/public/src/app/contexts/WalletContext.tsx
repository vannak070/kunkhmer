import { createContext, useContext, useState, ReactNode } from "react";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "bet_placed" | "bet_won" | "bet_lost" | "purchase";
  amount: number;
  description: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
  deductBalance: (amount: number, description: string, type: Transaction["type"]) => boolean;
  addBalance: (amount: number, description: string, type: Transaction["type"]) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(1000);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "deposit",
      amount: 1000,
      description: "Welcome bonus",
      timestamp: new Date().toISOString(),
      status: "completed"
    }
  ]);

  const deposit = (amount: number) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: "deposit",
      amount,
      description: `Deposit ${amount} points`,
      timestamp: new Date().toISOString(),
      status: "completed"
    };
    setBalance(prev => prev + amount);
    setTransactions(prev => [transaction, ...prev]);
  };

  const withdraw = (amount: number) => {
    if (balance >= amount) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: "withdraw",
        amount,
        description: `Withdraw ${amount} points`,
        timestamp: new Date().toISOString(),
        status: "completed"
      };
      setBalance(prev => prev - amount);
      setTransactions(prev => [transaction, ...prev]);
    }
  };

  const deductBalance = (amount: number, description: string, type: Transaction["type"]): boolean => {
    if (balance >= amount) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        type,
        amount,
        description,
        timestamp: new Date().toISOString(),
        status: "completed"
      };
      setBalance(prev => prev - amount);
      setTransactions(prev => [transaction, ...prev]);
      return true;
    }
    return false;
  };

  const addBalance = (amount: number, description: string, type: Transaction["type"]) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount,
      description,
      timestamp: new Date().toISOString(),
      status: "completed"
    };
    setBalance(prev => prev + amount);
    setTransactions(prev => [transaction, ...prev]);
  };

  return (
    <WalletContext.Provider value={{ balance, transactions, deposit, withdraw, deductBalance, addBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
