# AssetsManager 💰

A modern, secure financial portfolio management application built with React and Supabase. Track your investments, manage assets, and monitor your financial growth with beautiful analytics and insights.

## ✨ Features

- **🔐 Secure Authentication** - Email/password with strong validation
- **📊 Dashboard Analytics** - Real-time portfolio overview with interactive charts
- **💼 Asset Management** - Track liquid assets and investments by category
- **📈 Growth Tracking** - Monitor monthly and total portfolio growth
- **📋 Statistics** - Detailed analytics with category breakdowns
- **🔄 Period Comparison** - Compare performance across different time periods
- **🌙 Dark/Light Mode** - Beautiful glass morphism design with theme switching
- **📱 Responsive Design** - Works seamlessly on desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/assets-manager.git

# Navigate to project directory
cd assets-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your Supabase URL and anon key
4. Configure your database schema

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Interactive data visualization
- **React Router** - Client-side routing

### Backend
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - User authentication and authorization
- **Edge Functions** - Serverless API endpoints
- **Row Level Security** - Database-level security

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AppSidebar.tsx  # Navigation sidebar
│   ├── Footer.tsx      # Application footer
│   └── ThemeProvider.tsx # Theme management
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Portfolio overview
│   ├── AddParticulars.tsx # Add new assets
│   ├── Statistics.tsx  # Analytics and insights
│   ├── Comparison.tsx  # Period comparisons
│   ├── Settings.tsx    # User settings
│   └── Auth.tsx        # Authentication
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── integrations/       # Third-party integrations
└── lib/               # Utility functions

supabase/
├── functions/          # Edge Functions (API)
├── migrations/         # Database schema
└── config.toml        # Supabase configuration
```

## 🎨 Design System

- **Glass Morphism** - Modern translucent card designs
- **Gradient Themes** - Beautiful green-based color palette
- **Responsive Layout** - Mobile-first design approach
- **Smooth Animations** - Framer Motion powered interactions
- **Accessibility** - WCAG compliant components

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level data isolation
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Client and server-side validation
- **HTTPS Only** - Secure data transmission

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## 🚀 Deployment

The application can be deployed on various platforms:

- **Vercel** - Recommended for React apps
- **Netlify** - Great for static sites
- **Supabase Hosting** - Integrated with backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**ASH** - [Ananda S Holla](https://github.com/AnandaSH-8)

- LinkedIn: [@ananda-s-holla](https://www.linkedin.com/in/ananda-s-holla-268b94147/)
- Twitter: [@AnandSHolla8](https://x.com/AnandSHolla8)

---

⭐ **Star this repository if you found it helpful!**
