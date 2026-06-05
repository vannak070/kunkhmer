# Quick Data Update Guide - KUNKHMER Ecosystem

## 🎯 How to Update Data (One Place, Everywhere!)

Now that the Super APP is synced with the Digital Platform, updating data is simple - edit once, see changes everywhere!

---

## 📝 Adding a New Fighter

**File**: `/src/app/data/mock.ts`  
**Array**: `MOCK_FIGHTERS`

```typescript
{
  id: "f100",
  name: "New Fighter Name",
  alias: "The Nickname",
  weight: 70.5,
  record: "15-3-1",
  gym: "Club Name",
  clubId: "c1", // Must match a club ID
  origin: "Local", // or "Foreigner"
  type: "Professional", // or "Amateur"
  grade: "A", // A, B, C, or D
  style: "Aggressive", // Aggressive, Clinch, Counter, Balanced
  image: "https://...", // Image URL
  status: "Active" // Active, Injured, Retired
}
```

**Will appear in**:
- Digital Platform → `/home/fighters`
- Super APP → `/superapp` (Fighters section)

---

## 🏛️ Adding a New Club

**File**: `/src/app/data/mock.ts`  
**Array**: `MOCK_CLUBS`

```typescript
{
  id: "c20",
  name: "New Club Name",
  location: "City, Cambodia",
  headCoach: "Coach Full Name",
  activeFighters: 15,
  rating: 4.5,
  status: "active", // or "inactive"
  image: "https://..." // Image URL
}
```

**Will appear in**:
- Digital Platform → `/home/clubs`
- Super APP → `/superapp` (Clubs section)

---

## 📅 Adding a New Event

**File**: `/src/app/data/mock.ts`  
**Array**: `MOCK_EVENTS`

```typescript
{
  id: "e10",
  name: "Event Name 2026",
  station: "Town Full HDTV",
  stationId: "bs1", // Must match broadcast station ID
  sponsors: ["Carabao", "Smart Axiata"],
  sponsorIds: ["sp1", "sp2"], // Must match sponsor IDs
  mainSponsorId: "sp1",
  broadcastStationId: "bs1",
  organizer: "Organization Name",
  location: "Venue Name, City",
  date: "2026-06-15",
  endDate: "2026-06-15",
  hasSubEvents: false,
  description: "Event description here...",
  status: "Draft", // Draft, Pending KKF Approval, KKF Approved, In Progress, Closed
  kkfStatus: "Draft",
  kkfComments: null,
  kkfReviewedBy: null,
  kkfReviewedDate: null,
  submittedDate: null,
  createdBy: "u3",
  createdDate: "2026-03-01",
  matchesCount: 0,
  image: "https://...",
  linkedAwardIds: [],
  workflowHistory: [
    { 
      status: "Draft", 
      timestamp: "2026-03-01T10:00:00Z", 
      userId: "u3", 
      userName: "Organizer Name", 
      action: "Event created", 
      comments: null 
    }
  ]
}
```

**Will appear in**:
- Digital Platform → `/home/events`
- Super APP → `/superapp` (Events section)

---

## 🥊 Adding a New Match

**File**: `/src/app/data/batches.ts`  
**Array**: `MOCK_BATCHES` → Add to `matches` array within a batch

```typescript
// First, find or create a batch
{
  id: "batch-010",
  batchNumber: "BATCH-010",
  eventId: "e1",
  eventName: "Event Name",
  eventDate: "2026-06-15",
  status: "Proposed",
  totalMatches: 1,
  date: "2026-06-15",
  location: "Venue Name",
  organizerClub: "Club Name",
  broadcastStation: "Station Name",
  mainSponsor: "Sponsor Name",
  matches: [
    {
      id: "match-100",
      matchNumber: "M-100",
      batchId: "batch-010",
      fighterA: {
        id: "f1",
        name: "Fighter A Name",
        image: "https://...",
        weight: 70,
        record: "12-2-0",
        grade: "A",
        clubId: "c1",
        clubName: "Club Name"
      },
      fighterB: {
        id: "f2",
        name: "Fighter B Name",
        image: "https://...",
        weight: 70,
        record: "10-3-1",
        grade: "A",
        clubId: "c2",
        clubName: "Club Name"
      },
      matchType: "Championship Bout",
      weightClass: "70kg",
      rounds: 5,
      matchOrder: 1,
      notes: "Match notes",
      status: "Proposed", // Proposed, Ready, In Progress, Completed
      date: "2026-06-15",
      // Optional result (add after match is completed)
      result: {
        winner: "Fighter A Name",
        method: "KO",
        round: 3,
        time: "2:15"
      }
    }
  ]
}
```

**Will appear in**:
- Digital Platform → `/home/matches`
- Super APP → `/superapp` (Matches section)

