// Improved workflow validation for the 11-step Kun Khmer process
// CORRECTED ORDER: KKF approves EVENT before matches can be created

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface WorkflowHistoryEntry {
  status: string;
  timestamp: string;
  userId: string;
  userName?: string;
  comments?: string;
  action: string;
}

/**
 * STEP 1: Event Creation
 * Validates event has minimum required information
 */
export function canCreateEvent(eventData: any): ValidationResult {
  if (!eventData.name || eventData.name.trim() === "") {
    return { isValid: false, message: "Event name is required" };
  }

  if (!eventData.location || eventData.location.trim() === "") {
    return { isValid: false, message: "Event location is required" };
  }

  if (!eventData.date) {
    return { isValid: false, message: "Event date is required" };
  }

  return { isValid: true };
}

/**
 * STEP 2: Submit Event to KKF
 * Event must have sponsors before submission
 */
export function canSubmitEventToKKF(event: any): ValidationResult {
  if (event.status !== "Draft") {
    return {
      isValid: false,
      message: "Only Draft events can be submitted to KKF"
    };
  }

  if (!event.sponsors || event.sponsors.length === 0) {
    return {
      isValid: false,
      message: "Event must have at least one sponsor before submission to KKF"
    };
  }

  if (!event.name || !event.location || !event.date) {
    return {
      isValid: false,
      message: "Event must have name, location, and date"
    };
  }

  if (!event.station) {
    return {
      isValid: false,
      message: "Event must have a TV station/broadcaster"
    };
  }

  return { isValid: true };
}

/**
 * STEP 3: KKF Review & Approval ✅ (EVENT APPROVAL - must come first)
 * KKF reviews and approves the EVENT before matches can be created
 */
export function canKKFApproveEvent(event: any): ValidationResult {
  if (event.status !== "Pending KKF Approval") {
    return {
      isValid: false,
      message: "Event must be in 'Pending KKF Approval' status"
    };
  }

  if (!event.submittedDate) {
    return {
      isValid: false,
      message: "Event must be submitted to KKF first"
    };
  }

  return { isValid: true };
}

/**
 * STEP 4: Match Creation (Proposal)
 * Can only create matches AFTER KKF approves the event
 */
export function canCreateMatchForEvent(event: any): ValidationResult {
  if (event.status === "Draft") {
    return {
      isValid: false,
      message: "Event must be submitted to KKF before creating matches (Step 2)"
    };
  }

  if (event.status === "Pending KKF Approval") {
    return {
      isValid: false,
      message: "Event must be KKF approved before creating matches (Step 3)"
    };
  }

  if (event.kkfStatus !== "approved") {
    return {
      isValid: false,
      message: "Event must be KKF approved before creating matches"
    };
  }

  if (event.status === "Closed") {
    return {
      isValid: false,
      message: "Cannot create matches for a closed event"
    };
  }

  return { isValid: true };
}

/**
 * STEP 5: Club Confirmation
 * Validates match proposal can be sent to clubs
 */
export function canSendToClubs(match: any): ValidationResult {
  if (!match.fighterA || !match.fighterB) {
    return {
      isValid: false,
      message: "Match must have both fighters selected"
    };
  }

  if (!match.agreedWeight || match.agreedWeight <= 0) {
    return {
      isValid: false,
      message: "Match must have an agreed weight"
    };
  }

  if (!match.rounds || match.rounds <= 0) {
    return {
      isValid: false,
      message: "Match must have number of rounds specified"
    };
  }

  return { isValid: true };
}

/**
 * STEP 5: Club Confirmation Status
 * Checks if clubs have confirmed
 */
export function areClubsConfirmed(match: any): ValidationResult {
  if (match.clubAResponse !== "confirmed") {
    return {
      isValid: false,
      message: "Club A has not confirmed this match yet"
    };
  }

  if (match.clubBResponse !== "confirmed") {
    return {
      isValid: false,
      message: "Club B has not confirmed this match yet"
    };
  }

  return { isValid: true };
}

/**
 * STEP 6: Assign Matches to Event
 * Organizer assigns club-confirmed matches to event fight card
 */
export function canAssignMatchToEvent(match: any, event: any): ValidationResult {
  // Check if clubs confirmed
  const clubConfirmation = areClubsConfirmed(match);
  if (!clubConfirmation.isValid) {
    return clubConfirmation;
  }

  // Match must be in correct status
  if (match.status !== "Club Confirmed") {
    return {
      isValid: false,
      message: "Match must be club-confirmed before assignment (currently: " + match.status + ")"
    };
  }

  // Event must exist and be in valid state
  if (event.status === "Closed") {
    return {
      isValid: false,
      message: "Cannot assign matches to a closed event"
    };
  }

  if (event.kkfStatus !== "approved") {
    return {
      isValid: false,
      message: "Event must be KKF approved before assigning matches"
    };
  }

  return { isValid: true };
}

