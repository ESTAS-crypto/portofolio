<div align="center">

# ✨ Evan Atharasya — Portfolio

### *Crafting Digital Experiences*

[![Live Demo](https://img.shields.io/badge/🔗_Live_Demo-8b5cf6?style=for-the-badge&logoColor=white)](https://evanatharasya.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ESTAS-crypto)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/evanatharasya.x)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/evan-atharasya-64b1621b7/)

<br/>

<img src="docs/preview.png" alt="Portfolio Preview" width="100%" style="border-radius: 12px;" />

<br/>

*A modern, interactive developer portfolio built with React & Framer Motion.*
*Featuring glassmorphism design, smooth animations, and real-time GitHub integration.*

</div>

---

## 🚀 Features

| Feature | Description |
|:---:|---|
| 🎨 | **Glassmorphism UI** — Premium dark theme with glass-effect cards, gradient accents, and noise overlay |
| ✨ | **Micro-animations** — Smooth scroll reveals, magnetic buttons, typing effects, and floating orbs powered by Framer Motion |
| 📱 | **Fully Responsive** — Optimized for desktop, tablet, and mobile with adaptive bottom navigation bar |
| 🔗 | **Live GitHub Integration** — Projects fetched from GitHub API with smart caching (30-min TTL) to avoid rate limiting |
| 🌐 | **Social Links** — Direct links to GitHub, Instagram, and LinkedIn with proper SVG brand icons |
| ⚡ | **Performance** — Intersection Observer-based lazy animations, no unnecessary re-renders |
| 🛡️ | **Error Resilience** — Graceful fallback UI when GitHub API is rate-limited, with retry functionality |
| 🧩 | **Modular Architecture** — Centralized constants, shared hooks, and reusable icon components |

---

## 🖼️ Sections

<div align="center">

| | Section | Description |
|:---:|:---|:---|
| 🏠 | **Hero** | Animated intro with typing effect & floating orbs |
| 👤 | **About** | Bio, skill bars & GitHub stats in a bento grid |
| 💼 | **Projects** | Live repo cards fetched from GitHub API |
| ⚡ | **Skills** | Infinite-scroll tech stack marquee |
| 📋 | **Experience** | Interactive expandable timeline |
| ✉️ | **Contact** | Message form & social media cards |

</div>

---

## 🛠️ Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

</div>

---

## 📁 Project Structure

```
src/
├── constants.js          # 📋 All data constants (edit here → updates everywhere)
├── hooks/
│   ├── useIsMobile.js    # 📱 Responsive breakpoint hook
│   └── useGitHub.js      # 🔗 Cached GitHub API utility
├── components/
│   ├── Icons.jsx         # 🎨 Shared SVG icon components
│   ├── Navbar.jsx        # 🧭 Desktop nav + mobile bottom bar
│   ├── Hero.jsx          # 🏠 Landing section with parallax
│   ├── About.jsx         # 👤 Bio + skills bento grid
│   ├── Projects.jsx      # 💼 GitHub repos with cards
│   ├── Skills.jsx        # ⚡ Infinite marquee tech stack
│   ├── Experience.jsx    # 📋 Interactive timeline
│   ├── Contact.jsx       # ✉️ Form + social cards
│   ├── Footer.jsx        # 📄 Footer with gradient
│   └── CustomCursor.jsx  # 🖱️ Custom cursor (desktop only)
├── index.css             # 🎨 Global styles + responsive queries
├── App.jsx               # 📦 Root component
└── main.jsx              # 🚀 Entry point
```

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/ESTAS-crypto/portofolio.git

# Navigate to the project
cd portofolio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔧 Configuration

All personal data is centralized in **`src/constants.js`**:

```javascript
// Change your social links
export const SOCIAL_LINKS = [
  { name: 'GitHub',    url: 'https://github.com/ESTAS-crypto', ... },
  { name: 'Instagram', url: 'https://instagram.com/evanatharasya.x', ... },
  { name: 'LinkedIn',  url: 'https://linkedin.com/in/...', ... },
];

// Change your skills, experience, tech stack, etc.
export const SKILLS = [ ... ];
export const EXPERIENCES = [ ... ];
export const TECH_STACK = [ ... ];
```

| Want to change... | Edit in `constants.js` |
|---|---|
| Social media links | `SOCIAL_LINKS` |
| GitHub username | `GITHUB_USERNAME` |
| Name & tagline | `PROFILE` |
| Skills & levels | `SKILLS` |
| Tech stack marquee | `TECH_STACK` |
| Experience timeline | `EXPERIENCES` |
| Nav items | `NAV_ITEMS` |

---

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready for deployment on Vercel, Netlify, or any static hosting.

---

## 🎨 Design Philosophy

- **Dark-first** — Deep navy/black background with vibrant purple accents
- **Glassmorphism** — Frosted glass cards with subtle borders and blur effects
- **Motion-driven** — Every interaction has purpose; nothing is static
- **Mobile-native** — Touch-optimized bottom nav, larger tap targets, reduced animations on mobile
- **Data-driven** — Projects pull from GitHub API, stats update automatically

---

<div align="center">

### Made with 💜 by Evan Atharasya

*If you like this portfolio, consider giving it a ⭐!*

</div>
