# 🔧 CampusConnect - Implementation Guide

## What's in This Project & How It's Built

This guide explains every feature and how it's technically implemented.

---

## 📁 Project Structure

```
campusconnect/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── analytics/           # Analytics charts
│   │   ├── event-detail/        # Event detail components
│   │   ├── AnnouncementCard.tsx
│   │   ├── Certificate.tsx
│   │   ├── CreateAnnouncementDialog.tsx
│   │   ├── CreateEventDialog.tsx
│   │   ├── DashboardCountdown.tsx
│   │   ├── DiscussionThread.tsx
│   │   ├── EventCard.tsx
│   │   ├── EventCommunity.tsx
│   │   ├── EventRegistrationDialog.tsx
│   │   ├── PhotoGallery.tsx
│   │   ├── QRScanner.tsx
│   │   ├── RecommendedEvents.tsx
│   │   ├── RegistrationForm.tsx
│   │   ├── SettingsMenu.tsx
│   │   ├── ShareButtons.tsx
│   │   ├── SimilarEvents.tsx
│   │   └── TeamTicketsDialog.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-language.ts
│   │   └── use-theme.ts
│   ├── lib/                     # Utility functions
│   │   └── utils.ts
│   ├── pages/                   # Page components
│   │   ├── Analytics.tsx
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EditEvent.tsx
│   │   ├── EventDetail.tsx
│   │   ├── Landing.tsx
│   │   ├── MyHistory.tsx
│   │   ├── NotFound.tsx
│   │   ├── RoleSelection.tsx
│   │   └── Ticket.tsx
│   ├── index.css               # Global styles
│   ├── main.tsx                # App entry point
│   └── vite-env.d.ts
├── convex/                      # Backend code
│   ├── _generated/             # Auto-generated types
│   ├── ai.ts                   # AI functions
│   ├── analytics.ts            # Analytics queries
│   ├── announcements.ts        # Announcements CRUD
│   ├── auth.ts                 # Authentication
│   ├── discussions.ts          # Discussions & Q&A
│   ├── events.ts               # Event management
│   ├── history.ts              # User history
│   ├── migration.ts            # Data migration
│   ├── photos.ts               # Photo management
│   ├── recommendations.ts      # Event recommendations
│   ├── registrations.ts        # Registration system
│   ├── schema.ts               # Database schema
│   ├── users.ts                # User management
│   └── utils.ts                # Utility functions
├── public/                      # Static assets
├── .env.local                  # Environment variables
├── convex.json                 # Convex configuration
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript config
└── vite.config.ts              # Vite configuration
```

---

## 🎯 Feature Implementation Details


### 1. Authentication System

**What:** Email-based authentication with OTP verification

**Files:**
- `convex/auth.ts` - Backend authentication logic
- `convex/schema.ts` - User and OTP tables
- `src/pages/Auth.tsx` - Login/signup page
- `src/hooks/use-auth.ts` - Authentication hook

**How It Works:**
1. User enters email
2. System generates 6-digit OTP
3. OTP stored in database with expiry (5 minutes)
4. User enters OTP
5. System verifies OTP
6. Creates/retrieves user account
7. Returns user session

**Key Functions:**
- `sendOTP()` - Generates and stores OTP
- `verifyOTP()` - Validates OTP and creates session
- `getCurrentUser()` - Gets logged-in user

**Implementation:**
```typescript
// convex/auth.ts
export const sendOTP = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await ctx.db.insert("otpCodes", {
      email: args.email,
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });
    return { success: true };
  }
});
```

---

### 2. Event Management

**What:** Complete CRUD operations for events

**Files:**
- `convex/events.ts` - Event backend logic
- `src/components/CreateEventDialog.tsx` - Create event UI
- `src/pages/EditEvent.tsx` - Edit event page
- `src/components/EventCard.tsx` - Event display card

**How It Works:**
1. Organizer fills event form
2. Can use AI to generate description
3. Event saved to database
4. Real-time updates to all users
5. Events displayed on landing page
6. Organizers can edit/delete their events

**Key Functions:**
- `createEvent()` - Creates new event
- `updateEvent()` - Updates event details
- `deleteEvent()` - Deletes event
- `getEventById()` - Fetches single event
- `getAllEvents()` - Fetches all events

