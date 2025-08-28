# Mavjibha Bachat Mandal - Lucky Draw System

A modern web application for managing monthly lucky draws for gold distribution among family group members.

## 🏆 Features

### Core Functionality
- **Member Management**: Add, edit, and manage 30 family members
- **Lucky Draw System**: Conduct monthly draws with automatic exclusion of previous winners
- **Gold Price Integration**: Real-time gold price calculation and updates
- **Payment Tracking**: QR code generation and payment status monitoring
- **Comprehensive Reports**: Analytics and historical data visualization

### Key Features
- **Dynamic Draw System**: Automatically excludes previous winners from future draws
- **QR Code Generation**: Automatic QR code creation for payment collection
- **Payment Status Tracking**: Monitor individual member payment status
- **Real-time Calculations**: Automatic calculation of amounts per member
- **Export Functionality**: Export reports and payment data to CSV
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mavjibha-bachat-mandal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage Guide

### 1. Dashboard
- View overall statistics and recent activity
- Monitor current gold prices and member counts
- Quick access to all major functions

### 2. Member Management
- Add new family members with contact details
- Edit member information and status
- View active and inactive members
- Track member join dates

### 3. Lucky Draw
- View eligible members (excludes previous winners)
- Update current gold prices
- Conduct random draw with animation
- Generate QR codes for payment collection
- Share results with members

### 4. Payment Tracking
- Monitor payment status for each draw
- Mark payments as completed/pending
- Search and filter members
- Export payment reports

### 5. Reports & Analytics
- View comprehensive statistics
- Analyze monthly activity patterns
- Track winner frequency
- Export detailed reports

## 🏗️ Technical Architecture

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Modern icon library

### Data Management
- **Local Storage**: Client-side data persistence
- **TypeScript Interfaces**: Strong typing for data structures
- **Utility Functions**: Centralized data operations

### Key Components
- **Dashboard**: Main overview and navigation
- **Member Management**: CRUD operations for members
- **Draw System**: Lucky draw functionality
- **Payment Tracking**: Payment status management
- **Reports**: Analytics and data visualization

## 📊 Data Structure

### Member
```typescript
interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isActive: boolean;
  joinedDate: string;
}
```

### Draw
```typescript
interface Draw {
  id: string;
  month: string;
  date: string;
  winnerId: string;
  winnerName: string;
  goldPricePerGram: number;
  totalAmount: number;
  amountPerMember: number;
  qrCodeUrl: string;
  isCompleted: boolean;
  payments: Payment[];
}
```

### Payment
```typescript
interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed';
  transactionId?: string;
}
```

## 🎯 Business Logic

### Draw Rules
1. **Monthly Schedule**: Draws conducted on the 15th of each month
2. **Winner Exclusion**: Previous winners are automatically excluded
3. **Gold Distribution**: 20 grams of gold per winner
4. **Cost Sharing**: Total cost divided equally among 30 members

### Payment Process
1. **Price Calculation**: Current gold price × 20 grams
2. **Member Share**: Total amount ÷ 30 members
3. **QR Code Generation**: Automatic QR code for payment collection
4. **Status Tracking**: Monitor payment completion

## 🔧 Configuration

### Gold Price Updates
- Update gold prices through the draw interface
- Prices are stored locally and persist across sessions
- Automatic calculation of member shares

### Member Limits
- System designed for 30 family members
- Automatic winner exclusion prevents duplicates
- Support for active/inactive member status

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Touch interfaces

## 🔒 Data Security

- All data stored locally in browser storage
- No external API calls for sensitive data
- Export functionality for data backup
- No user authentication required (family group use)

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Static Export (Optional)
```bash
npm run export
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Check the documentation
- Review the code comments
- Create an issue in the repository

## 🎉 Acknowledgments

- Built for Mavjibha Bachat Mandal family group
- Designed for easy family group management
- Focused on transparency and fairness in draws

---

**Happy Lucky Drawing! 🎉🏆**
