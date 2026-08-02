# Security policy

## Supported version

Security fixes are applied to the latest release on `main`.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Use GitHub's **Report a vulnerability** option in the repository Security tab, or contact the repository owner privately through the profile at [github.com/hoque07](https://github.com/hoque07).

Include the affected component, reproduction steps, impact, and any suggested mitigation. Never include real API keys, passwords, private reading data, or database backups in a report.

## Deployment reminder

Before public backend deployment, replace all example credentials, use a strong `SECRET_KEY`, disable demo seeding, restrict CORS, use HTTPS and managed PostgreSQL backups, and keep OpenAI keys only in server-side environment variables.
