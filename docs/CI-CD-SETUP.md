# CI/CD Setup & Development Workflow

## Overview

Dit project heeft een complete CI/CD pipeline met geautomatiseerde code quality checks, branch protection, en een multi-stream development workflow.

## Branch Structure

```
main (productie)
  ↑
accept (QA/testing)
  ↑
develop (centrale development)
  ↑
feature/TL-techlead (Tech Lead stream)
feature/BE-backend (Backend stream)
feature/FE-frontend (Frontend stream)
```

### Branch Protection Rules

- **`main`**: Alleen via `accept` branch, vereist review + CI checks
- **`accept`**: Alleen via `develop` branch, vereist review + CI checks
- **`develop`**: Feature branches kunnen mergen na review + CI checks

## Local Development Checks

### Pre-commit Hooks (Snelle Checks)

Worden automatisch uitgevoerd bij elke `git commit`:

1. **Secret Detection**: Blokkeert commits van `.env*` bestanden (behalve `.example`)
2. **Lint-staged**: Voert checks uit op alleen staged bestanden (snel!)
   - **ESLint** met auto-fix op TypeScript/JavaScript bestanden
   - **Prettier** formatting op alle relevante bestanden
3. **TypeScript Check**: Compileert staged `.ts/.tsx` bestanden

### Pre-push Hooks (Volledige Checks)

Worden automatisch uitgevoerd bij elke `git push`:

1. **Full TypeScript Compilation**: Controleert hele project
2. **Wasp Validation**: Verifieert Wasp configuratie
3. **ESLint**: Lint alle bestanden (max 0 warnings)

### Hooks Omzeilen (Noodgevallen)

```bash
# Skip pre-commit hooks
git commit --no-verify

# Skip pre-push hooks
git push --no-verify
```

## GitHub Actions CI/CD

### Trigger: Pull Requests Only

CI draait **alleen** op Pull Requests naar:

- `develop`
- `accept`
- `main`

**Geen CI spam** op feature branch commits!

### CI Pipeline Jobs

#### 1. Lint and Type Check

- **ESLint**: Max 0 warnings toegestaan
- **Prettier**: Formatting check
- **TypeScript**: Compilation check

#### 2. Build Check

- **Wasp Build**: Verifieert dat de app succesvol build
- **Dependencies**: Installeert alle benodigde packages

### CI Requirements

- **Alle checks moeten slagen** voordat PR gemerged kan worden
- **Branch protection** via GitHub settings
- **Review vereist** voor alle merges naar protected branches

## Development Workflow

### 1. Feature Development

```bash
# Start vanuit develop
git checkout develop
git pull origin develop

# Maak feature branch
git checkout -b feature/my-feature

# Development work...
git add .
git commit -m "Add feature X"  # Pre-commit hooks draaien
git push origin feature/my-feature  # Pre-push hooks draaien

# Create Pull Request naar develop
```

### 2. Code Review & Merge

1. **Create PR**: `feature/my-feature` → `develop`
2. **CI Checks**: GitHub Actions draait automatisch
3. **Code Review**: Team member reviewt de code
4. **Merge**: Na goedkeuring + CI success

### 3. QA/Testing Flow

```bash
# Van develop naar accept
git checkout develop
git pull origin develop
git checkout accept
git merge develop
git push origin accept
```

### 4. Production Release

```bash
# Van accept naar main
git checkout accept
git pull origin accept
git checkout main
git merge accept
git push origin main
```

## Configuration Files

### ESLint Configuration

- **File**: `app/.eslintrc.json`
- **Rules**: TypeScript, React, React Hooks
- **Auto-fix**: Enabled voor veel regels

### Lint-staged Configuration

- **File**: `.lintstagedrc.json`
- **Scope**: Alleen staged bestanden
- **Excludes**: `node_modules/**`

### Husky Hooks

- **Pre-commit**: `.husky/_pre-commit.sh`
- **Pre-push**: `.husky/_pre-push.sh`
- **Config**: `package.json` (root level)

### GitHub Actions

- **File**: `.github/workflows/pr-checks.yml`
- **Triggers**: Pull requests to protected branches
- **Jobs**: Lint, TypeCheck, Build

## Troubleshooting

### Pre-commit Hook Fails

```bash
# Check wat er mis ging
git commit -m "Your message"

# Fix de issues en probeer opnieuw
# Of skip in noodgeval
git commit --no-verify -m "Emergency fix"
```

### Pre-push Hook Fails

```bash
# Check TypeScript errors
cd app && npx tsc --noEmit

# Check ESLint errors
cd app && npx eslint . --ext .ts,.tsx

# Fix issues en push opnieuw
# Of skip in noodgeval
git push --no-verify
```

### CI Pipeline Fails

1. **Check GitHub Actions tab** in de PR
2. **Fix de issues** lokaal
3. **Push nieuwe commit** naar de feature branch
4. **CI draait automatisch** opnieuw

## Best Practices

### Voor Developers

1. **Commit vaak**: Kleine, logische commits
2. **Test lokaal**: Hooks geven snelle feedback
3. **Review code**: Gebruik PR reviews voor kwaliteit
4. **Fix CI issues**: Los problemen op voordat merge

### Voor Tech Leads

1. **Review PRs**: Zorg voor code kwaliteit
2. **Merge strategy**: Gebruik squash/rebase voor clean history
3. **Branch protection**: Configureer in GitHub settings
4. **Monitor CI**: Zorg dat pipeline gezond blijft

### Voor QA/Testing

1. **Test in accept**: Gebruik accept branch voor testing
2. **Report issues**: Maak issues voor bugs
3. **Verify fixes**: Test fixes in accept branch
4. **Approve releases**: Goedkeuren voor main merge

## Monitoring & Maintenance

### Regular Tasks

- **Update dependencies**: Houd ESLint, Prettier, etc. up-to-date
- **Review hook performance**: Zorg dat hooks snel blijven
- **Monitor CI times**: Optimaliseer GitHub Actions
- **Update documentation**: Houd deze docs up-to-date

### Performance Optimization

- **Lint-staged**: Alleen staged files = snel
- **Parallel jobs**: GitHub Actions draait jobs parallel
- **Caching**: npm cache in CI voor snelheid
- **Selective checks**: Alleen relevante checks per file type

## Security Considerations

- **Secret detection**: Hooks blokkeren `.env*` commits
- **Branch protection**: Voorkomt direct pushes naar main
- **Review requirements**: Alle changes worden gereviewd
- **CI validation**: Build checks voorkomen broken deploys

---

**Laatste update**: Oktober 2025  
**Versie**: 1.0  
**Status**: Actief in gebruik
