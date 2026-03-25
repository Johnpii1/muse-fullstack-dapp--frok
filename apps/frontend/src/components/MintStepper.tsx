import React, { useState } from 'react'
import { Check, Sparkles, FileText, DollarSign, Rocket } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Input, Textarea, Select } from './ui/Input'
import { cn } from '@/lib/utils'
import { CreateArtworkForm, ArtworkAttribute } from '@/types'
import aiService, { GenerationStatus } from '@/services/aiService'

export interface MintStepperProps {
    onComplete: (data: CreateArtworkForm) => void
    onCancel?: () => void
    isSubmitting?: boolean
}

type Step = 'generate' | 'metadata' | 'pricing' | 'review'

const steps: Array<{ id: Step; label: string; icon: React.ReactNode }> = [
    { id: 'generate', label: 'Generate Art', icon: <Sparkles className="h-5 w-5" /> },
    { id: 'metadata', label: 'Add Details', icon: <FileText className="h-5 w-5" /> },
    { id: 'pricing', label: 'Set Price', icon: <DollarSign className="h-5 w-5" /> },
    { id: 'review', label: 'Review & Mint', icon: <Rocket className="h-5 w-5" /> },
]

const AI_STYLES = [
    { value: 'digital-art', label: 'Digital Art' },
    { value: 'oil-painting', label: 'Oil Painting' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'anime', label: 'Anime' },
    { value: 'photorealistic', label: 'Photorealistic' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: '3d-render', label: '3D Render' },
]

const CATEGORIES = [
    { value: 'abstract', label: 'Abstract' },
    { value: 'landscape', label: 'Landscape' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'digital', label: 'Digital' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'nature', label: 'Nature' },
    { value: 'other', label: 'Other' },
]

