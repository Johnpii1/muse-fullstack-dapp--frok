import { useState, useEffect } from 'react'
import { Wallet, LogOut, Settings, Download, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { useStellar } from '@/hooks/useStellar'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { Button } from '@/components/ui/Button'
import { AppError } from '@/utils/errorHandler'

interface WalletConnectProps {
  onConnectionChange?: (isConnected: boolean) => void
}

export function WalletConnect({ onConnectionChange }: WalletConnectProps) {
  const { 
    account, 
    isLoading, 
    connectWallet, 
    disconnectWallet, 
    network, 
    setNetwork,
    freighterState,
    checkFreighterInstalled,
    openFreighterDownload 
  } = useStellar()
  
  const [showNetworkSwitch, setShowNetworkSwitch] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [checkingInstall, setCheckingInstall] = useState(false)

  // Check if Freighter is installed on mount
  useEffect(() => {
    const checkInstall = async () => {
      setCheckingInstall(true)
      await checkFreighterInstalled()
      setCheckingInstall(false)
    }
    checkInstall()
  }, [checkFreighterInstalled])

  // Notify parent of connection state changes
  useEffect(() => {
    onConnectionChange?.(account.isConnected)
  }, [account.isConnected, onConnectionChange])

  const handleConnect = async () => {
    setError(null)
    try {
      await connectWallet()
    } catch (err) {
      const appError = err instanceof AppError ? err : { 
        code: 'UNKNOWN_ERROR', 
        message: String(err), 
        userMessage: 'An unexpected error occurred while connecting to your wallet.',
        isRecoverable: true 
      }
      setError(appError)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return 'Loading...'
    const num = parseFloat(balance)
    if (isNaN(num)) return '0 XLM'
    if (num < 0.01 && num > 0) {
      return '< 0.01 XLM'
    }
    return `${num.toFixed(2)} XLM`
  }

  // Show loading state while checking Freighter installation
  if (checkingInstall) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2">
        <Loader className="h-4 w-4 animate-spin text-secondary-500" />
        <span className="text-sm text-secondary-500">Checking wallet...</span>
      </div>
    )
  }

  // Show Freighter installation prompt if not installed
  if (!freighterState.isInstalled) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="primary"
          size="md"
          onClick={handleConnect}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Install Freighter</span>
        </Button>
        
        {error && (
          <ErrorDisplay
            error={error}
            onRetry={() => openFreighterDownload()}
            onDismiss={() => setError(null)}
            showRetry={true}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-2">
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={handleConnect}
          onDismiss={() => setError(null)}
          showRetry={error.isRecoverable}
        />
      )}
      
      {account.isConnected ? (
        <div className="flex items-center space-x-3">
          {/* Network Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowNetworkSwitch(!showNetworkSwitch)}
              className="btn-outline px-3 py-1 text-sm flex items-center space-x-1"
            >
              <span className={`w-2 h-2 rounded-full ${network === 'testnet' ? 'bg-blue-500' : 'bg-green-500'}`} />
              <span>{network === 'testnet' ? 'Testnet' : 'Mainnet'}</span>
              <Settings className="h-3 w-3" />
            </button>
            
            {showNetworkSwitch && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setNetwork('testnet')
                    setShowNetworkSwitch(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-secondary-50 transition-colors ${
                    network === 'testnet' ? 'bg-secondary-100 font-medium' : ''
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Testnet</span>
                </button>
                <button
                  onClick={() => {
                    setNetwork('mainnet')
                    setShowNetworkSwitch(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-secondary-50 transition-colors ${
                    network === 'mainnet' ? 'bg-secondary-100 font-medium' : ''
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Mainnet</span>
                </button>
              </div>
            )}
          </div>
        
          {/* Balance and Address */}
          <div className="text-right">
            <div className="text-sm text-secondary-600 font-medium">
              {formatBalance(account.balance)}
            </div>
            <div className="text-xs text-secondary-500 flex items-center space-x-1">
              <span>{formatAddress(account.publicKey)}</span>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>
          </div>
          
          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="btn-outline p-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            title="Disconnect wallet"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          variant="primary"
          size="md"
          onClick={handleConnect}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" />
              <span>Connect Freighter</span>
            </>
          )}
        </Button>
      )}

      {/* Click outside to close network switcher */}
      {showNetworkSwitch && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNetworkSwitch(false)}
        />
      )}
    </div>
  )
}
