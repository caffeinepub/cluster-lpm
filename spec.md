# Specification

## Summary
**Goal:** Fix the infinite loading state on the login page when authenticating via Internet Identity.

**Planned changes:**
- Investigate and fix the login flow so the loading state resolves after authentication completes
- Ensure successful authentication redirects users with an existing profile to the correct dashboard (admin or hotel)
- Ensure successful authentication redirects users without a profile to the profile setup page
- Display an error message if authentication fails instead of leaving the spinner indefinitely

**User-visible outcome:** Users can log in via Internet Identity without getting stuck in an infinite loading state, and are correctly redirected based on their profile status.