**Database Schema:**
```typescript
events: defineTable({
  title: v.string(),
  description: v.string(),
  date: v.string(),
  time: v.string(),
  location: v.string(),
  category: v.union(...),
  maxParticipants: v.number(),
  organizerId: v.id("users"),
  isTeamEvent: v.boolean(),
  teamSize: v.optional(v.number()),
})
```

---

### 3. AI Event Description Generator

**What:** AI-powered event description creation

**Files:**
- `convex/ai.ts` - AI backend functions
- `src/components/CreateEventDialog.tsx` - UI integration

**How It Works:**
1. User enters event title and category
2. Clicks "Generate with AI" button
3. Frontend calls `generateDescription` action
4. Backend sends prompt to Google Gemini AI
5. AI generates description based on context
6. Description returned and filled in form
7. User can edit or regenerate

**Implementation:**
```typescript
// convex/ai.ts
export const generateDescription = action({
  args: {
    title: v.string(),
    category: v.string(),
  },
  handler: async (_ctx, args) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Write a short, engaging event description for "${args.title}" (${args.category})`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
});
```

**Fallback:** If API fails, uses template-based descriptions

---

### 4. Registration System

**What:** Individual and team registration with QR codes

**Files:**
- `convex/registrations.ts` - Registration backend
- `src/components/RegistrationForm.tsx` - Registration form
- `src/components/TeamTicketsDialog.tsx` - Team tickets display
- `convex/utils.ts` - Code generation utility

**How It Works:**

**Individual Registration:**
1. User fills registration form
2. System checks capacity
3. Generates unique registration code (REG-XXXXXX)
4. Creates registration record
5. Generates QR code
6. Redirects to ticket page

**Team Registration:**
1. Team leader fills form with member details
2. System validates team size
3. Generates unique team ID
4. Creates separate registration for each member
5. Each member gets own registration code
6. All codes linked by team ID
7. Shows all QR codes in dialog

**Key Functions:**
- `register()` - Creates registration(s)
- `cancelRegistration()` - Cancels registration
- `isRegistered()` - Checks registration status
- `getEventRegistrations()` - Gets all registrations

**Code Generation:**
```typescript
// convex/utils.ts
export function generateRegistrationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars
  let code = 'REG-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

---

### 5. QR Attendance System

**What:** QR code scanning for attendance tracking

**Files:**
- `src/components/QRScanner.tsx` - QR scanner component
- `src/pages/Ticket.tsx` - Ticket display page
- `convex/registrations.ts` - Attendance functions

**How It Works:**

**Participant Side:**
1. After registration, gets QR code
2. QR contains registration code
3. Can view ticket anytime
4. Shows QR at event

**Organizer Side:**
1. Opens QR scanner
2. Scans participant's QR code
3. System extracts registration code
4. Looks up registration
5. Marks attendance in database
6. Shows success/already marked message

**Key Functions:**
- `markAttendance()` - Marks attendance
- `getAttendance()` - Gets attendance record
- `getEventAttendance()` - Gets all attendance for event

**Implementation:**
```typescript
export const markAttendance = mutation({
  args: {
    registrationId: v.id("registrations"),
    organizerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if already marked
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_registration", q => q.eq("registrationId", args.registrationId))
      .first();
    
    if (existing) {
      return { success: false, alreadyMarked: true };
    }
    
    // Mark attendance
    await ctx.db.insert("attendance", {
      registrationId: args.registrationId,
      markedAt: Date.now(),
      status: "Present",
    });
    
    return { success: true };
  }
});
```

---

### 6. Dashboard System

**What:** Role-based dashboards for organizers and participants

**Files:**
- `src/pages/Dashboard.tsx` - Main dashboard
- `convex/events.ts` - Event queries
- `convex/registrations.ts` - Registration queries

**How It Works:**

**Organizer Dashboard:**
1. Shows "Create Event" button
2. Lists all events created by organizer
3. Shows registration counts
4. Quick actions (edit, delete, export)
5. Analytics overview

**Participant Dashboard:**
1. Shows all available events
2. Highlights registered events
3. Shows attendance history
4. Event recommendations
5. Quick registration

