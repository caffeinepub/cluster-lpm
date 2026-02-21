# Specification

## Summary
**Goal:** Fix login authentication flow to resolve Version 17 login failure and eliminate post-login error message.

**Planned changes:**
- Revert authentication logic to Version 16 state to restore working login functionality
- Remove or fix the 'user is already authenticated' error message that appears after successful login

**User-visible outcome:** Users can successfully log in using Internet Identity without encountering blocking errors or 'already authenticated' messages, and are redirected smoothly to their dashboard.