---

## 📺 Adding a New Broadcast Station

**File**: `/src/app/data/masterData.ts`  
**Array**: `BROADCAST_STATIONS`

```typescript
{
  id: "bs20",
  name: "New TV Station",
  logo: "📺", // Emoji or URL
  type: "Cable TV", // National TV, Cable TV, Digital Platform, Radio
  reach: "National", // National, Urban Areas, Online/Mobile
  contactPerson: "Contact Name",
  contactEmail: "email@station.com",
  active: true // Must be true to appear
}
```

**Will appear in**:
- Digital Platform → System settings
- Super APP → `/superapp` (Broadcasts section)

---

## 💎 Adding a New Sponsor

**File**: `/src/app/data/masterData.ts`  
**Array**: `SPONSORS`

```typescript
{
  id: "sp20",
  name: "New Sponsor Name",
  logo: "🏢", // Emoji or URL
  industry: "Industry Type",
  tier: "Gold", // Platinum, Gold, Silver, Bronze
  contactPerson: "Contact Name",
  contactEmail: "email@sponsor.com",
  active: true // Must be true to appear
}
```

**Will appear in**:
- Digital Platform → System settings
- Super APP → `/superapp` (Sponsors section)

---

## 🎨 Updating Existing Data

### To Update a Fighter
1. Find fighter in `MOCK_FIGHTERS` by ID
2. Edit the properties you want to change
3. Save the file
4. Changes appear everywhere automatically

### To Update a Club
1. Find club in `MOCK_CLUBS` by ID
2. Edit the properties
3. Save the file

### To Update an Event
1. Find event in `MOCK_EVENTS` by ID
2. Edit the properties
3. Update status if needed
4. Save the file

### To Update a Match
1. Find batch in `MOCK_BATCHES` by ID
2. Find match within batch by ID
3. Edit match properties
4. Update result if completed
5. Save the file

---

## ⚡ Quick Tips

### Fighter Records
- Format: `"wins-losses-draws"`
- Example: `"28-3-1"` = 28 wins, 3 losses, 1 draw

### Fighter Grades
- **A** = Top tier, verified, 1-3 championships
- **B** = Mid tier, 1 championship
- **C** = Developing, 0 championships
- **D** = Beginner, 0 championships

### Event Status Flow
1. `Draft` → 2. `Pending KKF Approval` → 3. `KKF Approved` → 4. `In Progress` → 5. `Closed`

### Match Status Flow
1. `Proposed` → 2. `Ready` → 3. `In Progress` → 4. `Completed`

### Images
- Use Unsplash URLs for stock photos
- Use `figma:asset/[hash].png` for imported images
- Always provide fallback URLs

---

## 🔄 Data Relationship Map

```
Fighter (clubId) ──────► Club (id)
                         
Event (stationId) ─────► Broadcast Station (id)
Event (sponsorIds) ────► Sponsors (id)

Batch (eventId) ───────► Event (id)
Match (clubId) ────────► Club (id)
Match → Fighter ───────► Fighter (id)
```

**Important**: Always use correct IDs for relationships!

---

## ✅ Before You Save

1. **Check IDs**: Ensure all IDs are unique
2. **Verify Relationships**: Club IDs, Station IDs, Sponsor IDs exist
3. **Date Format**: Use `"YYYY-MM-DD"` format
4. **Required Fields**: Don't leave required fields empty
5. **Image URLs**: Test URLs work before adding

---

## 🆘 Common Mistakes to Avoid

❌ **Don't** use duplicate IDs  
✅ **Do** generate unique IDs

❌ **Don't** forget to update `totalMatches` count in batch  
✅ **Do** count matches and update the batch property

❌ **Don't** use invalid date formats  
✅ **Do** use `"YYYY-MM-DD"` format

❌ **Don't** reference non-existent club/station/sponsor IDs  
✅ **Do** verify IDs exist before referencing

❌ **Don't** forget to set `active: true` for broadcast stations/sponsors  
✅ **Do** set active flag to make them visible

---

## 📞 Need Help?

1. **Syntax Error**: Check for missing commas, brackets, quotes
2. **Data Not Appearing**: Check `active` flag, verify imports
3. **Relationship Error**: Verify ID references are correct
4. **Image Not Loading**: Check URL is valid, try fallback URL

---

## 🎉 That's It!

**Remember**: Edit data in source files → Changes appear everywhere automatically!

No need to update multiple places. The Super APP automatically syncs with the Digital Platform data.

---

**Quick Reference Files**:
- Fighters, Clubs, Events: `/src/app/data/mock.ts`
- Broadcast Stations, Sponsors: `/src/app/data/masterData.ts`
- Matches (Batches): `/src/app/data/batches.ts`