**Key Features:**
- Real-time event updates
- Capacity indicators
- Status badges (new, full, today)
- Countdown timers
- Responsive grid layout

---

### 7. Community Features

**What:** Discussions, Q&A, and photo sharing

**Files:**
- `src/components/EventCommunity.tsx` - Main container
- `src/components/DiscussionThread.tsx` - Discussion card
- `src/components/PhotoGallery.tsx` - Photo gallery
- `convex/discussions.ts` - Discussion backend
- `convex/photos.ts` - Photo backend

**How It Works:**

**Discussions:**
1. User clicks "Start Discussion"
2. Writes message
3. Posts to database
4. Real-time update to all viewers
5. Others can reply
6. Organizers can pin

**Q&A:**
1. User asks question with title
2. Question marked as "unanswered"
3. Organizer can get AI suggestion
4. Organizer posts answer
5. Answer marked with "ANSWER" badge
6. Question marked as "answered"

**Photos:**
1. User selects image file
2. Frontend validates (size, type)
3. Gets upload URL from backend
4. Uploads to Convex storage
5. Saves metadata to database
6. Photo appears in gallery
7. Users can like photos

**Key Functions:**
- `createDiscussion()` - Creates discussion/question
- `addComment()` - Adds reply
- `togglePin()` - Pins discussion
- `uploadPhoto()` - Uploads photo
- `toggleLike()` - Likes/unlikes photo

---

### 8. AI Q&A Assistant

**What:** AI-powered answer suggestions for questions

**Files:**
- `convex/ai.ts` - AI Q&A function
- `src/components/EventCommunity.tsx` - UI integration

**How It Works:**
1. User asks question in Q&A
2. Organizer views question
3. Clicks "Get AI Suggestion"
4. System gathers context:
   - Event details
   - Past Q&A
   - Announcements
5. Sends to Gemini AI with strict prompt
6. AI generates answer using only provided context
7. Organizer reviews and can edit
8. Posts answer

**Implementation:**
```typescript
export const generateQAAnswer = action({
  args: {
    eventId: v.id("events"),
    userQuestion: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch event context
    const event = await ctx.runQuery(internal.ai.getEventForAI, { eventId });
    const existingQA = await ctx.runQuery(internal.ai.getQAForAI, { eventId });
    
    // Build context
    const context = `Event: ${event.title}\n${event.description}\n...`;
    
    // Strict prompt to prevent hallucination
    const prompt = `Answer ONLY using provided context. If not available, say "Ask organizer".\n${context}`;
    
    // Generate answer
    const result = await model.generateContent(prompt);
    return { answer: result.response.text() };
  }
});
```

---

### 9. Announcements System

**What:** General and event-specific announcements

**Files:**
- `convex/announcements.ts` - Announcement backend
- `src/components/CreateAnnouncementDialog.tsx` - Create UI
- `src/components/AnnouncementCard.tsx` - Display card

**How It Works:**

**General Announcements:**
1. Organizer creates announcement
2. Leaves eventId empty
3. Selects department
4. Posts announcement
5. Shows on landing page
6. Filtered by department

**Event-Specific:**
1. Organizer creates announcement
2. Selects specific event
3. Posts announcement
4. Shows only on that event's page

**Key Functions:**
- `createAnnouncement()` - Creates announcement
- `getGeneralAnnouncements()` - Gets general announcements
- `getEventAnnouncements()` - Gets event announcements

**Database Schema:**
```typescript
announcements: defineTable({
  title: v.string(),
  message: v.string(),
  department: v.optional(v.string()),
  eventId: v.optional(v.id("events")), // null = general
  priority: v.union(v.literal("normal"), v.literal("important")),
})
```

---

### 10. Dark Mode & Multi-Language

**What:** Theme switching and language support

**Files:**
- `src/hooks/use-theme.ts` - Theme management
- `src/hooks/use-language.ts` - Language management
- `src/components/SettingsMenu.tsx` - Settings UI
- `src/index.css` - Dark mode styles

**How It Works:**

**Dark Mode:**
1. User clicks theme toggle
2. Hook updates state
3. Adds/removes 'dark' class on document
4. CSS applies dark mode styles
5. Preference saved to localStorage
6. Persists across sessions

