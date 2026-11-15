# VYRO Security Specification & Firestore Rules TDD

## 1. Data Invariants
1. **Permanent Role Invariant**: A user's `role` (`retailer` or `wholesaler`) is set once when `/profiles/{uid}` is created and can NEVER be mutated on update. `/businesses/{uid}.role` MUST match `/profiles/{uid}.role`.
2. **Ownership Isolation (PII Protection)**: Every document in `profiles`, `businesses`, `business_addresses`, `business_verifications`, `user_preferences`, and `deletion_requests` contains PII and is strictly readable and writable ONLY by `request.auth.uid == uid`. List queries are explicitly denied (`allow list: if false`).
3. **Unique Mobile Number Mapping**: `/phone_registry/{phoneHash}` enforces 1:1 mapping from hashed verified mobile number to `uid` and cannot be overwritten or listed by other users.
4. **No Self-Verified KYC**: Clients can never set `business_verifications/{uid}.kycStatus = 'verified'` or `aadhaarVerified = true` directly.
5. **Temporal Integrity**: All `createdAt` and `updatedAt` fields must match `request.time` on creation/update, and `createdAt` is immutable on update.
6. **Strict Schema Enforcement**: Every collection validates required keys, allowed keys (`hasOnly`), string `.size()` bounds, PIN code regex (`^[1-9][0-9]{5}$`), and `isValidId(id)` guards.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Cross-User Profile Read**: User B attempts `get(/profiles/userA_uid)`.
2. **Blanket Profile Listing**: Authenticated user attempts `list(/profiles)` to scrape phone numbers and emails.
3. **Role Privilege Escalation**: Retailer attempts `update(/profiles/uid, { role: 'wholesaler', updatedAt: serverTimestamp() })`.
4. **Shadow Ghost Field Injection**: User attempts `create(/profiles/uid, { ..., isAdmin: true })` or `update(..., { isVerified: true })`.
5. **Self-Verified KYC Bypass**: User attempts `create(/business_verifications/uid, { ..., kycStatus: 'verified', aadhaarVerified: true })`.
6. **Business Role Mismatch**: Wholesaler attempts `create(/businesses/uid, { role: 'retailer', ... })` while `/profiles/uid.role == 'wholesaler'`.
7. **ID Poisoning**: User attempts `get(/profiles/a_very_long_200_char_invalid_id$$$)`.
8. **Fake Client Timestamp**: User attempts `create(/profiles/uid, { ..., createdAt: '2020-01-01T00:00:00Z' })` instead of `request.time`.
9. **Immutable createdAt Tamper**: User attempts `update(/businesses/uid, { createdAt: serverTimestamp() })`.
10. **Invalid PIN Code Poisoning**: User attempts `create(/business_addresses/uid, { ..., residentialPincode: '00000' })`.
11. **Duplicate Phone Hijack**: User B attempts `create(/phone_registry/userA_phoneHash, { uid: userB_uid, ... })` or `update` existing `phone_registry` doc.
12. **Unauthenticated Write**: Anonymous/unauthenticated caller attempts write to any collection.
