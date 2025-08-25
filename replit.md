# Budget Tracker

## Overview

This is a full-stack budget tracker application that provides a calendar-based interface for managing personal finances. Users can track income and expenses by date, categorize transactions, and view monthly financial summaries. The application features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite for fast development and building
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design tokens for consistent theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management, caching, and synchronization
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Session Management**: Express sessions with PostgreSQL storage for persistent user sessions
- **API Design**: RESTful endpoints following conventional patterns for CRUD operations

### Authentication System
- **Provider**: Replit OIDC authentication system integrated with Passport.js
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Authorization**: Middleware-based route protection ensuring users can only access their own data

### Database Schema
- **Users Table**: Stores user profile information from OIDC provider
- **Transactions Table**: Core financial data with support for income/expense categorization
- **Sessions Table**: Secure session storage for authentication persistence
- **Relationships**: Foreign key constraints ensure data integrity between users and transactions

### Key Features
- **Calendar Interface**: Month-by-month transaction viewing with visual indicators for days with transactions
- **Transaction Management**: Full CRUD operations for income and expense entries with category support
- **Financial Summaries**: Monthly reporting with income/expense totals and category breakdowns
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes

### Error Handling
- **Client-side**: Centralized error handling through React Query with user-friendly toast notifications
- **Server-side**: Express error middleware with proper HTTP status codes and structured error responses
- **Database**: Transaction rollbacks and constraint validation for data integrity