'use client';

import { useEffect, useState } from 'react';
import { getDraws, getMembers, getPayments, addPayment, updatePayment } from '@/utils/api';
import { Draw, Member, Payment } from '@/types';
import Link from 'next/link';
import { 
  Coins, 
  ArrowLeft, 
  Search, 
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  User,
  DollarSign,
  RefreshCw
} from 'lucide-react';

export default function PaymentsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedDraw, setSelectedDraw] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Remove the automatic payment creation useEffect to prevent duplicates

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
      
      if (drawsData.length > 0 && !selectedDraw) {
        setSelectedDraw(drawsData[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (paymentId: string, currentStatus: string, payment: any) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

      // Check if this payment already exists in the database
      // Handle both string and ObjectId comparisons
      const existingPayment = payments.find(p => {
        const paymentMemberId = typeof p.memberId === 'string' ? p.memberId : 
                               (p.memberId && typeof p.memberId === 'object' && '_id' in p.memberId) ? 
                               (p.memberId as any)._id.toString() : 
                               String(p.memberId);
        
        const paymentDrawId = typeof p.drawId === 'string' ? p.drawId : 
                             (p.drawId && typeof p.drawId === 'object' && '_id' in p.drawId) ? 
                             (p.drawId as any)._id.toString() : 
                             String(p.drawId);
        
        const currentMemberId = String(payment.memberId);
        const currentDrawId = String(payment.drawId);
        
        return paymentMemberId === currentMemberId && paymentDrawId === currentDrawId;
      });

      if (existingPayment) {
        // Update existing payment record
        const updateData: any = { status: newStatus };
        if (newStatus === 'completed') {
          updateData.date = new Date().toISOString();
        } else {
          updateData.date = null; // Clear date when marking as pending
        }
        
        const updatedPayment = await updatePayment(existingPayment.id, updateData);
        
        if (updatedPayment) {
          // Update local state immediately for dynamic UI
          setPayments(prevPayments => 
            prevPayments.map(p => 
              p.id === existingPayment.id ? { ...p, ...updateData } : p
            )
          );
          
          // Reload data to ensure consistency
          await loadData();
        } else {
          alert('Failed to update payment in database. Please try again.');
        }
      } else {
        // Create new payment record only if it doesn't exist
        const paymentData = {
          memberId: payment.memberId,
          memberName: payment.memberName,
          drawId: payment.drawId,
          amount: payment.amount || 0,
          status: newStatus as 'pending' | 'completed',
          transactionId: '',
          date: newStatus === 'completed' ? new Date().toISOString() : null
        };
        
        const newPayment = await addPayment(paymentData);
        
        if (newPayment) {
          // Update local state immediately for dynamic UI
          setPayments(prevPayments => [...prevPayments, newPayment]);
          
          // Reload data to ensure consistency
          await loadData();
        } else {
          alert('Failed to create payment in database. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to save payment to database. Please check the console for details.');
    }
  };

  const currentDraw = draws.find(d => d.id === selectedDraw);
  
  // Simplified drawId comparison - handle both string and ObjectId types
  const drawPayments = payments.filter(p => {
    // Convert both to strings for comparison
    const paymentDrawId = typeof p.drawId === 'string' ? p.drawId : 
                         (p.drawId && typeof p.drawId === 'object' && '_id' in p.drawId) ? 
                         (p.drawId as any)._id.toString() : 
                         String(p.drawId);
    const selectedDrawId = String(selectedDraw);
    const isMatch = paymentDrawId === selectedDrawId;
    return isMatch;
  });
  
  const allMembers = members.filter(m => m.isActive);
  
  // Create payment list showing ALL active members for this draw
  // If a member has a payment record, use it; otherwise create a default pending entry
  const completePaymentList = allMembers.map(member => {
    // Find existing payment record for this member and draw
    const existingPayment = drawPayments.find(p => {
      const paymentMemberId = typeof p.memberId === 'string' ? p.memberId : 
                             (p.memberId && typeof p.memberId === 'object' && '_id' in p.memberId) ? 
                             (p.memberId as any)._id.toString() : 
                             String(p.memberId);
      const memberId = String(member.id);
      return paymentMemberId === memberId;
    });
    
    if (existingPayment) {
      // Use existing payment record
      return {
        id: existingPayment.id,
        memberId: member.id,
        memberName: member.name,
        drawId: selectedDraw,
        amount: currentDraw?.amountPerMember || 0,
        status: existingPayment.status,
        date: existingPayment.date || '',
        transactionId: existingPayment.transactionId || '',
        isWinner: currentDraw?.winnerId === member.id,
        isExistingPayment: true,
        tempId: false
      };
    } else {
      // Create default pending entry for member without payment record
      return {
        id: `temp-${member.id}`,
        memberId: member.id,
        memberName: member.name,
        drawId: selectedDraw,
        amount: currentDraw?.amountPerMember || 0,
        status: 'pending' as 'pending' | 'completed',
        date: '',
        transactionId: '',
        isWinner: currentDraw?.winnerId === member.id,
        isExistingPayment: false,
        tempId: true
      };
    }
  });

  const sortedPaymentList = completePaymentList.sort((a, b) => {
    if (a.isWinner && !b.isWinner) return 1;
    if (!a.isWinner && b.isWinner) return -1;
    return a.memberName.localeCompare(b.memberName);
  });

  const filteredPayments = sortedPaymentList.filter(p => 
    p.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics based on ALL members for this draw (not filtered)
  const completedPayments = completePaymentList.filter(p => p.status === 'completed');
  const pendingPayments = completePaymentList.filter(p => p.status === 'pending');
  const totalCollected = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  
  // Check if all payments are completed
  const allPaymentsCompleted = completedPayments.length === completePaymentList.length && completePaymentList.length > 0;

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
            <h1 className="text-3xl font-bold text-gray-900">Payment Tracking</h1>
            <p className="text-gray-600">Monitor member payments for each draw</p>
          </div>
        </div>
      </div>

      {/* Draw Selection */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Select Draw</h2>
          <Calendar className="h-5 w-5 text-primary-600" />
        </div>
        
        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Payment Tracking:</strong> This page shows ALL active members for the selected draw. 
                Members with existing payment records display their current status, while others show as "pending".
                The draw winner is highlighted with a crown (👑) and shown at the bottom. 
                Use the action buttons to change payment status between pending and completed.
                <br /><br />
                <strong>Automatic Display:</strong> All 30 active members are automatically shown in the table.
                Payment records are created automatically when you change a member's status from pending to completed.
                <br /><br />
                <strong>Status Management:</strong> 
                • <span className="text-green-600">"Mark Complete"</span> - Changes status from 'pending' to 'completed', automatically adds current date and time, and saves to database
                • <span className="text-yellow-600">"Mark Pending"</span> - Changes status from 'completed' to 'pending' and saves to database
                <br /><br />
                <strong>Note:</strong> All changes are automatically saved to the database. When you mark a payment as complete, the current date and time are automatically recorded.
              </p>
            </div>
          </div>
        </div>
        
        <select
          value={selectedDraw}
          onChange={(e) => setSelectedDraw(e.target.value)}
          className="input-field"
        >
          {draws.map((draw) => (
            <option key={draw.id} value={draw.id}>
              {draw.month} - {draw.winnerName} (₹{draw.amountPerMember})
            </option>
          ))}
        </select>
      </div>

      {/* Payment Statistics */}
      {currentDraw && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedPayments.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <XCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Collected</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Coins className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expected</p>
                <p className="text-2xl font-bold text-gray-900">₹{(currentDraw.amountPerMember * completePaymentList.length).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Payments Completed Message */}
      {allPaymentsCompleted && (
        <div className="card mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600 mr-3" />
                <h3 className="text-2xl font-bold text-green-800">🎉 All Payments Completed! 🎉</h3>
              </div>
              <p className="text-lg text-green-700 mb-2">
                <strong>Congratulations!</strong> All {completePaymentList.length} members have completed their payments.
              </p>
              <p className="text-green-600">
                <strong>Status:</strong> Waiting for next round - No payment due at this time.
              </p>
              <p className="text-sm text-green-500 mt-2">
                The winner will receive their 20 grams of gold. Next draw will be conducted on the 15th of the following month.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Payment List</h2>
          <button
            onClick={() => {
              const currentDraw = draws.find(d => d.id === selectedDraw);
              if (currentDraw) {
                const csvContent = [
                  ['Member Name', 'Amount', 'Status', 'Date', 'Is Winner'].join(','),
                  ...sortedPaymentList.map(p => [
                    p.memberName,
                    p.amount,
                    p.status,
                    p.date ? new Date(p.date).toLocaleDateString() : '-',
                    p.isWinner ? 'Yes' : 'No'
                  ].join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `payments-${currentDraw.month}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className={`hover:bg-gray-50 ${
                  payment.isWinner ? 'bg-gradient-to-r from-gold-50 to-yellow-50 border-l-4 border-gold-500' : ''
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          payment.isWinner 
                            ? 'bg-gold-100' 
                            : 'bg-primary-100'
                        }`}>
                          {payment.isWinner ? (
                            <span className="text-gold-600 font-bold text-lg">👑</span>
                          ) : (
                            <User className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.memberName}
                          {payment.isWinner && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800">
                              🏆 Winner
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.date ? new Date(payment.date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {payment.status === 'completed' ? (
                      <button
                        onClick={() => handleStatusToggle(payment.id, payment.status, payment)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Mark Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusToggle(payment.id, payment.status, payment)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="text-center py-8">
            <div className="mb-4">
              <Coins className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Members Found</h3>
            <p className="text-gray-600 mb-4">
              No active members found for this draw. Please ensure you have active members in the system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}