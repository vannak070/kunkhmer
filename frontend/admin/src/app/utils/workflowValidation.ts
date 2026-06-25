// Workflow validation rules for KUN KHMER Digital Platform
// Enforces the 11-step Kun Khmer process flow

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
 * Validates if an event can be submitted to KKF
 * Step 2: Submit to KKF
 */
export function canSubmitEventToKKF(event: any): ValidationResult {
  // Must be in Draft status
  if (event.status !== "Draft") {
    return {
      isValid: false,
      message: "Event must be in Draft status to submit to KKF"
    };
  }

  // Must have at least one sponsor
  if (!event.sponsors || event.sponsors.length === 0) {
    return {
      isValid: false,
      message: "Event must have at least one sponsor before submission"
    };
  }

  // Must have basic event information
  if (!event.name || !event.location || !event.date) {
    return {
      isValid: false,
      message: "Event must have name, location, and date"
    };
  }

  return { isValid: true };
}

/**
 * Validates if matches can be created for an event
 * Step 3: Match Creation (after submission to KKF)
 */
export function canCreateMatchForEvent(event: any): ValidationResult {
  // Event must be submitted to KKF (not Draft)
  if (event.status === "Draft") {
    return {
      isValid: false,
      message: "Event must be submitted to KKF before creating matches"
    };
  }

  // Event must not be closed
  if (event.status === "Closed") {
    return {
      isValid: false,
      message: "Cannot create matches for a closed event"
    };
  }

  return { isValid: true };
}

/**
 * Validates if a match can be assigned to an event
 * Step 5: Assign Matches to Event
 */
export function canAssignMatchToEvent(match: any): ValidationResult {
  // Match must have both clubs confirmed
  if (match.clubAResponse !== "confirmed" || match.clubBResponse !== "confirmed") {
    return {
      isValid: false,
      message: "Both clubs must confirm the match before it can be assigned to an event"
    };
  }

  // Match must be in correct status
  if (match.status !== "Club Confirmed" && match.status !== "Pending Club Confirmation") {
    return {
      isValid: false,
      message: "Match must be club-confirmed before assignment"
    };
  }

  return { isValid: true };
}

/**
 * Validates if an event can be started
 * Event must be KKF approved with assigned matches
 */
export function canStartEvent(event: any, matches: any[]): ValidationResult {
  // Event must be KKF approved
  if (event.kkfStatus !== "approved" || event.status !== "KKF Approved") {
    return {
      isValid: false,
      message: "Event must be approved by KKF before it can start"
    };
  }

  // Must have at least one match assigned
  const assignedMatches = matches.filter(m => 
    m.eventId === event.id && 
    (m.status === "Assigned to Event" || 
     m.status === "Weigh-In Complete" || 
     m.status === "Ready to Fight" ||
     m.status === "In Progress" ||
     m.status === "Results Recorded" ||
     m.status === "Completed")
  );

  if (assignedMatches.length === 0) {
    return {
      isValid: false,
      message: "Event must have at least one assigned match"
    };
  }

  return { isValid: true };
}

/**
 * Validates if an event can be closed
 * Step 11: Event Closure
 */
export function canCloseEvent(event: any, matches: any[]): ValidationResult {
  // Event must be in progress or approved
  if (event.status !== "In Progress" && event.status !== "KKF Approved") {
    return {
      isValid: false,
      message: "Only in-progress or approved events can be closed"
    };
  }

  // All matches must be completed
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
      message: `Cannot close event: ${incompleteMatches.length} match(es) still incomplete`
    };
  }

  return { isValid: true };
}

/**
 * Validates if weigh-in can be conducted for a match
 * Step 7: Weigh-In & Final Confirmation
 */