/**
 * STEP 7: Weigh-In & Final Confirmation
 * KKF conducts weigh-in
 */
export function canConductWeighIn(match: any): ValidationResult {
  if (match.status !== "Assigned to Event") {
    return {
      isValid: false,
      message: "Match must be assigned to event before weigh-in (currently: " + match.status + ")"
    };
  }

  if (!match.eventId) {
    return {
      isValid: false,
      message: "Match must be assigned to a specific event"
    };
  }

  // Both clubs must be confirmed
  const clubConfirmation = areClubsConfirmed(match);
  if (!clubConfirmation.isValid) {
    return clubConfirmation;
  }

  return { isValid: true };
}

/**
 * STEP 8: Match Execution
 * Validates match can start
 */
export function canStartMatch(match: any): ValidationResult {
  if (match.status !== "Ready to Fight") {
    return {
      isValid: false,
      message: "Match must be in 'Ready to Fight' status (currently: " + match.status + ")"
    };
  }

  // Weigh-in must be complete
  if (!match.weighInDate || !match.weighInWeightA || !match.weighInWeightB) {
    return {
      isValid: false,
      message: "Weigh-in must be completed before match can start"
    };
  }

  return { isValid: true };
}

/**
 * STEP 9: Result Update
 * KKF records match results
 */
export function canRecordResults(match: any): ValidationResult {
  if (match.status !== "In Progress") {
    return {
      isValid: false,
      message: "Can only record results for matches in progress (currently: " + match.status + ")"
    };
  }

  // Weigh-in must be complete
  if (!match.weighInDate || !match.weighInWeightA || !match.weighInWeightB) {
    return {
      isValid: false,
      message: "Weigh-in must be completed before recording results"
    };
  }

  return { isValid: true };
}

/**
 * STEP 10: Match Completion
 * Finalizes match with results
 */
export function canCompleteMatch(match: any): ValidationResult {
  if (match.status !== "Results Recorded") {
    return {
      isValid: false,
      message: "Results must be recorded before completing match (currently: " + match.status + ")"
    };
  }

  if (!match.result) {
    return {
      isValid: false,
      message: "Match result data is missing"
    };
  }

  if (!match.result.winner) {
    return {
      isValid: false,
      message: "Match must have a winner declared"
    };
  }

  if (!match.result.method) {
    return {
      isValid: false,
      message: "Match must have a winning method (KO, Decision, etc.)"
    };
  }

  return { isValid: true };
}

/**
 * STEP 11: Event Closure
 * Organizer closes event after all matches are completed
 */
export function canCloseEvent(event: any, matches: any[]): ValidationResult {
  if (event.status !== "In Progress" && event.status !== "KKF Approved") {
    return {
      isValid: false,
      message: "Only in-progress or approved events can be closed (currently: " + event.status + ")"
    };
  }

  const eventMatches = matches.filter(m => m.eventId === event.id);
  
  if (eventMatches.length === 0) {
    return {
      isValid: false,
      message: "Cannot close event with no matches"
    };
  }

  const incompleteMatches = eventMatches.filter(m => m.status !== "Completed");
  
  if (incompleteMatches.length > 0) {
    return {
      isValid: false,
      message: `Cannot close event: ${incompleteMatches.length} match(es) still incomplete. All matches must be completed first.`
    };
  }

  return { isValid: true };
}

/**
 * Helper: Check if event can start
 */
export function canStartEvent(event: any, matches: any[]): ValidationResult {
  if (event.kkfStatus !== "approved" || event.status !== "KKF Approved") {
    return {
      isValid: false,
      message: "Event must be KKF approved before it can start"
    };
  }

  const assignedMatches = matches.filter(m => 
    m.eventId === event.id && 
    ["Assigned to Event", "Weigh-In Complete", "Ready to Fight", "In Progress", "Results Recorded", "Completed"].includes(m.status)
  );

  if (assignedMatches.length === 0) {
    return {
      isValid: false,
      message: "Event must have at least one assigned match before starting"
    };
  }

  return { isValid: true };
}

/**
 * Get available actions for an event based on current status
 */
