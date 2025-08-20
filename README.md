# USAII Labs - AI-Powered Learning Platform

![USAII Labs](https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?w=1200&h=300&fit=crop)

A cutting-edge web application for managing AI-powered educational laboratories with comprehensive role-based access control and dynamic lab environments.

## 🚀 Features

### 🤖 **AI-Powered Lab Environments**
- Interactive coding environments via GitHub Codespaces
- Real-time lab environment management
- Automatic lab expiration with configurable timeframes
- Pop-up window controller for seamless lab access

### 👥 **Multi-Role System**
- **Admin**: Full platform management, user oversight, lab allocations
- **Creator**: Lab development, content creation, student progress tracking
- **Student**: Lab access, progress tracking, assignment completion

### 📚 **Dynamic Lab Management**
- Comprehensive lab catalog with filtering and search
- Category-based organization (AI/ML, Data Science, Python, Web Dev, DevOps)
- Difficulty levels (Beginner, Intermediate, Advanced)
- Custom expiration times set by creators (1-168 hours)

### 📊 **Advanced Analytics**
- Real-time dashboard with role-specific metrics
- Lab completion tracking and progress monitoring
- User activity analytics and engagement insights
- Allocation status management with automatic updates

### 🔐 **Secure Authentication**
- Email-based authentication system
- User status management (New, Verified, Active, Disabled)
- Email verification workflow
- Persistent login sessions

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite
- **Icons**: Lucide React
- **State Management**: React Context API
- **Data Persistence**: localStorage (demo) / Supabase ready
- **Lab Environments**: GitHub Codespaces integration

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/usaii-labs-platform.git
cd usaii-labs-platform

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Demo Accounts

The platform includes pre-configured demo accounts for testing:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@usaii.org | any | Full platform management |
| **Creator** | creator@usaii.org | any | Lab creation & management |
| **Student** | student@usaii.org | any | Lab access & completion |

> **Note**: Only users with "Verified" or "Active" status can log in. New and disabled users are blocked from accessing the system.

## 🏗 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Role-specific dashboards
│   ├── LabCatalog.tsx   # Lab browsing and filtering
│   ├── LabAllocations.tsx # Admin lab assignment management
│   ├── CreateLab.tsx    # Lab creation interface
│   ├── UserManagement.tsx # User administration
│   ├── LabEnvironment.tsx # Lab environment controller
│   ├── LoginForm.tsx    # Authentication interface
│   └── Layout.tsx       # Main application layout
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state management
├── services/            # Business logic
│   ├── mockApi.ts       # API simulation layer
│   └── labStorage.ts    # Lab persistence service
├── data/               # Static data
│   └── labs.json       # Default lab configurations
├── types/              # TypeScript definitions
│   └── index.ts        # Core type definitions
└── index.css          # Global styles and Tailwind config
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple to Blue gradient (`from-purple-600 to-blue-600`)
- **Success**: Green (`green-500`)
- **Warning**: Yellow (`yellow-500`)
- **Error**: Red (`red-500`)
- **Neutral**: Gray scale (`gray-50` to `gray-900`)

### Component Library
- **Cards**: Modern cards with hover effects and shadows
- **Buttons**: Primary, secondary, and status-specific variants
- **Forms**: Consistent input styling with focus states
- **Modals**: Backdrop blur with smooth animations
- **Tables**: Responsive tables with hover states
- **Badges**: Status indicators with color coding

## 🔧 Configuration

### Lab Expiration Settings
Labs can be configured with custom expiration times:
- **Minimum**: 1 hour (for quick exercises)
- **Maximum**: 168 hours (1 week for projects)
- **Default**: 40 hours (standard lab duration)

### Environment Variables
```env
# Development
VITE_APP_NAME=USAII Labs
VITE_APP_VERSION=1.0.0

# Production (when using Supabase)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Responsive Design

The platform is fully responsive with breakpoints:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

Key responsive features:
- Collapsible sidebar navigation
- Mobile-optimized forms and tables
- Touch-friendly interface elements
- Adaptive grid layouts

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🧪 Testing Scenarios

### Admin Workflow
1. Login as admin@usaii.org
2. View dashboard with platform statistics
3. Navigate to Lab Allocations
4. Assign labs to students with custom due dates
5. Monitor user management and status updates

### Creator Workflow  
1. Login as creator@usaii.org
2. Access lab creation interface
3. Create new lab with custom expiration time
4. Set difficulty level and category
5. Add resources and detailed instructions

### Student Workflow
1. Login as student@usaii.org
2. View assigned labs in catalog
3. Open lab environment controller
4. Access GitHub Codespaces environment
5. Track progress and completion status

## 🔄 Lab Expiration System

The platform features an intelligent lab expiration system:

- **Dynamic Timing**: Each lab can have custom expiration hours (1-168)
- **Automatic Updates**: System checks every 5 minutes for expired labs
- **Status Management**: Labs automatically transition to "overdue" status
- **Persistent Tracking**: Expiration status survives page refreshes
- **Visual Indicators**: Clear badges show lab status across all views

## 🎓 Educational Features

### Lab Categories
- **AI/ML**: Machine learning, neural networks, data modeling
- **Data Science**: Analytics, visualization, statistical analysis  
- **Python**: Programming fundamentals, frameworks, libraries
- **Web Development**: Frontend, backend, full-stack projects
- **DevOps**: Containerization, deployment, CI/CD pipelines

### Learning Progression
- **Beginner**: Foundational concepts and basic implementations
- **Intermediate**: Complex projects with multiple components
- **Advanced**: Research-level topics and cutting-edge techniques

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon library
- **Pexels** for high-quality stock images
- **GitHub** for Codespaces integration

## 📞 Support

For support and questions:
- 📧 Email: support@usaii.org
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/usaii-labs-platform/issues)
- 📖 Documentation: [Wiki](https://github.com/YOUR_USERNAME/usaii-labs-platform/wiki)

---

**Built with ❤️ for the future of AI education**