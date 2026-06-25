import { MOCK_FIGHTERS, MOCK_CLUBS, MOCK_EVENTS, MOCK_MATCHES } from "./mock";
import { MOCK_CHAMPIONS } from "./champion";
import { MOCK_BATCHES } from "./batches";

export type WorkflowType = "event" | "match" | "fighter" | "club" | "champion";
export type WorkflowStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "info_requested" | "pending";

export interface ValidationCheck {
  label: string;
  status: "valid" | "invalid" | "missing";
  message?: string;
}

export interface WorkflowRequest {
  id: string;
  type: WorkflowType;
  title: string;
  status: WorkflowStatus;
  createdBy: string;
  createdDate: string;
  submittedDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  comments?: string;
  data: any;
  validation?: ValidationCheck[];
  healthStatus?: "valid" | "expired" | "missing";
  auditTrail?: Array<{
    action: string;
    by: string;
    date: string;
    comment?: string;
  }>;
}

// Global shared mutable workflow list
export const MOCK_WORKFLOW_REQUESTS: WorkflowRequest[] = [
  {
    id: "wf-001",
    type: "fighter",
    title: "Register Fighter: Sok Bunthoeun",
    status: "pending",
    createdBy: "u3",
    createdDate: "2025-03-20",
    submittedDate: "2025-03-22",
    data: {
      fighterName: "Sok Bunthoeun",
      nameKH: "សុខ ប៊ុនធឿន",
      alias: "The Thunder",
      dob: "1998-05-15",
      pob: "Phnom Penh, Cambodia",
      nationality: "Cambodia",
      gender: "Male",
      idType: "National ID",
      idNumber: "010012345",
      idExpiry: "2028-05-15",
      phone: "+855 12 345 678",
      email: "sokbunthoeun@gmail.com",
      address: "St. 271, Toul Kork",
      city: "Phnom Penh",
      emergencyName: "Sok Ratha",
      emergencyRelation: "Father",
      emergencyPhone: "+855 89 123 456",
      bloodType: "O+",
      lastMedicalCheck: "2025-03-01",
      medicalExpiry: "2026-03-01",
      medicalConditions: "None",
      allergies: "None",
      weight: 67.5,
      height: "175 cm",
      reach: "178 cm",
      experience: "5 years",
      styles: ["Aggressive", "Clinch Master"],
      type: "Professional",
      grade: "B",
      origin: "Local",
      club: "Tiger Kun Khmer",
      clubId: "club-001",
      trainer: "Master Vong",
      promoter: "KKF Official",
      documents: ["National ID Card", "Medical Certificate", "Blood Test Results", "Club Registration"]
    }
  },
  {
    id: "wf-002",
    type: "club",
    title: "Register Club: Dragon Fight Academy",
    status: "pending",
    createdBy: "u5",
    createdDate: "2025-03-18",
    submittedDate: "2025-03-20",
    data: {
      clubName: "Dragon Fight Academy",
      headCoach: "Master Vong Sarath",
      location: "Siem Reap",
      fightersCount: 0,
      verificationDocs: ["Business License", "Facility Photos"]
    }
  },
  {
    id: "wf-003",
    type: "champion",
    title: "Title Fight: KKF Bantamweight Championship",
    status: "pending",
    createdBy: "u2",
    createdDate: "2025-03-15",
    submittedDate: "2025-03-17",
    data: {
      titleName: "KKF Bantamweight Championship",
      beltType: "Championship Belt",
      challenger: "Pich Sambath",
      champion: "Kim Sovannak",
      weightLimit: 61.2,
      rounds: 5,
      ranking: "Both fighters in Top 5",
      eventName: "Khmer New Year Fight Festival"
    }
  },
  {
    id: "wf-006",
    type: "fighter",
    title: "Register Fighter: Chan Virak",
    status: "pending",
    createdBy: "u3",
    createdDate: "2025-03-23",
    submittedDate: "2025-03-24",
    data: {
      fighterName: "Chan Virak",
      club: "Phnom Penh Warriors",
      weight: 58.3,
      type: "Amateur",
      origin: "Local",
      documents: ["ID Card", "Medical Certificate", "Parental Consent"]
    }
  },
  {
    id: "wf-007",
    type: "event",
    title: "Event Request: Battambang Fight Night",
    status: "pending",
    createdBy: "u2",
    createdDate: "2025-03-21",
    submittedDate: "2025-03-23",
    data: {
      eventName: "Battambang Fight Night",
      date: "2025-04-20",
      location: "Battambang Sports Arena",
      expectedMatches: 8,
      sponsors: ["Angkor Beer", "Wing Bank"]
    }
  },
  {
    id: "wf-008",
    type: "match",
    title: "Match Batch: BATCH-001 (Cambodia Fight Series)",
    status: "pending",
    createdBy: "u2",
    createdDate: "2025-03-22",
    submittedDate: "2025-03-23",
    data: {
      batchNumber: "BATCH-001",
      eventName: "Cambodia Fight Series",
      matchCount: 5,
      category: "Professional",
      totalFighters: 10,
      date: "2025-04-15",
      matches: [
        {
          matchNumber: 1,
          fighterA: { name: "Sok Bunthoeun", weight: 67.5, record: "12-3-0", club: "Tiger Kun Khmer", grade: "B" },
          fighterB: { name: "Pich Sambath", weight: 67.8, record: "10-2-1", club: "Diamond Fighters Gym", grade: "B" },
          weightAgreement: 68.0,
          rounds: 5,
          type: "Professional",
          isMainEvent: false
        }
      ]
    }
  },
  {
    id: "wf-004",
    type: "fighter",
    title: "Register Fighter: Nguyen Van Thanh",
    status: "approved",
    createdBy: "u3",
    createdDate: "2025-03-10",
    submittedDate: "2025-03-12",
    reviewedBy: "u1",
    reviewedDate: "2025-03-14",
    comments: "All documents verified. Fighter approved for competition.",
    data: {
      fighterName: "Nguyen Van Thanh",
      club: "Hanoi Champions",
      weight: 70.0,
      type: "Professional",
      origin: "Foreigner",
      documents: ["Passport", "Medical Certificate", "Visa"]
    }
  },
  {
    id: "wf-009",
    type: "event",
    title: "Event Request: Khmer New Year Fight Festival",
    status: "approved",
    createdBy: "u2",
    createdDate: "2025-03-05",
    submittedDate: "2025-03-07",
    reviewedBy: "u1",
    reviewedDate: "2025-03-10",
    comments: "Event approved. Excellent venue and organization plan.",
    data: {
      eventName: "Khmer New Year Fight Festival",
      date: "2025-04-14",
      location: "National Olympic Stadium",
      expectedMatches: 12,
      sponsors: ["Smart Axiata", "Cellcard", "Metfone"]
    }
  },
  {
    id: "wf-010",
    type: "champion",
    title: "Title Fight: KKF Lightweight Championship",
    status: "approved",
    createdBy: "u2",
    createdDate: "2025-03-08",
    submittedDate: "2025-03-10",
    reviewedBy: "u1",
    reviewedDate: "2025-03-12",
    comments: "Both fighters meet championship requirements. Title fight approved.",
    data: {
      titleName: "KKF Lightweight Championship",
      beltType: "Championship Belt",
      challenger: "Meas Chanthy",
      champion: "Ly Sokha",
      weightLimit: 70.3,
      rounds: 5,
      ranking: "Challenger ranked #1, Champion current titleholder",
      eventName: "Khmer New Year Fight Festival"
    }
  },
  {
    id: "wf-005",
    type: "club",
    title: "Register Club: Phnom Penh Elite Gym",
    status: "rejected",
    createdBy: "u6",
    createdDate: "2025-03-08",
    submittedDate: "2025-03-09",
    reviewedBy: "u1",
    reviewedDate: "2025-03-11",
    comments: "Facility does not meet KKF safety standards. Please upgrade equipment and reapply.",
    data: {
      clubName: "Phnom Penh Elite Gym",
      headCoach: "Chan Sophal",
      location: "Phnom Penh",
      fightersCount: 0,
      verificationDocs: ["Business License"]
    }
  },
  {
    id: "wf-011",
    type: "fighter",
    title: "Register Fighter: Lee Jae-sung",
    status: "rejected",
    createdBy: "u5",
    createdDate: "2025-03-16",
    submittedDate: "2025-03-18",
    reviewedBy: "u1",
    reviewedDate: "2025-03-19",
    comments: "Medical certificate expired. Please submit updated medical clearance.",
    data: {
      fighterName: "Lee Jae-sung",
      club: "Seoul Fight Academy",
      weight: 75.0,
      type: "Professional",
      origin: "Foreigner",
      documents: ["Passport", "Expired Medical Certificate"]
    }
  },
  {
    id: "wf-012",
    type: "fighter",
    title: "Register Fighter: Meas Bopha",
    status: "pending",
    createdBy: "u4",
    createdDate: "2025-03-25",
    submittedDate: "2025-03-26",
    data: {
      fighterName: "Meas Bopha",
      club: "Diamond Fighters Gym",
      weight: 62.0,
      type: "Professional",
      origin: "Local",
      documents: ["ID Card", "Medical Certificate", "Blood Test Results"]
    }
  }
];

