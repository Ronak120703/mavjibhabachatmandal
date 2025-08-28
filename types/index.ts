export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isActive: boolean;
  joinedDate: string;
}

export interface Draw {
  id: string;
  month: string; // Format: "YYYY-MM"
  date: string; // ISO date string
  winnerId: string;
  winnerName: string;
  goldPricePerGram: number;
  totalAmount: number;
  amountPerMember: number;
  qrCodeUrl: string;
  isCompleted: boolean;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  drawId: string;
  amount: number;
  date: string | null;
  status: 'pending' | 'completed';
  transactionId?: string;
}

export interface GoldPrice {
  id: string;
  pricePerGram: number;
  lastUpdated: string;
  currency: string;
}

export interface DrawStats {
  totalDraws: number;
  totalMembers: number;
  activeMembers: number;
  totalGoldDistributed: number;
  nextDrawDate: string;
}
