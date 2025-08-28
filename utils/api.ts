import axios from 'axios';
import { Member, Draw, Payment, GoldPrice } from '@/types';

const API_BASE_URL = '/api';

// Member Management
export const getMembers = async (): Promise<Member[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};

export const addMember = async (member: Omit<Member, 'id' | 'joinedDate'>): Promise<Member | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/members`, member);
    return response.data;
  } catch (error) {
    console.error('Error adding member:', error);
    return null;
  }
};

export const updateMember = async (id: string, updates: Partial<Member>): Promise<Member | null> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/members/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating member:', error);
    return null;
  }
};

export const deleteMember = async (id: string): Promise<boolean> => {
  try {
    await axios.delete(`${API_BASE_URL}/members/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting member:', error);
    return false;
  }
};

// Draw Management
export const getDraws = async (): Promise<Draw[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/draws`);
    return response.data;
  } catch (error) {
    console.error('Error fetching draws:', error);
    return [];
  }
};

export const createDraw = async (draw: Omit<Draw, 'id'>): Promise<Draw | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/draws`, draw);
    return response.data;
  } catch (error) {
    console.error('Error creating draw:', error);
    return null;
  }
};

// Payment Management
export const getPayments = async (): Promise<Payment[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};

export const addPayment = async (payment: Omit<Payment, 'id'>): Promise<Payment | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payments`, payment);
    return response.data;
  } catch (error) {
    console.error('Error adding payment:', error);
    return null;
  }
};

export const updatePayment = async (id: string, updates: Partial<Payment>): Promise<Payment | null> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/payments`, { id, ...updates });
    return response.data;
  } catch (error) {
    console.error('Error updating payment:', error);
    return null;
  }
};

// Gold Price Management
export const getGoldPrice = async (): Promise<GoldPrice> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gold-price`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return {
      id: 'default',
      pricePerGram: 0,
      lastUpdated: new Date().toISOString(),
      currency: 'INR'
    };
  }
};

export const updateGoldPrice = async (pricePerGram: number): Promise<GoldPrice | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/gold-price`, {
      pricePerGram,
      currency: 'INR',
    });
    return response.data;
  } catch (error) {
    console.error('Error updating gold price:', error);
    return null;
  }
};

// Admin Management
export const adminReset = async (): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/reset`);
    return response.data.success;
  } catch (error) {
    console.error('Error resetting data:', error);
    return false;
  }
};

// Utility Functions
export const getActiveMembers = async (): Promise<Member[]> => {
  try {
    const members = await getMembers();
    return members.filter(member => member.isActive);
  } catch (error) {
    console.error('Error getting active members:', error);
    return [];
  }
};

export const getPreviousWinners = async (): Promise<string[]> => {
  try {
    const draws = await getDraws();
    return draws.map(draw => draw.winnerId);
  } catch (error) {
    console.error('Error getting previous winners:', error);
    return [];
  }
};

export const getEligibleMembers = async (): Promise<Member[]> => {
  try {
    const [activeMembers, previousWinners] = await Promise.all([
      getActiveMembers(),
      getPreviousWinners()
    ]);
    
    console.log('Active members:', activeMembers.length);
    console.log('Previous winners:', previousWinners.length);
    
    const eligibleMembers = activeMembers.filter(member => 
      !previousWinners.includes(member.id)
    );
    
    console.log('Eligible members:', eligibleMembers.length);
    return eligibleMembers;
  } catch (error) {
    console.error('Error getting eligible members:', error);
    return [];
  }
};

export const calculateAmountPerMember = (goldPricePerGram: number, activeMembersCount: number = 30): number => {
  const totalAmount = goldPricePerGram * 20; // 20 grams of gold
  return Math.round(totalAmount / activeMembersCount); // Divide among active members
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
