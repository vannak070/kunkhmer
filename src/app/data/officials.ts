// Mock Officials Data for KKF Platform

export interface Official {
  id: string;
  name: string;
  experience: string;
  grade: string;
  status: "Available" | "Busy";
}

export const MOCK_JUDGES: Official[] = [
  { id: "J001", name: "Som Panha", experience: "15 years", grade: "International A", status: "Available" },
  { id: "J002", name: "Chea Veasna", experience: "12 years", grade: "International A", status: "Available" },
  { id: "J003", name: "Ly Sokha", experience: "10 years", grade: "National A", status: "Available" },
  { id: "J004", name: "Kim Rattana", experience: "8 years", grade: "National B", status: "Available" },
  { id: "J005", name: "Nhek Dara", experience: "6 years", grade: "National B", status: "Available" },
  { id: "J006", name: "Pov Samnang", experience: "11 years", grade: "International A", status: "Busy" },
  { id: "J007", name: "Touch Vibol", experience: "9 years", grade: "National A", status: "Available" },
];

export const MOCK_REFEREES: Official[] = [
  { id: "R001", name: "Meas Sopheak", experience: "18 years", grade: "International A", status: "Available" },
  { id: "R002", name: "Heng Bunthoeun", experience: "14 years", grade: "International A", status: "Available" },
  { id: "R003", name: "Keo Narith", experience: "10 years", grade: "National A", status: "Available" },
  { id: "R004", name: "San Piseth", experience: "7 years", grade: "National B", status: "Available" },
  { id: "R005", name: "Chan Rithy", experience: "12 years", grade: "International A", status: "Busy" },
  { id: "R006", name: "Long Sarath", experience: "9 years", grade: "National A", status: "Available" },
];
