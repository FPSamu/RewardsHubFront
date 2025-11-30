# RewardsHub - Frontend

> RewardsHub is a universal platform for rewards and fidelization programs between businesses and clients.
Businesses create a RewardsHub account and configure their custom rewards and points systems.
Clients use the app to generate a unique QR ID code, which will be used by businesses to accumulate points in the client's profile.
Clients can see all the businesses registered in the platform, labeled as `visited`, `not visited` and `rewards available`.

---

> This project sets up the frontend for the web platform which will work in the same way as the mobile app: clients and businesses can create accounts, clients can see their QR code, rewards and map of businesses; businesses can scan clients' QR codes, configure their rewards and see their clients.

---

## 🌐 Live Deployment

- **Frontend (Vercel)**: https://rewards-hub-opal.vercel.app/
- **Backend (Render)**: https://rewardshub-vvaj.onrender.com/

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start with network access (for mobile testing)
npm run dev:host
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Verify deployment configuration
npm run verify
```

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide for Vercel
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and data flows
- **[CHANGES.md](./CHANGES.md)** - Recent changes and deployment checklist
- **[.env.example](./.env.example)** - Environment variables configuration

---

## 🛠️ Tech Stack

### Core
- **React.js** (18.2.0) - UI Framework
- **Vite** (5.0.8) - Build Tool & Dev Server
- **React Router** (6.20.0) - Client-side Routing
- **Tailwind CSS** (3.3.6) - Utility-first CSS

### Key Libraries
- **Axios** - HTTP Client
- **qrcode.react** - QR Code Generation
- **html5-qrcode** - QR Code Scanning
- **react-leaflet** - Interactive Maps
- **Leaflet** - Map Rendering

### Development Tools
- **ESLint** - Code Linting
- **PostCSS** - CSS Processing
- **Autoprefixer** - CSS Vendor Prefixes

---

## 📁 Project Structure

```
RewardsHubFront/
├── src/
│   ├── pages/              # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── SignUpChoice.jsx
│   │   ├── SignUpClient.jsx
│   │   ├── SignUpBusiness.jsx
│   │   ├── ClientHome.jsx
│   │   ├── ClientPoints.jsx
│   │   ├── ClientMap.jsx
│   │   ├── BusinessHome.jsx
│   │   ├── BusinessClients.jsx
│   │   ├── BusinessRewards.jsx
│   │   ├── BusinessScan.jsx
│   │   └── BusinessLocationSetup.jsx
│   │
│   ├── components/         # Reusable components
│   │   ├── ClientLayout.jsx
│   │   ├── BusinessLayout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── DesignSystemComponents.jsx
│   │
│   ├── services/           # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── businessService.js
│   │   ├── rewardService.js
│   │   ├── systemService.js
│   │   ├── transactionService.js
│   │   └── userPointsService.js
│   │
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
│
├── public/                 # Static assets
├── .env.production         # Production environment variables
├── vercel.json             # Vercel configuration
├── design.json             # Design system tokens
└── package.json            # Dependencies and scripts
```

---

## 🎨 Design System

The project includes a comprehensive design system defined in `design.json`:

- **Color Palette**: Orange-gold primary, green success, neutral grays
- **Typography**: Inter/Manrope font families
- **Components**: Cards, Buttons, Chips, Avatars, Badges, etc.
- **Spacing & Layout**: Consistent spacing scale
- **Animations**: Smooth transitions and micro-interactions

See [design.json](./design.json) for complete design tokens.

---

## 🔐 Authentication

The app supports two user types with separate authentication flows:

### Clients (`/auth/*`)
- Registration: `/auth/register`
- Login: `/auth/login`
- Profile: `/auth/me`

### Businesses (`/business/*`)
- Registration: `/business/register`
- Login: `/business/login`
- Profile: `/business/me`

Authentication uses JWT tokens stored in localStorage.

---

## 🗺️ Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/signup` - Account type selection
- `/signup/client` - Client registration
- `/signup/business` - Business registration

### Client Routes (Protected)
- `/client/dashboard` - Client home
- `/client/dashboard/points` - Points & rewards
- `/client/dashboard/map` - Business map

### Business Routes (Protected)
- `/business/location-setup` - Location configuration
- `/business/dashboard/home` - Business home
- `/business/dashboard/clients` - Client management
- `/business/dashboard/rewards` - Rewards configuration
- `/business/dashboard/scan` - QR scanner

---

## 👥 User Flows

### Business Flow

1. Register/login with a business account
2. Configure custom rewards and points system
3. Open scanner in app
4. Input check's price
5. Scan client's QR code
6. Points are automatically added to client's account

### Client Flow

1. Register/login with a client account
2. View unique QR code
3. Browse available rewards
4. View visited and unvisited businesses on map
5. Redeem rewards when enough points accumulated

---

## 🌍 Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Production (Vercel)
VITE_API_URL=https://rewardshub-vvaj.onrender.com

# Development (Local)
VITE_API_URL=http://localhost:3000

# Network Access (Mobile Testing)
VITE_API_URL=http://YOUR_LOCAL_IP:3000
```

**Important**: Variables must be prefixed with `VITE_` to be accessible in the app.

---

## 🚀 Deployment

### Deploy to Vercel

#### Option 1: Git Integration (Recommended)

1. Push your code to GitHub
2. Import repository in Vercel
3. Vercel will auto-deploy on every push to `main`

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Verify deployment configuration
npm run verify
```

---

## 🐛 Troubleshooting

### CORS Errors

Ensure the backend (Render) has CORS configured to allow requests from:
- `https://rewards-hub-opal.vercel.app`
- `http://localhost:5173` (development)

### Environment Variables Not Loading

1. Ensure variables start with `VITE_`
2. Restart dev server after changing `.env`
3. For Vercel, check Settings → Environment Variables

### Routing Issues (404 on Refresh)

This is handled by `vercel.json` rewrites. If issues persist, verify the file exists and is properly configured.

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:host` | Start dev server with network access |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run preview:host` | Preview with network access |
| `npm run lint` | Run ESLint |
| `npm run verify` | Verify deployment configuration |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

ISC

---

## 🆘 Support

For issues or questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system understanding
3. Open an issue on GitHub

---

## 🎯 Project Status

| Feature | Status |
|---------|--------|
| Client Authentication | ✅ Complete |
| Business Authentication | ✅ Complete |
| QR Code Generation | ✅ Complete |
| QR Code Scanning | ✅ Complete |
| Points System | ✅ Complete |
| Rewards Management | ✅ Complete |
| Interactive Map | ✅ Complete |
| Responsive Design | ✅ Complete |
| Production Deployment | ✅ Configured |
| Testing Suite | 🔄 In Progress |

---

**Built with ❤️ for RewardsHub**
