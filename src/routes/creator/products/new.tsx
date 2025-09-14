import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  Image, 
  DollarSign, 
  Tag,
  Eye,
  Loader2,
  X,
  Plus,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CONTRACTS, PRODUCT_NFT_ABI } from '@/lib/contracts'
import { ipfsService } from '@/services/ipfs-service'
import { parseUnits } from 'viem'

export const Route = createFileRoute('/creator/products/new')({
  component: CreateProduct,
})

interface ProductData {
  name: string
  description: string
  shortDescription: string
  category: string
  tags: string[]
  price: string
  images: File[]
  previewFiles: File[]
  productFiles: File[]
}

const CATEGORIES = [
  'Digital Art', 'Photography', 'Graphic Design', 'UI/UX Design',
  'Music & Audio', 'Video & Animation', 'Writing & Publishing',
  'Software & Apps', 'Games', 'Education & Courses'
]

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Product details and description' },
  { id: 2, title: 'Media', description: 'Images and preview files' },
  { id: 3, title: 'Content', description: 'Main product files' },
  { id: 4, title: 'Pricing', description: 'Set your price and tags' },
  { id: 5, title: 'Review', description: 'Final review and publish' }
]

function CreateProduct() {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  
  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isSuccess, isError } = useWaitForTransactionReceipt({ hash: txHash })
  const [product, setProduct] = useState<ProductData>({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    tags: [],
    price: '',
    images: [],
    previewFiles: [],
    productFiles: []
  })

  const updateProduct = (field: keyof ProductData, value: any) => {
    setProduct(prev => ({ ...prev, [field]: value }))
  }

  const addTag = (tag: string) => {
    if (tag && !product.tags.includes(tag)) {
      updateProduct('tags', [...product.tags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateProduct('tags', product.tags.filter(tag => tag !== tagToRemove))
  }

  const handleFileUpload = (files: FileList | null, type: 'images' | 'previewFiles' | 'productFiles') => {
    if (!files) return
    const fileArray = Array.from(files)
    updateProduct(type, [...product[type], ...fileArray])
  }

  const removeFile = (index: number, type: 'images' | 'previewFiles' | 'productFiles') => {
    const newFiles = product[type].filter((_, i) => i !== index)
    updateProduct(type, newFiles)
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(product.name && product.description && product.category)
      case 2:
        return product.images.length > 0
      case 3:
        return product.productFiles.length > 0
      case 4:
        return !!(product.price && parseFloat(product.price) > 0)
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    } else {
      toast.error('Please complete all required fields')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!address || !product.name || !product.description || !product.price) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsUploading(true)
    try {
      toast.loading('Uploading files to IPFS...')
      
      // 1. Upload cover image to IPFS
      let imageUri = ''
      if (product.images[0]) {
        const imageHash = await ipfsService.uploadFile(product.images[0])
        imageUri = `ipfs://${imageHash}`
      }

      // 2. Upload product files to IPFS
      let contentHash = ''
      if (product.productFiles[0]) {
        const fileHash = await ipfsService.uploadFile(product.productFiles[0])
        contentHash = fileHash
      }

      toast.success('Files uploaded! Creating product NFT...')

      // 3. Mint ProductNFT
      const priceInWei = parseUnits(product.price, 6) // USDC has 6 decimals
      
      await writeContract({
        address: CONTRACTS.productNFT,
        abi: PRODUCT_NFT_ABI,
        functionName: 'mintProduct',
        args: [
          product.name,
          product.description,
          imageUri,
          priceInWei,
          contentHash
        ],
      })
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'shortMessage' in error 
        ? (error as { shortMessage: string }).shortMessage 
        : 'Failed to create product'
      toast.error(message)
      setIsUploading(false)
    }
  }

  // Handle transaction results
  if (isSuccess) {
    toast.success('Product created successfully!')
    setIsUploading(false)
    navigate({ to: '/creator' })
  }

  if (isError) {
    toast.error('Transaction failed')
    setIsUploading(false)
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-muted-foreground">
            Connect your wallet to create products
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate({ to: '/creator' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Product</h1>
            <p className="text-muted-foreground">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep > step.id 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.id 
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    w-16 h-px mx-2
                    ${currentStep > step.id ? 'bg-green-500' : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((step) => (
              <div key={step.id} className="text-xs text-center" style={{ width: '120px' }}>
                <p className="font-medium">{step.title}</p>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Product Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={product.name}
                        onChange={(e) => updateProduct('name', e.target.value)}
                        placeholder="Enter your product name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="shortDesc">Short Description *</Label>
                      <Input
                        id="shortDesc"
                        value={product.shortDescription}
                        onChange={(e) => updateProduct('shortDescription', e.target.value)}
                        placeholder="Brief description for product cards"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Full Description *</Label>
                      <Textarea
                        id="description"
                        value={product.description}
                        onChange={(e) => updateProduct('description', e.target.value)}
                        placeholder="Detailed description of your product..."
                        rows={6}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Category *</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {CATEGORIES.map((category) => (
                          <Badge
                            key={category}
                            variant={product.category === category ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => updateProduct('category', category)}
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Media */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Product Images & Preview</h3>
                  
                  {/* Product Images */}
                  <div className="space-y-4">
                    <div>
                      <Label>Product Images * (Max 5)</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 mt-2">
                        <div className="text-center">
                          <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Upload images to showcase your product
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileUpload(e.target.files, 'images')}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload">
                            <Button type="button" variant="outline" asChild>
                              <span>Choose Images</span>
                            </Button>
                          </label>
                        </div>
                      </div>
                      
                      {product.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {product.images.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                                <Image className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <p className="text-xs mt-1 truncate">{file.name}</p>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={() => removeFile(index, 'images')}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Preview Files */}
                    <div>
                      <Label>Preview Files (Optional)</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload free samples or previews for potential buyers
                      </p>
                      <div className="border-2 border-dashed rounded-lg p-6">
                        <div className="text-center">
                          <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleFileUpload(e.target.files, 'previewFiles')}
                            className="hidden"
                            id="preview-upload"
                          />
                          <label htmlFor="preview-upload">
                            <Button type="button" variant="outline" asChild>
                              <span>Upload Previews</span>
                            </Button>
                          </label>
                        </div>
                      </div>
                      
                      {product.previewFiles.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {product.previewFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(index, 'previewFiles')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Content */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Product Files</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload the main files that customers will receive after purchase
                  </p>
                  
                  <div className="border-2 border-dashed rounded-lg p-8">
                    <div className="text-center">
                      <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium mb-2">Upload Your Product Files</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Supported formats: Images, Videos, Audio, Documents, Software, 3D Models
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files, 'productFiles')}
                        className="hidden"
                        id="product-upload"
                      />
                      <label htmlFor="product-upload">
                        <Button type="button" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Files
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                  
                  {product.productFiles.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <h4 className="font-medium">Uploaded Files ({product.productFiles.length})</h4>
                      {product.productFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index, 'productFiles')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Pricing */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pricing & Tags</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="price">Price (USDC) *</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={product.price}
                          onChange={(e) => updateProduct('price', e.target.value)}
                          placeholder="10.00"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Set your price in USDC (minimum $0.01)
                      </p>
                    </div>

                    <div>
                      <Label>Tags</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Add tags to help customers find your product
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const input = e.target as HTMLInputElement
                              addTag(input.value.trim())
                              input.value = ''
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                            addTag(input.value.trim())
                            input.value = ''
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Review & Publish</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Product Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {product.name}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {product.category}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> {product.price} USDC
                        </div>
                        <div>
                          <span className="font-medium">Images:</span> {product.images.length}
                        </div>
                        <div>
                          <span className="font-medium">Product Files:</span> {product.productFiles.length}
                        </div>
                        <div>
                          <span className="font-medium">Preview Files:</span> {product.previewFiles.length}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg mt-6">
                    <h4 className="font-medium mb-2">What happens next?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Your product will be minted as an NFT on the blockchain</li>
                      <li>• Files will be securely stored on IPFS</li>
                      <li>• Your product will be available for purchase immediately</li>
                      <li>• You'll earn royalties on all secondary sales</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 5 ? (
                <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isUploading || isPending}
                  className="min-w-32"
                >
                  {(isUploading || isPending) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {isUploading ? 'Uploading...' : 'Publishing...'}
                    </>
                  ) : (
                    'Publish Product'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}