export function addWorkflowRequest(request: {
  type: WorkflowType;
  title: string;
  createdBy: string;
  data: any;
}): WorkflowRequest {
  const newRequest: WorkflowRequest = {
    id: `wf-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-4)}`,
    type: request.type,
    title: request.title,
    status: "pending",
    createdBy: request.createdBy,
    createdDate: new Date().toISOString().split('T')[0],
    submittedDate: new Date().toISOString().split('T')[0],
    data: request.data
  };
  MOCK_WORKFLOW_REQUESTS.push(newRequest);
  return newRequest;
}

export function updateWorkflowStatus(
  id: string,
  status: "approved" | "rejected",
  reviewerId: string,
  comments?: string
): void {
  const request = MOCK_WORKFLOW_REQUESTS.find(r => r.id === id);
  if (!request) return;

  request.status = status;
  request.reviewedBy = reviewerId;
  request.reviewedDate = new Date().toISOString().split('T')[0];
  request.comments = comments;

  const isApproved = status === "approved";

  // Mutate corresponding entity list reactively
  if (request.type === "fighter") {
    const fighterName = request.data.fighterName || request.data.nameEN || request.data.nameKH;
    const fighter = MOCK_FIGHTERS.find(f => f.name.toLowerCase() === fighterName?.toLowerCase());
    
    if (fighter) {
      fighter.approvalStatus = isApproved ? "approved" : "rejected";
      fighter.status = isApproved ? "Active" : "Injured"; // Active if approved
    } else if (isApproved) {
      // If it doesn't exist, we create and add it
      MOCK_FIGHTERS.push({
        id: `f${Date.now()}`,
        name: fighterName || "Unknown Fighter",
        alias: request.data.alias || "The Warrior",
        weight: parseFloat(request.data.weight) || 60,
        gym: request.data.club || "Phnom Penh Top Team",
        clubId: request.data.clubId || "c1",
        origin: request.data.origin || "Local",
        type: request.data.type || "Professional",
        grade: request.data.grade || "B",
        style: request.data.styles?.join(", ") || "Aggressive",
        image: "https://images.unsplash.com/photo-1601039834001-7d32a613c60d?auto=format&fit=crop&q=80&w=600",
        status: "Active",
        approvalStatus: "approved"
      });
    }
  } else if (request.type === "club") {
    const clubName = request.data.clubName;
    const club = MOCK_CLUBS.find(c => c.name.toLowerCase() === clubName?.toLowerCase());
    
    if (club) {
      club.status = isApproved ? "active" : "inactive";
    } else if (isApproved) {
      MOCK_CLUBS.push({
        id: `c${Date.now()}`,
        name: clubName || "Unknown Club",
        location: request.data.location || "Phnom Penh",
        headCoach: request.data.headCoach || "Master Vong",
        activeFighters: 0,
        rating: 5.0,
        status: "active",
        image: "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=2940&auto=format&fit=crop"
      });
    }
  } else if (request.type === "event") {
    const eventName = request.data.eventName;
    const event = MOCK_EVENTS.find(e => e.name.toLowerCase() === eventName?.toLowerCase() || e.id === request.data.eventId);
    if (event) {
      event.kkfStatus = isApproved ? "Approved" : "Draft";
      event.status = isApproved ? "Published" : "Draft";
      event.kkfComments = comments;
    }
  } else if (request.type === "champion") {
    const titleName = request.data.titleName;
    const champion = MOCK_CHAMPIONS.find(c => c.titleName.toLowerCase() === titleName?.toLowerCase() || c.id === request.data.championId);
    if (champion) {
      champion.status = isApproved ? "Active" : "Vacant";
      if (isApproved && request.data.champion) {
        champion.currentHolderName = request.data.champion;
      }
    } else if (isApproved) {
      MOCK_CHAMPIONS.push({
        id: request.data.championId || `champ-${Date.now()}`,
        titleName: titleName || "Championship Belt",
        championType: request.data.championType || "KKF National",
        weightClass: request.data.weightClass || 60,
        organization: request.data.organization || "KKF",
        batchId: request.data.batchId || "batch-001",
        eventName: request.data.eventName || "Kun Khmer Championship",
        currentHolderName: request.data.champion || undefined,
        status: "Active",
        defenseCount: 0,
        dateCreated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  } else if (request.type === "match") {
    // Approve matches batch
    const batchId = request.data.batchId || request.data.batchNumber;
    const batch = MOCK_BATCHES.find(b => b.id === batchId || b.batchNumber === batchId);
    if (batch) {
      batch.status = isApproved ? "Approved" : "Rejected";
      batch.reviewedBy = reviewerId;
      batch.reviewedDate = new Date().toISOString().split('T')[0];
      if (isApproved) {
        batch.approvalNotes = comments;
        batch.rejectionReason = undefined;
      } else {
        batch.rejectionReason = comments;
        batch.approvalNotes = undefined;
      }
    }
    const matches = MOCK_MATCHES.filter(m => m.batchId === batchId);
    matches.forEach(m => {
      m.status = isApproved ? "Club Confirmed" : "Proposed";
    });
  }
}
