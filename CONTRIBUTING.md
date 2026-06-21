# Contributing to SmartAppraisal

We love your input! We want to make contributing to SmartAppraisal as easy and transparent as possible.

## Development Process

1. Fork the repo and create your branch from `develop`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Pull Request Process

1. Update the README.md with details of changes if needed.
2. Update the CHANGELOG.md with your changes.
3. The PR will be merged once you have the sign-off of two other developers.
4. After merging, you may delete your branch.

## Code Style

### Python
- Follow PEP 8
- Use Black for formatting
- Add type hints
- Write docstrings for all functions
- Use meaningful variable names

### JavaScript/React
- Use ESLint
- Follow Airbnb style guide
- Use functional components
- Add PropTypes or TypeScript
- Write unit tests

## Commit Messages

Format: `type(scope): subject`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactor
- `perf`: Performance
- `test`: Testing
- `chore`: Maintenance

## Testing

### Backend
```bash
pytest tests/ -v --cov=app
```

### Frontend
```bash
npm test -- --coverage
```

### E2E
```bash
npx playwright test
```

## Reporting Bugs

Before creating a bug report:
1. Check if the bug has already been reported
2. Check if the bug has been fixed (try latest version)
3. Collect information about the bug:
   - Stack trace (if applicable)
   - OS and version
   - Browser and version (if applicable)
   - Steps to reproduce

## Feature Requests

- Use the issue tracker
- Describe the feature clearly
- Explain why this feature would be useful
- Suggest implementation if possible

## Questions?

Feel free to ask in our GitHub Discussions or Slack channel.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