export const MintStepper: React.FC<MintStepperProps> = ({
    onComplete,
    onCancel,
    isSubmitting = false,
}) => {
    const [currentStep, setCurrentStep] = useState<Step>('generate')
    const [formData, setFormData] = useState<Partial<CreateArtworkForm>>({
        currency: 'XLM',
        category: 'digital',
    })

    // AI Generation state
    const [prompt, setPrompt] = useState('')
    const [aiStyle, setAiStyle] = useState('digital-art')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null)
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)

    // Attributes state
    const [attributes, setAttributes] = useState<ArtworkAttribute[]>([])
    const [newAttribute, setNewAttribute] = useState({ trait_type: '', value: '' })

    const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

    const handleGenerateImage = async () => {
        if (!prompt.trim()) return

        setIsGenerating(true)
        setGenerationStatus(null)
        setGeneratedImageUrl(null)

        try {
            const response = await aiService.generateImage({
                prompt,
                style: aiStyle,
                quality: 'standard',
            })

            // Poll for completion
            const finalStatus = await aiService.pollGenerationStatus(
                response.generationId,
                (status) => {
                    setGenerationStatus(status)
                }
            )

            if (finalStatus.imageUrl) {
                setGeneratedImageUrl(finalStatus.imageUrl)
                setFormData((prev) => ({
                    ...prev,
                    imageUrl: finalStatus.imageUrl!,
                    prompt,
                    aiModel: aiStyle,
                }))
            }
        } catch (error) {
            console.error('Generation failed:', error)
            setGenerationStatus({
                generationId: '',
                status: 'failed',
                progress: 0,
                imageUrl: null,
                error: error instanceof Error ? error.message : 'Generation failed',
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleAddAttribute = () => {
        if (newAttribute.trait_type && newAttribute.value) {
            setAttributes([...attributes, { ...newAttribute }])
            setNewAttribute({ trait_type: '', value: '' })
        }
    }

    const handleRemoveAttribute = (index: number) => {
        setAttributes(attributes.filter((_, i) => i !== index))
    }

    const handleNext = () => {
        const stepIndex = steps.findIndex((s) => s.id === currentStep)
        if (stepIndex < steps.length - 1) {
            setCurrentStep(steps[stepIndex + 1].id)
        }
    }

    const handleBack = () => {
        const stepIndex = steps.findIndex((s) => s.id === currentStep)
        if (stepIndex > 0) {
            setCurrentStep(steps[stepIndex - 1].id)
        }
    }

    const handleSubmit = () => {
        const finalData: CreateArtworkForm = {
            title: formData.title || '',
            description: formData.description || '',
            imageUrl: formData.imageUrl || '',
            price: formData.price || '',
            currency: formData.currency || 'XLM',
            category: formData.category || 'digital',
            prompt: formData.prompt,
            aiModel: formData.aiModel,
            attributes: attributes.length > 0 ? attributes : undefined,
        }
        onComplete(finalData)
    }

    const canProceed = () => {
        switch (currentStep) {
            case 'generate':
                return !!generatedImageUrl
            case 'metadata':
                return !!formData.title && !!formData.description && !!formData.category
            case 'pricing':
                return !!formData.price && parseFloat(formData.price) > 0
            case 'review':
                return true
            default:
                return false
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Stepper Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={cn(
                                        'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
                                        index < currentStepIndex
                                            ? 'bg-primary-600 text-white'
                                            : index === currentStepIndex
                                                ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                                                : 'bg-secondary-200 text-secondary-500'
                                    )}
                                >
                                    {index < currentStepIndex ? (
                                        <Check className="h-6 w-6" />
                                    ) : (
                                        step.icon
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        'mt-2 text-sm font-medium',
                                        index <= currentStepIndex ? 'text-gray-900' : 'text-secondary-500'
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'h-1 flex-1 mx-2 transition-all duration-200',
                                        index < currentStepIndex ? 'bg-primary-600' : 'bg-secondary-200'
                                    )}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <Card variant="elevated" padding="lg">
                {/* Step 1: Generate Art */}
                {currentStep === 'generate' && (
                    <>
                        <CardHeader>
                            <CardTitle>Generate AI Art</CardTitle>
                            <CardDescription>
                                Describe your artwork and let AI bring it to life
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Textarea
                                    label="Prompt"
                                    placeholder="A majestic dragon flying over a cyberpunk city at sunset..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    fullWidth
                                    helperText="Be descriptive and specific for best results"
                                />

                                <Select
                                    label="Art Style"
                                    options={AI_STYLES}
                                    value={aiStyle}
                                    onChange={(e) => setAiStyle(e.target.value)}
                                    fullWidth
                                />

                                <Button
                                    onClick={handleGenerateImage}
                                    isLoading={isGenerating}
                                    disabled={!prompt.trim() || isGenerating}
                                    fullWidth
                                    leftIcon={<Sparkles className="h-5 w-5" />}
                                >
                                    {isGenerating ? 'Generating...' : 'Generate Image'}
                                </Button>

                                {generationStatus && (
                                    <div className="mt-4">
                                        {generationStatus.status === 'processing' && (
                                            <div className="text-center">
                                                <div className="mb-2">
                                                    <div className="w-full bg-secondary-200 rounded-full h-2">
                                                        <div
                                                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${generationStatus.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-sm text-secondary-600">
                                                    Generating... {generationStatus.progress}%
                                                </p>
                                            </div>
                                        )}
                                        {generationStatus.status === 'failed' && (
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-600">{generationStatus.error}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {generatedImageUrl && (
                                    <div className="mt-4">
                                        <img
                                            src={generatedImageUrl}
                                            alt="Generated artwork"
                                            className="w-full rounded-lg shadow-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Step 2: Metadata */}
                {currentStep === 'metadata' && (
                    <>
                        <CardHeader>
                            <CardTitle>Add Artwork Details</CardTitle>
                            <CardDescription>
                                Provide information about your artwork
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Input
                                    label="Title"
                                    placeholder="Enter artwork title"
                                    value={formData.title || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    fullWidth
                                />

                                <Textarea
                                    label="Description"
                                    placeholder="Describe your artwork..."
                                    value={formData.description || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    fullWidth
                                />

                                <Select
                                    label="Category"
                                    options={CATEGORIES}
                                    value={formData.category || 'digital'}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    fullWidth
                                />

                                <div>
                                    <label className="text-sm font-medium text-gray-900 mb-2 block">
                                        Attributes (Optional)
                                    </label>
                                    <div className="space-y-2">
                                        {attributes.map((attr, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 p-2 bg-secondary-50 rounded-lg"
                                            >
                                                <span className="text-sm font-medium">{attr.trait_type}:</span>
                                                <span className="text-sm">{attr.value}</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveAttribute(index)}
                                                    className="ml-auto"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Trait type"
                                                value={newAttribute.trait_type}
                                                onChange={(e) =>
                                                    setNewAttribute({ ...newAttribute, trait_type: e.target.value })
                                                }
                                            />
                                            <Input
                                                placeholder="Value"
                                                value={newAttribute.value}
                                                onChange={(e) =>
                                                    setNewAttribute({ ...newAttribute, value: e.target.value })
                                                }
                                            />
                                            <Button onClick={handleAddAttribute} variant="outline">
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Step 3: Pricing */}
                {currentStep === 'pricing' && (
                    <>
                        <CardHeader>
                            <CardTitle>Set Your Price</CardTitle>
                            <CardDescription>
                                Determine the price for your artwork
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <Input
                                        label="Price"
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.price || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, price: e.target.value })
                                        }
                                        fullWidth
                                        helperText="Minimum price: 0.01 XLM"
                                    />
                                    <Select
                                        label="Currency"
                                        options={[
                                            { value: 'XLM', label: 'XLM' },
                                            { value: 'USDC', label: 'USDC' },
                                        ]}
                                        value={formData.currency || 'XLM'}
                                        onChange={(e) =>
                                            setFormData({ ...formData, currency: e.target.value })
                                        }
                                    />
                                </div>

                                {formData.price && parseFloat(formData.price) > 0 && (
                                    <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                                        <p className="text-sm text-primary-900">
                                            Your artwork will be listed for{' '}
                                            <span className="font-bold">
                                                {formData.price} {formData.currency}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Step 4: Review */}
                {currentStep === 'review' && (
                    <>
                        <CardHeader>
                            <CardTitle>Review & Mint</CardTitle>
                            <CardDescription>
                                Review your artwork before minting
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {generatedImageUrl && (
                                    <div>
                                        <img
                                            src={generatedImageUrl}
                                            alt={formData.title}
                                            className="w-full rounded-lg shadow-lg"
                                        />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-secondary-600">Title</h4>
                                        <p className="text-base font-semibold">{formData.title}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-secondary-600">Description</h4>
                                        <p className="text-sm">{formData.description}</p>
                                    </div>

                                    <div className="flex gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-secondary-600">Category</h4>
                                            <p className="text-sm capitalize">{formData.category}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-secondary-600">Price</h4>
                                            <p className="text-sm font-semibold">
                                                {formData.price} {formData.currency}
                                            </p>
                                        </div>
                                    </div>

                                    {formData.prompt && (
                                        <div>
                                            <h4 className="text-sm font-medium text-secondary-600">AI Prompt</h4>
                                            <p className="text-sm italic">{formData.prompt}</p>
                                        </div>
                                    )}

                                    {attributes.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-secondary-600 mb-2">
                                                Attributes
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {attributes.map((attr, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-secondary-100 rounded-full text-xs"
                                                    >
                                                        {attr.trait_type}: {attr.value}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6 pt-6 border-t border-secondary-200">
                    <div>
                        {currentStepIndex > 0 && (
                            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                                Back
                            </Button>
                        )}
                        {onCancel && currentStepIndex === 0 && (
                            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                                Cancel
                            </Button>
                        )}
                    </div>

                    <div>
                        {currentStepIndex < steps.length - 1 ? (
                            <Button onClick={handleNext} disabled={!canProceed()}>
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                isLoading={isSubmitting}
                                disabled={!canProceed() || isSubmitting}
                                leftIcon={<Rocket className="h-5 w-5" />}
                            >
                                Mint NFT
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default MintStepper
