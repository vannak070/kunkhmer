// Demo page showcasing workflow validation features
// For development and testing purposes only

import { useState } from "react";
import { WorkflowHistory } from "../components/WorkflowHistory";
import { WorkflowProgressTracker } from "../components/WorkflowProgressTracker";
import { 
  canSubmitEventToKKF, 
  canCloseEvent, 
  canCreateMatchForEvent,
  createWorkflowEntry 
} from "../utils/workflowValidation";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router";

// Simple inline validation badge component
function ValidationBadge({ validation, showMessage, size = "md" }: { 
  validation: { isValid: boolean; message: string }; 
  showMessage?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center gap-2 rounded-lg font-bold ${sizeClasses[size]} ${
        validation.isValid 
          ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300" 
          : "bg-red-100 text-red-700 border-2 border-red-300"
      }`}>
        {validation.isValid ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        {validation.isValid ? "Valid" : "Invalid"}
      </div>
      {showMessage && (
        <p className="text-sm text-gray-600 font-medium">{validation.message}</p>
      )}
    </div>
  );
}

// Simple inline validation summary component
function ValidationSummary({ validations, title }: {
  validations: Array<{ label: string; validation: { isValid: boolean; message: string }; required?: boolean }>;
  title?: string;
}) {
  const requiredValidations = validations.filter(v => v.required !== false);
  const passedCount = requiredValidations.filter(v => v.validation.isValid).length;
  const totalCount = requiredValidations.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-gray-900">{title || "Validation Summary"}</h3>
        <div className={`px-4 py-2 rounded-lg font-bold ${
          allPassed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}>
          {passedCount} / {totalCount} Passed
        </div>
      </div>
      <div className="space-y-4">
        {validations.map((v, idx) => (
          <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            {v.validation.isValid ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-bold text-gray-900">{v.label}</p>
              <p className="text-sm text-gray-600 mt-1">{v.validation.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkflowDemo() {
  const [eventStatus, setEventStatus] = useState("Draft");
  
  // Mock event data
  const mockEvent = {
    id: "demo-1",
    name: "Demo Event",
    status: eventStatus,
    sponsors: ["Sponsor A", "Sponsor B"],
    location: "Demo Stadium",
    date: "2026-05-01",
    kkfStatus: eventStatus === "KKF Approved" ? "approved" : null
  };

  const mockMatches = [
    { id: "m1", status: eventStatus === "Closed" ? "Completed" : "In Progress", eventId: "demo-1" },
    { id: "m2", status: eventStatus === "Closed" ? "Completed" : "Assigned to Event", eventId: "demo-1" }
  ];

  // Sample workflow history
  const sampleHistory = [
    {
      status: "Draft",
      timestamp: "2026-03-20T10:00:00Z",
      userId: "u1",
      userName: "Demo Organizer",
      action: "Event created",
      comments: null
    },
    {
      status: "Pending KKF Approval",
      timestamp: "2026-03-21T14:30:00Z",
      userId: "u1",
      userName: "Demo Organizer",
      action: "Submitted to KKF for approval",
      comments: null
    },
    {
      status: "KKF Approved",
      timestamp: "2026-03-22T09:15:00Z",
      userId: "u2",
      userName: "KKF Officer",
      action: "Event approved by KKF",
      comments: "All requirements met. Event cleared for match creation."
    }
  ];

  // Workflow steps for progress tracker
  const workflowSteps = [
    {
      id: "create",
      label: "Event Created",
      description: "Basic information captured",
      status: "completed" as const
    },
    {
      id: "submit",
      label: "Submit to KKF",
      description: "Organizer submits for review",
      status: eventStatus === "Draft" ? ("current" as const) : ("completed" as const)
    },
    {
      id: "approve",
      label: "KKF Approval",
      description: "Federation reviews event",
      status: eventStatus === "Pending KKF Approval" ? ("current" as const) : 
             eventStatus === "KKF Approved" || eventStatus === "In Progress" || eventStatus === "Closed" ? ("completed" as const) : 
             ("pending" as const)
    },
    {
      id: "execute",
      label: "Event Execution",
      description: "Matches in progress",
      status: eventStatus === "In Progress" ? ("current" as const) : 
             eventStatus === "Closed" ? ("completed" as const) : 
             ("pending" as const)
    },
    {
      id: "close",
      label: "Event Closed",
      description: "All matches complete",
      status: eventStatus === "Closed" ? ("completed" as const) : ("pending" as const)
    }
  ];

  // Validations for summary
  const validations = [
    {
      label: "Can Submit to KKF",
      validation: canSubmitEventToKKF(mockEvent),
      required: true
    },
    {
      label: "Can Create Matches",
      validation: canCreateMatchForEvent(mockEvent),
      required: true
    },
    {
      label: "Can Close Event",
      validation: canCloseEvent(mockEvent, mockMatches),
      required: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <Link 
                to="/home/events"
                className="p-2 bg-white rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-4xl font-black text-[#0A3D91]">Workflow Features Demo</h1>
                <p className="text-gray-600 font-medium mt-1">
                  Interactive demonstration of validation, progress tracking, and audit logging
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Selector */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
          <h3 className="text-xl font-black text-[#0A3D91] mb-4">Simulate Event Status</h3>
          <div className="flex flex-wrap gap-3">
            {["Draft", "Pending KKF Approval", "KKF Approved", "In Progress", "Closed"].map(status => (
              <button
                key={status}
                onClick={() => setEventStatus(status)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  eventStatus === status
                    ? "bg-[#0A3D91] text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900 font-medium">
              <strong>Current Status:</strong> {eventStatus}
            </p>
          </div>
        </div>

        {/* Workflow Progress Tracker */}
        <div>
          <h2 className="text-2xl font-black text-[#0A3D91] mb-4">1. Workflow Progress Tracker</h2>
          <WorkflowProgressTracker 
            steps={workflowSteps}
            title="Event Workflow Progress"
            variant="horizontal"
          />
        </div>

        {/* Vertical Progress Tracker */}
        <div>
          <h2 className="text-2xl font-black text-[#0A3D91] mb-4">2. Vertical Progress Tracker</h2>
          <WorkflowProgressTracker 
            steps={workflowSteps}
            title="Event Workflow Progress (Vertical)"
            variant="vertical"
          />
        </div>

        {/* Validation Badges */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-[#0A3D91] mb-6">3. Validation Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Can Submit to KKF</p>
              <ValidationBadge 
                validation={canSubmitEventToKKF(mockEvent)}
                showMessage={true}
                size="md"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Can Create Matches</p>
              <ValidationBadge 
                validation={canCreateMatchForEvent(mockEvent)}
                showMessage={true}
                size="md"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Can Close Event</p>
              <ValidationBadge 
                validation={canCloseEvent(mockEvent, mockMatches)}
                showMessage={true}
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        <div>
          <h2 className="text-2xl font-black text-[#0A3D91] mb-4">4. Validation Summary</h2>
          <ValidationSummary 
            validations={validations}
            title="Event Validation Status"
          />
        </div>

        {/* Workflow History */}
        <div>
          <h2 className="text-2xl font-black text-[#0A3D91] mb-4">5. Workflow History (Audit Log)</h2>
          <WorkflowHistory 
            history={sampleHistory}
            title="Event Workflow History"
            defaultExpanded={true}
          />
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-[#0A3D91] mb-4">6. Usage Examples</h2>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Validate Before Action:</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`import { canSubmitEventToKKF } from '@/utils/workflowValidation';

const validation = canSubmitEventToKKF(event);
if (!validation.isValid) {
  toast.error(validation.message);
  return;
}

// Proceed with submission
event.status = "Pending KKF Approval";`}
              </pre>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">Create Workflow Entry:</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`import { createWorkflowEntry } from '@/utils/workflowValidation';

event.workflowHistory.push(
  createWorkflowEntry(
    "KKF Approved",
    currentUser.id,
    currentUser.fullName,
    "Event approved by KKF",
    "All requirements met"
  )
);`}
              </pre>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">Display Components:</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`import { WorkflowHistory } from '@/components/WorkflowHistory';
import { WorkflowProgressTracker } from '@/components/WorkflowProgressTracker';

<WorkflowProgressTracker steps={steps} variant="horizontal" />
<WorkflowHistory history={event.workflowHistory} defaultExpanded={true} />`}
              </pre>
            </div>
          </div>
        </div>

        {/* Feature Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200 p-8 shadow-lg">
          <h2 className="text-3xl font-black text-[#0A3D91] mb-6 text-center">✅ Features Demonstrated</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">✓ Validation Rules</h4>
              <p className="text-gray-600">Real-time validation with helpful error messages</p>
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">✓ Progress Tracking</h4>
              <p className="text-gray-600">Visual workflow progress indicators</p>
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">✓ Audit Logging</h4>
              <p className="text-gray-600">Complete history with timestamps and users</p>
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">✓ Status-Based Actions</h4>
              <p className="text-gray-600">Dynamic action availability based on state</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}