**Multi-Language:**
1. User selects language
2. Hook updates state
3. Translation function returns text
4. UI updates with new language
5. Preference saved to localStorage

**Implementation:**
```typescript
// use-theme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return saved || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return { theme, setTheme };
}
```

---

### 11. Analytics System

**What:** Event and attendance analytics

**Files:**
- `src/pages/Analytics.tsx` - Analytics page
- `src/components/analytics/` - Chart components
- `convex/analytics.ts` - Analytics queries

**How It Works:**
1. Backend aggregates data
2. Calculates metrics:
   - Total events
   - Total registrations
   - Attendance rate
   - Category distribution
3. Frontend displays charts:
   - Registration trends (line chart)
   - Category pie chart
   - Attendance bar chart
   - Peak times chart
4. Real-time updates

**Key Functions:**
- `getAnalytics()` - Gets all analytics data
- `getRegistrationTrends()` - Registration over time
- `getCategoryDistribution()` - Events by category

---

### 12. Recommendations System

**What:** Event recommendations based on similarity

**Files:**
- `convex/recommendations.ts` - Recommendation logic
- `src/components/SimilarEvents.tsx` - Similar events display
- `src/components/RecommendedEvents.tsx` - Recommendations

**How It Works:**
1. Analyzes current event
2. Finds events with same category
3. Excludes current event
4. Limits to 3-4 events
5. Displays with event cards

**Future Enhancement:**
- User behavior analysis
- Registration history
- Collaborative filtering
- Personalized recommendations

---


## 🎨 Design Implementation

### Neo Brutalism Design System

**What:** Bold, modern design with thick borders and hard shadows

**Files:**
- `src/index.css` - Global styles and utilities
- `tailwind.config.js` - Tailwind configuration

**How It's Implemented:**

**CSS Classes:**
```css
/* Neo Brutal borders and shadows */
.neo-brutal {
  border: 4px solid black;
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
}

.neo-brutal-sm {
  border: 2px solid black;
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 1);
}

.neo-brutal-lg {
  border: 6px solid black;
  box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 1);
}

/* Dark mode variants */
.dark .neo-brutal {
  border-color: white;
  box-shadow: 4px 4px 0px 0px rgba(255, 255, 255, 1);
}
```

**Usage:**
```tsx
<div className="neo-brutal bg-white p-4">
  Content with neo-brutal styling
</div>
```

---

### Animations

**What:** Smooth transitions and micro-interactions

**Library:** Framer Motion

**Implementation:**
```tsx
// Page transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>
  Content
</motion.div>

// Button hover
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>

// List animations
<AnimatePresence>
  {items.map(item => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

---

### Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Implementation:**
```tsx
// Tailwind responsive classes
<div className="
  grid 
  grid-cols-1          // Mobile: 1 column
  md:grid-cols-2       // Tablet: 2 columns
  lg:grid-cols-4       // Desktop: 4 columns
  gap-4
">
  {items}
</div>
```

---

## 🔧 Technical Implementation Details

### State Management

**Approach:** React hooks + Convex real-time queries

**No Redux needed** because:
- Convex handles server state
- React hooks handle local state
- Real-time updates automatic

**Example:**
```tsx
// Server state (real-time)
const events = useQuery(api.events.getAllEvents);

// Local state
const [selectedEvent, setSelectedEvent] = useState(null);

// Mutations
const createEvent = useMutation(api.events.createEvent);
```

---

### Real-Time Updates

**How It Works:**
1. Component uses `useQuery` hook
2. Convex subscribes to database changes
3. When data changes, query re-runs
4. Component automatically re-renders
5. No manual refresh needed

**Example:**
```tsx
// This automatically updates when registrations change
const registrations = useQuery(
  api.registrations.getEventRegistrations,
  { eventId }
);
```

---

### File Upload (Photos)

**Implementation:**

**Step 1: Generate Upload URL**
```typescript
// convex/photos.ts
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  }
});
```

**Step 2: Upload File**
```tsx
// Frontend
const uploadUrl = await generateUploadUrl();

const result = await fetch(uploadUrl, {
  method: 'POST',
  headers: { 'Content-Type': file.type },
  body: file,
});

