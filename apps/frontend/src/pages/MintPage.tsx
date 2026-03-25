import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { MintStepper } from '@/components/MintStepper'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { TransactionStatus, TransactionStatusType } from '@/components/TransactionStatus'
import { useStellar } from '@/hooks/useStellar'
import { artworkService } from '@/services/artworkService'
import { CreateArtworkForm } from '@/types'
import { ErrorHandler } from '@/utils/errorHandler'

export const MintPage: React.FC = () => {
    const navigate = useNavigate()
    const { account, connectWallet } = useStellar()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [transactionStatus, setTransactionStatus] = useState<TransactionStatusType>('idle')
    const [transactionHash, setTransactionHash] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [mintedArtworkId, setMintedArtworkId] = useState<string | null>(null)

    const handleMintComplete = async (formData: CreateArtworkForm) => {
        if (!account.isConnected) {
            setError('Please connect your wallet first')
            return
        }

        setIsSubmitting(true)
        setTransactionStatus('pending')
        setError(null)

        try {
            // Validate artwork data
            const validation = artworkService.validateArtworkData(formData)
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '))
            }

            // Mint the artwork
            const response = await artworkService.mintArtwork({
                ...formData,
                creatorPublicKey: account.publicKey,
            })

            setTransactionHash(response.transactionHash)
            setMintedArtworkId(response.artwork.id)
            setTransactionStatus('confirmed')

            // Redirect to artwork page after a delay
            setTimeout(() => {
                navigate(`/artwork/${response.artwork.id}`)
            }, 3000)
        } catch (err) {
            console.error('Minting failed:', err)
            const appError = ErrorHandler.handleError(err, {
                context: 'MintPage.handleMintComplete',
                userMessage: 'Failed to mint artwork. Please try again.',
            })
            setError(appError.userMessage)
            setTransactionStatus('failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        navigate('/')
    }

    const handleRetry = () => {
        setTransactionStatus('idle')
        setError(null)
        setTransactionHash(null)
        setMintedArtworkId(null)
    }

    // Show wallet connection prompt if not connected
    if (!account.isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <Card variant="elevated" padding="lg">
                        <CardHeader>
                            <CardTitle className="text-center">Connect Your Wallet</CardTitle>
                            <CardDescription className="text-center">
                                You need to connect your wallet to mint NFTs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center gap-4">
                                <AlertCircle className="h-16 w-16 text-primary-600" />
                                <p className="text-center text-secondary-600">
                                    Connect your Stellar wallet to start creating and minting your AI-generated
                                    artwork as NFTs on the blockchain.
                                </p>
                                <Button onClick={connectWallet} size="lg" fullWidth>
                                    Connect Wallet
                                </Button>
                                <Button onClick={handleCancel} variant="outline" fullWidth>
                                    Go Back
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Show success message after minting
    if (transactionStatus === 'confirmed' && mintedArtworkId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <Card variant="elevated" padding="lg">
                        <CardContent>
                            <div className="flex flex-col items-center gap-4 text-center">
                                <CheckCircle2 className="h-20 w-20 text-green-600" />
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Artwork Minted Successfully!
                                </h2>
                                <p className="text-secondary-600">
                                    Your artwork has been minted as an NFT on the Stellar blockchain.
                                </p>
                                {transactionHash && (
                                    <div className="w-full p-4 bg-secondary-50 rounded-lg">
                                        <p className="text-xs font-mono text-secondary-600 break-all">
                                            Transaction: {transactionHash}
                                        </p>
                                    </div>
                                )}
                                <div className="flex gap-3 w-full mt-4">
                                    <Button
                                        onClick={() => navigate(`/artwork/${mintedArtworkId}`)}
                                        fullWidth
                                    >
                                        View Artwork
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/profile')}
                                        variant="outline"
                                        fullWidth
                                    >
                                        Go to Profile
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Create & Mint Your Artwork
                    </h1>
                    <p className="text-lg text-secondary-600">
                        Generate AI art and mint it as an NFT on Stellar
                    </p>
                </div>

                {/* Wallet Info */}
                <div className="mb-6">
                    <Card variant="bordered" padding="sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-secondary-600">Connected Wallet</p>
                                <p className="text-sm font-mono font-medium">
                                    {account.publicKey.slice(0, 8)}...{account.publicKey.slice(-8)}
                                </p>
                            </div>
                            {account.balance && (
                                <div className="text-right">
                                    <p className="text-sm text-secondary-600">Balance</p>
                                    <p className="text-sm font-semibold">{account.balance} XLM</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Transaction Status */}
                {transactionStatus !== 'idle' && (
                    <TransactionStatus
                        status={transactionStatus}
                        hash={transactionHash}
                        error={error}
                    />
                )}

                {/* Error Display with Retry */}
                {transactionStatus === 'failed' && (
                    <div className="mb-6">
                        <Card variant="bordered" padding="md">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-900">Minting Failed</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                                <Button onClick={handleRetry} variant="outline" size="sm">
                                    Try Again
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Mint Stepper */}
                {transactionStatus === 'idle' && (
                    <MintStepper
                        onComplete={handleMintComplete}
                        onCancel={handleCancel}
                        isSubmitting={isSubmitting}
                    />
                )}

                {/* Help Section */}
                <div className="mt-8">
                    <Card variant="default" padding="md">
                        <div className="text-center">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                Need Help?
                            </h3>
                            <p className="text-xs text-secondary-600">
                                Learn more about{' '}
                                <a href="#" className="text-primary-600 hover:underline">
                                    minting NFTs
                                </a>
                                {' '}or{' '}
                                <a href="#" className="text-primary-600 hover:underline">
                                    AI art generation
                                </a>
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default MintPage