export function getAvailableEventActions(
  event: any, 
  matches: any[], 
  userRole: string,
  permissions: any
): Array<{ action: string; label: string; icon: string; color: string; validation: ValidationResult }> {
  const actions: Array<{ action: string; label: string; icon: string; color: string; validation: ValidationResult }> = [];

  // STEP 2: Submit to KKF (Organizer only, Draft status)
  if (event.status === "Draft" && permissions.hasPermission('events.submit')) {
    actions.push({
      action: "submit_to_kkf",
      label: "Submit to KKF",
      icon: "Send",
      color: "blue",
      validation: canSubmitEventToKKF(event)
    });
  }

  // Edit Event (Organizer, only if Draft or Rejected)
  if ((event.status === "Draft" || event.kkfStatus === "rejected") && permissions.hasPermission('events.update')) {
    actions.push({
      action: "edit_event",
      label: "Edit Event",
      icon: "Edit",
      color: "gray",
      validation: { isValid: true }
    });
  }

  // STEP 4: Create Match (Organizer, after KKF approval)
  if (event.kkfStatus === "approved" && event.status !== "Closed" && permissions.hasPermission('matches.create')) {
    actions.push({
      action: "create_match",
      label: "Create Match Proposal",
      icon: "Plus",
      color: "purple",
      validation: canCreateMatchForEvent(event)
    });
  }

  // STEP 6: Assign Matches (Organizer, when matches are club-confirmed)
  if (permissions.hasPermission('events.assign_matches')) {
    const confirmedMatches = matches.filter(m => m.status === "Club Confirmed");
    if (confirmedMatches.length > 0) {
      actions.push({
        action: "assign_matches",
        label: `Assign ${confirmedMatches.length} Confirmed Match(es)`,
        icon: "ListChecks",
        color: "green",
        validation: { isValid: true }
      });
    }
  }

  // Start Event (Organizer, when KKF approved and has matches)
  if (event.status === "KKF Approved" && permissions.hasPermission('events.start')) {
    actions.push({
      action: "start_event",
      label: "Start Event",
      icon: "PlayCircle",
      color: "red",
      validation: canStartEvent(event, matches)
    });
  }

  // STEP 11: Close Event (Organizer or KKF, when all matches complete)
  if ((event.status === "In Progress" || event.status === "KKF Approved") && permissions.hasPermission('events.close')) {
    actions.push({
      action: "close_event",
      label: "Close Event",
      icon: "CheckCircle",
      color: "green",
      validation: canCloseEvent(event, matches)
    });
  }

  return actions;
}

/**
 * Get available actions for a match based on current status
 */
export function getAvailableMatchActions(
  match: any,
  permissions: any
): Array<{ action: string; label: string; icon: string; color: string; validation: ValidationResult }> {
  const actions: Array<{ action: string; label: string; icon: string; color: string; validation: ValidationResult }> = [];

  // STEP 7: Conduct Weigh-In (KKF Officer)
  if (match.status === "Assigned to Event" && permissions.hasPermission('federation.conduct_weighin')) {
    actions.push({
      action: "conduct_weighin",
      label: "Conduct Weigh-In",
      icon: "Scale",
      color: "blue",
      validation: canConductWeighIn(match)
    });
  }

  // STEP 8: Start Match (KKF Officer)
  if (match.status === "Ready to Fight" && permissions.hasPermission('federation.start_match')) {
    actions.push({
      action: "start_match",
      label: "Start Match",
      icon: "PlayCircle",
      color: "red",
      validation: canStartMatch(match)
    });
  }

  // STEP 9: Record Results (KKF Officer)
  if (match.status === "In Progress" && permissions.hasPermission('federation.enter_results')) {
    actions.push({
      action: "record_results",
      label: "Record Results",
      icon: "FileText",
      color: "purple",
      validation: canRecordResults(match)
    });
  }

  // STEP 10: Complete Match (KKF Officer)
  if (match.status === "Results Recorded" && permissions.hasPermission('federation.complete_match')) {
    actions.push({
      action: "complete_match",
      label: "Complete Match",
      icon: "CheckCircle",
      color: "green",
      validation: canCompleteMatch(match)
    });
  }

  return actions;
}

/**
 * Create a workflow history entry
 */
export function createWorkflowEntry(
  status: string,
  userId: string,
  userName: string,
  action: string,
  comments?: string
): WorkflowHistoryEntry {
  return {
    status,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    comments
  };
}

/**
 * Get workflow step details for progress tracker
 */
