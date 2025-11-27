# SportSnap

A sports photography platform connecting photographers and participants.

## Tech Stack

### Frontend
- **Framework**: Nuxt.js 4 (Vue 3)
- **Language**: TypeScript
- **UI Library**: Nuxt UI
- **Styling**: Tailwind CSS + SCSS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Docker)
- **Storage**: Cloudflare R2

## Getting Started

### Prerequisites
- Node.js
- Docker Desktop

### Installation

1. **Install Dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

2. **Start Database**
   ```bash
   docker-compose up -d
   ```

3. **Run Development Servers**
   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd backend
   npm run dev
   ```
