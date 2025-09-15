interface SuccessStepProps {
  mode: 'signin' | 'signup'
}

export function SuccessStep({ mode }: SuccessStepProps) {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-12 h-12 bg-chart-1/10 rounded-full flex items-center justify-center">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-background rounded-full" />
        </div>
      </div>
      <div>
        <h4 className="font-medium text-green-900">Success!</h4>
        <p className="text-sm text-green-800">
          {mode === 'signin' ? 'Welcome back!' : 'Account created successfully!'}
        </p>
      </div>
    </div>
  )
}