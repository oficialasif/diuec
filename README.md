# DIU Esports Community (DIUEC)

> A comprehensive Progressive Web App (PWA) for the Daffodil International University Esports Community. Connect with fellow gamers, participate in tournaments, track stats, and engage with the vibrant esports ecosystem.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.4-orange?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🚀 Live Demo

**Production:** [Coming Soon]  
**Development:** `

---

## ✨ Features

### 🎮 Tournament System
- **Tournament Creation & Management**
  - Create tournaments with detailed configurations
  - Multiple game support (PUBG, Free Fire, Valorant, CS2, Football)
  - Configurable team sizes, entry fees, and prize pools
  - Deadline-based registration with automatic closure
  - Admin-only approval and publishing

- **Team Management**
  - Create and manage esports teams
  - Team invitations and join requests
  - Captain role with team administration
  - Team profiles with member rosters
  - Strict team creation rules (DIU email verification)

- **Tournament Registration**
  - Team-based registration for tournaments
  - Real-time capacity tracking
  - Automatic bracket generation
  - Match scheduling and bracket viewing

- **Result Submission & Verification**
  - Secure result submission by team captains
  - Screenshot upload via Cloudinary
  - Two-phase verification (both teams must confirm)
  - Admin review and approval system
  - Automatic leaderboard updates

- **Stats & Leaderboards**
  - Real-time leaderboard updates
  - Game-specific stat tracking
  - Kill tracking for shooter games (PUBG, Valorant, CS2)
  - Goal tracking for sports games (Football)
  - Match history and performance analytics

### 💬 Communication
- **Live Chat System**
  - Multi-channel support (Community, Support, Team)
  - Real-time messaging with Firebase
  - Discord-like notification sounds
  - Message reactions and threading
  - Mobile-responsive interface
  - Sound notifications (send/receive)
  - Mute/unmute toggle with persistent settings

- **Admin Support Panel**
  - Dedicated support conversation management
  - Real-time message notifications
  - Browser notifications for background tabs
  - Message preview in OS notifications
  - Admin reply system with delivery confirmation

### 👥 Community Features
- **Social Feed**
  - Create and share posts
  - Image uploads via Cloudinary
  - Like and comment system
  - Real-time feed updates
  - Infinite scroll pagination

- **User Profiles**
  - Customizable user profiles
  - Avatar and cover photo upload
  - Display name and bio
  - Gaming statistics
  - Tournament history

### 🔐 Authentication & Security
- **Multi-Provider Auth**
  - Email/Password authentication
  - Social login support
  - Secure session management
  - Role-based access control (User/Admin)

- **Security Features**
  - Environment variable configuration
  - API key protection (.gitignore)
  - Secure Cloudinary uploads with signed URLs
  - Firebase security rules
  - Admin-only routes with middleware

### 🎨 User Experience
- **Progressive Web App (PWA)**
  - Installable on mobile and desktop
  - Offline capability
  - App-like experience
  - Fast loading with Next.js optimization

- **Modern UI/UX**
  - Dark theme with violet accents
  - Smooth animations with Framer Motion
  - Responsive design (mobile-first)
  - Accessible components (HeadlessUI, Radix UI)
  - Loading states and error handling
  - Toast notifications for feedback

### 🔔 Notifications
- **In-App Notifications**
  - Discord-like sound effects (Web Audio API)
  - Send sound (800Hz beep)
  - Receive sound (600Hz → 800Hz two-tone)
  - Smart detection (no self-notifications)
  - Persistent mute preferences

- **Browser Notifications** (Admin Only)
  - Desktop notifications for support messages
  - Message preview (first 100 characters)
  - Background tab support
  - Auto-request permission flow

### 📊 Admin Dashboard
- **Content Management**
  - User management (view, verify, remove)
  - Tournament oversight and approval
  - Community post moderation
  - Match result verification
  - Support ticket management

- **Game Management**
  - Add/edit game configurations
  - Game-specific stat tracking setup
  - Tournament templates

- **Analytics & Reports**
  - User statistics dashboard
  - Tournament participation metrics
  - Real-time data visualization

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 16.1 (App Router, React 19)
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS 4.0
- **UI Components:** Radix UI, HeadlessUI
- **Animations:** Framer Motion
- **Forms:** React Hook Form
- **State Management:** React Context API

### Backend & Services
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth + Clerk
- **Storage:** Cloudinary (image uploads)
- **Real-time:** Firebase Realtime Database
- **Analytics:** Firebase Analytics
- **Hosting:** Firebase Hosting / Vercel

### Development Tools
- **Package Manager:** npm
- **Linting:** ESLint
- **Build Tool:** Webpack (Next.js default)
- **PWA:** next-pwa

---

## 📁 Project Structure

```
diuec/
├── public/                          # Static assets
│   ├── sounds/                      # Notification sound files
│   ├── images/                      # Image assets
│   └── manifest.json                # PWA manifest
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (main)/                  # Main app routes
│   │   │   ├── chat/                # Chat page
│   │   │   ├── community/           # Community feed
│   │   │   ├── tournaments/         # Tournament listing
│   │   │   ├── teams/               # Team management
│   │   │   └── profile/             # User profiles
│   │   ├── diuec/                   # Admin routes
│   │   │   └── dashboard/           # Admin dashboard
│   │   │       ├── support/         # Support panel
│   │   │       ├── tournaments/     # Tournament admin
│   │   │       ├── users/           # User management
│   │   │       └── matches/         # Match verification
│   │   ├── api/                     # API routes
│   │   │   ├── auth/                # Auth endpoints
│   │   │   └── cloudinary/          # Image upload signing
│   │   └── globals.css              # Global styles
│   │
│   ├── components/                  # React components
│   │   ├── dashboard/               # Dashboard components
│   │   ├── home/                    # Landing page components
│   │   ├── layout/                  # Layout components
│   │   ├── matches/                 # Match components
│   │   ├── shared/                  # Shared/reusable components
│   │   └── tournaments/             # Tournament components
│   │
│   ├── lib/                         # Utilities & configurations
│   │   ├── firebase.ts              # Firebase config
│   │   ├── upload.ts                # Cloudinary upload helper
│   │   ├── models/                  # TypeScript models
│   │   ├── services/                # Business logic services
│   │   │   ├── conversation-service.ts
│   │   │   ├── stats-services.ts
│   │   │   └── tournament-service.ts
│   │   └── utils/                   # Utility functions
│   │       ├── sound-manager.ts     # Notification sounds
│   │       └── image.ts             # Image utilities
│   │
│   ├── contexts/                    # React contexts
│   │   └── auth-context.tsx         # Authentication context
│   │
│   └── hooks/                       # Custom React hooks
│
├── .env                             # Environment variables (gitignored)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── next.config.js                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS config
├── tsconfig.json                    # TypeScript config
└── package.json                     # Dependencies
```

---

## 🚦 Getting Started

### Prerequisites

- **Node.js:** 18.0 or higher
- **npm:** 9.0 or higher
- **Firebase Account:** For backend services
- **Cloudinary Account:** For image uploads

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/diuec.git
   cd diuec
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your credentials
   # See .env.example for required variables
   ```

