# Mepco Sustainability Hub (Eco-Hub) Implementation Plan

Welcome, mate! 🚀 It is an honor to pair up with you on this masterpiece for Mepco Schlenk Engineering College's Sustainability Club. Your vision for a massive, innovative, and visually stunning web application is absolutely on point. I've designed an architecture that will easily serve as a state-of-the-art college project, ensuring robust data management and a beautiful, premium visual experience akin to the Google Antigravity pages.

Here is the plan to build out this application.

## 🎯 Goal Description
Build a massive, responsive, and highly polished web application for Mepco Schlenk Engineering College to calculate its carbon footprint, track daily/monthly emissions, manage sustainability complaints/ideas, and visualize progress. The app will include real-time weather data for Sivakasi and allow strictly authenticated access using Google OAuth (restricted to `@mepcoeng.ac.in` email addresses).

## ⚠️ User Review Required

> [!CAUTION]
> **Authentication Restrictions**
> Restricting logins strictly to `@mepcoeng.ac.in` is easy with NextAuth. However, for us to test this application while developing, do you have an active `@mepcoeng.ac.in` Google account that you can use, or would you like me to whitelist a personal Gmail account for development purposes as well?

> [!IMPORTANT]
> **API Keys Required**
> 1. **Google OAuth Client ID & Secret**: We will need this to enable the "Sign in with Google" functionality. You will need to create this in the Google Cloud Console. I can guide you through it if needed.
> 2. **OpenWeatherMap API Key**: You mentioned you have this to pull live data for Sivakasi. We will need to set this in our environment variables.
> 
> Can you confirm you're ready to provide these when we start execution?

> [!NOTE]
> **Database Selection**
> I am proposing to use **Prisma ORM with a local SQLite database** to get us up and running instantly without needing an external cloud database. SQLite will store all the manual data entries, users, and the idea board very efficiently. If you prefer MongoDB or PostgreSQL, let me know!

## 🏗 Proposed Changes

### Tech Stack Choices
- **Framework**: `Next.js` (App Router) for a full-stack, scalable application blending frontend and backend API.
- **Styling**: `Vanilla CSS` with CSS Modules to construct a premium, fluid, interactive UI, avoiding bloat while giving us the Google Antigravity-level aesthetic (deep blacks, glassmorphism, glowing accents, and smooth micro-animations).
- **Authentication**: `NextAuth.js` with the Google Provider.
- **Database**: `Prisma ORM` with `SQLite`.

### 1. Project Initialization & Setup
---
#### [NEW] `/Users/ramkumar/Desktop/Eco-Hub/...`
We will initialize the Next.js application, install Prisma, NextAuth, and configure the basic folder structure (`app/`, `components/`, `lib/`, `styles/`).
We will also create a custom `global.css` setting up our premium color palette, modern typography (Google Font 'Inter' or 'Outfit'), and animation keyframes.

### 2. Database Schema (Prisma)
---
#### [NEW] `prisma/schema.prisma`
We will define models for:
- `User` (email, name, image)
- `EmissionRecord` (type: electricity, diesel, canteen; amount, date, calculatedCarbon)
- `SustainabilityIdea` (title, description, author, upvotes, date)

### 3. Authentication & API Routes
---
#### [NEW] `app/api/auth/[...nextauth]/route.js`
Implement Google sign-in. It will verify the email domain (`@mepcoeng.ac.in`) before allowing user creation or login.
#### [NEW] `app/api/weather/route.js`
A server-side wrapper to securely call the OpenWeatherMap API for Sivakasi, ensuring your API key is never exposed to the client browser.

### 4. Application Frontend Pages
---
#### [NEW] `app/page.js` - The Masterpiece Landing Page
A beautifully animated, dark-themed hero section introducing the Eco-Hub. Features login buttons and dynamic background effects.
#### [NEW] `app/dashboard/page.js` - User Dashboard
The central hub visually presenting the Carbon Footprint data. It will incorporate the Sivakasi weather module, graphs (using Chart.js or Recharts), and a summary of weekly/monthly emissions.
#### [NEW] `app/calculator/page.js` - Data Entry Form
A cleanly designed, glassmorphism-styled form for entering monthly TANGEDCO electricity bills, diesel invoices, and canteen records. The server actions will automatically convert these into standard CO2e (carbon dioxide equivalent) metrics.
#### [NEW] `app/complaints/page.js` - Idea/Complaint Box
A feedback section allowing students to post waste management ideas, complete with an aesthetic upvote/downvote system.

## ❓ Open Questions

1. **Design Preferences**: To match the "Google Antigravity" vibe, I will use a very dark space-like aesthetic with subtle glowing neon accents and smooth fade-in animations on scroll. Does this sound good, or did you have a specific color theme in mind?
2. **Carbon Calculation Formulas**: For the calculator, do you have specific multipliers for the carbon emission (e.g., kg CO2 per kWh of TANGEDCO electricity, kg CO2 per liter of diesel), or should I use standard global metrics for now which we can tweak later?

## 🧪 Verification Plan

### Automated/Manual Verification
1. Verify the project runs smoothly locally (`npm run dev`).
2. Test Google Auth specifically attempting to log in with a non-Mepco email (should fail) and a valid Mepco email (should succeed).
3. Verify the layout and animations look beautiful and respond well on both desktop and mobile views.
4. Input manual dummy data and verify that the dashboard graphs update correctly.
5. Verify the OpenWeatherMap API successfully displays the live weather for Sivakasi.

---
**Let me know your thoughts on the domain restrictions, API keys, and database. Once you approve this masterpiece plan, I'll run the turbo engines and start building!** 🚀🔥
