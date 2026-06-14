# Firestore Security Rules — Required Configuration

These rules must be applied in the Firebase Console (Firestore → Rules tab)
or managed via `firestore.rules` if deploying with Firebase CLI.

---

## Required Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Helper functions ────────────────────────────────────────────────────
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // ── users ───────────────────────────────────────────────────────────────
    // Normal users can read their own profile.
    // Normal users CANNOT update role, accessStatus, or plan directly.
    // Admin can read/write all users.
    match /users/{userId} {
      allow read: if isSignedIn() && (isOwner(userId) || isAdmin());
      allow create: if isSignedIn() && isOwner(userId)
        && !("role" in request.resource.data)
        && !("accessStatus" in request.resource.data);
      allow update: if isSignedIn() && isOwner(userId)
        && !("role" in request.resource.data)
        && !("accessStatus" in request.resource.data)
        && !("plan" in request.resource.data);
      allow write: if isAdmin();
    }

    // ── projects ────────────────────────────────────────────────────────────
    // Users can CRUD only their own projects.
    match /projects/{projectId} {
      allow read, write: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
    }

    // ── rooms ───────────────────────────────────────────────────────────────
    // Users can CRUD only their own rooms.
    match /rooms/{roomId} {
      allow read, write: if isSignedIn() && isOwner(resource.data.ownerId);
      allow create: if isSignedIn() && isOwner(request.resource.data.ownerId);
    }

    // ── messages ────────────────────────────────────────────────────────────
    // Users can read/write messages for rooms they own.
    // (In practice, roomId is used to scope, and ownerId is denormalized.)
    match /messages/{messageId} {
      allow read, write: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
    }

    // ── decisionMemos ───────────────────────────────────────────────────────
    // Users can read/write only their own Decision Memos.
    // Admin can read all (for debugging / admin dashboard).
    match /decisionMemos/{memoId} {
      allow read: if isSignedIn() && (isOwner(resource.data.userId) || isAdmin());
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update: if isSignedIn() && isOwner(resource.data.userId);
      allow delete: if isSignedIn() && (isOwner(resource.data.userId) || isAdmin());
    }

    // ── coupons ─────────────────────────────────────────────────────────────
    // Normal users CANNOT create or update coupons.
    // Normal users CAN read a coupon to validate it (needed for early-access flow).
    match /coupons/{couponId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    // ── couponRedemptions ───────────────────────────────────────────────────
    // Users can create their own redemption record (one per coupon check).
    // Users can only read their own redemptions.
    // Admin can read all.
    match /couponRedemptions/{redemptionId} {
      allow read: if isSignedIn() && (isOwner(resource.data.userId) || isAdmin());
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update, delete: if isAdmin();
    }

    // ── waitlist ────────────────────────────────────────────────────────────
    // Anyone can submit a waitlist entry (pre-auth).
    // Only admin can read/manage.
    match /waitlist/{entryId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // ── feedback ────────────────────────────────────────────────────────────
    // Signed-in users can submit feedback.
    // Only admin can read feedback.
    match /feedback/{feedbackId} {
      allow create: if isSignedIn();
      allow read, update, delete: if isAdmin();
    }

    // ── admin-only collections ───────────────────────────────────────────────
    // Any collection prefixed with "admin_" or explicitly admin-gated.
    match /adminLogs/{docId} {
      allow read, write: if isAdmin();
    }

    match /systemConfig/{docId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## Security Expectations Summary

| Collection         | Normal user (read) | Normal user (write)         | Admin |
|--------------------|--------------------|-----------------------------|-------|
| users              | Own profile only   | Own profile (no role/status) | All   |
| projects           | Own only           | Own only                    | All   |
| rooms              | Own only           | Own only                    | All   |
| messages           | Own only           | Own only                    | All   |
| decisionMemos      | Own only           | Own only                    | All   |
| coupons            | Read (validate)    | BLOCKED                     | All   |
| couponRedemptions  | Own only           | Create own                  | All   |
| waitlist           | BLOCKED            | Create (pre-auth)           | All   |
| feedback           | BLOCKED            | Create (signed-in)          | All   |
| adminLogs          | BLOCKED            | BLOCKED                     | All   |
| systemConfig       | BLOCKED            | BLOCKED                     | All   |

---

## Gaps / Known Limitations

1. **API keys never stored in Firestore** — stored only as environment variables
   on the server (`ANTHROPIC_API_KEY`). Never exposed to client.

2. **Firestore rules currently managed via Firebase Console only** — this file
   documents the required rules but is not automatically deployed. To enable
   source-control deployment, add `firebase.json` and deploy via Firebase CLI.

3. **rooms.ownerId field** — currently the localStorage-backed `roomsService`
   does not set `ownerId`. When migrating to Firestore, ensure `ownerId` is set
   to `request.auth.uid` on every room document.

4. **Admin role check** — the `isAdmin()` helper reads `users/{uid}.role`.
   This requires the `users` collection to exist with a `role` field. Ensure
   new users are created with `role: "user"` by default (server-side only).
