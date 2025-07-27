# NutriTrack Pro

A comprehensive meal planning and health tracking application built with Next.js 15, React 19, TypeScript, and Prisma.

## 🚀 Features

### Phase 1 MVP - Core Functionality
- **Authentication**: Google OAuth integration with NextAuth.js
- **Dashboard**: Daily nutrition overview, weekly meal plans, and health goals
- **Meal Planning**: 7-day calendar, meal creation, and templates
- **Health Tracking**: Weight, measurements, water intake, sleep, mood, and custom metrics
- **Recipe Management**: Create, search, and manage personal recipes
- **Food Database**: Search, filter, and add custom food items
- **Smart Meal Planning**: AI-powered meal suggestions with fallback APIs
- **User Profile**: Demographics, health stats, and AI integration settings

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: OpenAI API with fallback to themealdb.com
- **Charts**: Chart.js with react-chartjs-2

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Google OAuth credentials
- OpenAI API key (optional, for AI features)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nirajshiwantha/VibeCodeItDemo.git
   cd VibeCodeItDemo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your-neon-postgresql-connection-string"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # OpenAI (optional)
   OPENAI_API_KEY="your-openai-api-key"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed the database with initial food data
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)

### Database Setup
1. Create a PostgreSQL database (Neon recommended)
2. Copy the connection string to your `.env.local`
3. Run Prisma migrations to create tables

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page and actions
│   ├── food/             # Food database page and actions
│   ├── health/           # Health tracking page
│   ├── meals/            # Meal planning pages
│   ├── profile/          # User profile page and actions
│   └── recipes/          # Recipe management pages
├── components/           # Reusable UI components
│   └── ui/              # Shadcn UI components
├── lib/                 # Utility functions and configurations
└── generated/           # Prisma generated types
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## 🔍 API Endpoints

- `POST /api/ai-meal-suggestions` - AI-powered meal suggestions
- `GET /api/auth/session` - NextAuth session management
- Server Actions for CRUD operations on meals, recipes, food, etc.

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with initial data

### Database Management
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma migrate dev` - Create and apply new migrations
- `npx prisma generate` - Regenerate Prisma client

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/nirajshiwantha/VibeCodeItDemo/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🔮 Roadmap

### Phase 2 - Community Features
- Recipe sharing and discovery
- User reviews and ratings
- Social features and following

### Phase 3 - Professional Tools
- Nutritionist dashboard
- Advanced analytics
- Meal plan templates
- Integration with fitness trackers

---

Built with ❤️ using Next.js, React, and TypeScript
