import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Upload, 
  Image as ImageIcon, 
  DollarSign, 
  FileText, 
  Settings,
  Eye,
  Save,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react'
import { AuthService } from '@/lib/auth'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/creator/create-product')({
  component: CreateProductPage,
})

interface ProductFormData {
  name: string
  description: string
  price: string
  productType: string
  category: string
  coverImage: File | null
  thumbnail: File | null
  digitalFiles: File[]
  customUrl: string
  tags: string[]
  enablePayWhatYouWant: boolean
  minimumPrice: string
  maxQuantity: string
  thankyouMessage: string
}

function CreateProductPage() {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [newTag, setNewTag] = useState('')
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    productType: 'digital',
    category: '',
    coverImage: null,
    thumbnail: null,
    digitalFiles: [],
    customUrl: '',
    tags: [],
    enablePayWhatYouWant: false,
    minimumPrice: '',
    maxQuantity: '',
    thankyouMessage: ''
  })

  const productTypes = [
    { value: 'digital', label: 'Digital Product', desc: 'Downloadable files (PDFs, images, software, etc.)' },
    { value: 'course', label: 'Online Course', desc: 'Educational content with lessons and materials' },
    { value: 'subscription', label: 'Subscription', desc: 'Recurring access to content or services' },
    { value: 'service', label: 'Service', desc: 'Consultation, design work, or other services' }
  ]

  const categories = [
    'Art & Design', 'Music & Audio', 'Writing & Publishing', 'Video & Animation',
    'Photography', 'Software & Apps', 'Education & Tutorials', 'Business & Marketing',
    'Health & Fitness', 'Gaming', 'Other'
  ]

  const loyaltyBadges = [
    { id: 1, name: 'Bronze Badge', color: 'bg-chart-1/10 text-chart-1' },
    { id: 2, name: 'Silver Badge', color: 'bg-muted text-foreground' },
    { id: 3, name: 'Gold Badge', color: 'bg-chart-2/10 text-chart-2' },
    { id: 4, name: 'Diamond Badge', color: 'bg-chart-3/10 text-chart-3' }
  ]

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: 'coverImage' | 'thumbnail', file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  const handleDigitalFileUpload = (files: FileList) => {
    const newFiles = Array.from(files)
    setFormData(prev => ({
      ...prev,
      digitalFiles: [...prev.digitalFiles, ...newFiles]
    }))
  }

  const removeDigitalFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      digitalFiles: prev.digitalFiles.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!AuthService.isAuthenticated()) {
      toast.error('Please authenticate as a creator first')
      return
    }

    setIsLoading(true)
    
    try {
      // Here we would integrate with the backend API to create the product
      // For now, we'll simulate the creation
      
      const productData = {
        ...formData,
        creatorAddress: address,
        createdAt: new Date().toISOString()
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <div>
            <div className="font-semibold text-foreground">Product Created!</div>
            <div className="text-xs text-foreground/70">Your product is now live on KudoBit</div>
          </div>
        </div>,
        { 
          duration: 5000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
          }
        }
      )

      // Navigate to creator dashboard or product management page
      navigate({ to: '/creator/dashboard' })
      
    } catch (error) {
      console.error('Product creation error:', error)
      toast.error('Failed to create product. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.productType && formData.name && formData.description && formData.price
      case 2:
        return formData.category
      case 3:
        return formData.productType !== 'digital' || formData.digitalFiles.length > 0
      default:
        return true
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Product Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productTypes.map((type) => (
                  <Card 
                    key={type.value} 
                    className={`cursor-pointer transition-all ${
                      formData.productType === type.value 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleInputChange('productType', type.value)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{type.label}</CardTitle>
                      <CardDescription className="text-sm">{type.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your product name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product in detail..."
                  className="w-full mt-1 p-3 border border-input rounded-md resize-none h-32"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (USDC) *</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customUrl">Custom URL</Label>
                  <Input
                    id="customUrl"
                    value={formData.customUrl}
                    onChange={(e) => handleInputChange('customUrl', e.target.value)}
                    placeholder="my-awesome-product"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    kudobit.com/p/{formData.customUrl || 'your-product-url'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="mt-1 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>Cover Image & Thumbnail</Label>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Cover Image (1280x720)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('coverImage', e.target.files[0])}
                    className="hidden"
                    id="cover-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('cover-upload')?.click()}
                  >
                    Upload Cover
                  </Button>
                  {formData.coverImage && (
                    <p className="text-xs text-primary mt-1">✓ {formData.coverImage.name}</p>
                  )}
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Thumbnail (600x600)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('thumbnail', e.target.files[0])}
                    className="hidden"
                    id="thumb-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('thumb-upload')?.click()}
                  >
                    Upload Thumbnail
                  </Button>
                  {formData.thumbnail && (
                    <p className="text-xs text-primary mt-1">✓ {formData.thumbnail.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {formData.productType === 'digital' && (
              <div>
                <Label>Digital Files *</Label>
                <div className="mt-2">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Upload your digital files</p>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => e.target.files && handleDigitalFileUpload(e.target.files)}
                      className="hidden"
                      id="files-upload"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.getElementById('files-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </Button>
                  </div>

                  {formData.digitalFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Uploaded Files:</p>
                      {formData.digitalFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDigitalFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="thankyou">Thank You Message</Label>
              <textarea
                id="thankyou"
                value={formData.thankyouMessage}
                onChange={(e) => handleInputChange('thankyouMessage', e.target.value)}
                placeholder="Thank you for your purchase! Here's what to expect..."
                className="w-full mt-1 p-3 border border-input rounded-md resize-none h-24"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="payWhatYouWant"
                  checked={formData.enablePayWhatYouWant}
                  onChange={(e) => handleInputChange('enablePayWhatYouWant', e.target.checked)}
                />
                <Label htmlFor="payWhatYouWant">Enable "Pay What You Want" pricing</Label>
              </div>

              {formData.enablePayWhatYouWant && (
                <div>
                  <Label htmlFor="minimumPrice">Minimum Price (USDC)</Label>
                  <Input
                    id="minimumPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumPrice}
                    onChange={(e) => handleInputChange('minimumPrice', e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="maxQuantity">Maximum Quantity (leave empty for unlimited)</Label>
                <Input
                  id="maxQuantity"
                  type="number"
                  min="1"
                  value={formData.maxQuantity}
                  onChange={(e) => handleInputChange('maxQuantity', e.target.value)}
                  placeholder="Unlimited"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              You need to connect your wallet to create products on KudoBit
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/creator/dashboard' })}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold">Create New Product</h1>
        <p className="text-muted-foreground">
          Follow the steps below to create your digital product on KudoBit
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'}
              `}>
                {step}
              </div>
              <div className="ml-2 hidden sm:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step === 1 && 'Basic Info'}
                  {step === 2 && 'Details & Media'}  
                  {step === 3 && 'Files & Options'}
                </p>
              </div>
              {step < 3 && (
                <div className={`
                  flex-1 h-1 mx-4 
                  ${currentStep > step ? 'bg-primary' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {
              currentStep === 1 ? 'Basic Information' :
              currentStep === 2 ? 'Details & Media' :
              'Files & Options'
            }
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Choose your product type and add basic details'}
            {currentStep === 2 && 'Add category, tags, and images for your product'}
            {currentStep === 3 && 'Upload files and configure advanced options'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderStepContent()}
        </CardContent>
        
        <div className="p-6 border-t flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!validateStep(currentStep)}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !validateStep(currentStep)}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                {isLoading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Product
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}