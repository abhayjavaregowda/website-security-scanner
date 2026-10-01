# Upstream Attribution

## Original project

- **Project:** Web-Check
- **Repository:** https://github.com/lissy93/web-check
- **Original author:** Alicia Sykes (`lissy93`)
- **License:** MIT License
- **Exact upstream commit:** `daa935f174531e04811e99e554ed1ba90c9492cf`

The upstream license text and copyright notice are preserved without modification in [LICENSE](./LICENSE).

## What Website Security Scanner preserves

Website Security Scanner retains the existing Web-Check scanner, API handlers, job orchestration and result components. This includes the upstream DNS, SSL/TLS, HTTP header, redirect, cookie, technology, security, performance, domain, network, port and server-related functionality available at the commit above.

## Major Website Security Scanner modifications

- Renamed the visible product and metadata to **Website Security Scanner — Website Security & Infrastructure Intelligence**
- Added a new logo, OpenGraph treatment, navigation and responsive visual system
- Redesigned the scan entry page and enhanced result-card presentation and transitions
- Added browser-local scan baseline persistence
- Added deterministic field-level change detection with Changed, Added, Removed and Unchanged groups
- Added safeguards so failed or skipped current checks are not reported as removed baseline data
- Added baseline engine and persistence tests
- Added reduced-motion and keyboard-focus behavior
- Added a deployment-only Vercel catch-all that routes requests to the existing scanner handlers without duplicating their logic
- Reworked the README as a portfolio and deployment document

No authorship is claimed over Web-Check's original scanner implementation. No AI, paid API, authentication service or database has been added.
