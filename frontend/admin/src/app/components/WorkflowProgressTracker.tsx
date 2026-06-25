import { Check, Circle, Clock } from "lucide-react";

interface WorkflowStep {
  id: string;
  label: string;
  description?: string;
  status: "completed" | "current" | "pending";
}

interface WorkflowProgressTrackerProps {
  steps: WorkflowStep[];
  title?: string;
  variant?: "horizontal" | "vertical";
}

export function WorkflowProgressTracker({ 
  steps, 
  title = "Workflow Progress",
  variant = "horizontal" 
}: WorkflowProgressTrackerProps) {
  
  if (variant === "vertical") {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
        {title && (
          <h3 className="text-xl font-black uppercase tracking-tight text-[#0A3D91] mb-6">
            {title}
          </h3>
        )}
        
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-green-300 via-blue-200 to-gray-200" />
          
          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Step Circle */}
                <div className={`relative z-10 w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center shrink-0 ${
                  step.status === "completed" 
                    ? "bg-gradient-to-br from-green-500 to-green-600 ring-4 ring-green-100" 
                    : step.status === "current"
                    ? "bg-gradient-to-br from-[#0A3D91] to-blue-700 ring-4 ring-blue-100 animate-pulse"
                    : "bg-gradient-to-br from-gray-300 to-gray-400"
                }`}>
                  {step.status === "completed" ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : step.status === "current" ? (
                    <Clock className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-3 h-3 text-white fill-white" />
                  )}
                </div>

                {/* Step Content */}
                <div className={`flex-1 pb-2 ${
                  step.status === "current" ? "pt-1" : "pt-0.5"
                }`}>
                  <div className={`font-black text-sm uppercase tracking-wide ${
                    step.status === "completed" 
                      ? "text-green-700" 
                      : step.status === "current"
                      ? "text-[#0A3D91]"
                      : "text-gray-500"
                  }`}>
                    {step.label}
                  </div>
                  {step.description && (
                    <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                  )}
                </div>

                {/* Step Number Badge */}
                <div className={`text-xs font-bold px-2 py-1 rounded ${
                  step.status === "completed" 
                    ? "bg-green-100 text-green-700" 
                    : step.status === "current"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
      {title && (
        <h3 className="text-xl font-black uppercase tracking-tight text-[#0A3D91] mb-6 text-center">
          {title}
        </h3>
      )}
      
      <div className="relative">
        {/* Horizontal connecting line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gradient-to-r from-green-200 via-blue-200 to-gray-200" 
             style={{ 
               left: '40px',
               right: '40px'
             }} 
        />
        
        {/* Steps */}
        <div className="relative flex justify-between items-start">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center" style={{ flex: 1 }}>
              {/* Step Circle */}
              <div className={`relative z-10 w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                step.status === "completed" 
                  ? "bg-gradient-to-br from-green-500 to-green-600 ring-4 ring-green-100" 
                  : step.status === "current"
                  ? "bg-gradient-to-br from-[#0A3D91] to-blue-700 ring-4 ring-blue-100 animate-pulse"
                  : "bg-gradient-to-br from-gray-300 to-gray-400"
              }`}>
                {step.status === "completed" ? (
                  <Check className="w-5 h-5 text-white" />
                ) : step.status === "current" ? (
                  <Clock className="w-5 h-5 text-white" />
                ) : (
                  <Circle className="w-3 h-3 text-white fill-white" />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center max-w-[120px]">
                <div className={`font-black text-[10px] uppercase tracking-wider leading-tight ${
                  step.status === "completed" 
                    ? "text-green-700" 
                    : step.status === "current"
                    ? "text-[#0A3D91]"
                    : "text-gray-500"
                }`}>
                  {step.label}
                </div>
                <div className={`text-[8px] font-bold mt-1 px-2 py-0.5 rounded inline-block ${
                  step.status === "completed" 
                    ? "bg-green-100 text-green-700" 
                    : step.status === "current"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  Step {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
