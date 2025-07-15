# Kinza Berlin

A cross-platform app designed to connect parents in Berlin with family-friendly events, venues, and communities. Built with React Native (Expo) and Firebase, optimized for quick iteration and user-centered design.

## Features

- Event & location discovery (geo-based)
- Map view + filters (indoor, stroller-friendly, etc.)
- Save & share events
- User-generated tips/comments
- Multilingual UI (DE/EN/IT)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/kinza-berlin.git
cd kinza-berlin
```

2. Install dependencies
```
npm install
# or
yarn install
```

3. Start the development server
```
npm start
# or
yarn start
```

## Project Structure

```
/src
  /components - Reusable UI components
  /screens - Main app screens
  /hooks - Custom React hooks
  /utils - Utility functions
  /styles - Global styles
  /auth - Authentication related code
/firebase - Firebase configuration and functions
/types - TypeScript type definitions
/assets - Images, fonts, etc.
```

## User Roles

- **Parent** - Primary user – discover events, connect locally
- **Organiser** - Hosts or venues posting events
- **Admin** - Kinza team or moderators
- **Guest** - New or anonymous user
- **Partner/Venue Host** - Businesses promoting kid-friendly places

## Multilingual Support

The app supports English, German, and Italian languages for all UI elements.
