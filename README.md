# DIU Esports Community Platform

A Progressive Web App (PWA) for the Daffodil International University Esports Community. This platform enables esports enthusiasts to connect, participate in tournaments, and engage with the community.

## Features

- 🎮 Tournament registration and management
- 💬 Community posts with likes and comments
- 🔒 Secure authentication system
- 💻 Responsive design with mobile-first approach
- 📱 PWA support for app-like experience
- 🎨 Modern UI with smooth animations
- 🔄 Real-time updates using Firebase
- 👤 User profiles and dashboard
- 💭 Live chat functionality
- 🎯 Admin panel for content management

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)
- Framer Motion for animations
- HeadlessUI for accessible components

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your Firebase configuration:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── home/           # Home page components
│   ├── layout/         # Layout components
│   └── shared/         # Shared/reusable components
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
