# Specification

## Summary
**Goal:** Simplify user creation by removing the principal ID field and auto-generating it server-side.

**Planned changes:**
- Remove principal ID input field from CreateUserDialog form component
- Update useCreateUser mutation to remove principal ID parameter from input
- Modify backend createUser method to automatically generate unique principal IDs for new users

**User-visible outcome:** Users can create new accounts without needing to manually enter or understand principal IDs - the system handles this automatically.
