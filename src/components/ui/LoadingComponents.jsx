import React from 'react';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
const ProgressIndicator = ({
    steps,
    currentStep,
    error = null,
    className = ""
}) => {
    return (
        <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-400" />
                Loading Progress
            </h3>
            <div className="space-y-3">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const hasError = error && isCurrent;
                    return (
                        <div key={step.id} className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {hasError ? (
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                ) : isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : isCurrent ? (
                                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className={`text-sm font-medium ${hasError ? 'text-red-300' :
                                        isCompleted ? 'text-green-300' :
                                            isCurrent ? 'text-blue-300' :
                                                'text-gray-400'
                                    }`}>
                                    {step.label}
                                </div>
                                {step.description && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {step.description}
                                    </div>
                                )}
                                {hasError && (
                                    <div className="text-xs text-red-400 mt-1">
                                        {error}
                                    </div>
                                )}
                            </div>
                            {step.duration && isCompleted && (
                                <div className="text-xs text-gray-500">
                                    {step.duration}ms
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-300">
                            Something went wrong. Retrying automatically...
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
const LoadingCard = ({
    title,
    icon,
    isLoading,
    error,
    onRetry,
    children,
    loadingContent
}) => {
    if (isLoading) {
        return (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                </div>
                {loadingContent || (
                    <div className="space-y-4">
                        <div className="h-6 bg-gray-600 animate-pulse rounded w-3/4"></div>
                        <div className="h-4 bg-gray-600 animate-pulse rounded w-1/2"></div>
                        <div className="h-32 bg-gray-600 animate-pulse rounded"></div>
                    </div>
                )}
            </div>
        );
    }
    if (error) {
        return (
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <h2 className="text-xl font-semibold text-white">{title} Error</h2>
                </div>
                <p className="text-red-300 mb-4">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }
    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center mr-3">
                    {icon}
                </div>
                {title}
            </h2>
            {children}
        </div>
    );
};
export { ProgressIndicator, LoadingCard };
