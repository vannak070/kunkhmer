# Roles & Permissions - Quick Reference

## 🎭 6 Roles at a Glance

| Role | Icon | Main Purpose | Can Approve? | Can Execute? |
|------|------|--------------|--------------|--------------|
| **KKF Super Admin** | 👑 | Full system control | ✅ Yes | ✅ Yes |
| **KKF Auditor** | 🔍 | Approve/reject requests | ✅ Yes | ❌ No |
| **KKF Officer** | ⚙️ | Execute operations | ❌ No | ✅ Yes |
| **Organizer** | 🎯 | Create events/matches | ❌ No | ❌ No |
| **Club/Gym** | 🏢 | Manage fighters | ❌ No | ❌ No |
| **Referee/Judge** | 🧑‍⚖️ | View assignments | ❌ No | ❌ No |

---

## 🔑 Key Separation

### Governance vs Execution

```
🔍 AUDITOR (Governance)        ⚙️ OFFICER (Execution)
├─ Approve events ✅            ├─ Assign officials ✅
├─ Approve matches ✅           ├─ Conduct weigh-ins ✅
├─ Validate fighters ✅         ├─ Enter results ✅
└─ ❌ Cannot execute            └─ ❌ Cannot approve
```

**Why?** Separation of duties prevents conflicts of interest!

---

## 📋 Quick Permission Check

### Who Can Do What?

**Create Events**
- ✅ Super Admin
- ✅ Organizer
- ❌ Everyone else

**Approve Events**
- ✅ Super Admin
- ✅ Auditor
- ❌ Everyone else

**Assign Officials**
- ✅ Super Admin
- ✅ Officer
- ❌ Everyone else

**Enter Results**
- ✅ Super Admin
- ✅ Officer
- ❌ Everyone else

**Register Fighters**
- ✅ Super Admin
- ✅ Club
- ❌ Everyone else

**View Matches**
- ✅ Everyone

---

## 🎯 Typical Workflows

### Event Approval Workflow

```
1. ORGANIZER creates event
2. ORGANIZER submits to KKF
3. AUDITOR reviews
4. AUDITOR approves ✅
5. Event ready for matches
```

### Match Execution Workflow

```
1. OFFICER assigns referee
2. OFFICER assigns judges
3. OFFICER conducts weigh-in
4. Match ready to fight
5. REFEREE officiates
6. OFFICER enters results
7. OFFICER completes match
```

---

## 🔐 Permission Examples

### In Code

```tsx
import { hasPermission } from "../data/users";

// Check if can approve events
if (hasPermission('federation.approve_event')) {
  // Show approve button (Auditor/Super Admin)
}

// Check if can enter results
if (hasPermission('federation.enter_results')) {
  // Show results form (Officer/Super Admin)
}

// Check if can create events
if (hasPermission('events.create')) {
  // Show create button (Organizer/Super Admin)
}
```

---

## 🎨 Role Badge Colors

```
👑 Super Admin → Purple
🔍 Auditor     → Indigo
⚙️ Officer     → Red
🎯 Organizer   → Blue
🏢 Club        → Amber
🧑‍⚖️ Referee    → Green
```

---

## ✅ Quick Decision Tree

### "Who should approve this event?"

- Is it a governance decision? → **AUDITOR**
- Need to override? → **SUPER ADMIN**

### "Who should assign the referee?"

- Normal operation? → **OFFICER**
- Override needed? → **SUPER ADMIN**

### "Who should create matches?"

- Building fight card? → **ORGANIZER**
- System testing? → **SUPER ADMIN**

### "Who should register fighters?"

- Gym's own fighter? → **CLUB**
- System management? → **SUPER ADMIN**

---

## 📊 Files Reference

- **Configuration**: `/src/app/data/users.ts`
- **Full Guide**: `/ROLES_AND_PERMISSIONS_GUIDE.md`
- **Quick Ref**: `/ROLES_QUICK_REFERENCE.md` (this file)
- **UI Component**: `/src/app/components/RoleComparisonTable.tsx`

---

## 💡 Remember

1. **Auditor approves** → Officer executes
2. **Organizer creates** → Auditor approves
3. **Club manages fighters** → Participates in matches
4. **Referee views only** → Limited access
5. **Super Admin** → Can do everything (use sparingly!)

---

**Need full details?** → See `/ROLES_AND_PERMISSIONS_GUIDE.md`

**Version**: 3.0.0  
**Last Updated**: March 20, 2026
