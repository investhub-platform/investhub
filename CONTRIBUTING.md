# Contributing Guide

This repository uses a strict, submission-friendly Git workflow.

## Branching

- Create one feature branch per change.
- Use clear branch names such as `feat/backend-validation`, `feat/swagger-ui`, or `fix/startup-pagination`.
- Do not commit unrelated changes in the same branch.

## Commit Rules

- Keep commits atomic and focused on one logical change.
- Use meaningful commit messages in the imperative mood.
- Preferred formats:
  - `feat: add startup pagination`
  - `fix: enforce minimum investment on backend`
  - `docs: add Swagger UI setup instructions`
  - `test: add request validation coverage`

## Pull Request Rules

- Every PR should include a short summary of what changed and why.
- Mention any environment variables, database changes, or deployment steps that are required.
- Include screenshots or API examples when the change affects UI or API behavior.
- Run the relevant tests before requesting review.

## Review Checklist

- Code follows the existing architecture and naming conventions.
- API responses remain consistent.
- Validation and error handling are covered.
- Tests pass locally.
- Documentation is updated when behavior changes.

## Submission Standard

- Keep the final history readable.
- Prefer a small number of clean commits over many noisy ones.
- Avoid force-pushing rewritten history unless absolutely necessary.