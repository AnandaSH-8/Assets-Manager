# AssetPulse 💰

Track your wealth. Measure your growth.

AssetPulse is a modern personal wealth tracking application designed to help users monitor their financial journey through monthly asset snapshots. Record your liquid assets and investments, analyze growth trends, visualize net worth progression, and gain valuable insights into your financial health—all in a secure and intuitive dashboard.

## ✨ Features

### 📊 Wealth Dashboard

* Track total net worth across all assets
* View total liquid assets and investments
* Monitor month-over-month growth
* Analyze overall portfolio growth from your starting period
* Interactive charts and visualizations

### 💼 Asset Management

* Create and manage custom asset names
* Categorize assets into:

  * Liquid Assets (Bank Accounts, Cash, Wallets, etc.)
  * Investments (Stocks, Mutual Funds, FD, RD, etc.)
* Reuse previously created asset names through smart dropdown selection
* Record monthly asset values with ease

### 📈 Analytics & Insights

* Best Performing Assets
* Assets Needing Attention
* Highest Holding Assets
* Gain/Loss Analysis
* Category-wise Performance Tracking
* Asset Allocation Breakdown
* Historical Net Worth Trends

### 📋 Reporting

* Export monthly financial data to Excel
* Review historical records and performance
* Compare portfolio growth over time

### 🔐 Security

* Secure authentication with Supabase Auth
* Row-Level Security (RLS) for complete data isolation
* User-specific asset and financial records

### 🎨 User Experience

* Responsive design for desktop and mobile
* Dark & Light theme support
* Modern glassmorphism-inspired interface
* Interactive charts powered by Recharts

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* npm
* Supabase Account

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/assetpulse.git

# Navigate into project
cd assetpulse

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## ⚙️ Environment Setup

1. Create a project in Supabase.
2. Copy environment variables:

```bash
cp .env.example .env
```

3. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations and start the application.

---

## 🛠️ Tech Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Recharts
* React Router

### Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Edge Functions
* Row Level Security (RLS)

### Development Tools

* ESLint
* Prettier
* TypeScript

---

## 📊 How AssetPulse Works

1. Create your assets once (Bank Accounts, Cash, Stocks, Mutual Funds, FD, RD, etc.)
2. Each month, enter the latest values for your assets.
3. AssetPulse calculates:

   * Total Net Worth
   * Investment Value
   * Liquid Assets
   * Monthly Growth %
   * Overall Growth %
4. Explore analytics and performance insights.
5. Track your financial progress over time.

---

## 📁 Project Structure

```text
src/
├── components/
├── pages/
│   ├── Dashboard.tsx
│   ├── AddAssets.tsx
│   ├── Analytics.tsx
│   ├── Settings.tsx
│   └── Auth.tsx
├── hooks/
├── services/
├── integrations/
└── lib/

supabase/
├── functions/
├── migrations/
└── config.toml
```

---

## 🔒 Security Features

* Supabase Authentication
* JWT-based Sessions
* Row-Level Security (RLS)
* User Data Isolation
* Input Validation
* Secure HTTPS Communication

---

## 🔧 Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run format:check
```

---

## 🚀 Deployment

AssetPulse can be deployed on:

* Vercel (Recommended)
* Netlify
* Supabase Hosting

---

## 🎯 Future Enhancements

* Weekly Asset Tracking
* Financial Goals & Milestones
* CAGR & Advanced Growth Metrics
* Asset Allocation History
* Wealth Forecasting
* Import/Export Improvements
* Enhanced Reporting & Insights

---

## 📄 License

This project is licensed under the MIT License.


## 👨‍💻 Author

**ASH** - [Ananda S Holla](https://github.com/AnandaSH-8)

- LinkedIn: [@ananda-s-holla](https://www.linkedin.com/in/ananda-s-holla-268b94147/)
- Twitter: [@AnandSHolla8](https://x.com/AnandSHolla8)

---

⭐ **Star this repository if you found it helpful!**
