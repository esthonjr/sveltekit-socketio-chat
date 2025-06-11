# SvelteKit + Socket.IO + TypeScript Chat

A real-time chat application built as a showcase of the SvelteKit, Socket.IO, and TypeScript stack. The interface and functionality are inspired by the classic mIRC (Internet Relay Chat) client, featuring a retro monospace design and IRC-style commands.

## Features

### Real-time Communication
- **Live messaging**: Send and receive messages instantly
- **User presence**: See who's online with a live user list
- **Private messaging**: Send direct messages to specific users
- **Room capacity**: Supports up to 10 concurrent users

### IRC-Style Commands
The chat supports various slash commands reminiscent of classic IRC:

- `/nick <new-nickname>` - Change your nickname
- `/quit [message]` - Leave the chat with an optional quit message
- `/help` - Display all available commands
- `/whois <nickname>` - Get information about a user
- `/pvt <nickname> <message>` - Send a private message to a user
- `/me <message>` - Send an action message (e.g., "*nickname waves*")

### User Experience
- **Message history navigation**: Use ↑/↓ arrow keys to navigate through previous messages
- **Dynamic tips**: Rotating command suggestions to help new users
- **Auto-nickname assignment**: Automatic guest nickname assignment for new users
- **Real-time feedback**: System messages for errors, joins, quits, and nickname changes
- **Color-coded messages**: Different message types have distinct colors (system, private, actions, errors)

### Visual Design
- **Monospace interface**: Classic terminal/IRC aesthetic
- **Split layout**: Separate areas for messages and user list
- **Responsive design**: Built with Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm, pnpm, or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

The application will be available at `http://localhost:5173`

### Building for Production

To create a production version:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Tech Stack

- **Frontend**: SvelteKit with TypeScript
- **Real-time Communication**: Socket.IO (client & server)
- **Styling**: Tailwind CSS
- **Server**: Express.js with Socket.IO server
- **Build Tool**: Vite

## Project Structure

- `src/routes/+page.svelte` - Main chat interface component
- `src/lib/server/socket-io-plugin.ts` - Socket.IO server implementation
- **Real-time events**: Join/leave notifications, nickname changes, message broadcasting
- **Command processing**: Client-side command parsing and validation

> This project serves as a demonstration of real-time web application development using modern technologies while maintaining the nostalgic feel of classic IRC clients.
