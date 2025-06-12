import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { ProgressiveFormProps } from '@/lib/types/component-props';

export const ProgressiveForm: React.FC<ProgressiveFormProps> = ({
  steps,
  onComplete,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData] = useState<Record<string, unknown>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const canProceed = () => {
    const step = steps[currentStep];
    return step.validation ? step.validation() : true;
  };

  const nextStep = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleComplete = () => {
    if (canProceed()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onComplete(formData);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${getStepStatus(index) === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : getStepStatus(index) === 'current'
                  ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {getStepStatus(index) === 'completed' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  h-0.5 w-16 mx-2 transition-colors duration-300
                  ${completedSteps.has(index) ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${isAnimating ? 'opacity-50 transform translate-x-4' : 'opacity-100 transform translate-x-0'}
      `}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {steps[currentStep].title}
          </h2>
          {steps[currentStep].description && (
            <p className="text-gray-600 dark:text-gray-400">
              {steps[currentStep].description}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {steps[currentStep].fields}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${currentStep === 0 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
            }
          `}
        >
          Previous
        </button>

        {currentStep === steps.length - 1 ? (
          <button
            onClick={handleComplete}
            disabled={!canProceed()}
            className={`
              px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
              ${canProceed()
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Complete
            <Check className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`
              px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
              ${canProceed()
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgressiveForm; 