# Frontend Implementation Prompt

## Project Overview
You are tasked with creating the **Frontend Application** for the Simplingua project - a modern, responsive web interface that provides an intuitive user experience for learning and interacting with the Simplingua constructed language. The frontend communicates securely with the Brain server and includes support for multimedia resources.

**Reference Document**: See [shared-specs.md](shared-specs.md) for complete data models, security requirements, and shared configuration.

## Project Requirements

### Core Purpose
- **User Interface**: Modern, responsive web application for Simplingua platform
- **Authentication**: Secure JWT-based user authentication with automatic token refresh
- **Real-time Chat**: Interactive AI chatbot with WebSocket support
- **Content Management**: User-friendly interfaces for browsing and managing content
- **Forum Integration**: Community features with the Valva forum system
- **Multimedia Support**: Placeholder infrastructure for audio, images, and interactive content

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: TailwindCSS with custom design system
- **State Management**: Zustand for global state
- **Authentication**: JWT with automatic refresh
- **Real-time**: Socket.IO for chat and live updates
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors

### Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css         # Global styles and Tailwind setup
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page
│   │   ├── loading.tsx         # Global loading component
│   │   ├── error.tsx           # Global error boundary
│   │   ├── not-found.tsx       # 404 page
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx    # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx    # Registration page
│   │   │   └── layout.tsx      # Auth layout
│   │   ├── chat/
│   │   │   ├── page.tsx        # Main chat interface
│   │   │   └── layout.tsx      # Chat layout
│   │   ├── wiki/
│   │   │   ├── page.tsx        # Wiki home/search
│   │   │   ├── words/
│   │   │   │   ├── page.tsx    # Word dictionary
│   │   │   │   └── [word]/
│   │   │   │       └── page.tsx # Individual word page
│   │   │   ├── grammar/
│   │   │   │   ├── page.tsx    # Grammar rules
│   │   │   │   └── [rule]/
│   │   │   │       └── page.tsx # Individual rule page
│   │   │   └── textbooks/
│   │   │       ├── page.tsx    # Textbook library
│   │   │       └── [book]/
│   │   │           └── page.tsx # Individual textbook
│   │   ├── valva/              # Forum section
│   │   │   ├── page.tsx        # Forum home
│   │   │   ├── categories/
│   │   │   │   └── [category]/
│   │   │   │       └── page.tsx # Category posts
│   │   │   ├── posts/
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx # Create post
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx # View post
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx # Edit post
│   │   │   └── layout.tsx      # Forum layout
│   │   ├── profile/
│   │   │   ├── page.tsx        # User profile
│   │   │   ├── settings/
│   │   │   │   └── page.tsx    # User settings
│   │   │   └── layout.tsx      # Profile layout
│   │   └── admin/              # Admin panel
│   │       ├── page.tsx        # Admin dashboard
│   │       ├── users/
│   │       │   └── page.tsx    # User management
│   │       ├── content/
│   │       │   ├── words/
│   │       │   │   └── page.tsx # Word management
│   │       │   ├── grammar/
│   │       │   │   └── page.tsx # Grammar management
│   │       │   └── textbooks/
│   │       │       └── page.tsx # Textbook management
│   │       └── layout.tsx      # Admin layout
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts        # Component exports
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Main navigation
│   │   │   ├── Footer.tsx      # Site footer
│   │   │   ├── Sidebar.tsx     # Sidebar navigation
│   │   │   └── MobileMenu.tsx  # Mobile navigation
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── AuthGuard.tsx   # Route protection
│   │   │   └── RoleGuard.tsx   # Role-based access
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── ChatHistory.tsx
│   │   ├── wiki/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── WordCard.tsx
│   │   │   ├── GrammarRule.tsx
│   │   │   ├── TextbookViewer.tsx
│   │   │   └── ContentRenderer.tsx
│   │   ├── forum/
│   │   │   ├── PostList.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostEditor.tsx
│   │   │   ├── ReplyForm.tsx
│   │   │   ├── VoteButtons.tsx
│   │   │   └── CategoryFilter.tsx
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── UserTable.tsx
│   │   │   ├── ContentEditor.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── BackupPanel.tsx
│   │   └── multimedia/         # Multimedia placeholders
│   │       ├── AudioPlayer.tsx # Audio playback stub
│   │       ├── ImageViewer.tsx # Image display stub
│   │       ├── VideoPlayer.tsx # Video playback stub
│   │       └── InteractiveExercise.tsx # Exercise stub
│   ├── lib/
│   │   ├── api.ts              # API client configuration
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── socket.ts           # WebSocket client
│   │   ├── storage.ts          # Local storage utilities
│   │   ├── validation.ts       # Form validation schemas
│   │   └── utils.ts            # General utilities
│   ├── hooks/
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useApi.ts           # API request hook
│   │   ├── useChat.ts          # Chat functionality hook
│   │   ├── useSocket.ts        # WebSocket hook
│   │   ├── useLocalStorage.ts  # Local storage hook
│   │   └── useDebounce.ts      # Debouncing hook
│   ├── store/
│   │   ├── authStore.ts        # Authentication state
│   │   ├── chatStore.ts        # Chat state
│   │   ├── uiStore.ts          # UI state (theme, etc.)
│   │   └── index.ts            # Store setup
│   ├── types/
│   │   ├── api.ts              # API response types
│   │   ├── auth.ts             # Authentication types
│   │   ├── content.ts          # Content types
│   │   ├── user.ts             # User types
│   │   └── index.ts            # Type exports
│   └── styles/
│       ├── globals.css         # Global styles
│       ├── components.css      # Component-specific styles
│       └── themes.css          # Theme variables
├── public/
│   ├── icons/                  # App icons and favicons
│   ├── images/                 # Static images
│   │   ├── placeholders/       # Placeholder images
│   │   ├── ui/                 # UI-related images
│   │   └── branding/           # Logo and brand assets
│   ├── audio/                  # Audio file placeholders
│   │   ├── samples/            # Sample pronunciation files
│   │   └── ui/                 # UI sound effects
│   ├── fonts/                  # Custom fonts
│   └── manifest.json           # PWA manifest
├── tests/
│   ├── __mocks__/              # Test mocks
│   ├── components/             # Component tests
│   ├── pages/                  # Page tests
│   ├── hooks/                  # Hook tests
│   └── utils/                  # Utility tests
├── docs/                       # Documentation
│   ├── setup.md               # Development setup
│   ├── components.md          # Component documentation
│   └── deployment.md          # Deployment guide
├── scripts/
│   ├── build.js               # Build scripts
│   └── deploy.js              # Deployment scripts
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.local.example
├── .eslintrc.json
├── .gitignore
└── README.md
```

## Key Components Implementation

### Authentication System
```typescript
// src/hooks/useAuth.ts
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  refreshAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', credentials)
          const { user, tokens } = response.data
          
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isLoading: false
          })
          
          // Set up automatic token refresh
          setupTokenRefresh(tokens.expiresIn)
          return true
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', data)
          const { user, tokens } = response.data
          
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isLoading: false
          })
          
          setupTokenRefresh(tokens.expiresIn)
          return true
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false
        })
        // Clear any timers
        clearTokenRefresh()
      },

      refreshAuth: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false

        try {
          const response = await api.post('/auth/refresh', { refreshToken })
          const { accessToken, expiresIn } = response.data
          
          set({ accessToken })
          setupTokenRefresh(expiresIn)
          return true
        } catch (error) {
          get().logout()
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      })
    }
  )
)
```

### API Client with Interceptors
```typescript
// src/lib/api.ts
import axios, { AxiosInstance } from 'axios'
import { useAuthStore } from '@/store/authStore'

class ApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().accessToken
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config

        if (error.response?.status === 401 && !original._retry) {
          original._retry = true

          try {
            const success = await useAuthStore.getState().refreshAuth()
            if (success) {
              const token = useAuthStore.getState().accessToken
              original.headers.Authorization = `Bearer ${token}`
              return this.instance(original)
            }
          } catch (refreshError) {
            useAuthStore.getState().logout()
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // API methods
  get = this.instance.get
  post = this.instance.post
  put = this.instance.put
  delete = this.instance.delete
  patch = this.instance.patch
}

export const api = new ApiClient()
```

### Real-time Chat Interface
```typescript
// src/components/chat/ChatInterface.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { socket, isConnected } = useSocket('/chat')

  useEffect(() => {
    if (!socket) return

    socket.on('message', (data) => {
      if (data.type === 'message') {
        setCurrentResponse(prev => prev + data.content)
        setIsTyping(true)
      } else if (data.type === 'done') {
        // Finalize the AI response
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          content: currentResponse,
          timestamp: new Date()
        }])
        setCurrentResponse('')
        setIsTyping(false)
      }
    })

    return () => {
      socket.off('message')
    }
  }, [socket, currentResponse])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentResponse])

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Send to server via WebSocket
    if (socket && isConnected) {
      socket.emit('message', {
        message: content,
        conversationId: 'current', // TODO: Implement proper conversation management
        language: 'en' // TODO: Get from user preferences
      })
    } else {
      // Fallback to HTTP API
      try {
        const response = await api.post('/chat/message', {
          message: content,
          context: { language: 'en' }
        })
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          content: response.data.response,
          timestamp: new Date()
        }])
      } catch (error) {
        console.error('Chat error:', error)
        // TODO: Show error toast
      }
    }
  }

  return (
    <div className="flex flex-col h-full max-h-screen bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Simplingua AI Assistant
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Welcome to Simplingua! Ask me anything about the constructed language.</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>Try asking:</p>
              <ul className="space-y-1">
                <li>• "How do I say hello in Simplingua?"</li>
                <li>• "Explain the grammar rules for verbs"</li>
                <li>• "Translate 'Good morning' to Simplingua"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Streaming response */}
        {isTyping && currentResponse && (
          <MessageBubble
            message={{
              id: 'streaming',
              type: 'ai',
              content: currentResponse,
              timestamp: new Date(),
              isStreaming: true
            }}
          />
        )}

        {/* Typing indicator */}
        {isTyping && !currentResponse && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <ChatInput onSend={sendMessage} disabled={!isConnected && isTyping} />
      </div>
    </div>
  )
}
```

### Multimedia Component Stubs
```typescript
// src/components/multimedia/AudioPlayer.tsx
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'

