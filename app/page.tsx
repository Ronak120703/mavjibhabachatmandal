'use client';

import { useEffect, useState } from 'react';
import { getMembers, getDraws, getGoldPrice, formatCurrency, formatDate, adminReset, getAdminSession, adminLogout } from '@/utils/api';
import { Member, Draw, GoldPrice, DrawStats } from '@/types';
import Link from 'next/link';
import { 
  Users, 
  Trophy, 
  Coins, 
  Calendar, 
  Plus, 
  Settings, 
  BarChart3,
  Crown,
  TrendingUp,
  RotateCcw,
  LogIn,
  LogOut,
  User
} from 'lucide-react';

export default function HomePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [stats, setStats] = useState<DrawStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadData();
    // Check admin session
    getAdminSession().then(({ isAdmin }) => setIsAdmin(!!isAdmin)).catch(() => setIsAdmin(false));
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, drawsData, goldPriceData] = await Promise.all([
        getMembers(),
        getDraws(),
        getGoldPrice()
      ]);
      
      setMembers(membersData);
      setDraws(drawsData);
      setGoldPrice(goldPriceData);
      calculateStats(membersData, drawsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const handleAdminReset = async () => {
    const confirmReset = confirm('⚠️ ADMIN ACTION: This will delete ALL draw and payment data. Are you sure you want to reset everything? This action cannot be undone.');
    
    if (!confirmReset) return;
    
    try {
      const success = await adminReset();
      if (success) {
        alert('✅ All draw and payment data has been reset successfully!');
        await loadData(); // Reload data
      } else {
        alert('❌ Failed to reset data. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('❌ Error resetting data. Please check the console for details.');
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsAdmin(false);
    alert('Logged out');
  };

  const calculateStats = (allMembers: Member[], allDraws: Draw[]) => {
    const nextDrawDate = new Date();
    nextDrawDate.setDate(15);
    if (nextDrawDate < new Date()) {
      nextDrawDate.setMonth(nextDrawDate.getMonth() + 1);
    }

    const stats: DrawStats = {
      totalDraws: allDraws.length,
      totalMembers: allMembers.length,
      activeMembers: allMembers.filter(m => m.isActive).length,
      totalGoldDistributed: allDraws.length * 20, // 20 grams per draw
      nextDrawDate: nextDrawDate.toISOString(),
    };

    setStats(stats);
  };

  const getRecentWinners = () => {
    return draws
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  };

  const getEligibleMembersCount = () => {
    const previousWinners = draws.map(d => d.winnerId);
    return members.filter(m => m.isActive && !previousWinners.includes(m.id)).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 relative">
        <h1 className="text-4xl font-bold text-primary-800 mb-2">
          Mavjibha Bachat Mandal
        </h1>
        <p className="text-lg text-gray-600">
          Monthly Lucky Draw System for Gold Distribution
        </p>
        
        {/* Admin Actions */}
        {isAdmin ? (
          <div className="absolute top-0 right-0 flex items-center space-x-2">
            <button
              onClick={handleAdminReset}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Admin: Reset all draw and payment data"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
              title="Logout admin"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <Link href="/admin" className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-700 transition-colors" title="Admin sign in">
            <LogIn className="h-5 w-5" />
          </Link>
        )}
      </div>

      

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gold-100 rounded-lg">
              <Trophy className="h-6 w-6 text-gold-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Draws</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDraws}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Coins className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gold Distributed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGoldDistributed}g</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Next Draw</p>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(stats.nextDrawDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gold Price Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Gold Price</h2>
            <TrendingUp className="h-5 w-5 text-gold-600" />
          </div>
          {goldPrice && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price per gram:</span>
                <span className="text-2xl font-bold text-gold-600">
                  {formatCurrency(goldPrice.pricePerGram)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">20g Gold Value:</span>
                <span className="text-xl font-semibold text-gray-900">
                  {formatCurrency(goldPrice.pricePerGram * 20)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Per Member Share:</span>
                <span className="text-lg font-medium text-primary-600">
                  {formatCurrency(Math.round((goldPrice.pricePerGram * 20) / 30))}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {formatDate(goldPrice.lastUpdated)}
              </p>
            </div>
          )}
        </div>

        {/* Draw Status Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Draw Status</h2>
            <Crown className="h-5 w-5 text-primary-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Eligible Members:</span>
              <span className="text-lg font-semibold text-green-600">
                {getEligibleMembersCount()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Members:</span>
              <span className="text-lg font-medium text-gray-900">
                {stats.activeMembers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Previous Winners:</span>
              <span className="text-lg font-medium text-gray-900">
                {stats.totalDraws}
              </span>
            </div>
            {isAdmin && (
              <div className="mt-4">
                <Link 
                  href="/draw"
                  className="btn-primary w-full text-center block"
                >
                  Conduct New Draw
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Winners */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Winners</h2>
        {getRecentWinners().length > 0 ? (
          <div className="space-y-3">
            {getRecentWinners().map((draw) => (
              <div key={draw.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{draw.winnerName}</p>
                  <p className="text-sm text-gray-600">{formatDate(draw.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gold-600">20g Gold</p>
                  <p className="text-sm text-gray-600">{formatCurrency(draw.totalAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No draws conducted yet</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/members" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Manage Members</h3>
              <p className="text-sm text-gray-600">Add, edit, or remove members</p>
            </div>
          </div>
        </Link>

        {isAdmin && (
          <Link href="/draw" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-gold-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Conduct Draw</h3>
                <p className="text-sm text-gray-600">Select monthly winner</p>
              </div>
            </div>
          </Link>
        )}

        <Link href="/payments" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <Coins className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Payment Tracking</h3>
              <p className="text-sm text-gray-600">Monitor member payments</p>
            </div>
          </div>
        </Link>

        <Link href="/reports" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Reports</h3>
              <p className="text-sm text-gray-600">View detailed reports</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
