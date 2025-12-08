# Contributing Guidelines

## Code Style

### TypeScript
- Use strict mode (`strict: true` in tsconfig.json)
- Prefer interfaces for object types
- Use enums for constants
- Add JSDoc comments for public APIs

### React/Next.js
- Functional components only
- Use React hooks (useEffect, useState, etc)
- Keep components under 200 lines
- Extract reusable components
- Use next/navigation for routing

### NestJS/Backend
- Organize code by modules
- Use dependency injection
- Keep services focused (single responsibility)
- Use DTOs for request/response validation
- Add comprehensive error handling

## Git Workflow

### Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/**`: Feature branches
- `bugfix/*`: Bug fix branches

### Commit Messages
```
type(scope): subject

body (optional)

footer (optional)
```

Types: feat, fix, docs, style, refactor, test, chore

Example:
```
feat(persons): add multilingual name validation

- Implement Zod schema for translated name fields
- Add error messages for all three languages
- Update form to display validation errors

Closes #42
```

### Pull Request Process
1. Create branch from `develop`
2. Make changes with tests
3. Update documentation
4. Push and create PR
5. Request review
6. Address feedback
7. Merge when approved

## Testing Requirements

### Frontend
- All form validations must have tests
- API integration tests for CRUD operations
- Component tests for interactive elements
- Run: `npm test`

### Backend
- Service unit tests
- Controller integration tests
- Database operation tests
- Run: `npm test`

### Coverage Targets
- Minimum: 60% statement coverage
- Target: 80% for critical paths

## Code Review Checklist

### Before submitting PR
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] No console errors/warnings
- [ ] Documentation updated
- [ ] No hardcoded secrets/keys

### Reviewer checklist
- [ ] Code is readable and maintainable
- [ ] Logic is correct and efficient
- [ ] Error handling is comprehensive
- [ ] Tests are adequate
- [ ] No security vulnerabilities
- [ ] Performance impact considered

## Performance Guidelines

### Frontend
- Bundle size < 200KB (gzipped)
- Lighthouse score > 80
- First Contentful Paint < 1s
- Time to Interactive < 2s

### Backend
- API response time < 200ms
- Database query time < 100ms
- Memory usage stable over time

## Security Checklist

### Code Security
- [ ] No hardcoded secrets
- [ ] Environment variables used properly
- [ ] Input validation on all endpoints
- [ ] Output encoding for HTML/JSON
- [ ] No SQL injection vulnerabilities
- [ ] CORS properly configured

### Dependency Security
- [ ] npm audit passes (no critical issues)
- [ ] Dependencies updated regularly
- [ ] License compliance checked

## Documentation Requirements

### Code Comments
- Complex algorithms: explain the logic
- Non-obvious code: explain intent
- Public APIs: JSDoc comments
- Keep comments up to date

### README Updates
- Document new features
- Update API endpoints
- Include setup instructions
- Add troubleshooting section

## Release Process

### Version Numbering
Semantic Versioning: MAJOR.MINOR.PATCH

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Tag created
- [ ] Release notes written

### Deployment
- [ ] Code review completed
- [ ] Tests pass on CI/CD
- [ ] Staging deployment verified
- [ ] Production deployment
- [ ] Monitoring confirmed

## Troubleshooting Common Issues

### Build Errors
```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Test Failures
```bash
# Run specific test file
npm test -- __tests__/validation.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Database Issues
```bash
# Reset database in Docker
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migrate
```

## Getting Help

- **Technical Questions**: Check TECHNICAL_DOCUMENTATION.md
- **Setup Issues**: See INSTALLATION.md or DEPLOYMENT.md
- **Bug Reports**: Open GitHub issue with reproduction steps
- **Feature Requests**: Start discussion in GitHub Discussions
