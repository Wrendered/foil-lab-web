# Development Environment Setup & Tracking

## Environment Control Strategy

### 1. Node Version Management
- **File**: `.nvmrc` - Locks Node.js to v18.17.0
- **Usage**: 
  ```bash
  nvm use  # Automatically uses correct Node version
  ```

### 2. Dependency Locking
- **File**: `package-lock.json` - Exact dependency versions
- **Strategy**: Always commit lock file changes
- **Updates**: Use `npm ci` for exact reproduction

### 3. Environment Variables
```bash
# .env.local (for local development)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development

# .env.example (committed to repo)
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_ENV=
```

### 4. Development Branches
```
main
├── feature/react-migration-plan (current)
│   ├── stage-1.1-project-setup
│   ├── stage-1.2-file-upload
│   ├── stage-1.3-api-integration
│   ├── stage-1.4-parameter-controls
│   └── stage-1.5-results-display
```

## Dependency Tracking

### Core Dependencies Added
```json
{
  "dependencies": {
    "@radix-ui/themes": "^3.0.0",
    "@radix-ui/react-icons": "^1.3.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.400.0",
    "@tanstack/react-query": "^5.32.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "prettier": "^3.2.0",
    "eslint-config-prettier": "^9.1.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^15.0.0",
    "@playwright/test": "^1.43.0"
  }
}
```

## Git Workflow

### Feature Development
```bash
# Start new stage
git checkout feature/react-migration-plan
git checkout -b stage-1.1-project-setup

# Work on stage
git add .
git commit -m "feat: implement design system foundation"

# Create PR for review
git push origin stage-1.1-project-setup
```

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

## Testing Strategy

### Unit Tests (Vitest)
```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report
```

### Integration Tests (Playwright)
```bash
npm run test:e2e    # Run E2E tests
npm run test:e2e:ui # Open Playwright UI
```

### Component Testing (Storybook)
```bash
npm run storybook   # Development
npm run build-storybook # Production build
```

## CI/CD Pipeline

### GitHub Actions (.github/workflows/ci.yml)
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### Vercel Preview Deployments
- Automatic on PR creation
- Environment variables per branch
- Preview URL pattern: `[branch-name]-foil-lab.vercel.app`

## Development Commands

### Daily Development
```bash
# Start development
nvm use
npm install
npm run dev

# Before committing
npm run lint:fix
npm run test
npm run type-check
```

### Stage Completion
```bash
# Verify stage works
npm run test:stage-1.1
npm run build
npm run preview

# Merge back
git checkout feature/react-migration-plan
git merge stage-1.1-project-setup
```

## Monitoring Development Progress

### 1. Stage Tracking (GitHub Projects)
- Each stage = GitHub issue
- Automated PR linking
- Progress visualization

### 2. Performance Tracking
```bash
# Bundle size analysis
npm run analyze

# Lighthouse CI
npm run lighthouse
```

### 3. Dependency Updates
```bash
# Check for updates (don't auto-update)
npm outdated

# Update carefully with testing
npm update [package-name]
npm test
```

## Environment Variables Documentation

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_ENV` | Environment name | `development` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token | `pk.xxx` |

### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking | `null` |
| `ANALYZE` | Bundle analysis | `false` |

## Rollback Procedures

### Quick Rollback
```bash
# Revert last commit
git revert HEAD
git push

# Revert to specific version
git checkout [commit-hash] -- .
npm ci
```

### Vercel Rollback
- Use Vercel dashboard
- Instant rollback to previous deployment
- No code changes needed

This setup ensures consistent, trackable development across all stages!