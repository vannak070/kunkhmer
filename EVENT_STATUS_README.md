# Event Status System - Quick Start

## 📋 11 Event Statuses at a Glance

```
🟡 Draft              → Event created, being prepared
🔵 Submitted          → Sent to KKF for review  
🟣 Under Review       → KKF actively reviewing
🟢 Approved ✅        → ⭐ GATE UNLOCKED - Can create matches!
🔴 Rejected ❌        → Needs fixes, can resubmit
🟠 Match Preparation  → Fight card being built
🟤 Weigh-In Completed → Ready to fight
🔥 Live               → Event happening now!
🟦 Results Pending    → Awaiting verification
⚫ Completed          → Archived and final
⚪ Cancelled          → Event not happening
```

---

## ⭐ Critical Status: Approved (Status #4)

**This is the GATE for matchmaking!**

✅ **AFTER Approval**:
- Can create match proposals
- Can build fight card
- Can assign fighters
- Full event management

❌ **BEFORE Approval**:
- Cannot create matches
- Limited actions
- Waiting for KKF

---

## 🔄 Typical Flow

```
Draft → Submitted → Under Review → Approved ✅
                         ↓
                    (If issues)
                    Rejected ❌ → Fix → Resubmit

Approved → Match Preparation → Weigh-In → Live → Results → Completed ✅
```

---

## 📁 Documentation Files

| File | Purpose |
|------|---------|
| `EVENT_STATUS_GUIDE.md` | 📖 **Full guide** - All 11 statuses in detail |
| `EVENT_STATUS_IMPLEMENTATION.md` | 🔧 **Implementation** - Code examples & integration |
| `EVENT_STATUS_README.md` | 📋 **Quick start** - This file |
| `/src/app/data/eventStatuses.ts` | 💻 **Core config** - Status definitions |
| `/src/app/data/eventStatusExamples.ts` | 📊 **Examples** - Sample events for each status |
| `/src/app/components/EventStatusBadge.tsx` | 🎨 **UI components** - Status badges |

---

## 🎨 Usage

### Basic Badge
```tsx
import { EventStatusBadge } from "./components/EventStatusBadge";

<EventStatusBadge status="Approved" />
```

### Compact (for tables)
```tsx
import { EventStatusCompact } from "./components/EventStatusBadge";

<EventStatusCompact status="Live" />
```

### Full Card
```tsx
import { EventStatusCard } from "./components/EventStatusBadge";

<EventStatusCard status="Approved" />
```

---

## 🔍 Check Permissions

```tsx
import { getStatusInfo } from "../data/eventStatuses";

const info = getStatusInfo(event.status);

if (info.canCreateMatches) {
  // Show "Create Match" button
}

if (info.organizerCanEdit) {
  // Show "Edit Event" button
}
```

---

## ✅ Quick Reference

| Status | Can Edit? | Can Create Matches? |
|--------|-----------|---------------------|
| 🟡 Draft | ✅ Yes | ❌ No |
| 🔵 Submitted | ❌ Locked | ❌ No |
| 🟣 Under Review | ❌ Locked | ❌ No |
| 🟢 Approved | ❌ Locked | ✅ **YES** |
| 🔴 Rejected | ✅ Yes | ❌ No |
| 🟠 Match Preparation | ❌ Locked | ✅ Yes |
| 🟤 Weigh-In Completed | ❌ Locked | ❌ No |
| 🔥 Live | ❌ Locked | ❌ No |
| 🟦 Results Pending | ❌ Locked | ❌ No |
| ⚫ Completed | ❌ Locked | ❌ No |
| ⚪ Cancelled | ❌ Locked | ❌ No |

---

## 🎯 Next Steps

1. Read `EVENT_STATUS_GUIDE.md` for complete details
2. Check `EVENT_STATUS_IMPLEMENTATION.md` for code examples
3. Use status badges in your components
4. Validate status transitions with `canTransitionTo()`
5. Log all changes to `workflowHistory`

---

**Quick Question?** Check `/EVENT_STATUS_GUIDE.md` for the answer!  
**Need code examples?** See `/EVENT_STATUS_IMPLEMENTATION.md`!  

---

**Version**: 2.2.0  
**Status**: ✅ Ready to Use
