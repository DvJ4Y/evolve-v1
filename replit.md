# Evolve AI - Holistic Wellness Companion

## Overview

Evolve AI is a comprehensive wellness application that helps users track and improve their physical, mental, and spiritual well-being through the three pillars of wellness: Body, Mind, and Soul. The application features voice-powered activity logging using Google's Gemini AI, a responsive React frontend with modern UI components, and a robust Express.js backend with PostgreSQL database integration.

## System Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern component patterns
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** with custom wellness-themed color palette (charcoal, rose-gold, glass effects)
- **Shadcn/UI** component library for consistent, accessible UI components
- **Wouter** for lightweight client-side routing
- **TanStack Query** for efficient server state management and caching

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **Drizzle ORM** with PostgreSQL for type-safe database operations
- **Google Gemini AI** integration for intelligent voice log parsing
- **Session-based storage** with configurable in-memory or database persistence

### Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly interface with proper spacing and gesture support
- Glassmorphic design elements for modern aesthetic
- Progressive Web App capabilities

## Key Components

### Voice Processing System
The core innovation of the application is its voice-powered activity logging:
- **Speech Recognition**: Browser Web Speech API for real-time voice capture
- **AI Processing**: Google Gemini AI parses natural language into structured wellness activities
- **Smart Categorization**: Automatically categorizes activities into Body, Mind, or Soul pillars
- **Context Awareness**: Cross-references user's supplement list and personal goals

### Wellness Pillars Framework
Three-pillar approach to holistic wellness tracking:
- **Body**: Physical activities, nutrition, supplements, exercise routines
- **Mind**: Mental wellness, meditation, mindfulness, stress management
- **Soul**: Spiritual practices, gratitude, reflection, purpose work

### Database Schema
Comprehensive data model supporting:
- **Users**: Profile information, goals, supplement tracking, streak counters
- **Activity Logs**: Timestamped wellness activities with detailed metadata
- **Daily Stats**: Aggregated daily wellness metrics and progress tracking
- **Goals**: User-defined wellness objectives across all three pillars

### UI Component System
Modern, accessible component library featuring:
- **Glassmorphic Cards**: Semi-transparent cards with backdrop blur effects
- **Progress Rings**: Circular progress indicators for wellness metrics
- **Voice Interface**: Animated voice recording overlay with visual feedback
- **Pillar Cards**: Interactive cards representing each wellness pillar

## Data Flow

1. **Voice Input**: User activates voice recording through floating action button
2. **Speech Processing**: Browser captures audio and converts to text via Web Speech API
3. **AI Analysis**: Gemini AI parses natural language and extracts structured wellness data
4. **Data Persistence**: Processed activities are stored in PostgreSQL database
5. **Real-time Updates**: TanStack Query invalidates caches and updates UI components
6. **Analytics**: Daily stats are computed and progress metrics are updated

## External Dependencies

### Core Technologies
- **Node.js 20**: Runtime environment with ES modules support
- **PostgreSQL 16**: Primary database for persistent data storage
- **Google Gemini AI**: Natural language processing for voice log interpretation

### Key Libraries
- **@google/genai**: Official Google Gemini AI SDK
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless
- **drizzle-orm**: Type-safe ORM with schema validation
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI components for accessibility

### Development Tools
- **TypeScript**: Static typing across frontend and backend
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Build Process
- **Development**: `npm run dev` starts concurrent Vite dev server and Express server
- **Production Build**: `npm run build` compiles React app and bundles Express server
- **Production Start**: `npm run start` runs optimized Express server serving static assets

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable
- **AI Services**: Gemini API key via `GEMINI_API_KEY` or `VITE_GEMINI_API_KEY`
- **Session Storage**: Configurable between in-memory and database persistence

### Autoscale Deployment
- Configured for Replit's autoscale deployment target
- Port 5000 for local development, port 80 for production
- Optimized for serverless environment with connection pooling

## Changelog

```
Changelog:
- June 25, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```