export function canConductWeighIn(match: any): ValidationResult {
  // Match must be assigned to event
  if (match.status !== "Assigned to Event" && match.status !== "Club Confirmed") {
    return {
      isValid: false,
      message: "Match must be assigned to an event before weigh-in"
    };
  }

  // Match must have both fighters confirmed
  if (match.clubAResponse !== "confirmed" || match.clubBResponse !== "confirmed") {
    return {
      isValid: false,
      message: "Both clubs must confirm fighters before weigh-in"
    };
  }

  return { isValid: true };
}

/**
 * Validates if results can be recorded for a match
 * Step 9: Result Update
 */
export function canRecordResults(match: any): ValidationResult {
  // Match must be in progress or ready to fight
  if (match.status !== "In Progress" && match.status !== "Ready to Fight") {
    return {
      isValid: false,
      message: "Can only record results for matches in progress"
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
 * Validates if a match can be marked as completed
 * Step 10: Match Completion
 */
export function canCompleteMatch(match: any): ValidationResult {
  // Results must be recorded
  if (!match.result || match.status !== "Results Recorded") {
    return {
      isValid: false,
      message: "Results must be recorded before completing match"
    };
  }

  return { isValid: true };
}

/**
 * Get available actions for an event based on its current status and user permissions
 */
export function getAvailableEventActions(
  event: any, 
  matches: any[], 
  userRole: string,
  permissions: any
): Array<{ action: string; label: string; icon: string; color: string; validation: ValidationResult }> {
  const actions: Array<{ action: string; label: string; icon: string; color: string; validation: ValidationResult }> = [];

  // Submit to KKF (Organizer only)
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

  // Create Match (Organizer, after submission)
  if (permissions.hasPermission('matches.create')) {
    actions.push({
      action: "create_match",
      label: "Create Match",
      icon: "Plus",
      color: "purple",
      validation: canCreateMatchForEvent(event)
    });
  }

  // Assign Matches (Organizer, when matches are club-confirmed)
  if (permissions.hasPermission('events.assign_matches')) {
    const confirmedMatches = matches.filter(m => 
      m.status === "Club Confirmed" && m.eventId === event.id
    );
    if (confirmedMatches.length > 0) {
      actions.push({
        action: "assign_matches",
        label: `Assign Matches (${confirmedMatches.length})`,
        icon: "ListChecks",
        color: "green",
        validation: { isValid: true }
      });
    }
  }

  // Start Event (Organizer, when KKF approved)
  if (event.status === "KKF Approved" && permissions.hasPermission('events.start')) {
    actions.push({
      action: "start_event",
      label: "Start Event",
      icon: "Play",
      color: "red",
      validation: canStartEvent(event, matches)
    });
  }

  // Close Event (Organizer or KKF, when all matches complete)
  if (permissions.hasPermission('events.close')) {
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
 * Get available actions for a match based on its current status and user permissions
 */
export function getAvailableMatchActions(
  match: any,
  permissions: any
): Array<{ action: string; label: string; icon: string; color: string; validation: ValidationResult }> {
  const actions: Array<{ action: string; label: string; icon: string; color: string; validation: ValidationResult }> = [];

  // Conduct Weigh-In (KKF Officer)
  if (permissions.hasPermission('federation.conduct_weighin')) {
    actions.push({
      action: "conduct_weighin",
      label: "Conduct Weigh-In",
      icon: "Scale",
      color: "blue",
      validation: canConductWeighIn(match)
    });
  }

  // Record Results (KKF Officer)
  if (permissions.hasPermission('federation.enter_results')) {
    actions.push({
      action: "record_results",
      label: "Record Results",
      icon: "FileText",
      color: "purple",
      validation: canRecordResults(match)
    });
  }

  // Complete Match (KKF Officer)
  if (permissions.hasPermission('federation.complete_match')) {
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
 * Format workflow history for display
 */
export function formatWorkflowHistory(history: WorkflowHistoryEntry[]): string {
  return history.map(entry => {
    const date = new Date(entry.timestamp).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${date} - ${entry.userName}: ${entry.action}`;
  }).join('\n');
}
