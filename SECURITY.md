# Security Policy

Sanchika is a design-system SDK. It should not collect, process, upload, or store
user data.

## Sensitive Data

Do not include real or realistic sensitive compliance artifacts in issues, pull
requests, fixtures, screenshots, or examples:

- PAN, GSTIN, Aadhaar, bank account numbers, taxpayer names, phone numbers, or
  personal addresses.
- Portal cookies, tokens, credentials, OTPs, CAPTCHA responses, or session data.
- Notices, invoices, returns, ledgers, downloaded files, local paths, or browser
  profiles from real users.

Use synthetic fixtures and clearly mark them as synthetic.

## Reporting

After the GitHub repository is created, enable GitHub private vulnerability
reporting and use that channel for suspected vulnerabilities or sensitive-data
exposure. Until that setting is enabled, report privately to the repository
owner `lamemustafa` through the private channel used to grant repository access
instead of opening a public issue.

## Post-Create Checklist

- Enable GitHub private vulnerability reporting before public issue templates
  invite external reports.
- Keep security reports out of public issues and pull requests until triaged.
- Remove or rotate any accidental sensitive material before release tags or npm
  packages are created.
