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

GitHub private vulnerability reporting for `lamemustafa/sanchika` must be
enabled before the repository is opened to public issue intake. Use that channel
for suspected vulnerabilities or sensitive-data exposure. Do not open a public
issue or pull request containing sensitive material.

## Post-Create Checklist

- Enable GitHub private vulnerability reporting before public issue templates
  invite external reports.
- Keep security reports out of public issues and pull requests until triaged.
- Remove or rotate any accidental sensitive material before release tags or npm
  packages are created.