export function getEventWorkflowSteps(event: any, matches: any[]) {
  const eventMatches = matches.filter(m => m.eventId === event.id);
  const allMatchesCompleted = eventMatches.length > 0 && eventMatches.every(m => m.status === "Completed");
  const hasAssignedMatches = eventMatches.some(m => ["Assigned to Event", "Weigh-In Complete", "Ready to Fight", "In Progress", "Results Recorded", "Completed"].includes(m.status));

  return [
    {
      id: "step1",
      label: "Event Created",
      description: "Basic event information captured",
      status: event.status !== null ? "completed" : "current"
    },
    {
      id: "step2",
      label: "Submit to KKF",
      description: "Organizer submits event for review",
      status: event.status === "Draft" ? "current" : 
             event.submittedDate ? "completed" : "pending"
    },
    {
      id: "step3",
      label: "KKF Review & Approval ✅",
      description: "KKF approves event (must come first)",
      status: event.kkfStatus === "approved" ? "completed" : 
             event.status === "Pending KKF Approval" ? "current" : "pending"
    },
    {
      id: "step4",
      label: "Match Creation",
      description: "Organizer creates match proposals",
      status: eventMatches.length > 0 ? "completed" : 
             event.kkfStatus === "approved" ? "current" : "pending"
    },
    {
      id: "step5",
      label: "Club Confirmation",
      description: "Clubs confirm/reject matches",
      status: eventMatches.some(m => m.clubAResponse === "confirmed" && m.clubBResponse === "confirmed") ? "completed" : 
             eventMatches.length > 0 ? "current" : "pending"
    },
    {
      id: "step6",
      label: "Assign to Event",
      description: "Organizer assigns confirmed matches",
      status: hasAssignedMatches ? "completed" : 
             eventMatches.some(m => m.status === "Club Confirmed") ? "current" : "pending"
    },
    {
      id: "step7",
      label: "Weigh-In",
      description: "KKF conducts weigh-in ceremony",
      status: eventMatches.some(m => m.weighInDate) ? "completed" : 
             eventMatches.some(m => m.status === "Assigned to Event") ? "current" : "pending"
    },
    {
      id: "step8",
      label: "Match Execution",
      description: "Matches take place",
      status: eventMatches.some(m => m.status === "Completed" || m.status === "Results Recorded") ? "completed" : 
             event.status === "In Progress" ? "current" : "pending"
    },
    {
      id: "step9",
      label: "Result Update",
      description: "KKF records match results",
      status: eventMatches.some(m => m.result) ? "completed" : 
             eventMatches.some(m => m.status === "In Progress") ? "current" : "pending"
    },
    {
      id: "step10",
      label: "Match Completion",
      description: "Matches finalized and locked",
      status: allMatchesCompleted ? "completed" : 
             eventMatches.some(m => m.status === "Results Recorded") ? "current" : "pending"
    },
    {
      id: "step11",
      label: "Event Closure",
      description: "Event officially closed",
      status: event.status === "Closed" ? "completed" : 
             allMatchesCompleted ? "current" : "pending"
    }
  ] as Array<{ id: string; label: string; description: string; status: "completed" | "current" | "pending" }>;
}

/**
 * Get match workflow steps for progress tracker
 */
export function getMatchWorkflowSteps(match: any) {
  const statusOrder = ["Proposed", "Pending Club Confirmation", "Club Confirmed", "Assigned to Event", "Weigh-In Complete", "Ready to Fight", "In Progress", "Results Recorded", "Completed"];
  const currentIndex = statusOrder.indexOf(match.status);

  return [
    {
      id: "step4",
      label: "Match Proposed",
      description: "Organizer creates match",
      status: currentIndex >= 0 ? "completed" : "current"
    },
    {
      id: "step5",
      label: "Club Confirmation",
      description: "Both clubs confirm",
      status: currentIndex >= 2 ? "completed" : currentIndex >= 1 ? "current" : "pending"
    },
    {
      id: "step6",
      label: "Assigned to Event",
      description: "Added to fight card",
      status: currentIndex >= 3 ? "completed" : currentIndex === 2 ? "current" : "pending"
    },
    {
      id: "step7",
      label: "Weigh-In Complete",
      description: "Official weigh-in done",
      status: currentIndex >= 4 ? "completed" : currentIndex === 3 ? "current" : "pending"
    },
    {
      id: "step8",
      label: "Match Execution",
      description: "Fight in progress",
      status: currentIndex >= 6 ? "completed" : currentIndex === 5 ? "current" : "pending"
    },
    {
      id: "step9",
      label: "Results Recorded",
      description: "Official results entered",
      status: currentIndex >= 7 ? "completed" : currentIndex === 6 ? "current" : "pending"
    },
    {
      id: "step10",
      label: "Match Completed",
      description: "Match finalized",
      status: currentIndex >= 8 ? "completed" : currentIndex === 7 ? "current" : "pending"
    }
  ] as Array<{ id: string; label: string; description: string; status: "completed" | "current" | "pending" }>;
}