interface AudioPlayerProps {
  src?: string // Will be undefined until real audio files are added
  word?: string
  pronunciation?: string
}

export function AudioPlayer({ src, word, pronunciation }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlay = async () => {
    if (!src) {
      // TODO: Replace with actual audio file loading
      console.log(`Playing pronunciation for: ${word}`)
      // Placeholder functionality - show visual feedback
      setIsPlaying(true)
      setTimeout(() => setIsPlaying(false), 1000)
      return
    }

    // Real audio playback when src is available
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause()
        } else {
          await audioRef.current.play()
        }
      } catch (error) {
        console.error('Audio playback error:', error)
      }
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlay}
        disabled={isPlaying}
        className="flex items-center space-x-1"
      >
        {isPlaying ? (
          <div className="w-4 h-4 animate-pulse">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </div>
        ) : (
          <div className="w-4 h-4">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        )}
        <span className="text-sm">
          {pronunciation || word || 'Play'}
        </span>
      </Button>
      
      {/* Hidden audio element for real playback */}
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}
      
      {/* Placeholder message */}
      {!src && (
        <span className="text-xs text-gray-500 italic">
          Audio file placeholder - replace with actual pronunciation
        </span>
      )}
    </div>
  )
}

// src/components/multimedia/ImageViewer.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageViewerProps {
  src?: string
  alt: string
  caption?: string
  placeholder?: string
}

