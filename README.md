<div align="center">

# 画像辞書 · Image Dictionary

**Learn Japanese vocabulary through visual connections**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)

<br />

<img src="screenshots/hero.png" alt="Image Dictionary Grid View" width="800" />

</div>

<br />

## Why Image Dictionary?

Traditional flashcard apps show you a word and its translation. **Image Dictionary** goes further — it lets you build **visual mind maps** by linking related words together in a 3×3 grid.

Place 山 (mountain) at the center, surround it with 森 (forest), 川 (river), 雲 (cloud), and suddenly you're not memorizing isolated words — you're building a mental landscape where vocabulary lives in context.

**The science:** Our brains remember images and spatial relationships far better than text alone. By associating words visually, you create stronger neural pathways and recall vocabulary faster.

<br />

<div align="center">
<table>
<tr>
<td align="center">
<img src="screenshots/grid.png" alt="3x3 Word Relationship Grid" width="380" />
<br />
<sub><b>Visual word associations in a 3×3 grid</b></sub>
</td>
<td align="center">
<img src="screenshots/gridadd.png" alt="Adding words to the grid" width="380" />
<br />
<sub><b>Link related vocabulary to any position</b></sub>
</td>
</tr>
</table>
</div>

<br />

## Features

- 🧠 **Visual word linking** — Connect related vocabulary in 3×3 grids to build memorable associations
- 📸 **Image-based learning** — Every word paired with a visual for stronger recall
- 🔍 **Smart search** — Find entries by Japanese, romaji, or English
- 🎨 **Masonry grid layout** — Pinterest-style browsing experience
- 🏷️ **Tag organization** — Categorize and filter your vocabulary
- 📝 **Furigana support** — Readings displayed above kanji
- 🎌 **JLPT levels** — Organize by proficiency level (N5–N1)
- 🎬 **Animated image support** — Full GIF and animated WebP processing
- 📱 **Fully responsive** — Works on desktop, tablet, and mobile

<br />

<div align="center">
<table>
<tr>
<td align="center">
<img src="screenshots/entry.png" alt="Entry Form" width="380" />
<br />
<sub><b>Entry Form</b></sub>
</td>
<td align="center">
<img src="screenshots/imagecrop.png" alt="Image Gif and Webp cropping" width="380" />
<br />
<sub><b>Image, GIF & WebP Cropping</b></sub>
</td>
</tr>
</table>
</div>

<br />

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) 14+

### 1. Clone & Setup

```bash
git clone https://github.com/TomMannion/image-dictionary.git
cd image-dictionary

# Create the database
createdb imagedictionary

# Install dependencies & run migrations
npm run setup
```

### 2. Configure Environment

Create `server/.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/imagedictionary"
PORT=3001
NODE_ENV=development
UPLOAD_DIR=./uploads
```

Create `client/.env`:

```env
# Leave empty to use Vite proxy (recommended)
VITE_API_URL=
```

### 3. Start Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

<br />

## How Word Linking Works

1. **Create entries** — Add vocabulary with images, readings, and translations
2. **Open any entry** — Click to view the detail modal
3. **Link related words** — Click grid positions around the center to connect related vocabulary
4. **Build associations** — Group words by theme, kanji radicals, grammar patterns, or any connection that helps you remember

The 3×3 grid places your word at the center with 8 surrounding positions for related terms. Navigate between linked words to explore your vocabulary web.

<br />

## Tech Stack

| Layer        | Technologies                                |
| ------------ | ------------------------------------------- |
| **Frontend** | React 19 · TypeScript · Vite · Tailwind CSS |
| **State**    | TanStack Query · React Hook Form · Zod      |
| **Backend**  | Node.js · Express · TypeScript              |
| **Database** | PostgreSQL · Prisma ORM                     |
| **Images**   | Multer · Sharp                              |

<br />

## Project Structure

```
image-dictionary/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # UI components
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── types/          # TypeScript types
│
├── server/                 # Express backend
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── middleware/     # Express middleware
│       ├── routes/         # API routes
│       └── services/       # Business logic
│
└── package.json            # Root scripts
```

<br />

## API Reference

| Method   | Endpoint            | Description                              |
| -------- | ------------------- | ---------------------------------------- |
| `GET`    | `/api/entries`      | List entries (supports search & filters) |
| `GET`    | `/api/entries/:id`  | Get single entry                         |
| `POST`   | `/api/entries`      | Create entry                             |
| `PUT`    | `/api/entries/:id`  | Update entry                             |
| `DELETE` | `/api/entries/:id`  | Delete entry                             |
| `GET`    | `/api/entries/tags` | List all tags                            |

### Query Parameters

| Parameter   | Type     | Description                                      |
| ----------- | -------- | ------------------------------------------------ |
| `query`     | string   | Search term (word, reading, romaji, translation) |
| `tags`      | string[] | Filter by tags                                   |
| `jlptLevel` | number   | Filter by JLPT level (1-5)                       |
| `page`      | number   | Page number (default: 1)                         |
| `limit`     | number   | Items per page (default: 20)                     |

<br />

## Scripts

```bash
# Development
npm run dev              # Start both frontend & backend
npm run install:all      # Install all dependencies
npm run setup            # Full setup (install + migrations)
npm run build            # Build for production

# Server only
cd server
npm run dev              # Start with hot reload
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run migrations

# Client only
cd client
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run lint             # Run ESLint
```

<br />

## License

MIT
