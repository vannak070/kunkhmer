// Mock Officials Data for KKF Platform

export interface Official {
  id: string;
  name: string;
  experience: string;
  grade: string;
  status: "Available" | "Busy";
}

export const MOCK_JUDGES: Official[] = [
  { id: "e7c50001-9323-4ac0-8035-a2f8848fe8a4", name: "Som Panha", experience: "15 years", grade: "International A", status: "Available" },
  { id: "e7c50002-9323-4ac0-8035-a2f8848fe8a4", name: "Chea Veasna", experience: "12 years", grade: "International A", status: "Available" },
  { id: "e7c50003-9323-4ac0-8035-a2f8848fe8a4", name: "Ly Sokha", experience: "10 years", grade: "National A", status: "Available" },
  { id: "e7c50004-9323-4ac0-8035-a2f8848fe8a4", name: "Kim Rattana", experience: "8 years", grade: "National B", status: "Available" },
  { id: "e7c50005-9323-4ac0-8035-a2f8848fe8a4", name: "Nhek Dara", experience: "6 years", grade: "National B", status: "Available" },
  { id: "e7c50006-9323-4ac0-8035-a2f8848fe8a4", name: "Pov Samnang", experience: "11 years", grade: "International A", status: "Busy" },
  { id: "e7c50007-9323-4ac0-8035-a2f8848fe8a4", name: "Touch Vibol", experience: "9 years", grade: "National A", status: "Available" },
];

export const MOCK_REFEREES: Official[] = [
  { id: "d7b30001-9f5b-4b24-a208-bdab9a3f764e", name: "Meas Sopheak", experience: "18 years", grade: "International A", status: "Available" },
  { id: "d7b30002-9f5b-4b24-a208-bdab9a3f764e", name: "Heng Bunthoeun", experience: "14 years", grade: "International A", status: "Available" },
  { id: "d7b30003-9f5b-4b24-a208-bdab9a3f764e", name: "Keo Narith", experience: "10 years", grade: "National A", status: "Available" },
  { id: "d7b30004-9f5b-4b24-a208-bdab9a3f764e", name: "San Piseth", experience: "7 years", grade: "National B", status: "Available" },
  { id: "d7b30005-9f5b-4b24-a208-bdab9a3f764e", name: "Chan Rithy", experience: "12 years", grade: "International A", status: "Busy" },
  { id: "d7b30006-9f5b-4b24-a208-bdab9a3f764e", name: "Long Sarath", experience: "9 years", grade: "National A", status: "Available" },
];