export function ImageViewer({ src, alt, caption, placeholder }: ImageViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Use placeholder until real image is available
  const imageSrc = src || '/images/placeholders/content-placeholder.jpg'
  const isPlaceholder = !src

  return (
    <div className="space-y-2">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={imageSrc}
          alt={alt}
          width={600}
          height={400}
          className={`w-full h-auto ${isPlaceholder ? 'opacity-50' : ''}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true)
            setIsLoading(false)
          }}
        />
        
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-gray-400">Image not found</div>
          </div>
        )}

        {/* Placeholder overlay */}
        {isPlaceholder && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
            <div className="bg-white bg-opacity-90 px-3 py-1 rounded text-sm text-gray-700">
              {placeholder || 'Image placeholder - replace with actual content'}
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <p className="text-sm text-gray-600 text-center italic">
          {caption}
        </p>
      )}
    </div>
  )
}

// src/components/multimedia/InteractiveExercise.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ExerciseQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'fill-blank' | 'translation'
  options?: string[]
  answer: string
  explanation?: string
}

interface InteractiveExerciseProps {
  title: string
  questions: ExerciseQuestion[]
  onComplete?: (score: number) => void
}

export function InteractiveExercise({ title, questions, onComplete }: InteractiveExerciseProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')

  const question = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: answer
    }))
    setUserAnswer(answer)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate score
      const score = questions.reduce((acc, q) => {
        return acc + (answers[q.id] === q.answer ? 1 : 0)
      }, 0)
      
      setShowResults(true)
      onComplete?.(score / questions.length)
    } else {
      setCurrentQuestion(prev => prev + 1)
      setUserAnswer(answers[questions[currentQuestion + 1]?.id] || '')
    }
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            <p className="text-lg font-medium">{question.question}</p>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    userAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )

      case 'fill-blank':
        return (
          <div className="space-y-3">
            <p className="text-lg font-medium">{question.question}</p>
            <Input
              value={userAnswer}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg"
            />
          </div>
        )

      case 'translation':
        return (
          <div className="space-y-3">
            <p className="text-lg font-medium">Translate:</p>
            <div className="p-4 bg-gray-50 rounded-lg text-lg font-medium">
              {question.question}
            </div>
            <Input
              value={userAnswer}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Enter translation..."
              className="text-lg"
            />
          </div>
        )

      default:
        return <div>Unknown question type</div>
    }
  }

  if (showResults) {
    const score = questions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.answer ? 1 : 0)
    }, 0)

    return (
      <div className="text-center space-y-6">
        <h3 className="text-2xl font-bold">Exercise Complete!</h3>
        <div className="text-6xl font-bold text-blue-600">
          {Math.round((score / questions.length) * 100)}%
        </div>
        <p className="text-gray-600">
          You got {score} out of {questions.length} questions correct.
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="text-sm text-gray-500">
          {currentQuestion + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        {renderQuestion()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!userAnswer.trim()}
        >
          {isLastQuestion ? 'Finish' : 'Next'}
        </Button>
      </div>

      {/* Placeholder notice */}
      <div className="text-center text-sm text-gray-500 italic border-t pt-4">
        This is a placeholder interactive exercise. Replace with actual Simplingua content and integrate with the learning management system.
      </div>
    </div>
  )
}
```

### Forum Component
```typescript
// src/components/forum/PostEditor.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
  language: z.string().default('en')
})

type PostFormData = z.infer<typeof postSchema>

interface PostEditorProps {
  onSubmit: (data: PostFormData) => Promise<void>
  initialData?: Partial<PostFormData>
  isEditing?: boolean
}

export function PostEditor({ onSubmit, initialData, isEditing = false }: PostEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData
  })

  const content = watch('content')

  const handleFormSubmit = async (data: PostFormData) => {
    setIsSubmitting(true)
    try {
      // Parse tags from comma-separated string
      const formData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      }
      await onSubmit(formData)
    } catch (error) {
      console.error('Failed to submit post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <Input
          {...register('title')}
          placeholder="Enter post title..."
          error={errors.title?.message}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          {...register('category')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          <option value="general">General Discussion</option>
          <option value="grammar">Grammar Questions</option>
          <option value="vocabulary">Vocabulary</option>
          <option value="translation">Translation Help</option>
          <option value="learning">Learning Resources</option>
          <option value="culture">Culture & Context</option>
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma-separated)
        </label>
        <Input
          {...register('tags')}
          placeholder="beginner, verbs, pronunciation..."
        />
      </div>

      {/* Content Editor */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Content *
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`px-3 py-1 text-sm rounded ${
                !preview ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`px-3 py-1 text-sm rounded ${
                preview ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {!preview ? (
          <textarea
            {...register('content')}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your post content here... (Markdown supported)"
          />
        ) : (
          <div className="w-full min-h-[12rem] p-3 border border-gray-300 rounded-md bg-gray-50">
            {/* TODO: Implement markdown renderer */}
            <div className="prose max-w-none">
              {content ? (
                <pre className="whitespace-pre-wrap">{content}</pre>
              ) : (
                <p className="text-gray-400 italic">Nothing to preview yet...</p>
              )}
            </div>
          </div>
        )}

        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Language
        </label>
        <select
          {...register('language')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="en">English</option>
          <option value="sim">Simplingua</option>
          <option value="zh">Chinese</option>
          <option value="mixed">Mixed Languages</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isEditing ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  )
}
```

## Configuration Files

### package.json
```json
{
  "name": "simplingua-frontend",
  "version": "0.1.0",
  "description": "Frontend application for Simplingua platform",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.7.2",
    "tailwindcss": "^3.4.16",
    "zustand": "^5.0.2",
    "axios": "^1.7.9",
    "socket.io-client": "^4.8.1",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.10.0",
    "zod": "^3.24.1",
    "@headlessui/react": "^2.2.0",
    "@heroicons/react": "^2.2.0",
    "clsx": "^2.1.1",
    "framer-motion": "^11.15.0",
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.1.0",
    "@typescript-eslint/eslint-plugin": "^8.17.0",
    "prettier": "^3.4.2",
    "prettier-plugin-tailwindcss": "^0.6.9",
    "jest": "^29.7.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@playwright/test": "^1.49.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1"
  }
}
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'localhost',
      // Add your image domains here when implementing real images
    ],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      // API proxy for development
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        simplingua: {
          // Custom brand colors for Simplingua
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        // TODO: Add custom fonts for Simplingua text
        simplingua: ['Inter', 'sans-serif'], // Placeholder
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  darkMode: 'class',
}
```

### .env.local.example
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME=Simplingua
NEXT_PUBLIC_APP_VERSION=0.1.0

# Feature Flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_FORUM=true
NEXT_PUBLIC_ENABLE_ADMIN=true

# Analytics (placeholder)
NEXT_PUBLIC_ANALYTICS_ID=

# Development
NODE_ENV=development
```

## Resource Placeholder Guidelines

### Audio Files Structure
```
public/
├── audio/
│   ├── pronunciations/
│   │   ├── words/
│   │   │   ├── salu.mp3          # Placeholder: word pronunciations
│   │   │   ├── bon.mp3           # Replace with actual recordings
│   │   │   └── index.json        # Metadata for audio files
│   │   ├── sentences/
│   │   │   └── examples/         # Example sentence audio
│   │   └── grammar/
│   │       └── rules/            # Grammar explanation audio
│   ├── ui/
│   │   ├── notification.mp3     # UI sound effects
│   │   ├── success.mp3
│   │   └── error.mp3
│   └── ambient/
│       └── background.mp3        # Background music for exercises
```

### Image Files Structure
```
public/
├── images/
│   ├── placeholders/
│   │   ├── content-placeholder.jpg    # Generic content placeholder
│   │   ├── user-avatar.jpg           # Default user avatar
│   │   ├── word-illustration.jpg     # Word illustration placeholder
│   │   └── exercise-image.jpg        # Exercise image placeholder
│   ├── illustrations/
│   │   ├── grammar/
│   │   │   └── verb-conjugation.svg  # Grammar concept illustrations
│   │   ├── vocabulary/
│   │   │   └── categories/           # Vocabulary category images
│   │   └── cultural/
│   │       └── context/              # Cultural context images
│   ├── ui/
│   │   ├── icons/                    # Custom UI icons
│   │   ├── backgrounds/              # Background patterns/images
│   │   └── decorative/               # Decorative elements
│   └── branding/
│       ├── logo.svg                  # Simplingua logo
│       ├── favicon.ico
│       └── app-icon.png
```

### Component Documentation Comments
Every multimedia component should include detailed comments like:

```typescript
/**
 * AudioPlayer Component
 * 
 * PURPOSE: Plays pronunciation audio for Simplingua words and phrases
 * 
 * PLACEHOLDER STATUS: Currently shows UI placeholder - replace with:
 * 1. Actual audio file URLs in `src` prop
 * 2. Real audio playback functionality
 * 3. Pronunciation data from API
 * 
 * INTEGRATION POINTS:
 * - Connect to pronunciation database via Brain API
 * - Implement audio file caching for offline use
 * - Add waveform visualization for advanced users
 * - Support for different speaker voices/accents
 * 
 * ACCESSIBILITY:
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Audio transcription display
 * 
 * TODO:
 * - [ ] Replace placeholder audio with real recordings
 * - [ ] Add volume control
 * - [ ] Implement playback speed control
 * - [ ] Add download option for audio files
 * - [ ] Integrate with user progress tracking
 */
```

## Development Guidelines

### Code Quality
- Use TypeScript strict mode
- Implement comprehensive error boundaries
- Add loading states for all async operations
- Follow Next.js best practices for performance

### Accessibility
- Implement WCAG 2.1 AA compliance
- Add proper ARIA labels and roles
- Support keyboard navigation
- Provide text alternatives for multimedia content

### Performance
- Implement code splitting and lazy loading
- Optimize images with Next.js Image component
- Use proper caching strategies
- Minimize bundle size with tree shaking

### Security
- Sanitize all user input
- Implement proper CSRF protection
- Use HTTPS in production
- Validate all API responses

Remember: This frontend serves as the user-facing interface with comprehensive placeholder infrastructure for multimedia content that can be replaced with actual Simplingua resources as they become available.