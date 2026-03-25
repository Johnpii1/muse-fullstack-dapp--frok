import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Upload, FileText, Wallet, Check, Sparkles, AlertCircle, ExternalLink } from 'lucide-react'
import { useStellar } from '@/hooks/useStellar'
import { ErrorHandler, AppError } from '@/utils/errorHandler'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { TransactionStatus, TransactionStatusType } from '@/components/TransactionStatus'

interface Metadata {
  title: string
  description: string
  category: string
  tags: string[]
  price: string
  royalty: string
}

interface FileData {
  file: File | null
  preview: string | null
  type: string
}

interface StepperProps {
  onComplete?: (data: { metadata: Metadata; fileData: FileData }) => void
}

export function MintStepper({ onComplete }: StepperProps) {
  const { 
    account, 
    isLoading: walletLoading, 
    connectWallet, 
    freighterState,
    openFreighterDownload,
    sendTransaction,
    server,
    network,
  } = useStellar()

  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<AppError | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Metadata state
  const [metadata, setMetadata] = useState<Metadata>({
    title: '',
    description: '',
    category: '',
    tags: [],
    price: '',
    royalty: '10'
  })

  // File state
  const [fileData, setFileData] = useState<FileData>({
    file: null,
    preview: null,
    type: ''
  })

  // Blockchain state
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatusType>('idle')

  // Wallet connection state
  const walletConnected = account.isConnected

  const steps = [
    { id: 1, title: 'Metadata', icon: FileText, description: 'Add artwork details' },
    { id: 2, title: 'Upload', icon: Upload, description: 'Upload your file' },
    { id: 3, title: 'Sign', icon: Wallet, description: 'Sign transaction' }
  ]

  const validateMetadata = (): boolean => {
    return !!(metadata.title.trim() &&
      metadata.description.trim() &&
      metadata.category &&
      metadata.price.trim())
  }

  const validateFile = (): boolean => {
    return !!(fileData.file && fileData.preview)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']
    const maxSize = 50 * 1024 * 1024 // 50MB

    if (!allowedTypes.includes(file.type)) {
      setError(ErrorHandler.handle({
        code: 'VALIDATION_ERROR',
        message: 'Invalid file type. Please upload an image or video.',
        userMessage: 'Invalid file type. Please upload an image or video.',
        isRecoverable: false
      }))
      return
    }

    if (file.size > maxSize) {
      setError(ErrorHandler.handle({
        code: 'VALIDATION_ERROR',
        message: 'File too large. Maximum size is 50MB.',
        userMessage: 'File too large. Maximum size is 50MB.',
        isRecoverable: false
      }))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setFileData({
        file,
        preview: e.target?.result as string,
        type: file.type
      })
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateMetadata()) {
      setError(ErrorHandler.handle({
        code: 'VALIDATION_ERROR',
        message: 'Please fill in all required fields',
        userMessage: 'Please fill in all required fields',
        isRecoverable: false
      }))
      return
    }

    if (currentStep === 2 && !validateFile()) {
      setError(ErrorHandler.handle({
        code: 'VALIDATION_ERROR',
        message: 'Please upload a file',
        userMessage: 'Please upload a file',
        isRecoverable: false
      }))
      return
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      setError(null)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleConnectWallet = async () => {
    setIsProcessing(true)
    setError(null)
    try {
      await connectWallet()
    } catch (err) {
      const appError = err instanceof AppError ? err : ErrorHandler.handle(err)
      setError(appError)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSignTransaction = async () => {
    if (!walletConnected) {
      setError(ErrorHandler.handle({
        code: 'WALLET_ERROR',
        message: 'Please connect your wallet first',
        userMessage: 'Please connect your wallet first',
        isRecoverable: false
      }))
      return
    }

    setIsProcessing(true)
    setTransactionStatus('pending')

    try {
      // In a real implementation, you would:
      // 1. Create a Soroban contract transaction for minting
      // 2. Use sendTransaction to sign and submit it
      
      // For demo purposes, we simulate the transaction flow
      // In production, replace this with actual contract interaction:
      
      /*
      // Example real implementation:
      const contractId = import.meta.env.VITE_CONTRACT_ID
      const contract = new Contract(contractId)
      
      // Build the mint transaction
      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC,
      })
        .addOperation(contract.call('mint', ...params))
        .setTimeout(30)
        .build()
      
      const result = await sendTransaction(transaction)
      
      if (result.status === 'success') {
        setTransactionHash(result.hash)
        setTransactionStatus('confirmed')
      }
      */

      // Simulated transaction for demo
      await new Promise(resolve => setTimeout(resolve, 3000))
      const mockHash = 'tx_' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      setTransactionHash(mockHash)
      setTransactionStatus('confirmed')
      onComplete?.({ metadata, fileData })

    } catch (err) {
      setTransactionStatus('failed')
      const appError = err instanceof AppError ? err : ErrorHandler.handle(err)
      setError(appError)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                placeholder="Enter artwork title"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Description *
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                placeholder="Describe your artwork..."
                className="input w-full h-32 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category *
                </label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                  className="input w-full"
                >
                  <option value="">Select category</option>
                  <option value="digital-art">Digital Art</option>
                  <option value="photography">Photography</option>
                  <option value="illustration">Illustration</option>
                  <option value="3d-art">3D Art</option>
                  <option value="animation">Animation</option>
                  <option value="music">Music</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Price (XLM) *
                </label>
                <input
                  type="number"
                  value={metadata.price}
                  onChange={(e) => setMetadata({ ...metadata, price: e.target.value })}
                  placeholder="0.0"
                  step="0.1"
                  min="0"
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Royalty (%)
              </label>
              <input
                type="number"
                value={metadata.royalty}
                onChange={(e) => setMetadata({ ...metadata, royalty: e.target.value })}
                placeholder="10"
                min="0"
                max="100"
                className="input w-full"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {!fileData.preview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-secondary-300 border-dashed rounded-lg cursor-pointer bg-secondary-50 hover:bg-secondary-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-secondary-400" />
                  <p className="mb-2 text-sm text-secondary-700">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-secondary-500">
                    PNG, JPG, GIF, WEBP or MP4 (MAX. 50MB)
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp,video/mp4"
                  onChange={handleFileUpload}
                />
              </label>
            ) : (
              <div className="relative">
                {fileData.type.startsWith('image/') ? (
                  <img 
                    src={fileData.preview} 
                    alt="Preview" 
                    className="w-full h-64 object-contain rounded-lg bg-secondary-100"
                  />
                ) : (
                  <video 
                    src={fileData.preview} 
                    controls 
                    className="w-full h-64 object-contain rounded-lg bg-secondary-100"
                  />
                )}
                <button
                  onClick={() => setFileData({ file: null, preview: null, type: '' })}
                  className="absolute top-2 right-2 p-2 bg-secondary-900/50 hover:bg-secondary-900 text-white rounded-full transition-colors"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {!walletConnected ? (
              <div className="text-center space-y-4">
                {freighterState.isInstalled ? (
                  <>
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center">
                        <Wallet className="h-8 w-8 text-secondary-600" />
                      </div>
                    </div>
                    <p className="text-secondary-600">
                      Connect your Freighter wallet to sign the minting transaction
                    </p>
                    <button
                      onClick={handleConnectWallet}
                      disabled={walletLoading}
                      className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
                    >
                      {walletLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="h-4 w-4" />
                          <span>Connect Wallet</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                    <p className="text-secondary-600">
                      Freighter wallet is required to mint NFTs on Stellar
                    </p>
                    <button
                      onClick={() => openFreighterDownload()}
                      className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Install Freighter</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span>Wallet connected: {account.publicKey.slice(0, 6)}...{account.publicKey.slice(-4)}</span>
                </div>

                <TransactionStatus
                  status={transactionStatus}
                  hash={transactionHash}
                  error={error?.userMessage}
                />

                {transactionStatus === 'idle' && (
                  <button
                    onClick={handleSignTransaction}
                    disabled={isProcessing}
                    className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Sign & Mint NFT</span>
                  </button>
                )}

                {isProcessing && transactionStatus === 'pending' && (
                  <button
                    disabled
                    className="btn-primary w-full py-3 flex items-center justify-center space-x-2 opacity-50"
                  >
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Processing...</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">Create NFT</h1>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${currentStep >= step.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-200 text-secondary-600'
                  }
                `}>
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-primary-600' : 'text-secondary-600'
                    }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-secondary-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-primary-600' : 'bg-secondary-200'
                  }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={() => setError(null)}
          showRetry={error.isRecoverable}
        />
      )}

      {/* Step Content */}
      <div className="card p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="btn-secondary px-6 py-2 flex items-center space-x-2 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex space-x-2">
          {currentStep < 3 && (
            <button
              onClick={handleNext}
              className="btn-primary px-6 py-2 flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