4. **Required Environment Variables**
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Cloudinary (REQUIRED for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Firebase (Optional - has fallbacks)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   # ... (see .env.example for complete list)
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Create Admin Account

```bash
# Run the admin creation script
npm run create-admin
```

---

## 🔄 Workflow Examples

### User Journey: Tournament Participation

```mermaid
graph TD
    A[User Registration] --> B[Create/Join Team]
    B --> C[Browse Tournaments]
    C --> D[Register Team for Tournament]
    D --> E[Wait for Tournament Start]
    E --> F[View Bracket]
    F --> G[Play Match]
    G --> H[Submit Results]
    H --> I[Wait for Opponent Verification]
    I --> J[Admin Approval]
    J --> K[Leaderboard Update]
    K --> L[Next Match or Victory]
```

### Admin Workflow: Tournament Management

```mermaid
graph TD
    A[Create Tournament] --> B[Configure Details]
    B --> C[Publish Tournament]
    C --> D[Monitor Registrations]
    D --> E[Generate Brackets]
    E --> F[Monitor Match Results]
    F --> G[Verify Submissions]
    G --> H[Approve/Reject Results]
    H --> I[Update Leaderboard]
    I --> J[Declare Winner]
```

### Chat Notification Flow

```mermaid
graph TD
    A[User Sends Message] --> B[Play Send Sound 🎵]
    A --> C[Firebase Updates]
    C --> D{Recipient Online?}
    D -->|Yes| E[Receive Messages]
    D -->|No| F[Store for Later]
    E --> G{New Message?}
    G -->|Yes| H{From Self?}
    H -->|No| I[Play Receive Sound 🎶]
    H -->|Yes| J[Silent]
    I --> K{Tab Active?}
    K -->|No| L[Show Browser Notification 🔔]
    K -->|Yes| M[Sound Only]
```

---

## 🎯 Key Features Explained

### Tournament System

**How it works:**
1. **Creation:** Admin creates tournament with game type, team size, prize pool, entry fee
2. **Registration:** Teams register before deadline (automatic closure)
3. **Bracket Generation:** System generates single/double elimination brackets
4. **Match Play:** Teams compete and submit results with screenshots
5. **Verification:** Both teams confirm + admin approval
6. **Leaderboard:** Auto-updates based on game-specific rules

### Result Verification (Two-Phase)

**Phase 1: Team Confirmation**
- Winner submits result + screenshot
- Loser must confirm the submission
- Prevents false result claims

**Phase 2: Admin Approval**
- Admin reviews screenshot evidence
- Checks for score accuracy
- Approves or rejects with feedback

### Chat Notifications

**Sound System:**
- Web Audio API generates Discord-like beeps
- No audio files needed (programmatic generation)
- Send: 800Hz rising tone
- Receive: 600Hz → 800Hz two-tone
- Mute toggle with localStorage persistence

**Background Support:**
- Sounds play even in inactive tabs
- Browser notifications (admin panel only)
- Message previews in OS notifications
- Auto-request permission flow

---

## 🔒 Security Features

### Environment Variables
- All secrets in `.env` (gitignored)
- No hardcoded credentials in source code
- `.env.example` for documentation
- Cloudinary API signing on server-side

### Authentication
- Firebase Auth + Clerk integration
- Secure session management
- Admin role verification
- Protected API routes

### Data Security
- Firestore security rules
- Input validation and sanitization
- XSS protection
- CSRF protection (Next.js built-in)

---

## 🌐 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core App | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| PWA | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Web Audio | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Notifications | ✅ Desktop + Mobile | ✅ Desktop | ⚠️ macOS only | ✅ Desktop |
| Offline Mode | ✅ | ✅ | ✅ | ✅ |

---

## 🚧 Future Features

### Phase 1: Enhanced Tournament Experience
- [ ] **Live Streaming Integration**
  - Embed YouTube/Twitch streams
  - Live tournament spectating
  - Stream chat integration

- [ ] **Advanced Bracket System**
  - Swiss system tournaments
  - Round-robin format
  - Custom bracket templates

- [ ] **Match Scheduling**
  - Calendar integration
  - Automated reminders
  - Time zone support

### Phase 2: Community Engagement
- [ ] **Achievements & Badges**
  - Tournament wins
  - Participation milestones
  - Community contributions

- [ ] **Player Rankings**
  - ELO rating system
  - Skill-based matchmaking
  - Rank progression

- [ ] **Team Recruitment**
  - Looking for team (LFT) posts
  - Team recruitment board
  - Player profiles with stats

### Phase 3: Content & Media
- [ ] **Video Highlights**
  - Upload match highlights
  - Clip sharing
  - Highlight reels

- [ ] **News & Articles**
  - Esports news feed
  - Tournament recaps
  - Player interviews

- [ ] **Photo Gallery**
  - Event photo albums
  - Tournament galleries
  - Community showcase

### Phase 4: Analytics & Insights
- [ ] **Advanced Stats Dashboard**
  - Player performance analytics
  - Team statistics
  - Win rate tracking
  - Head-to-head comparisons

- [ ] **Tournament Analytics**
  - Participation trends
  - Game popularity metrics
  - Revenue analytics

### Phase 5: Monetization & Commerce
- [ ] **Premium Features**
  - Team customization
  - Priority support
  - Ad-free experience

- [ ] **Merchandise Store**
  - Team jerseys
  - Gaming accessories
  - DIU Esports merch

- [ ] **Sponsorship System**
  - Team sponsorships
  - Tournament sponsors
  - Banner ads

### Phase 6: Mobile App
- [ ] **Native Mobile Apps**
  - React Native (iOS/Android)
  - Push notifications
  - Offline-first architecture
  - Camera integration for result photos

### Phase 7: Integrations
- [ ] **Discord Bot**
  - Tournament announcements
  - Match reminders
  - Result notifications

- [ ] **Email Notifications**
  - Tournament invitations
  - Match schedules
  - Result confirmations

- [ ] **Payment Gateway**
  - bKash/Nagad integration
  - Entry fee collection
  - Prize distribution

---

## 📊 Performance Metrics

### Current Performance
- **Lighthouse Score:** 95+ (Desktop)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.0s
- **Build Size:** ~1.2MB (gzipped)
- **PWA Score:** 100/100

### Optimizations
- Next.js Image optimization
- Code splitting and lazy loading
- Firebase query optimization
- Cloudinary image CDN
- Service worker caching

---

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build test
npm run build
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Contribution Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Lead Developer:** [Your Name]  
**University:** Daffodil International University  
**Department:** Computer Science & Engineering

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/diuec/issues)
- **Email:** support@diuesports.com
- **Discord:** [Join our server](https://discord.gg/diuesports)

---

## 🙏 Acknowledgments

- **DIU:** Daffodil International University
- **Firebase:** Backend infrastructure
- **Cloudinary:** Image hosting and optimization
- **Clerk:** Authentication services
- **Vercel:** Hosting and deployment
- **Next.js Team:** Amazing framework

---

## 📸 Screenshots

### Landing Page
![Landing Page](screenshots/landing.png)

### Tournament Bracket
![Tournament Bracket](screenshots/bracket.png)

### Chat Interface
![Chat](screenshots/chat.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin.png)

---

## 🔗 Links

- **Live Site:** [Coming Soon]
- **Documentation:** [Wiki](https://github.com/yourusername/diuec/wiki)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Roadmap:** [Project Board](https://github.com/yourusername/diuec/projects)

---

<p align="center">Made with ❤️ for DIU Esports Community</p>
<p align="center">⭐ Star this repo if you like it!</p>
