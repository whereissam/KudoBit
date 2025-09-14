import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { WalletConnect } from '../components/wallet-connect';
import { AuthService } from '../lib/auth';
import { 
  Download, 
  Eye, 
  ExternalLink, 
  Calendar, 
  Hash, 
  Package, 
  Star,
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Route = createFileRoute('/purchases')({
  component: PurchasesPage,
});

interface PurchasedItem {
  purchaseId: number;
  purchaseDate: string;
  transactionHash: string;
  loyaltyBadgeEarned?: {
    id: number;
    name: string;
    color: string;
  };
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    creatorAddress: string;
    creatorName?: string;
    hasContent: boolean;
    ipfsHash: string | null;
    category: string;
    coverImage?: string;
    downloadCount?: number;
    accessExpiry?: string | null;
  };
}

function PurchasesPage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  
  const [library, setLibrary] = useState<PurchasedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState('all');

  // No fake data - will load real purchases from API

  useEffect(() => {
    const checkAuthAndLoadPurchases = async () => {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is authenticated
        const authStatus = await AuthService.verifyAuth();
        setIsAuthenticated(authStatus.authenticated);

        // Load REAL purchase history from backend
        try {
          const response = await fetch(`http://localhost:3001/api/content/library`, {
            headers: {
              'Authorization': `Bearer ${AuthService.getToken()}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setLibrary(data.library || []);
          } else {
            // If API fails, show empty library (no fake data)
            setLibrary([]);
          }
        } catch (apiError) {
          console.error('Failed to load real purchases:', apiError);
          // Show empty library instead of fake data
          setLibrary([]);
        }
      } catch (error) {
        console.error('Failed to load purchases:', error);
        toast.error('Failed to load purchase history');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadPurchases();
  }, [address, isConnected]);

  const handleDownload = async (item: PurchasedItem) => {
    if (!item.product.hasContent || !item.product.ipfsHash) {
      toast.error('No downloadable content available');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please sign in to download content');
      return;
    }

    try {
      toast.loading('Verifying purchase and generating secure download link...', { id: 'download-toast' });
      
      // Call secure content delivery API
      const response = await fetch(`http://localhost:3001/api/content/download/${item.product.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify purchase');
      }

      const data = await response.json();
      
      if (!data.success || !data.downloadUrl) {
        throw new Error('Invalid download response');
      }
      
      // Open secure download in new tab
      window.open(data.downloadUrl, '_blank');
      
      toast.dismiss('download-toast');
      toast.success('Download started! Access verified and content delivered securely.');
      
      // Update download count
      setLibrary(prev => prev.map(purchase => 
        purchase.purchaseId === item.purchaseId 
          ? {
              ...purchase,
              product: {
                ...purchase.product,
                downloadCount: (purchase.product.downloadCount || 0) + 1
              }
            }
          : purchase
      ));
      
    } catch (error: any) {
      toast.dismiss('download-toast');
      console.error('Download error:', error);
      toast.error(error.message || 'Download failed. Please verify your purchase and try again.');
    }
  };

  const handleViewTransaction = (txHash: string) => {
    const morphExplorerUrl = `https://explorer-holesky.morphl2.io/tx/${txHash}`;
    window.open(morphExplorerUrl, '_blank');
  };

  const filteredLibrary = library.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(library.map(item => item.product.category)))];

  const isExpired = (accessExpiry: string | null | undefined) => {
    if (!accessExpiry) return false;
    return new Date(accessExpiry) < new Date();
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Package className="h-5 w-5" />
              My Purchase Library
            </CardTitle>
            <CardDescription>
              Connect your wallet to view your purchased digital products
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <WalletConnect />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          My Purchase Library
          <Badge variant="secondary" className="ml-3">
            {library.length} item{library.length !== 1 ? 's' : ''}
          </Badge>
        </h1>
        <p className="text-muted-foreground">
          Access and download your purchased digital products
        </p>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-input rounded-md w-full sm:w-64"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Purchase Library */}
      {filteredLibrary.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {library.length === 0 ? 'No purchases yet' : 'No items match your search'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {library.length === 0 
                ? 'Start exploring the KudoBit marketplace to find amazing digital products'
                : 'Try adjusting your search or filters to find what you\'re looking for'
              }
            </p>
            {library.length === 0 && (
              <Button onClick={() => navigate({ to: '/' })}>
                Browse Products
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredLibrary.map((item) => (
            <Card key={item.purchaseId} className={`
              overflow-hidden hover:shadow-lg transition-all duration-300 
              ${viewMode === 'list' ? 'flex flex-row' : ''}
            `}>
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center relative">
                    <Package className="h-12 w-12 text-primary/60" />
                    {item.loyaltyBadgeEarned && (
                      <Badge className={`absolute top-2 right-2 ${item.loyaltyBadgeEarned.color}`}>
                        <Star className="h-3 w-3 mr-1" />
                        {item.loyaltyBadgeEarned.name}
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{item.product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {item.product.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>by {item.product.creatorName}</span>
                      <Badge variant="outline">{item.product.category}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.purchaseDate).toLocaleDateString()}
                      </span>
                      <span className="font-medium">{item.product.price} USDC</span>
                    </div>

                    {item.product.accessExpiry && (
                      <div className={`text-xs flex items-center gap-1 ${
                        isExpired(item.product.accessExpiry) ? 'text-destructive' : 'text-chart-4'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {isExpired(item.product.accessExpiry) 
                          ? 'Access expired'
                          : `Expires ${new Date(item.product.accessExpiry).toLocaleDateString()}`
                        }
                      </div>
                    )}
                  </CardContent>
                  
                  <div className="p-4 pt-0 flex gap-2">
                    <Button 
                      onClick={() => handleDownload(item)}
                      disabled={!item.product.hasContent || isExpired(item.product.accessExpiry)}
                      className="flex-1"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTransaction(item.transactionHash)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex w-full">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center relative shrink-0">
                    <Package className="h-8 w-8 text-primary/60" />
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {item.product.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>by {item.product.creatorName}</span>
                          <Badge variant="outline" className="text-xs">{item.product.category}</Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.purchaseDate).toLocaleDateString()}
                          </span>
                        </div>

                        {item.loyaltyBadgeEarned && (
                          <Badge className={`${item.loyaltyBadgeEarned.color} mr-2`}>
                            <Star className="h-3 w-3 mr-1" />
                            {item.loyaltyBadgeEarned.name} Earned
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-right mr-4">
                          <p className="font-medium">{item.product.price} USDC</p>
                          {item.product.downloadCount && (
                            <p className="text-xs text-muted-foreground">
                              {item.product.downloadCount} downloads
                            </p>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => handleDownload(item)}
                          disabled={!item.product.hasContent || isExpired(item.product.accessExpiry)}
                          size="sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTransaction(item.transactionHash)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {library.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Library Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{library.length}</p>
                <p className="text-sm text-muted-foreground">Total Purchases</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {library.reduce((sum, item) => sum + parseFloat(item.product.price), 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">USDC Spent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {library.filter(item => item.product.hasContent).length}
                </p>
                <p className="text-sm text-muted-foreground">Downloadable Items</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {library.reduce((sum, item) => sum + (item.product.downloadCount || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}