# Security Audit Report - Role-Based Access Control Issues

## 🔴 CRITICAL SECURITY VULNERABILITIES

### 1. **Direct URL Access - No Route Protection**
**Issue**: Users can directly access any route by typing the URL, bypassing role checks.

**Vulnerable Routes:**
- `/analytics` - Organizer only, but accessible via direct URL
- `/edit-event/:eventId` - Organizer only, but accessible via direct URL  
- `/my-history` - Participant only, but accessible via direct URL

**Current Protection**: Only client-side `useEffect` redirects (can be bypassed)

**Risk Level**: 🔴 HIGH
- Participants can view analytics dashboard
- Participants can access event edit pages
- Organizers can access participant history

---

### 2. **Backend API - Missing Role Verification**
**Issue**: Some backend mutations don't verify user roles properly.

**Vulnerable APIs:**

#### ✅ SECURE (Has role checks):
- `events.createEvent` - ✅ Checks organizer role
- `events.deleteEvent` - ✅ Checks organizer role
- `registrations.markAttendance` - ✅ Checks organizer role
- `announcements.createAnnouncement` - ✅ Checks organizer role

#### ⚠️ PARTIALLY SECURE:
- `events.updateEvent` - ❌ NO role check! Anyone can update any event
- `events.reassignOrganizer` - ❌ NO role check! Anyone can reassign events

#### ⚠️ NEEDS OWNERSHIP VERIFICATION:
- `events.updateEvent` - Missing check: Is user the event owner?
- `events.deleteEvent` - Has role check but should also verify ownership
- `announcements.deleteAnnouncement` - Has ownership check ✅

**Risk Level**: 🔴 CRITICAL
- Any user can modify any event
- Participants can update organizer events
- No ownership verification on updates

---

### 3. **Query Access - No Role Restrictions**
**Issue**: Queries don't restrict data based on user role.

**Vulnerable Queries:**
- `events.getEventsByOrganizer` - ❌ Anyone can query any organizer's events
- `registrations.getEventRegistrations` - ❌ Anyone can see all registrations
- `registrations.myRegistrations` - ❌ Anyone can query any user's registrations
- `analytics.*` - ❌ No role checks, anyone can view analytics

**Risk Level**: 🟡 MEDIUM
- Privacy violation: Anyone can see who registered for events
- Data leakage: Participants can view organizer analytics
- No data isolation between roles

---

### 4. **Frontend Component Access**
**Issue**: Components render based on role but don't prevent API calls.

**Vulnerable Components:**
- `CreateEventDialog` - Can be opened by participants if they bypass UI
- `QRScanner` - Participants could scan if they access the component
- `CreateAnnouncementDialog` - No backend protection if accessed

**Risk Level**: 🟡 MEDIUM
- UI-only protection is insufficient
- Backend must validate all actions

---

## 🛡️ RECOMMENDED FIXES

### Priority 1: Backend API Security

#### Fix 1: Add Role Middleware/Helper
```typescript
// convex/utils.ts
export async function requireOrganizer(ctx: any, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "organizer") {
    throw new Error("Unauthorized: Organizer access required");
  }
  return user;
}

export async function requireParticipant(ctx: any, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "participant") {
    throw new Error("Unauthorized: Participant access required");
  }
  return user;
}

export async function requireEventOwnership(
  ctx: any, 
  eventId: Id<"events">, 
  userId: Id<"users">
) {
  const event = await ctx.db.get(eventId);
  if (!event) throw new Error("Event not found");
  
  const user = await requireOrganizer(ctx, userId);
  
  if (event.organizerId !== userId) {
    throw new Error("Unauthorized: You don't own this event");
  }
  
  return { event, user };
}
```

#### Fix 2: Secure updateEvent
```typescript
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"), // ADD THIS
    // ... other args
  },
  handler: async (ctx, args) => {
    // Verify ownership
    await requireEventOwnership(ctx, args.eventId, args.userId);
    
    // Proceed with update
    await ctx.db.patch(args.eventId, { /* ... */ });
  },
});
```

#### Fix 3: Secure Analytics Queries
```typescript
export const getOrganizerAnalytics = query({
  args: { organizerId: v.id("users") },
  handler: async (ctx, args) => {
    // Verify the requester is an organizer
    await requireOrganizer(ctx, args.organizerId);
    
    // Return analytics
    // ...
  },
});
```

### Priority 2: Route Protection

#### Fix: Create Protected Route Component
```typescript
// src/components/ProtectedRoute.tsx
export function OrganizerRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/role-selection');
    } else if (user.role !== 'organizer') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  if (!user || user.role !== 'organizer') {
    return null;
  }
  
  return <>{children}</>;
}

export function ParticipantRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/role-selection');
    } else if (user.role !== 'participant') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  if (!user || user.role !== 'participant') {
    return null;
  }
  
  return <>{children}</>;
}
```

#### Fix: Update Routes
```typescript
<Route path="/analytics" element={
  <OrganizerRoute>
    <Analytics />
  </OrganizerRoute>
} />
<Route path="/my-history" element={
  <ParticipantRoute>
    <MyHistory />
  </ParticipantRoute>
} />
```

### Priority 3: Query Access Control

#### Fix: Add userId parameter to sensitive queries
```typescript
export const getEventRegistrations = query({
  args: { 
    eventId: v.id("events"),
    requesterId: v.id("users") // ADD THIS
  },
  handler: async (ctx, args) => {
    // Verify requester is the event organizer
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    
    const user = await ctx.db.get(args.requesterId);
    if (!user || user.role !== "organizer" || event.organizerId !== args.requesterId) {
      throw new Error("Unauthorized: Only event organizer can view registrations");
    }
    
    return await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Backend (Convex)
- [ ] Create role verification helpers in `convex/utils.ts`
- [ ] Add `userId` parameter to `updateEvent` mutation
- [ ] Add ownership check to `updateEvent`
- [ ] Add role check to `reassignOrganizer` (or remove if not needed)
- [ ] Add role checks to all analytics queries
- [ ] Add requester verification to `getEventRegistrations`
- [ ] Add requester verification to `myRegistrations`
- [ ] Review all mutations for missing role checks
- [ ] Review all queries for data leakage

### Frontend (React)
- [ ] Create `ProtectedRoute` components
- [ ] Wrap `/analytics` with `OrganizerRoute`
- [ ] Wrap `/edit-event/:id` with `OrganizerRoute`
- [ ] Wrap `/my-history` with `ParticipantRoute`
- [ ] Update all mutation calls to include `userId`
- [ ] Update all query calls to include `requesterId` where needed
- [ ] Add error handling for unauthorized access
- [ ] Test all routes with both roles

### Testing
- [ ] Test direct URL access for protected routes
- [ ] Test API calls with wrong role
- [ ] Test event update with non-owner
- [ ] Test analytics access by participants
- [ ] Test registration viewing by non-organizers
- [ ] Test cross-user data access

---

## 🎯 SUMMARY

**Total Vulnerabilities Found**: 12
- 🔴 Critical: 4
- 🟡 Medium: 8

**Estimated Fix Time**: 4-6 hours

**Priority Order**:
1. Fix backend mutations (updateEvent, reassignOrganizer)
2. Add route protection components
3. Secure analytics queries
4. Add ownership verification to all mutations
5. Test thoroughly with both roles
