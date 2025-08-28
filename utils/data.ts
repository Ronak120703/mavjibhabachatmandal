import { Member, Draw, Payment, GoldPrice } from '@/types';

// Local Storage Keys
const STORAGE_KEYS = {
  MEMBERS: 'mavjibha_members',
  DRAWS: 'mavjibha_draws',
  GOLD_PRICE: 'mavjibha_gold_price',
  PAYMENTS: 'mavjibha_payments',
};

// Initialize default data if not exists
export const initializeData = () => {
  if (typeof window === 'undefined') return;

  // Initialize members if not exists
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    const defaultMembers: Member[] = [
      {
        id: '1',
        name: 'Sample Member 1',
        phone: '+91 9876543210',
        email: 'member1@example.com',
        isActive: true,
        joinedDate: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Sample Member 2',
        phone: '+91 9876543211',
        email: 'member2@example.com',
        isActive: true,
        joinedDate: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(defaultMembers));
  }

  // Initialize gold price if not exists
  if (!localStorage.getItem(STORAGE_KEYS.GOLD_PRICE)) {
    const defaultGoldPrice: GoldPrice = {
      pricePerGram: 6000, // Default price in INR
      lastUpdated: new Date().toISOString(),
      currency: 'INR',
    };
    localStorage.setItem(STORAGE_KEYS.GOLD_PRICE, JSON.stringify(defaultGoldPrice));
  }

  // Initialize draws if not exists
  if (!localStorage.getItem(STORAGE_KEYS.DRAWS)) {
    localStorage.setItem(STORAGE_KEYS.DRAWS, JSON.stringify([]));
  }

  // Initialize payments if not exists
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  }
};

// Member Management
export const getMembers = (): Member[] => {
  if (typeof window === 'undefined') return [];
  const members = localStorage.getItem(STORAGE_KEYS.MEMBERS);
  return members ? JSON.parse(members) : [];
};

export const addMember = (member: Omit<Member, 'id' | 'joinedDate'>): Member => {
  const members = getMembers();
  const newMember: Member = {
    ...member,
    id: Date.now().toString(),
    joinedDate: new Date().toISOString(),
  };
  members.push(newMember);
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  return newMember;
};

export const updateMember = (id: string, updates: Partial<Member>): Member | null => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === id);
  if (index === -1) return null;
  
  members[index] = { ...members[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  return members[index];
};

export const deleteMember = (id: string): boolean => {
  const members = getMembers();
  const filteredMembers = members.filter(m => m.id !== id);
  if (filteredMembers.length === members.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filteredMembers));
  return true;
};

// Draw Management
export const getDraws = (): Draw[] => {
  if (typeof window === 'undefined') return [];
  const draws = localStorage.getItem(STORAGE_KEYS.DRAWS);
  return draws ? JSON.parse(draws) : [];
};

export const createDraw = (draw: Omit<Draw, 'id'>): Draw => {
  const draws = getDraws();
  const newDraw: Draw = {
    ...draw,
    id: Date.now().toString(),
  };
  draws.push(newDraw);
  localStorage.setItem(STORAGE_KEYS.DRAWS, JSON.stringify(draws));
  return newDraw;
};

export const updateDraw = (id: string, updates: Partial<Draw>): Draw | null => {
  const draws = getDraws();
  const index = draws.findIndex(d => d.id === id);
  if (index === -1) return null;
  
  draws[index] = { ...draws[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.DRAWS, JSON.stringify(draws));
  return draws[index];
};

// Gold Price Management
export const getGoldPrice = (): GoldPrice => {
  if (typeof window === 'undefined') {
    return {
      pricePerGram: 6000,
      lastUpdated: new Date().toISOString(),
      currency: 'INR',
    };
  }
  const price = localStorage.getItem(STORAGE_KEYS.GOLD_PRICE);
  return price ? JSON.parse(price) : {
    pricePerGram: 6000,
    lastUpdated: new Date().toISOString(),
    currency: 'INR',
  };
};

export const updateGoldPrice = (pricePerGram: number): GoldPrice => {
  const goldPrice: GoldPrice = {
    pricePerGram,
    lastUpdated: new Date().toISOString(),
    currency: 'INR',
  };
  localStorage.setItem(STORAGE_KEYS.GOLD_PRICE, JSON.stringify(goldPrice));
  return goldPrice;
};

// Payment Management
export const getPayments = (): Payment[] => {
  if (typeof window === 'undefined') return [];
  const payments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return payments ? JSON.parse(payments) : [];
};

export const addPayment = (payment: Omit<Payment, 'id'>): Payment => {
  const payments = getPayments();
  const newPayment: Payment = {
    ...payment,
    id: Date.now().toString(),
  };
  payments.push(newPayment);
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  return newPayment;
};

export const updatePayment = (id: string, updates: Partial<Payment>): Payment | null => {
  const payments = getPayments();
  const index = payments.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  payments[index] = { ...payments[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  return payments[index];
};

// Utility Functions
export const getActiveMembers = (): Member[] => {
  return getMembers().filter(member => member.isActive);
};

export const getPreviousWinners = (): string[] => {
  const draws = getDraws();
  return draws.map(draw => draw.winnerId);
};

export const getEligibleMembers = (): Member[] => {
  const activeMembers = getActiveMembers();
  const previousWinners = getPreviousWinners();
  return activeMembers.filter(member => !previousWinners.includes(member.id));
};

export const calculateAmountPerMember = (goldPricePerGram: number): number => {
  const totalAmount = goldPricePerGram * 20; // 20 grams of gold
  return Math.round(totalAmount / 30); // Divide among 30 members
};

export const generateQRCodeUrl = (amount: number, drawId: string): string => {
  const paymentData = {
    amount,
    drawId,
    description: `Mavjibha Bachat Mandal - Monthly Draw Payment`,
    timestamp: new Date().toISOString(),
  };
  
  const dataString = JSON.stringify(paymentData);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dataString)}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
