# Mystery Message

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Upstash Redis](https://img.shields.io/badge/Redis-Upstash-red?style=for-the-badge&logo=redis)](https://upstash.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

Mystery Message is a modern anonymous messaging platform inspired by NGL and Qooh.me. Users can create an account, receive a unique profile URL, and anonymously receive messages from anyone. The platform focuses on privacy, security, and a premium user experience.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Security](#security)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)
- [Contribution](#contribution)
- [License](#license)

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Library:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Toasts:** Sonner
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **State/Cache:** Upstash Redis

### Backend
- **Routing:** Next.js Route Handlers
- **Database:** MongoDB (via Mongoose)
- **Authentication:** NextAuth
- **Encryption:** bcryptjs
- **Email Delivery:** Resend Email API
- **AI Engine:** Groq API (Llama 3.1 8B Instant)
- **Rate Limiting:** Upstash Redis

---

## Features

- **Secure Authentication:** Server-side authentication and session management.
- **Email Verification with OTP:** Secure signup validation.
- **Anonymous Messaging:** Public profile sharing with a unique URL.
- **AI-Generated Message Suggestions:** Suggestion prompts powered by Groq API.
- **Delete Received Messages:** Manage your inbox with instant message deletion.
- **Public Profile Sharing:** Responsive shareable page for receipt of messages.
- **Dark Mode Premium UI:** Sleek, custom dark aesthetics for a premium feel.
- **Responsive Design:** Optimized layout for mobile, tablet, and desktop screens.
- **Production-Grade API Architecture:** Scalable and structured API endpoints.
- **Input Validation using Zod:** Hardened schema validation on all inputs.
- **Rate Limiting using Redis:** Enforced call limits on API endpoints.
- **Secure Password Hashing:** Salted hashes generated using bcryptjs.
- **Server-Side Authentication:** Protected page loading and session handling.
- **Security Hardened Backend:** Defense against common web vulnerabilities.
- **Protected API Routes:** Guarded routes checking session integrity.

---

## Security

This platform implements security best practices to protect user data and endpoints:

* **Server-Side Validation:** All input payloads are checked via schema validation utilizing Zod to prevent malformed data.
* **NoSQL Injection Protection:** Database interactions are handled using Mongoose ODM, avoiding raw query execution.
* **Rate Limiting:** Guarded with Upstash Redis at the API level to prevent spam and brute-force attempts.
* **Cryptographically Secure OTP Generation:** Generated values for email verification are secure and time-sensitive.
* **Password Hashing:** Passwords are cryptographed using bcryptjs before database insertion.
* **Authentication using NextAuth:** Sessions are handled server-side with secure JWT mechanisms.
* **Environment Variable Protection:** Sensitive keys and credentials are kept server-side and never exposed to the frontend.
* **Secure Error Handling:** System logs are abstracted from the client response to avoid stack trace leaks.
* **Input Sanitization:** Data inputs are sanitized to protect against Cross-Site Scripting (XSS).

---

## Folder Structure

```text
mystery_message/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── accept-messages/
│   │   │   │   └── route.ts
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       ├── options.ts
│   │   │   │       └── route.ts
│   │   │   ├── check-username-unique/
│   │   │   │   └── route.ts
│   │   │   ├── delete-message/
│   │   │   │   └── [messageId]/
│   │   │   │       └── route.ts
│   │   │   ├── get-messages/
│   │   │   │   └── route.ts
│   │   │   ├── send-message/
│   │   │   │   └── route.ts
│   │   │   ├── signup/
│   │   │   │   └── route.ts
│   │   │   ├── suggest-messages/
│   │   │   │   └── route.ts
│   │   │   └── verify-code/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx
│   │   │   ├── sign-out/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── verify/
│   │   │       └── [username]/
│   │   │           └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── u/
│   │   │   └── [username]/
│   │   │       ├── page.tsx
│   │   │       └── SendMessageClient.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       └── sonner.tsx
│   ├── context/
│   │   └── AuthProvider.tsx
│   ├── helpers/
│   │   └── sendVerificationEmail.ts
│   ├── lib/
│   │   ├── dbConnect.ts
│   │   ├── groq.ts
│   │   ├── redis.ts
│   │   ├── resend.ts
│   │   └── utils.ts
│   ├── model/
│   │   └── user.model.ts
│   ├── schemas/
│   │   ├── acceptMessageSchema.ts
│   │   ├── messageSchema.ts
│   │   ├── signInSchema.ts
│   │   ├── signUpSchema.ts
│   │   ├── verifyCodeSchema.ts
│   │   └── verifySchema.ts
│   ├── types/
│   │   ├── ApiResponse.ts
│   │   └── next-auth.d.ts
│   └── middleware.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## Installation

Follow these steps to set up the project locally:

### 1. Clone Repository
```bash
git clone https://github.com/dipanjan2907/mystery-message.git
cd mystery-message
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` or `.env.local` file in the root directory and configure the variables listed in the [Environment Variables](#environment-variables) section.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build & Production Run
To build the application:
```bash
npm run build
```
To run the production server:
```bash
npm run start
```

---

## Environment Variables

Ensure the following variables are configured in your environment:

```env
# Database (MongoDB connection strings)
MONGO_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/mystery_message"
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/mystery_message"

# Authentication (NextAuth config)
NEXTAUTH_SECRET="your_nextauth_jwt_secret"
NEXTAUTH_URL="http://localhost:3000"

# Email Provider
RESEND_API_KEY="re_yourResendApiKey"

# AI Integration
GROQ_API_KEY="gsk_yourGroqApiKey"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://your-db-name.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"
```

---

## Roadmap

- [ ] **Sender Outbox:** Allow anonymous senders to view their sent messages history.
- [ ] **Archive Messages:** Archive messages instead of permanently deleting them.
- [ ] **AI Message Categorization:** Automatically tag or classify messages using natural language analysis.
- [ ] **User Blocking:** Enable profile owners to temporarily block spam senders.
- [ ] **Notifications:** Email alerts or push notifications for incoming messages.

---

## Contribution

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository.
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`).
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`).
4. **Push** to the branch (`git push origin feature/amazing-feature`).
5. **Open** a Pull Request.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
