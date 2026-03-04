# Simplingua Frontend

Next.js frontend for Simplingua conlang learning platform.

## Features

- **Modern React 18** with hooks and context
- **TypeScript** for type safety
- **TailwindCSS** for utility-first styling
- **Responsive Design** - Mobile-first approach
- **SSE Streaming** - Real-time chat interface
- **JWT Authentication** - Token management and auto-refresh

## Technology Stack

- **Next.js 14**: React framework with App Router
- **React 18**: Hooks and concurrent features
- **TypeScript 5**: Type-safe development
- **TailwindCSS 3**: Utility-first CSS framework
- **Zustand**: State management
- **Axios**: HTTP client
- **Socket.io**: Real-time events (optional)

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check with TypeScript

## Environment Variables

See `.env.local` or `.env`:

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)
- Other environment variables can be added as needed

## Project Structure

```
frontend/
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── (auth)/        # Login, register
│   │   ├── (wiki)/        # Wiki/search, words/[id], grammar
│   │   ├── (chat)/        # AI chat interface
│   │   ├── (valva)/       # Forum posts
│   │   ├── (profile)/     # User settings
│   │   ├── admin/          # Admin dashboard
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── wiki/          # Wiki-specific components
│   │   ├── chat/          # Chat components with SSE
│   │   └── forum/         # Forum components
│   ├── lib/
│   │   ├── api.ts          # API client functions
│   │   ├── auth.ts         # JWT token management
│   │   └── utils.ts        # Utility functions
│   ├── styles/
│   │   └── globals.css     # Global styles
│   └── types/
│       └── index.ts        # TypeScript interfaces
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── Dockerfile
```

## Pages

### Public Pages
- `/` - Home page with feature overview
- `/auth/login` - User login
- `/auth/register` - User registration

### Protected Pages (require authentication)
- `/wiki/search` - Knowledge base search
- `/wiki/words/[id]` - Word details
- `/grammar` - Grammar reference
- `/chat` - AI chat interface
- `/valva/posts` - Forum posts list
- `/profile/settings` - User profile management
- `/admin/*` - Admin dashboard

## Development

### Adding New Pages

1. Create page file in `src/app/` directory
2. Use React hooks for state management
3. Use API client from `@/lib/api`
4. Add navigation in `components/ui/Header.tsx`

### Styling Guidelines

- Use TailwindCSS utility classes
- Follow component-based design
- Use responsive breakpoints (sm, md, lg, xl)
- Follow color scheme from `tailwind.config.ts`

### State Management

- Use React hooks (`useState`, `useEffect`) for local state
- Consider Zustand for global state
- Keep components simple and composable

## API Integration

Use the API client from `@/lib/api`:
- `authApi` - Authentication endpoints
- `wikiApi` - Knowledge base endpoints
- `chatApi` - Chat endpoints
- `userApi` - User management
- `forumApi` - Forum endpoints

## Building for Production

```bash
# Build
npm run build

# Start production server
npm start
```

The production build will be optimized with:
- Static HTML generation
- Image optimization
- Tree shaking
- Code splitting