const { storageId } = await result.json();
```

**Step 3: Save Metadata**
```typescript
await uploadPhoto({
  eventId,
  userId,
  storageId,
  caption,
});
```

**Step 4: Display Image**
```tsx
const photoUrl = useQuery(api.photos.getPhotoUrl, { storageId });

<img src={photoUrl} alt="Event photo" />
```

---

### QR Code Generation

**Library:** react-qr-code

**Implementation:**
```tsx
import QRCode from 'react-qr-code';

<QRCode
  value={registrationCode}  // REG-XXXXXX
  size={256}
  level="H"  // High error correction
/>
```

**QR Code Contains:** Just the registration code (REG-XXXXXX)

**Scanning Process:**
1. Scanner reads QR code
2. Extracts registration code
3. Looks up in database
4. Marks attendance

---

### Form Validation

**Approach:** Real-time validation with visual feedback

**Implementation:**
```tsx
// Email validation
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Phone validation
const validatePhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\s/g, '');
  return /^\d{10}$/.test(digitsOnly);
};

// Visual feedback
<input
  className={`
    neo-brutal w-full px-4 py-3
    ${touched.email && !validation.email.isValid 
      ? 'border-red-500' 
      : 'border-black'}
  `}
/>
```

---

### Error Handling

**Pattern:** Try-catch with user-friendly messages

**Implementation:**
```tsx
const handleSubmit = async () => {
  setLoading(true);
  setError('');
  
  try {
    await createEvent(formData);
    navigate('/dashboard');
  } catch (err: any) {
    setError(err.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};
```

**Backend:**
```typescript
export const createEvent = mutation({
  handler: async (ctx, args) => {
    // Validation
    if (!args.title) {
      throw new Error("Title is required");
    }
    
    // Business logic
    const eventId = await ctx.db.insert("events", args);
    
    return { success: true, eventId };
  }
});
```

---

### Loading States

**Pattern:** Loading flags + conditional rendering

**Implementation:**
```tsx
const [loading, setLoading] = useState(false);

{loading ? (
  <div className="flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
  </div>
) : (
  <Content />
)}
```

---

### Routing

**Library:** React Router v6

**Implementation:**
```tsx
// main.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/event/:eventId" element={<EventDetail />} />
    <Route path="/ticket/:code" element={<Ticket />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

**Protected Routes:**
```tsx
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return children;
};
```

---

## 🗄️ Database Implementation

### Convex Database

**Type:** Document database (like MongoDB)

**Features:**
- Real-time subscriptions
- ACID transactions
- Automatic indexing
- Type-safe queries

### Schema Definition

**File:** `convex/schema.ts`

**Example:**
```typescript
export default defineSchema({
  events: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.string(),
    organizerId: v.id("users"),
  }).index("by_organizer", ["organizerId"]),
  
  registrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    registrationCode: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_code", ["registrationCode"]),
});
```

### Queries

**Read Data:**
```typescript
// Get all events
export const getAllEvents = query({
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  }
});

// Get with filter
export const getEventsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .filter(q => q.eq(q.field("category"), args.category))
      .collect();
  }
});

// Get with index
export const getOrganizerEvents = query({
  args: { organizerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", args.organizerId))
      .collect();
  }
});
```

### Mutations

**Write Data:**
```typescript
// Insert
export const createEvent = mutation({
  args: { title: v.string(), ... },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", args);
    return { eventId };
  }
});

// Update
export const updateEvent = mutation({
  args: { eventId: v.id("events"), ... },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      title: args.title,
      description: args.description,
    });
  }
});

// Delete
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.eventId);
  }
});
```

### Actions

**External API Calls:**
```typescript
export const generateDescription = action({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    // Can call external APIs
    const response = await fetch('https://api.example.com');
    const data = await response.json();
    
    // Can call queries/mutations
    await ctx.runMutation(api.events.createEvent, { ... });
    
    return data;
  }
});
```

---

## 🔐 Security Implementation

### Authentication

**Pattern:** Session-based with OTP

**Flow:**
1. User enters email
2. OTP generated and stored
3. User enters OTP
4. OTP verified
5. Session created
6. User ID stored in context

**Implementation:**
```typescript
// Backend
export const verifyOTP = mutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    // Find OTP
    const otp = await ctx.db
      .query("otpCodes")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();
    
    // Verify
    if (!otp || otp.code !== args.code) {
      throw new Error("Invalid OTP");
    }
    
    if (otp.expiresAt < Date.now()) {
      throw new Error("OTP expired");
    }
    
    // Create/get user
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();
    
    if (!user) {
      const userId = await ctx.db.insert("users", {
        email: args.email,
        role: "participant",
        isAnonymous: false,
      });
      user = await ctx.db.get(userId);
    }
    
    return user;
  }
});
```

### Authorization

**Pattern:** Role-based access control

**Implementation:**
```typescript
// Check user role
export const createEvent = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user || user.role !== "organizer") {
      throw new Error("Only organizers can create events");
    }
    
    // Proceed with creation
  }
});

// Check ownership
export const deleteEvent = mutation({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    
    if (event.organizerId !== args.userId) {
      throw new Error("You can only delete your own events");
    }
    
    await ctx.db.delete(args.eventId);
  }
});
```

---

## 🚀 Performance Optimizations

### Database Indexes

**Purpose:** Fast queries

**Implementation:**
```typescript
// Without index: O(n) - scans all records
// With index: O(log n) - uses B-tree

registrations: defineTable({
  eventId: v.id("events"),
  userId: v.id("users"),
})
  .index("by_event", ["eventId"])      // Fast event lookups
  .index("by_user", ["userId"])        // Fast user lookups
  .index("by_event_and_user", ["eventId", "userId"])  // Compound index
```

### Lazy Loading

**Pattern:** Load data only when needed

**Implementation:**
```tsx
// Don't load comments until expanded
const comments = useQuery(
  api.discussions.getDiscussionComments,
  showComments ? { discussionId } : 'skip'
);
```

### Optimistic Updates

**Pattern:** Update UI immediately, sync later

**Implementation:**
```tsx
const toggleLike = useMutation(api.photos.toggleLike);

const handleLike = async () => {
  // Update UI immediately
  setLiked(!liked);
  setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  
  // Sync with backend
  await toggleLike({ photoId, userId });
};
```

### Code Splitting

**Pattern:** Load code on demand

**Implementation:**
```tsx
// Lazy load heavy components
const Analytics = lazy(() => import('./pages/Analytics'));

<Suspense fallback={<Loading />}>
  <Analytics />
</Suspense>
```

---

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^4.3.0"
}
```

### UI Libraries
```json
{
  "tailwindcss": "^3.3.0",
  "framer-motion": "^10.12.0",
  "lucide-react": "^0.263.0",
  "react-qr-code": "^2.0.11"
}
```

### Backend
```json
{
  "convex": "^1.0.0",
  "@google/generative-ai": "^0.1.0"
}
```

### Routing
```json
{
  "react-router-dom": "^6.11.0"
}
```

### Utilities
```json
{
  "clsx": "^1.2.1",
  "date-fns": "^2.30.0"
}
```

---

## 🎯 Key Takeaways

### What Makes This Project Special

1. **Real-Time Architecture**
   - No manual refreshes needed
   - Instant updates across all users
   - Powered by Convex

2. **AI Integration**
   - Practical AI use cases
   - Cost-effective implementation
   - Fallback mechanisms

3. **Individual QR Codes**
   - Unique approach to team events
   - Accurate attendance tracking
   - Better user experience

4. **Complete Feature Set**
   - Not just event management
   - Full community platform
   - Analytics and insights

5. **Modern Tech Stack**
   - TypeScript for safety
   - React for UI
   - Convex for backend
   - Tailwind for styling

6. **Production-Ready**
   - Error handling throughout
   - Loading states everywhere
   - Responsive design
   - Accessible interface

---

## 📚 Learning Resources

### To Understand This Project

**React:**
- React hooks (useState, useEffect, custom hooks)
- Component composition
- Props and state management

**TypeScript:**
- Type definitions
- Interfaces
- Generic types

**Convex:**
- Queries and mutations
- Real-time subscriptions
- Actions for external APIs

**Tailwind CSS:**
- Utility classes
- Responsive design
- Custom configurations

**Framer Motion:**
- Animation variants
- Layout animations
- Gesture animations

---

**This implementation guide covers all major features and how they're built. Each feature is production-ready and follows best practices!**
