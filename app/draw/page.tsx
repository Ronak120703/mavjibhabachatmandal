'use client';

import { useEffect, useState } from 'react';
import { 
  getEligibleMembers, 
  getGoldPrice, 
  createDraw, 
  calculateAmountPerMember, 
  generateQRCodeUrl,
  formatCurrency,
  formatDate,
  updateGoldPrice
} from '@/utils/api';
import { Member, Draw } from '@/types';
import Link from 'next/link';
import { 
  Trophy, 
  ArrowLeft, 
  Users, 
  Coins, 
  RefreshCw,
  Crown,
  QrCode,
  Download,
  Share2,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function DrawPage() {
  const [eligibleMembers, setEligibleMembers] = useState<Member[]>([]);
  const [activeMembersCount, setActiveMembersCount] = useState<number>(30);
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(6000);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Member | null>(null);
  const [currentDraw, setCurrentDraw] = useState<Draw | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [customGoldPrice10Gram, setCustomGoldPrice10Gram] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading data...');
      const [members, currentGoldPrice, allMembersResponse] = await Promise.all([
        getEligibleMembers(),
        getGoldPrice(),
        fetch('/api/members')
      ]);
      
      const allMembers = await allMembersResponse.json();
      const activeMembers = allMembers.filter((m: any) => m.isActive);
      
      console.log('Loaded members:', members.length);
      console.log('Loaded gold price:', currentGoldPrice);
      console.log('Total active members:', activeMembers.length);
      
      setEligibleMembers(members);
      setActiveMembersCount(activeMembers.length);
      setGoldPricePerGram(currentGoldPrice.pricePerGram);
      // Convert per gram price to 10 gram price for display
      setCustomGoldPrice10Gram((currentGoldPrice.pricePerGram * 10).toString());
      
      // Check if draw already exists for current month
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Check if draw exists for this month
      const response = await fetch(`/api/draws?month=${currentMonth}`);
      if (response.ok) {
        const existingDraws = await response.json();
        if (existingDraws.length > 0) {
          setError(`❌ Monthly Draw Limit Reached!\n\nA draw for ${currentMonth} has already been conducted.\n\n📅 Only one draw is allowed per month.\n⏰ Please wait until next month (15th) to conduct another draw.\n\n🏆 Previous winner: ${existingDraws[0].winnerName}`);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoldPriceUpdate = async () => {
    const newPrice10Gram = parseFloat(customGoldPrice10Gram);
    if (newPrice10Gram > 0) {
      try {
        const newPricePerGram = newPrice10Gram / 10; // Convert 10 gram price to per gram
        const updatedPrice = await updateGoldPrice(newPricePerGram);
        if (updatedPrice) {
          setGoldPricePerGram(newPricePerGram);
          alert('Gold price updated successfully!');
        }
      } catch (error) {
        console.error('Error updating gold price:', error);
        alert('Failed to update gold price');
      }
    }
  };

  const conductDraw = async () => {
    if (eligibleMembers.length === 0) {
      alert('No eligible members found for the draw! Please add some members first.');
      return;
    }

    setIsDrawing(true);
    setError('');
    
    console.log('=== STARTING LUCKY DRAW ===');
    console.log('Total eligible members:', eligibleMembers.length);
    console.log('Eligible members:', eligibleMembers.map(m => m.name));
    
    // Enhanced random selection with visual feedback
    let animationCount = 0;
    const maxAnimations = 20; // Number of random selections to show
    const animationInterval = 150; // Milliseconds between each random selection
    
    // Track random selections for verification
    const randomSelections: number[] = [];
    
    const animationTimer = setInterval(() => {
      // Show random member during animation
      const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
      randomSelections.push(randomIndex);
      const tempWinner = eligibleMembers[randomIndex];
      setWinner(tempWinner);
      
      animationCount++;
      
      if (animationCount >= maxAnimations) {
        clearInterval(animationTimer);
        
        // Final random selection
        const finalRandomIndex = Math.floor(Math.random() * eligibleMembers.length);
        randomSelections.push(finalRandomIndex);
        const selectedWinner = eligibleMembers[finalRandomIndex];
        setWinner(selectedWinner);
        
        console.log('=== DRAW COMPLETED ===');
        console.log('Final selected winner:', selectedWinner);
        console.log('Final random index used:', finalRandomIndex);
        console.log('All random selections made:', randomSelections);
        console.log('Random selection distribution:', randomSelections.reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {} as Record<number, number>));
        console.log('Total eligible members:', eligibleMembers.length);
        
        // Calculate amounts
        const totalAmount = goldPricePerGram * 20; // 20 grams
        const amountPerMember = calculateAmountPerMember(goldPricePerGram, activeMembersCount);
        
        console.log('Calculated amounts:', { totalAmount, amountPerMember, activeMembersCount });
        
        // Create draw record
        const currentDate = new Date();
        const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        const newDraw: Omit<Draw, 'id'> = {
          month,
          date: currentDate.toISOString(),
          winnerId: selectedWinner.id,
          winnerName: selectedWinner.name,
          goldPricePerGram: goldPricePerGram,
          totalAmount,
          amountPerMember,
          qrCodeUrl: generateQRCodeUrl(amountPerMember, Date.now().toString()),
          isCompleted: false,
        };
        
        console.log('Creating draw record:', newDraw);
        
        createDraw(newDraw).then(createdDraw => {
          if (createdDraw) {
            console.log('Draw created successfully:', createdDraw);
            setCurrentDraw(createdDraw);
            setShowResults(true);
            
            // Automatically create payment records for all members
            createPaymentRecordsForDraw(createdDraw);
          } else {
            throw new Error('Failed to create draw record');
          }
        }).catch(error => {
          console.error('Error creating draw:', error);
          setError('Failed to conduct draw. Please try again.');
          alert('Failed to conduct draw. Please check the console for details.');
        }).finally(() => {
          setIsDrawing(false);
        });
      }
    }, animationInterval);
  };

  const downloadQRCode = () => {
    if (currentDraw) {
      const link = document.createElement('a');
      link.href = currentDraw.qrCodeUrl;
      link.download = `payment-qr-${currentDraw.month}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const shareResults = () => {
    if (currentDraw && winner) {
      const message = `🎉 Congratulations ${winner.name}! 🎉\n\nYou have won the ${currentDraw.month} lucky draw!\n\n🏆 Prize: 20 grams of gold\n💰 Value: ${formatCurrency(currentDraw.totalAmount)}\n\nEach member needs to pay: ${formatCurrency(currentDraw.amountPerMember)}\n\nScan the QR code to make your payment.`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Lucky Draw Results - Mavjibha Bachat Mandal',
          text: message,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
          alert('Results copied to clipboard!');
        });
      }
    }
  };

  const createPaymentRecordsForDraw = async (draw: Draw) => {
    try {
      console.log('Creating payment records for draw:', draw.id);
      
      // Get ALL active members (not just eligible ones) for payment records
      const allActiveMembersResponse = await fetch('/api/members');
      if (!allActiveMembersResponse.ok) {
        throw new Error('Failed to fetch all active members');
      }
      const allActiveMembers = await allActiveMembersResponse.json();
      const activeMembers = allActiveMembers.filter((m: any) => m.isActive);
      
      console.log(`Creating payment records for ${activeMembers.length} active members`);
      
      // Create payment records for ALL active members
      const paymentPromises = activeMembers.map((member: any) => {
        const paymentData = {
          memberId: member.id,
          memberName: member.name,
          drawId: draw.id,
          amount: draw.amountPerMember,
          status: 'pending' as 'pending' | 'completed',
          transactionId: '',
          date: null // Explicitly set date to null for pending payments
        };
        
        console.log('Creating payment for member:', member.name, paymentData);
        
        return fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Payment creation failed for', member.name, errorData);
            throw new Error(`Failed to create payment for ${member.name}: ${errorData.error}`);
          }
          return response;
        });
      });
      
      const results = await Promise.allSettled(paymentPromises);
      const successfulPayments = results.filter(r => r.status === 'fulfilled').length;
      const failedPayments = results.filter(r => r.status === 'rejected').length;
      
      console.log(`Successfully created ${successfulPayments} payment records`);
      if (failedPayments > 0) {
        console.log(`Failed to create ${failedPayments} payment records`);
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error('Failed payment:', activeMembers[index]?.name, result.reason);
          }
        });
      }
      
      if (successfulPayments > 0) {
        alert(`✅ Draw completed successfully!\n\n🎉 Winner: ${draw.winnerName}\n💰 Amount per member: ${formatCurrency(draw.amountPerMember)}\n📝 Payment records created for ${successfulPayments} active members\n\nAll active members now have pending payment status.`);
      } else {
        alert('❌ Draw completed but failed to create any payment records. Please check the console for details.');
      }
    } catch (error) {
      console.error('Error creating payment records:', error);
      alert('Draw completed but failed to create payment records. Please check the payment tracking page.');
    }
  };

  const amountPerMember = calculateAmountPerMember(goldPricePerGram, activeMembersCount);
  const totalAmount = goldPricePerGram * 20;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading draw data...</p>
        </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Lucky Draw</h1>
            <p className="text-gray-600">Conduct monthly lucky draw for gold distribution</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card mb-8 bg-red-50 border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {!showResults ? (
        <>
          {/* Draw Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Eligible Members */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Eligible Members</h2>
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Eligible:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {eligibleMembers.length}
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {eligibleMembers.length > 0 ? (
                    <div className="space-y-2">
                      {eligibleMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium text-gray-900">{member.name}</span>
                          <span className="text-sm text-gray-500">{member.phone}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-2">
                        No eligible members found. All members may have already won.
                      </p>
                      <p className="text-sm text-gray-400">
                        Add some members first or check if all members have already won.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gold Price & Calculations */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Gold Price & Calculations</h2>
                <TrendingUp className="h-5 w-5 text-gold-600" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Gold Price (10 grams / 1 tola)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={customGoldPrice10Gram}
                      onChange={(e) => setCustomGoldPrice10Gram(e.target.value)}
                      className="input-field flex-1"
                      placeholder="Enter price for 10 grams"
                    />
                    <button
                      onClick={handleGoldPriceUpdate}
                      className="btn-secondary"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price per gram:</span>
                    <span className="font-semibold text-gold-600">
                      {formatCurrency(goldPricePerGram)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">20g Gold Value:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Per Member Share:</span>
                    <span className="text-lg font-semibold text-primary-600">
                      {formatCurrency(amountPerMember)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Draw Button */}
          <div className="text-center">
            {eligibleMembers.length > 0 ? (
              <div className="space-y-4">
                <button
                  onClick={conductDraw}
                  disabled={isDrawing}
                  className="btn-primary text-xl px-8 py-4 flex items-center mx-auto"
                >
                  {isDrawing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Drawing...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-6 w-6 mr-3" />
                      Conduct Lucky Draw
                    </>
                  )}
                </button>
                
                {/* Random Selection Indicator */}
                {isDrawing && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full" style={{animationDelay: '0.1s'}}></div>
                      <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-sm text-blue-700 text-center">
                      Randomly selecting winner from {eligibleMembers.length} eligible members...
                    </p>
                    {winner && (
                      <p className="text-xs text-blue-600 text-center mt-1">
                        Currently showing: <span className="font-medium">{winner.name}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Eligible Members</h3>
                <p className="text-gray-600 mb-4">
                  All active members have already won the lucky draw.
                </p>
                <div className="space-x-4">
                  <Link href="/members" className="btn-primary">
                    Manage Members
                  </Link>
                  <button 
                    onClick={loadData}
                    className="btn-secondary"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Results Section */
        <div className="max-w-4xl mx-auto">
          {/* Winner Announcement */}
          <div className="card text-center mb-8">
            <div className="mb-6">
              <Crown className="h-16 w-16 text-gold-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                The lucky winner for {currentDraw?.month} is:
              </p>
              <div className="bg-gradient-to-r from-gold-100 to-primary-100 p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-primary-800 mb-2">
                  {winner?.name}
                </h3>
                <p className="text-gray-600">{winner?.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-600 mb-1">20g</div>
                <div className="text-sm text-gray-600">Gold Weight</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(currentDraw?.totalAmount || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {formatCurrency(currentDraw?.amountPerMember || 0)}
                </div>
                <div className="text-sm text-gray-600">Per Member Share</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={shareResults}
                className="btn-primary flex items-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </button>
              <button
                onClick={() => setShowResults(false)}
                className="btn-secondary"
              >
                Conduct Another Draw
              </button>
            </div>
          </div>

          {/* Payment QR Code */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Payment QR Code</h3>
              <QrCode className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Each member needs to pay: <span className="font-semibold text-primary-600">
                  {formatCurrency(currentDraw?.amountPerMember || 0)}
                </span>
              </p>
              {currentDraw && (
                <div className="inline-block p-4 bg-white border rounded-lg">
                  <img
                    src={currentDraw.qrCodeUrl}
                    alt="Payment QR Code"
                    className="w-48 h-48"
                  />
                </div>
              )}
              <div className="mt-4">
                <button
                  onClick={downloadQRCode}
                  className="btn-secondary flex items-center mx-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </button>
              </div>
            </div>
          </div>

          {/* Draw Details */}
          <div className="card mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Draw Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Draw Date:</p>
                <p className="font-medium">{formatDate(currentDraw?.date || '')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Draw Month:</p>
                <p className="font-medium">{currentDraw?.month}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gold Price per Gram:</p>
                <p className="font-medium">{formatCurrency(currentDraw?.goldPricePerGram || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Members:</p>
                <p className="font-medium">30</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
