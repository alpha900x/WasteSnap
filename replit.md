# WasteSnap - Civic Garbage Reporting Platform

## Overview

WasteSnap is a civic reporting platform designed to help communities report and track garbage cleanup efforts. The application allows users to submit photo-based reports of waste locations, view reports on an interactive map, and enables administrators to manage and track cleanup progress. Built as a full-stack web application with mobile-responsive design, it facilitates collaboration between citizens and local authorities for maintaining cleaner communities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses a modern React-based stack with TypeScript for type safety and better developer experience. The UI is built with shadcn/ui components providing a consistent design system based on Radix UI primitives and styled with Tailwind CSS. The application implements client-side routing using Wouter for navigation between different views (map, report form, user reports, admin dashboard).

State management is handled through TanStack Query (React Query) for server state synchronization and caching, eliminating the need for additional global state management. The frontend follows a component-based architecture with reusable UI components and custom hooks for authentication and other shared logic.

### Backend Architecture
The server is built on Express.js with TypeScript, providing a RESTful API architecture. The application uses a monorepo structure with shared TypeScript types between client and server, ensuring type consistency across the full stack. File uploads are handled through Multer middleware with image validation and size limits.

The API implements session-based authentication with PostgreSQL session storage, providing secure user management. Error handling is centralized through Express middleware, and the application includes request logging for monitoring and debugging.

### Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes users, reports, and sessions tables. Reports contain geolocation data (latitude/longitude), waste type classification, status tracking, and photo URLs. The database supports enum types for waste categories (general, recyclables, organic, hazardous) and report statuses (new, in_progress, resolved).

Session management is handled through a dedicated sessions table required for the authentication system, with automatic cleanup of expired sessions.

### Authentication System
Authentication is implemented using Replit's OpenID Connect (OIDC) integration with Passport.js. The system supports automatic user creation and profile updates, storing user information including email, names, and profile images. Session management uses connect-pg-simple for PostgreSQL-backed session storage with configurable TTL.

The authentication flow includes protected routes on both client and server sides, with automatic redirection for unauthenticated users and proper error handling for authorization failures.

### Map Integration
The application integrates Leaflet.js for interactive mapping functionality, loaded dynamically to improve initial page load performance. Maps display garbage reports with custom markers, support location selection for new reports, and provide geographic visualization of waste distribution across the community.

The map component is designed to work responsively across different screen sizes and supports both viewing existing reports and selecting locations for new submissions.

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL hosting service providing the primary database backend
- **Drizzle ORM**: Type-safe database client and migration system

### Authentication Services
- **Replit Auth**: OpenID Connect authentication provider for user management
- **Passport.js**: Authentication middleware for Express.js

### Map Services
- **Leaflet.js**: Open-source mapping library for interactive maps
- **OpenStreetMap**: Tile provider for map visualization

### UI Framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework for styling

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type system for JavaScript
- **ESBuild**: Fast JavaScript bundler for production builds

### File Storage
- **Local File System**: Image uploads stored in server uploads directory
- **Multer**: File upload middleware with validation and size limits

### Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Express Session**: Session middleware for user authentication state