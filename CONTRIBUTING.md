# Contributing to AdSphere

## Git Workflow

We follow **GitHub Flow** with **Conventional Commits**.

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Urgent production fixes
- `release/x.y.z` - Release branches

### Commit Convention

```
feat: add campaign analytics dashboard
fix: resolve ad rendering timeout
refactor: optimize database queries
perf: improve cache hit ratio
docs: update API documentation
test: add fraud detection tests
ci: optimize build pipeline
chore: update dependencies
```

### PR Process

1. Create branch from `develop`
2. Implement changes with conventional commits
3. Push and create Pull Request to `develop`
4. Ensure CI passes (lint, typecheck, test, build)
5. Get at least one code review approval
6. Squash merge into `develop`

### Release Process

1. Create `release/x.y.z` from `develop`
2. Bump version, update CHANGELOG
3. Create PR to `main`
4. After merge, tag with `vx.y.z`
5. Merge back to `develop`

## Development Setup

See [README.md](README.md) for setup instructions.

## Code Standards

- Clean Architecture (layered: controller → service → repository)
- SOLID principles
- DRY, KISS, YAGNI
- TypeScript strict mode
- Unit test coverage > 90%
- No `any` types
- Proper error handling with custom exceptions
- Input validation on all endpoints
