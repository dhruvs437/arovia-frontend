# Arovia Frontend

A modern web application built with Next.js 15, React 19, and TypeScript, featuring RSA encryption capabilities and optimized with Turbopack.

## 🚀 Tech Stack

- **Framework:** Next.js 15.5.3 with App Router
- **React:** 19.1.0 
- **TypeScript:** Full type safety
- **Styling:** Tailwind CSS v4
- **Build Tool:** Turbopack for faster development and builds
- **HTTP Client:** Axios for API requests
- **Encryption:** Node-RSA for cryptographic operations

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd arovia-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

## 🚦 Getting Started

### Development

Start the development server with Turbopack:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page auto-updates as you edit files. Start by modifying `app/page.tsx`.

### Production Build

Build the application for production:

```bash
npm run build
# or
yarn build
```

### Start Production Server

Run the built application:

```bash
npm run start
# or
yarn start
```

### Linting

Check code quality with ESLint:

```bash
npm run lint
# or
yarn lint
```

## 📁 Project Structure

```
arovia-frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── public/                # Static assets
├── types/                 # TypeScript type definitions
└── ...
```

## 🔧 Key Features

- **Fast Development:** Turbopack integration for lightning-fast builds and hot reload
- **Modern React:** Built with React 19 and latest Next.js features
- **Type Safety:** Full TypeScript support with strict type checking
- **Responsive Design:** Tailwind CSS v4 for modern, responsive styling
- **Security:** RSA encryption capabilities for secure data handling
- **API Integration:** Axios configured for seamless API communication

## 🌐 Environment Setup

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=your_api_url_here
API_SECRET_KEY=your_secret_key_here

# Add other environment variables as needed
```

## 📖 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Next.js GitHub Repository](https://github.com/vercel/next.js)

### Additional Resources
- [React 19 Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Turbopack Documentation](https://turbo.build/pack)

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Vercel will automatically build and deploy your application

### Other Platforms

This application can be deployed on any platform that supports Node.js:

- **Netlify:** Connect your Git repository for automatic deployments
- **Railway:** Simple deployment with automatic HTTPS
- **DigitalOcean App Platform:** Scalable cloud deployment
- **AWS Amplify:** Full-stack cloud deployment

Check the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for detailed deployment guides.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🐛 Issues & Support

If you encounter any issues or need support, please:

1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Include steps to reproduce the problem

---

Built with ❤️ using Next.js and modern web technologies.