# CLAUDE.md - Foil Lab Web (REDIRECT STUB ONLY)

## !! STOP - DO NOT DEVELOP HERE !!

This repo is **ONLY** a redirect stub. There is NO frontend code here.

**The actual frontend is at**: `/Users/wrench/Software/foil-lab/frontend/`

## What This Repo Contains

```
foil-lab-web/
├── vercel.json       # Redirect config for Vercel
├── public/
│   └── index.html    # Fallback redirect page
├── CLAUDE.md         # This file
└── .git/             # Version history
```

That's it. Everything else was deleted to prevent confusion.

## Why This Exists

This repo was the original standalone frontend before we migrated to a monorepo. It's kept only because:
- Vercel may still be configured to deploy from this repo
- The vercel.json redirects all traffic to the Railway production URL

## The Real Code Location

| Component | Path |
|-----------|------|
| **Frontend** | `/Users/wrench/Software/foil-lab/frontend/` |
| **Backend** | `/Users/wrench/Software/foil-lab/backend/` |
| **Root docs** | `/Users/wrench/Software/foil-lab/CLAUDE.md` |

## If You're Here By Mistake

1. **STOP** - Do not create or modify any code here
2. Navigate to the monorepo: `cd /Users/wrench/Software/foil-lab`
3. Read the CLAUDE.md there for guidance
4. Work in `foil-lab/frontend/` for frontend changes

## Historical Context

On Dec 22-23, 2024, we accidentally developed wind compass UI here instead of in the monorepo. The code was manually copied to `foil-lab/frontend/` and this repo was stripped to prevent future confusion.
