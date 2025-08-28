'use client';

import { useEffect, useState } from 'react';
import { getDraws, getMembers, getPayments, formatCurrency, formatDate } from '@/utils/api';
import { Draw, Member, Payment } from '@/types';
import Link from 'next/link';
import { 
  BarChart3, 
  ArrowLeft, 
  Calendar, 
  TrendingUp,
  Users,
  Trophy,
  Coins,
  Download,
  Filter
} from 'lucide-react';

export default function ReportsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [drawsData, membersData, paymentsData] = await Promise.all([
        getDraws(),
        getMembers(),
        getPayments()
      ]);
      
      setDraws(drawsData);
      setMembers(membersData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYearlyDraws = () => {
    return draws.filter(draw => draw.month.startsWith(selectedYear));
  };

  const getYearlyPayments = () => {
    const yearlyDraws = getYearlyDraws();
    const drawIds = yearlyDraws.map(d => d.id);
    return payments.filter(payment => drawIds.includes(payment.drawId));
  };

  const getOverallStats = () => {
    const totalDraws = draws.length;
    const totalGoldDistributed = totalDraws * 20; // 20 grams per draw
    const totalValue = draws.reduce((sum, draw) => sum + draw.totalAmount, 0);
    const activeMembers = members.filter(m => m.isActive).length;

    return {
      totalDraws,
      totalGoldDistributed,
      totalValue,
      activeMembers,
    };
  };

  const getYearlyStats = () => {
    const yearlyDraws = getYearlyDraws();
    const yearlyPayments = getYearlyPayments();
    
    const totalDraws = yearlyDraws.length;
    const totalGoldDistributed = totalDraws * 20;
    const totalValue = yearlyDraws.reduce((sum, draw) => sum + draw.totalAmount, 0);
    const completedPayments = yearlyPayments.filter(p => p.status === 'completed').length;
    const totalCollected = yearlyPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalDraws,
      totalGoldDistributed,
      totalValue,
      completedPayments,
      totalCollected,
    };
  };

  const getMonthlyActivity = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => {
      const monthStr = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
      const monthDraws = draws.filter(d => d.month === monthStr);
      const monthPayments = payments.filter(p => 
        monthDraws.some(d => d.id === p.drawId)
      );
      
      return {
        month,
        draws: monthDraws.length,
        payments: monthPayments.filter(p => p.status === 'completed').length,
        amount: monthPayments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
      };
    });
  };

  const getWinnerFrequency = () => {
    const winnerCounts: { [key: string]: number } = {};
    
    draws.forEach(draw => {
      winnerCounts[draw.winnerName] = (winnerCounts[draw.winnerName] || 0) + 1;
    });

    return Object.entries(winnerCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const exportReport = () => {
    const yearlyDraws = getYearlyDraws();
    const yearlyPayments = getYearlyPayments();
    
    const csvContent = [
      ['Report Type', 'Value'].join(','),
      ['Year', selectedYear].join(','),
      ['Total Draws', yearlyDraws.length].join(','),
      ['Total Gold Distributed (grams)', yearlyDraws.length * 20].join(','),
      ['Total Value', yearlyDraws.reduce((sum, d) => sum + d.totalAmount, 0)].join(','),
      ['Completed Payments', yearlyPayments.filter(p => p.status === 'completed').length].join(','),
      ['Total Collected', yearlyPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)].join(','),
      ['', ''].join(','),
      ['Draw Details', ''].join(','),
      ['Month', 'Winner', 'Gold Price/g', 'Total Amount', 'Per Member Share'].join(','),
      ...yearlyDraws.map(draw => [
        draw.month,
        draw.winnerName,
        draw.goldPricePerGram,
        draw.totalAmount,
        draw.amountPerMember
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mavjibha-report-${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const overallStats = getOverallStats();
  const yearlyStats = getYearlyStats();
  const monthlyActivity = getMonthlyActivity();
  const winnerFrequency = getWinnerFrequency();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-800" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive statistics and historical data</p>
          </div>
        </div>
        <button
          onClick={exportReport}
          className="btn-primary flex items-center"
        >
          <Download className="h-5 w-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Year Filter */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Filter by Year</h2>
          <Filter className="h-5 w-5 text-primary-600" />
        </div>
        <div className="mt-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-field"
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Trophy className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Draws</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalDraws}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gold-100 rounded-lg">
              <Coins className="h-6 w-6 text-gold-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gold Distributed</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalGoldDistributed}g</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(overallStats.totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.activeMembers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Yearly Statistics ({selectedYear})</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Draws:</span>
              <span className="font-semibold">{yearlyStats.totalDraws}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gold Distributed:</span>
              <span className="font-semibold">{yearlyStats.totalGoldDistributed}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Value:</span>
              <span className="font-semibold">{formatCurrency(yearlyStats.totalValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Payments:</span>
              <span className="font-semibold">{yearlyStats.completedPayments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Collected:</span>
              <span className="font-semibold">{formatCurrency(yearlyStats.totalCollected)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Members:</span>
              <span className="font-semibold">{members.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Members:</span>
              <span className="font-semibold">{members.filter(m => m.isActive).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inactive Members:</span>
              <span className="font-semibold">{members.filter(m => !m.isActive).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Gold Price:</span>
              <span className="font-semibold">
                {draws.length > 0 
                  ? formatCurrency(draws.reduce((sum, d) => sum + d.goldPricePerGram, 0) / draws.length)
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Activity Chart */}
      <div className="card mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Activity ({selectedYear})</h3>
        <div className="grid grid-cols-12 gap-2">
          {monthlyActivity.map((month, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-600 mb-1">{month.month}</div>
              <div className="bg-primary-100 rounded p-2">
                <div className="text-sm font-semibold text-primary-800">{month.draws}</div>
                <div className="text-xs text-gray-600">Draws</div>
              </div>
              {month.payments > 0 && (
                <div className="mt-1 text-xs text-green-600">
                  {month.payments} payments
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Draws */}
      <div className="card mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Draws</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Winner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gold Price/g
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Per Member
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {draws.slice(0, 10).map((draw) => (
                <tr key={draw.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {draw.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {draw.winnerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(draw.goldPricePerGram)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(draw.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(draw.amountPerMember)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Winner Frequency */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Winner Frequency</h3>
        <div className="space-y-3">
          {winnerFrequency.map((winner, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-primary-600">{index + 1}</span>
                </div>
                <span className="font-medium text-gray-900">{winner.name}</span>
              </div>
              <div className="flex items-center">
                <Trophy className="h-4 w-4 text-gold-600 mr-1" />
                <span className="font-semibold text-gray-900">{winner.count} wins</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
