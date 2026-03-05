'use client';

import '../globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminThemeProvider } from '@/components/admin-theme-provider';
import { toast } from 'sonner';
import VendorLogo from '@/components/VendorLogo';
import { 
  Users, 
  Package, 
  FileSpreadsheet, 
  Mail,
  Upload as UploadIcon,
  Search,
  X,
  Plus,
  CheckCircle,
  XCircle,
  Globe,
  ShieldCheck,
  Store,
  ArrowLeftRight,
  Filter,
  ClipboardCopy
} from 'lucide-react';

// Offer Vendor Row Component - Compact table row version
function OfferVendorRow({ vendor, onUpdate }: { vendor: any; onUpdate: (id: number | string, updates: any) => Promise<boolean> }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [offerType, setOfferType] = useState(vendor.offer_type || '');
  const [offerValue, setOfferValue] = useState(vendor.offer_value?.toString() || '');
  const [offerDescription, setOfferDescription] = useState(vendor.offer_description || '');

  useEffect(() => {
    if (!isUpdating) {
      setOfferType(vendor.offer_type || '');
      setOfferValue(vendor.offer_value?.toString() || '');
      setOfferDescription(vendor.offer_description || '');
    }
  }, [vendor.offer_type, vendor.offer_value, vendor.offer_description, vendor.id]);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const updates = {
        offer_type: offerType || null,
        offer_value: offerType && offerValue ? parseFloat(offerValue) : null,
        offer_description: offerType ? offerDescription : null
      };
      const success = await onUpdate(vendor.id, updates);
      if (success) {
        toast.success(`${vendor.name} offer updated`);
      } else {
        toast.error('Failed to update');
        setOfferType(vendor.offer_type || '');
        setOfferValue(vendor.offer_value?.toString() || '');
        setOfferDescription(vendor.offer_description || '');
      }
    } catch {
      toast.error('Failed to update');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr className="hover:bg-slate-800/20 transition-colors group">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <VendorLogo logo={vendor.logo_url || ''} name={vendor.name} size={28} />
          <span className="text-sm text-white font-medium">{vendor.name}</span>
        </div>
      </td>
      <td className="px-3 py-2">
        <select
          value={offerType}
          onChange={(e) => {
            setOfferType(e.target.value);
            if (!e.target.value) { setOfferValue(''); setOfferDescription(''); }
          }}
          disabled={isUpdating}
          className="h-7 px-2 bg-slate-900/50 border border-slate-700/50 rounded text-xs text-slate-300"
        >
          <option value="">No Offer</option>
          <option value="percentage_discount">% Discount</option>
          <option value="extra_pouches">Extra Pouches</option>
        </select>
      </td>
      <td className="px-3 py-2">
        {offerType ? (
          <Input
            type="number"
            value={offerValue}
            onChange={(e) => setOfferValue(e.target.value)}
            placeholder={offerType === 'percentage_discount' ? '%' : '#'}
            disabled={isUpdating}
            className="h-7 w-20 text-xs bg-slate-900/50 border-slate-700/50"
          />
        ) : (
          <span className="text-slate-600 text-xs">-</span>
        )}
      </td>
      <td className="px-3 py-2">
        {offerType ? (
          <Input
            value={offerDescription}
            onChange={(e) => setOfferDescription(e.target.value)}
            placeholder="Description..."
            disabled={isUpdating}
            className="h-7 text-xs bg-slate-900/50 border-slate-700/50"
          />
        ) : (
          <span className="text-slate-600 text-xs">-</span>
        )}
      </td>
      <td className="px-3 py-2 text-right">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isUpdating || (offerType && !offerValue)}
          className="h-6 px-3 text-xs bg-blue-600 hover:bg-blue-700"
        >
          {isUpdating ? '...' : 'Save'}
        </Button>
      </td>
    </tr>
  );
}

// Currency Converter Vendor Row Component
function CurrencyConverterVendorRow({ vendor, onUpdate }: { vendor: any; onUpdate: (id: number | string, updates: any) => Promise<boolean> }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currency, setCurrency] = useState(vendor.currency || 'GBP');
  const [needsConversion, setNeedsConversion] = useState(vendor.needs_currency_conversion || false);

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <VendorLogo 
            logo={vendor.logo_url || ''} 
            name={vendor.name} 
            size={48}
          />
          <div>
            <h3 className="text-base font-semibold text-white">{vendor.name}</h3>
            {vendor.website && (
              <p className="text-xs text-slate-400">{vendor.website}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Currency:</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={isUpdating}
              className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-white"
            >
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={needsConversion}
              onChange={(e) => setNeedsConversion(e.target.checked)}
              disabled={isUpdating}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-slate-300">
              Convert EUR to GBP
            </label>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              setIsUpdating(true);
              const success = await onUpdate(vendor.id, {
                currency,
                needs_currency_conversion: needsConversion && currency === 'EUR'
              });
              if (success) {
                toast.success(`${vendor.name} currency settings updated`);
              }
              setIsUpdating(false);
            }}
            disabled={isUpdating || (needsConversion && currency !== 'EUR')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      {needsConversion && currency === 'EUR' && (
        <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300">
          ⚠️ All prices from this vendor will be converted from EUR to GBP using the configured exchange rate.
        </div>
      )}
    </Card>
  );
}

// Vendor Card Component with Shipping Info Editing
function VendorCard({ vendor, region, onUpdate, onDelete }: { vendor: any; region: 'UK' | 'US'; onUpdate: (id: number | string, updates: any) => Promise<boolean>; onDelete: (id: number | string) => Promise<void> }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(vendor.shipping_info || '');
  const [shippingCost, setShippingCost] = useState(vendor.shipping_cost?.toString() || '0');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(vendor.free_shipping_threshold?.toString() || '0');
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [isEditingTrustpilot, setIsEditingTrustpilot] = useState(false);
  const [trustpilotScore, setTrustpilotScore] = useState(vendor.trustpilot_score?.toString() || '');
  const [reviewCount, setReviewCount] = useState(vendor.review_count?.toString() || '0');
  const [isSavingTrustpilot, setIsSavingTrustpilot] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Update shipping fields when vendor prop changes, but only if not currently editing
  useEffect(() => {
    if (!isEditingShipping && !isSavingShipping) {
      const newShippingInfo = vendor.shipping_info || '';
      setShippingInfo(newShippingInfo);
      setShippingCost(vendor.shipping_cost?.toString() || '0');
      setFreeShippingThreshold(vendor.free_shipping_threshold?.toString() || '0');
    }
  }, [vendor.shipping_info, vendor.shipping_cost, vendor.free_shipping_threshold, vendor.id]);

  // Update Trustpilot score and review count when vendor prop changes, but only if not currently editing
  useEffect(() => {
    if (!isEditingTrustpilot && !isSavingTrustpilot) {
      setTrustpilotScore(vendor.trustpilot_score?.toString() || '');
      setReviewCount(vendor.review_count?.toString() || '0');
    }
  }, [vendor.trustpilot_score, vendor.review_count, vendor.id]);

  // Fetch reviews for this vendor
  const fetchVendorReviews = async () => {
    if (!showReviews && reviews.length === 0) {
      setLoadingReviews(true);
      try {
        const response = await fetch(`/api/reviews?vendorId=${vendor.id}&vendorOnly=true`);
        const data = await response.json();
        if (response.ok) {
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    }
    setShowReviews(!showReviews);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isActive = region === 'UK' ? vendor.is_active : vendor.status === 'active';

  return (
    <Card className="bg-slate-900/50 border-slate-800/50 hover:border-slate-700/50 transition-colors overflow-hidden">
      {/* Compact Header Row - Always visible */}
      <div
        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <VendorLogo
          logo={vendor.logo_url || ''}
          name={vendor.name}
          size={36}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-white truncate">{vendor.name}</h3>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
          </div>
          {vendor.website && (
            <p className="text-xs text-slate-500 truncate">{vendor.website.replace(/^https?:\/\//, '')}</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          {vendor.trustpilot_score && (
            <div className="flex items-center gap-1 text-yellow-400">
              <span>★</span>
              <span>{vendor.trustpilot_score}</span>
            </div>
          )}
          {vendor.shipping_cost !== undefined && (
            <div className="text-slate-400">
              £{vendor.shipping_cost} ship
            </div>
          )}
          {vendor.free_shipping_threshold > 0 && (
            <div className="text-emerald-400/70">
              Free £{vendor.free_shipping_threshold}+
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {vendor.website && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-500 hover:text-white"
              onClick={() => window.open(vendor.website, '_blank')}
            >
              <Globe className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(vendor.id)}
            className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="border-t border-slate-800/50 bg-slate-900/30 px-3 py-3 space-y-3">
        {/* Shipping Information Section */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-2 block">
                Shipping Information
              </label>
              {isEditingShipping ? (
                <div className="space-y-3">
                  <Input
                    value={shippingInfo}
                    onChange={(e) => setShippingInfo(e.target.value)}
                    placeholder="Enter shipping information..."
                    className="bg-slate-800 border-slate-700 text-white"
                    disabled={isSavingShipping}
                  />
                  {/* Shipping Cost Fields */}
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 mb-1 block font-medium">
                          Shipping Cost (£)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={shippingCost}
                          onChange={(e) => setShippingCost(e.target.value)}
                          placeholder="0.00"
                          className="bg-slate-800 border-slate-600 text-white w-full"
                          disabled={isSavingShipping}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 mb-1 block font-medium">
                          Free Shipping Threshold (£)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={freeShippingThreshold}
                          onChange={(e) => setFreeShippingThreshold(e.target.value)}
                          placeholder="0.00"
                          className="bg-slate-800 border-slate-600 text-white w-full"
                          disabled={isSavingShipping}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!shippingInfo.trim()) {
                          toast.error('Shipping information cannot be empty');
                          return;
                        }
                        setIsSavingShipping(true);
                        const success = await onUpdate(vendor.id, {
                          shipping_info: shippingInfo.trim(),
                          shipping_cost: parseFloat(shippingCost) || 0,
                          free_shipping_threshold: parseFloat(freeShippingThreshold) || 0
                        });
                        if (success) {
                          // Keep the saved value visible immediately
                          // The vendor prop will update after loadVendors completes
                          setIsEditingShipping(false);
                        } else {
                          // If save failed, revert to original
                          setShippingInfo(vendor.shipping_info || '');
                          setShippingCost(vendor.shipping_cost?.toString() || '0');
                          setFreeShippingThreshold(vendor.free_shipping_threshold?.toString() || '0');
                          setIsEditingShipping(false);
                        }
                        setIsSavingShipping(false);
                      }}
                      disabled={isSavingShipping}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShippingInfo(vendor.shipping_info || '');
                        setShippingCost(vendor.shipping_cost?.toString() || '0');
                        setFreeShippingThreshold(vendor.free_shipping_threshold?.toString() || '0');
                        setIsEditingShipping(false);
                      }}
                      disabled={isSavingShipping}
                      className="border-slate-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-300 flex-1">
                      {shippingInfo ? (
                        shippingInfo
                      ) : (
                        <span className="text-slate-500 italic">No shipping information</span>
                      )}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingShipping(true)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {shippingCost && parseFloat(shippingCost) > 0 && (
                      <span>Shipping Cost: £{parseFloat(shippingCost).toFixed(2)}</span>
                    )}
                    {freeShippingThreshold && parseFloat(freeShippingThreshold) > 0 && (
                      <span>Free shipping over £{parseFloat(freeShippingThreshold).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trustpilot Score Section (UK Only) */}
        {region === 'UK' && (
          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">
                    Trustpilot Score
                  </label>
                  {isEditingTrustpilot ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={trustpilotScore}
                            onChange={(e) => setTrustpilotScore(e.target.value)}
                            placeholder="Enter Trustpilot score (0-5)"
                            className="bg-slate-800 border-slate-700 text-white"
                            disabled={isSavingTrustpilot}
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            min="0"
                            value={reviewCount}
                            onChange={(e) => setReviewCount(e.target.value)}
                            placeholder="Review count"
                            className="bg-slate-800 border-slate-700 text-white"
                            disabled={isSavingTrustpilot}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            const score = trustpilotScore ? parseFloat(trustpilotScore) : null;
                            if (score !== null && (score < 0 || score > 5)) {
                              toast.error('Trustpilot score must be between 0 and 5');
                              return;
                            }
                            const count = reviewCount ? parseInt(reviewCount) : 0;
                            if (count < 0) {
                              toast.error('Review count must be 0 or greater');
                              return;
                            }
                            setIsSavingTrustpilot(true);
                            const success = await onUpdate(vendor.id, {
                              trustpilot_score: score,
                              review_count: count
                            });
                            if (success) {
                              setIsEditingTrustpilot(false);
                            } else {
                              setTrustpilotScore(vendor.trustpilot_score?.toString() || '');
                              setReviewCount(vendor.review_count?.toString() || '0');
                              setIsEditingTrustpilot(false);
                            }
                            setIsSavingTrustpilot(false);
                          }}
                          disabled={isSavingTrustpilot}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSavingTrustpilot ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTrustpilotScore(vendor.trustpilot_score?.toString() || '');
                            setReviewCount(vendor.review_count?.toString() || '0');
                            setIsEditingTrustpilot(false);
                          }}
                          disabled={isSavingTrustpilot}
                          className="border-slate-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-slate-300 flex-1">
                        {trustpilotScore ? (
                          `${trustpilotScore}/5.0`
                        ) : (
                          <span className="text-slate-500 italic">No Trustpilot score set</span>
                        )}
                        {reviewCount && parseInt(reviewCount) > 0 && (
                          <span className="text-slate-400 ml-2">
                            ({reviewCount} {parseInt(reviewCount) === 1 ? 'review' : 'reviews'})
                          </span>
                        )}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingTrustpilot(true)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="border-t border-slate-800 pt-3 mt-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block font-medium">
                    Reviews
                  </label>
                  <p className="text-xs text-slate-500">
                    View and manage reviews for this vendor
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={fetchVendorReviews}
                  className="text-blue-400 hover:text-blue-300 text-xs"
                  disabled={loadingReviews}
                >
                  {showReviews ? 'Hide' : 'Show'} Reviews ({reviews.length > 0 ? reviews.length : (vendor.review_count || 0)})
                </Button>
              </div>
              {showReviews && (
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {loadingReviews ? (
                    <div className="text-sm text-slate-400 text-center py-4">
                      Loading reviews...
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-sm text-slate-500 italic text-center py-4">
                      No reviews yet
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-3 bg-slate-800 rounded border border-slate-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-300">
                              {review.vendors?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-yellow-400">
                              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {review.review_text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
    </Card>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [region, setRegion] = useState<'UK' | 'US'>('UK');
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [vendorProducts, setVendorProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 50;
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>('all');
  const [vendorProductsPage, setVendorProductsPage] = useState(1);
  const vendorProductsPerPage = 20;
  const [vendorProductMappings, setVendorProductMappings] = useState<any[]>([]);
  const [mappingsPage, setMappingsPage] = useState(1);
  const [mappingsBrandFilter, setMappingsBrandFilter] = useState<string>('all');
  const [mappingsStatusFilter, setMappingsStatusFilter] = useState<string>('all');
  const [mappingsSearchTerm, setMappingsSearchTerm] = useState('');
  const [mappingsSimilarityFilter, setMappingsSimilarityFilter] = useState<string>('all');
  const [searchSuggestions, setSearchSuggestions] = useState<Map<string, any[]>>(new Map());
  const [productsWithMatches, setProductsWithMatches] = useState<Set<string>>(new Set());
  const [activeSearchRow, setActiveSearchRow] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const mappingsPerPage = 50;
  const [signups, setSignups] = useState<any[]>([]);
  const [signupsPage, setSignupsPage] = useState(1);
  const [signupsTotalPages, setSignupsTotalPages] = useState(1);
  const [signupsTotalCount, setSignupsTotalCount] = useState(0);
  const [signupsSearch, setSignupsSearch] = useState('');
  const [signupsSourceFilter, setSignupsSourceFilter] = useState('all');
  const [signupsStatusFilter, setSignupsStatusFilter] = useState('all');
  const signupsPerPage = 50;

  // Unmapped Products state
  const [unmappedProducts, setUnmappedProducts] = useState<any[]>([]);
  const [unmappedPage, setUnmappedPage] = useState(1);
  const [unmappedTotalPages, setUnmappedTotalPages] = useState(1);
  const [unmappedTotalCount, setUnmappedTotalCount] = useState(0);
  const [unmappedStatusFilter, setUnmappedStatusFilter] = useState('pending');
  const [unmappedVendorFilter, setUnmappedVendorFilter] = useState('all');
  const [unmappedSearch, setUnmappedSearch] = useState('');
  const [unmappedVendors, setUnmappedVendors] = useState<string[]>([]);
  const unmappedPerPage = 20;
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showMapDialog, setShowMapDialog] = useState<any>(null);
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState<any[]>([]);
  const [showProductDetail, setShowProductDetail] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: number; action: 'create' | 'reject'; product: any } | null>(null);
  const [createForm, setCreateForm] = useState<{ id: number; product: any; name: string; brand: string; strength_mg: string; flavour: string; format: string; pouch_count: string; image_url: string } | null>(null);

  // Store Applications state
  const [applications, setApplications] = useState<any[]>([]);
  const [applicationsTotal, setApplicationsTotal] = useState(0);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsTotalPages, setApplicationsTotalPages] = useState(1);
  const [applicationsStatusFilter, setApplicationsStatusFilter] = useState('pending');
  const [applicationsPendingCount, setApplicationsPendingCount] = useState(0);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [approvedCredentials, setApprovedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [applicationActionLoading, setApplicationActionLoading] = useState<string | null>(null);
  const [mapSearchLoading, setMapSearchLoading] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('admin_key');
    if (key !== '9503283252') {
      router.push('/admin/login');
      return;
    }
    setAdminKey(key);
  }, [router]);

  useEffect(() => {
    if (adminKey) {
      loadVendors();
      if (activeTab === 'vendor-products') {
        loadVendorProducts();
      }
      if (activeTab === 'signups') {
        loadSignups();
      }
    }
  }, [adminKey, region, activeTab]);

  useEffect(() => {
    if (adminKey && activeTab === 'vendor-products') {
      loadVendorProducts();
    }
  }, [adminKey, region, activeTab]);

  useEffect(() => {
    if (adminKey && activeTab === 'products') {
      loadProducts();
    }
  }, [adminKey, region, activeTab, currentPage]);

  // Reset vendor products page when filter changes
  useEffect(() => {
    setVendorProductsPage(1);
  }, [selectedVendorFilter, searchTerm]);

  // Load vendor product mappings when switching to mappings tab
  useEffect(() => {
    if (adminKey && activeTab === 'vendor-mappings') {
      loadVendorProductMappings();
    }
  }, [adminKey, region, activeTab]);

  // Reload signups when filters or page changes
  useEffect(() => {
    if (adminKey && activeTab === 'signups') {
      loadSignups();
    }
  }, [adminKey, activeTab, signupsPage, signupsSearch, signupsSourceFilter, signupsStatusFilter]);

  // Reset mappings page when filters change
  useEffect(() => {
    setMappingsPage(1);
  }, [mappingsBrandFilter, mappingsStatusFilter, mappingsSearchTerm, mappingsSimilarityFilter, selectedVendorFilter]);

  // Load unmapped products when switching to unmapped tab
  useEffect(() => {
    if (adminKey && activeTab === 'unmapped') {
      loadUnmappedProducts();
    }
  }, [adminKey, activeTab, unmappedPage, unmappedStatusFilter, unmappedVendorFilter, unmappedSearch]);

  // Reset unmapped products page when filters change
  useEffect(() => {
    setUnmappedPage(1);
  }, [unmappedStatusFilter, unmappedVendorFilter, unmappedSearch]);

  // Load store applications when switching to applications tab
  useEffect(() => {
    if (adminKey && activeTab === 'applications') {
      loadApplications();
    }
  }, [adminKey, activeTab, applicationsPage, applicationsStatusFilter]);

  // Load pending count for badge on mount
  useEffect(() => {
    if (adminKey) {
      loadApplicationsPendingCount();
    }
  }, [adminKey]);

  const loadApplicationsPendingCount = async () => {
    try {
      const res = await fetch('/api/admin/store-applications?status=pending&limit=1');
      const data = await res.json();
      if (data.total !== undefined) {
        setApplicationsPendingCount(data.total);
      }
    } catch {
      // Silently fail for badge count
    }
  };

  const loadApplications = async () => {
    setApplicationsLoading(true);
    try {
      const params = new URLSearchParams({
        status: applicationsStatusFilter,
        page: applicationsPage.toString(),
        limit: '50',
      });
      const res = await fetch(`/api/admin/store-applications?${params}`);
      const data = await res.json();
      if (data.data) {
        setApplications(data.data);
        setApplicationsTotal(data.total || 0);
        setApplicationsTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleApplicationAction = async (id: string, action: 'approve' | 'reject') => {
    setApplicationActionLoading(id);
    setApprovedCredentials(null);
    try {
      const res = await fetch('/api/admin/store-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Action failed');
        return;
      }
      if (action === 'approve' && data.credentials) {
        setApprovedCredentials(data.credentials);
        toast.success('Application approved! Credentials generated.');
      } else {
        toast.success('Application rejected.');
      }
      loadApplications();
      loadApplicationsPendingCount();
    } catch {
      toast.error('An error occurred');
    } finally {
      setApplicationActionLoading(null);
    }
  };

  const loadVendors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/vendors?region=${region}&page=1&limit=1000`);
      const data = await response.json();
      if (data.data) {
        setVendors(data.data);
        console.log(`Loaded ${data.data.length} vendors for ${region}`);
        // Debug: Check if shipping_info and offers are in the data
        const snusifer = data.data.find((v: any) => v.name === 'Snusifer');
        if (snusifer) {
          console.log('Snusifer data from API:', {
            shipping_info: snusifer.shipping_info,
            offer_type: snusifer.offer_type,
            offer_value: snusifer.offer_value,
            offer_description: snusifer.offer_description
          });
        }
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
    // Return a promise that resolves when loading is complete
    return Promise.resolve();
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        region,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();
      if (data.data) {
        setProducts(data.data);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadVendorProducts = async () => {
    setLoading(true);
    try {
      // Fetch ALL vendor products in batches (Supabase has 1000 row limit per query)
      let allVendorProducts: any[] = [];
      let page = 1;
      const perPage = 1000;
      let hasMore = true;
      let totalCount = 0;
      
      while (hasMore) {
        const params = new URLSearchParams({
          region,
          page: page.toString(),
          limit: perPage.toString(),
          ...(searchTerm && { search: searchTerm })
        });
        
        const response = await fetch(`/api/admin/vendor-products?${params}`);
        const data = await response.json();
        
        if (data.error) {
          console.error('API Error:', data.error);
          hasMore = false;
          break;
        }
        
        if (data.data && data.data.length > 0) {
          allVendorProducts = [...allVendorProducts, ...data.data];
          totalCount = data.totalCount || allVendorProducts.length;
          // Continue fetching if we got a full page and haven't reached total count
          hasMore = data.data.length === perPage && allVendorProducts.length < totalCount;
          page++;
          console.log(`Fetched batch ${page - 1}: ${data.data.length} products (total so far: ${allVendorProducts.length}/${totalCount})`);
        } else {
          hasMore = false;
        }
      }
      
      setVendorProducts(allVendorProducts);
      console.log(`✅ Loaded ${allVendorProducts.length} vendor products for ${region} in ${page - 1} batches`);
    } catch (error) {
      console.error('Error loading vendor products:', error);
      toast.error('Failed to load vendor products');
    } finally {
      setLoading(false);
    }
  };

  const loadSignups = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/signups?page=${signupsPage}&limit=${signupsPerPage}&search=${signupsSearch}&source=${signupsSourceFilter}&status=${signupsStatusFilter}`);
      const data = await response.json();

      if (data.error) {
        toast.error('Failed to load signups');
        return;
      }

      setSignups(data.data || []);
      setSignupsTotalCount(data.totalCount || 0);
      setSignupsTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error loading signups:', error);
      toast.error('Failed to load signups');
    } finally {
      setLoading(false);
    }
  };

  const loadUnmappedProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        adminKey: '9503283252',
        page: unmappedPage.toString(),
        limit: unmappedPerPage.toString(),
        status: unmappedStatusFilter,
        ...(unmappedVendorFilter !== 'all' && { vendor: unmappedVendorFilter }),
        ...(unmappedSearch && { search: unmappedSearch })
      });

      const response = await fetch(`/api/admin/unmapped-products?${params}`);
      const data = await response.json();

      if (data.error) {
        toast.error('Failed to load unmapped products');
        return;
      }

      setUnmappedProducts(data.products || []);
      setUnmappedTotalCount(data.total || 0);
      setUnmappedTotalPages(data.totalPages || 1);
      setUnmappedVendors(data.vendors || []);
    } catch (error) {
      console.error('Error loading unmapped products:', error);
      toast.error('Failed to load unmapped products');
    } finally {
      setLoading(false);
    }
  };

  const handleUnmappedAction = async (id: number, action: 'reject' | 'map' | 'create', mappedProductId?: number, newProductData?: any) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/unmapped-products?adminKey=9503283252`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, mappedProductId, newProductData })
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(data.message || 'Action completed');
      loadUnmappedProducts(); // Reload the list
      setShowMapDialog(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to perform action');
    } finally {
      setActionLoading(null);
    }
  };

  const searchProductsForMapping = async (term: string) => {
    if (!term || term.length < 2) {
      setMapSearchResults([]);
      return;
    }

    setMapSearchLoading(true);
    try {
      const response = await fetch(`/api/admin/products?region=${region}&search=${encodeURIComponent(term)}&limit=10`);
      const data = await response.json();
      setMapSearchResults(data.data || []);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setMapSearchLoading(false);
    }
  };

  const loadVendorProductMappings = async () => {
    setLoading(true);
    try {
      // Fetch ALL vendor products in batches (Supabase has 1000 row limit per query)
      let allVendorProducts: any[] = [];
      let page = 1;
      const perPage = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const response = await fetch(`/api/admin/vendor-products?region=${region}&page=${page}&limit=${perPage}`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          allVendorProducts = [...allVendorProducts, ...data.data];
          hasMore = data.data.length === perPage && allVendorProducts.length < data.totalCount;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      // Fetch existing mappings from vendor_product_mapping table in batches
      let allMappings: any[] = [];
      let mappingsPage = 1;
      let mappingsHasMore = true;
      
      while (mappingsHasMore) {
        const mappingsResponse = await fetch(`/api/vendor-product-mappings?region=${region}&page=${mappingsPage}&limit=${perPage}`);
        const mappingsData = await mappingsResponse.json();
        
        if (mappingsData.error) {
          console.error('Error fetching mappings:', mappingsData.error, mappingsData.details);
          toast.error('Failed to load existing mappings');
          mappingsHasMore = false;
        } else if (mappingsData.data && mappingsData.data.length > 0) {
          allMappings = [...allMappings, ...mappingsData.data];
          mappingsHasMore = mappingsData.data.length === perPage && allMappings.length < (mappingsData.totalCount || 0);
          mappingsPage++;
        } else {
          mappingsHasMore = false;
        }
      }
      
      if (allVendorProducts.length > 0) {
        const mappingsArray = allMappings || [];
        
        // Create a lookup map: vendor_id -> vendor_product -> mapping
        // This is more efficient and handles exact matches
        const mappingsLookup = new Map<string, any>();
        mappingsArray.forEach((m: any) => {
          const vendorId = m[region === 'UK' ? 'vendor_id' : 'us_vendor_id'];
          const key = `${vendorId}|||${m.vendor_product?.toLowerCase().trim()}`;
          mappingsLookup.set(key, m);
        });
        
        // Merge vendor products with their mappings
        const vendorProductsWithMappings = allVendorProducts.map((vp: any) => {
          // Get vendor ID from the correct field based on region
          const vpVendorId = region === 'UK' ? vp.vendor_id : vp.us_vendor_id;
          const lookupKey = `${vpVendorId}|||${vp.name?.toLowerCase().trim()}`;
          
          // Look up mapping using the optimized map
          const existingMapping = mappingsLookup.get(lookupKey);
          
          // Get the mapped product details
          const productTableKey = region === 'UK' ? 'wp_products' : 'us_products';
          const mappedProduct = existingMapping?.[productTableKey];
          
          return {
            ...vp,
            mapping: existingMapping,
            mapped_product: mappedProduct,
            is_mapped: !!existingMapping // Boolean flag for easier filtering
          };
        });
        
        const mappedCount = vendorProductsWithMappings.filter((vp: any) => vp.is_mapped).length;
        const unmappedCount = vendorProductsWithMappings.length - mappedCount;
        
        // Check for similarity matches for unmapped products (in background, non-blocking)
        const unmappedForSimilarityCheck = vendorProductsWithMappings.filter((vp: any) => !vp.is_mapped);
        if (unmappedForSimilarityCheck.length > 0) {
          // Check similarity matches in background (don't await to avoid blocking UI)
          checkSimilarityMatches(unmappedForSimilarityCheck).catch(err => {
            console.error('Error in background similarity check:', err);
          });
        }
        
        // NOTE: Auto-mapping removed from reload to prevent re-mapping when user unmaps products
        // Use the "Auto-Match All 100% Matches" button to manually trigger bulk auto-mapping
        
        setVendorProductMappings(vendorProductsWithMappings);
      }
    } catch (error) {
      console.error('Error loading vendor product mappings:', error);
      toast.error('Failed to load vendor product mappings');
    } finally {
      setLoading(false);
    }
  };

  const processCSVFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    // Get vendor ID from the vendor filter or require selection
    const vendorIdToUse = selectedVendorFilter && selectedVendorFilter !== 'all' 
      ? selectedVendorFilter 
      : null;

    if (!vendorIdToUse) {
      toast.error('Please select a vendor before uploading CSV');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('vendor_id', vendorIdToUse);
    formData.append('region', region);

    try {
      const response = await fetch('/api/admin/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult(result);
        const message = result.message || `Successfully processed ${result.processed} products`;
        toast.success(message);
        // Reload vendor products and mappings to reflect updates
        loadVendorProducts();
        if (activeTab === 'vendor-mappings') {
          loadVendorProductMappings();
        }
      } else {
        setUploadResult({ success: false, error: result.error || 'Upload failed' });
        toast.error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({ success: false, error: 'Failed to upload file' });
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processCSVFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (uploading || selectedVendorFilter === 'all') return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processCSVFile(file);
    }
  };

  const handleDeleteVendorProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vendor product?')) return;

    try {
      const response = await fetch(`/api/admin/vendor-products?id=${id}&region=${region}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Vendor product deleted successfully');
        loadVendorProducts();
      } else {
        toast.error('Failed to delete vendor product');
      }
    } catch (error) {
      console.error('Error deleting vendor product:', error);
      toast.error('Failed to delete vendor product');
    }
  };

  const handleDeleteVendor = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const response = await fetch(`/api/admin/vendors?id=${id}&region=${region}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Vendor deleted successfully');
        loadVendors();
      } else {
        toast.error('Failed to delete vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
    }
  };

  const handleUpdateVendor = async (id: number | string, updates: any) => {
    try {
      console.log('Updating vendor:', id, updates);
      const response = await fetch('/api/admin/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          region,
          ...updates
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Vendor update response:', responseData);
        toast.success('Vendor updated successfully');
        // Reload vendors but don't wait for it to complete
        loadVendors().catch(err => console.error('Error reloading vendors:', err));
        return true;
      } else {
        const data = await response.json();
        console.error('Vendor update failed:', data);
        toast.error(data.error || 'Failed to update vendor');
        return false;
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error('Failed to update vendor');
      return false;
    }
  };

  const handleCreateMapping = async (vendorProductName: string, productId: number, vendorId: number | string) => {
    try {
      console.log('🔗 Creating mapping:', { vendorProductName, productId, vendorId, region });
      
      // Show loading state immediately
      toast.loading('Creating mapping...', { id: 'mapping-status' });
      
      const response = await fetch('/api/vendor-product-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_product: vendorProductName,
          product_id: productId,
          vendor_id: vendorId,
          region
        }),
      });

      const data = await response.json();
      const statusCode = response.status;

      // Update UI immediately based on response
      if (statusCode === 201 || response.ok) {
        console.log('✅ Mapping created successfully:', data);
        
        // Fetch product name for display
        const productTableName = region === 'UK' ? 'wp_products' : 'us_products';
        const productNameField = region === 'UK' ? 'name' : 'product_title';
        
        // Try to get product name from response
        let productName = data.data?.[productTableName]?.name || data.data?.[productTableName]?.[productNameField] || 'Mapped Product';
        
        // Update local state immediately - NO RELOAD
        setVendorProductMappings(prev => {
          const updated = prev.map(vp => {
            const vpVendorId = region === 'UK' ? vp.vendor_id : vp.us_vendor_id;
            const matchesVendor = vpVendorId === vendorId || vpVendorId?.toString() === vendorId?.toString();
            const matchesName = vp.name?.toLowerCase().trim() === vendorProductName.toLowerCase().trim();
            
            if (matchesVendor && matchesName) {
              console.log('🔄 Updating state immediately for:', vp.name, '→ is_mapped: true');
              return {
                ...vp,
                is_mapped: true,
                mapping: { id: data.data?.id, product_id: productId, vendor_product: vendorProductName },
                mapped_product: { 
                  id: productId, 
                  name: productName,
                  ...(data.data?.[productTableName] || {})
                }
              };
            }
            return vp;
          });
          console.log('✅ State updated immediately - NO RELOAD. Updated count:', updated.filter(vp => vp.is_mapped).length);
          return updated;
        });
        
        toast.success(`✅ SUCCESS: Mapping created! Status: ${statusCode}`, { id: 'mapping-status', duration: 5000 });
      } else if (statusCode === 409) {
        console.log('ℹ️ Mapping already exists:', data);
        
        // Fetch product name for display
        const productTableName = region === 'UK' ? 'wp_products' : 'us_products';
        const productNameField = region === 'UK' ? 'name' : 'product_title';
        let productName = 'Product';
        
        // Get product ID from existing mapping
        const existingProductId = data.data?.product_id || productId;
        productName = 'Mapped Product'; // Placeholder, will be updated on next page load
        
        // Update local state immediately - NO RELOAD
        setVendorProductMappings(prev => {
          const updated = prev.map(vp => {
            const vpVendorId = region === 'UK' ? vp.vendor_id : vp.us_vendor_id;
            const matchesVendor = vpVendorId === vendorId || vpVendorId?.toString() === vendorId?.toString();
            const matchesName = vp.name?.toLowerCase().trim() === vendorProductName.toLowerCase().trim();
            
            if (matchesVendor && matchesName) {
              console.log('🔄 Updating state immediately (409) for:', vp.name, '→ is_mapped: true');
              return {
                ...vp,
                is_mapped: true,
                mapping: data.data || { id: 'existing', product_id: productId },
                mapped_product: { id: productId, name: productName }
              };
            }
            return vp;
          });
          console.log('✅ State updated immediately (409) - NO RELOAD. Updated count:', updated.filter(vp => vp.is_mapped).length);
          return updated;
        });
        
        toast.success(`✅ SUCCESS: Mapping already exists! Status: ${statusCode}`, { id: 'mapping-status', duration: 5000 });
      } else {
        const errorMsg = data.error || data.details || 'Unknown error';
        const errorDetails = data.details ? ` Details: ${data.details}` : '';
        
        console.error('❌ Mapping failed:', { status: statusCode, error: errorMsg, data });
        toast.error(`❌ FAILED: ${errorMsg}${errorDetails} (Status: ${statusCode})`, { 
          id: 'mapping-status', 
          duration: 8000 
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Network error or server unavailable';
      console.error('❌ Error creating mapping:', error);
      toast.error(`❌ FAILED: ${errorMessage}`, { 
        id: 'mapping-status', 
        duration: 8000 
      });
    }
  };

  // Calculate string similarity percentage (0-100)
  const calculateSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;
    
    // Test: Log a sample calculation for debugging
    if (s1.includes('lundgrens') || s2.includes('lundgrens')) {
      console.log(`🧪 Testing similarity: "${s1}" vs "${s2}"`);
    }
    
    // Levenshtein distance algorithm
    const matrix: number[][] = [];
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;
    
    return Math.round(similarity * 100) / 100; // Round to 2 decimal places
  };

  const autoMatchAll100Percent = async () => {
    try {
      setLoading(true);
      toast.info('Starting bulk auto-match for 100% matches...', { id: 'auto-match-status' });
      
      // Get all unmapped vendor products
      const unmappedProducts = vendorProductMappings.filter((vp: any) => !vp.is_mapped);
      
      if (unmappedProducts.length === 0) {
        toast.info('No unmapped products to match', { id: 'auto-match-status' });
        setLoading(false);
        return;
      }
      
      console.log(`🚀 Starting bulk auto-match for ${unmappedProducts.length} unmapped vendor products...`);
      
      // Fetch all products from database in batches
      let allProducts: any[] = [];
      let page = 1;
      const perPage = 1000;
      let hasMore = true;
      
      toast.loading(`Fetching all products from database...`, { id: 'auto-match-status' });
      
      while (hasMore) {
        const response = await fetch(`/api/admin/products?region=${region}&page=${page}&limit=${perPage}`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          allProducts = [...allProducts, ...data.data];
          hasMore = data.data.length === perPage && allProducts.length < (data.totalCount || 0);
          page++;
        } else {
          hasMore = false;
        }
      }
      
      console.log(`✅ Fetched ${allProducts.length} products from database`);
      
      // Get the correct product name field based on region
      const productNameField = region === 'UK' ? 'name' : 'product_title';
      
      // Create a map of products by normalized name for quick lookup
      const productsMap = new Map<string, any>();
      allProducts.forEach((product: any) => {
        const productName = product[productNameField] || product.name || '';
        if (productName) {
          const normalizedName = productName.toLowerCase().trim();
          // Store both the normalized key and the product
          productsMap.set(normalizedName, product);
        }
      });
      
      // Find 100% matches and create mappings
      const mappingsToCreate: any[] = [];
      let checkedCount = 0;
      
      toast.loading(`Checking ${unmappedProducts.length} vendor products for 100% matches...`, { id: 'auto-match-status' });
      
      for (const vp of unmappedProducts) {
        checkedCount++;
        
        if (!vp.name) continue;
        
        const vpVendorId = region === 'UK' ? vp.vendor_id : vp.us_vendor_id;
        const normalizedVpName = vp.name.toLowerCase().trim();
        
        // First try exact name match (fastest)
        const exactMatch = productsMap.get(normalizedVpName);
        
        if (exactMatch) {
          mappingsToCreate.push({
            vendor_product: vp.name,
            product_id: exactMatch.id,
            vendor_id: vpVendorId,
            region
          });
          console.log(`✅ Found exact match: "${vp.name}" → "${exactMatch[productNameField] || exactMatch.name}"`);
        } else {
          // If no exact match, calculate similarity for all products
          let bestMatch: any = null;
          let bestSimilarity = 0;
          
          for (const product of allProducts) {
            const productName = product[productNameField] || product.name || '';
            if (!productName) continue;
            
            const similarity = calculateSimilarity(vp.name, productName);
            
            if (similarity === 100 || similarity >= 99.9) {
              bestMatch = product;
              bestSimilarity = similarity;
              break; // Found 100% match, no need to continue
            }
          }
          
          if (bestMatch && bestSimilarity >= 99.9) {
            mappingsToCreate.push({
              vendor_product: vp.name,
              product_id: bestMatch.id,
              vendor_id: vpVendorId,
              region
            });
            console.log(`✅ Found 100% match: "${vp.name}" → "${bestMatch[productNameField] || bestMatch.name}" (${bestSimilarity}%)`);
          }
        }
        
        // Update progress every 100 products
        if (checkedCount % 100 === 0) {
          toast.loading(`Checked ${checkedCount}/${unmappedProducts.length} products, found ${mappingsToCreate.length} matches...`, { id: 'auto-match-status' });
        }
      }
      
      console.log(`🎯 Found ${mappingsToCreate.length} products with 100% matches out of ${unmappedProducts.length} checked`);
      
      if (mappingsToCreate.length === 0) {
        toast.info('No 100% matches found', { id: 'auto-match-status' });
        setLoading(false);
        return;
      }
      
      // Create all mappings in parallel batches
      toast.loading(`Creating ${mappingsToCreate.length} mappings...`, { id: 'auto-match-status' });
      
      const batchSize = 50;
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < mappingsToCreate.length; i += batchSize) {
        const batch = mappingsToCreate.slice(i, i + batchSize);
        
        const mappingPromises = batch.map(mapping => 
          fetch('/api/vendor-product-mappings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mapping),
          })
            .then(async (res) => {
              const data = await res.json();
              if (res.ok || res.status === 201) {
                return true;
              } else if (res.status === 409) {
                // Already exists, count as success
                return true;
              } else {
                console.error(`Failed to map "${mapping.vendor_product}":`, data);
                return false;
              }
            })
            .catch((error) => {
              console.error(`Error mapping "${mapping.vendor_product}":`, error);
              return false;
            })
        );
        
        const results = await Promise.all(mappingPromises);
        successCount += results.filter(r => r === true).length;
        errorCount += results.filter(r => r === false).length;
        
        // Update progress
        const processed = Math.min(i + batchSize, mappingsToCreate.length);
        toast.loading(`Created ${processed}/${mappingsToCreate.length} mappings...`, { id: 'auto-match-status' });
      }
      
      console.log(`✅ Auto-match complete: ${successCount} successful, ${errorCount} failed`);
      
      toast.success(`🎯 Auto-matched ${successCount} products with 100% matches!`, { id: 'auto-match-status', duration: 5000 });
      
      // Reload mappings to reflect new auto-mappings
      await loadVendorProductMappings();
      
    } catch (error) {
      console.error('❌ Error in bulk auto-match:', error);
      toast.error('Failed to auto-match products', { id: 'auto-match-status' });
    } finally {
      setLoading(false);
    }
  };

  const checkSimilarityMatches = async (vendorProducts: any[]) => {
    try {
      console.log(`🔍 Starting similarity check for ${vendorProducts.length} vendor products...`);
      
      if (vendorProducts.length === 0) {
        console.warn('⚠️ No vendor products to check');
        return;
      }
      
      // Show sample vendor products being checked
      console.log(`📋 Sample vendor products to check:`, vendorProducts.slice(0, 5).map((vp: any) => vp.name));
      
      // Fetch all products once (from wp_products or us_products)
      let allProducts: any[] = [];
      let page = 1;
      const perPage = 1000;
      let hasMore = true;
      let totalCount = 0;
      
      while (hasMore) {
        const response = await fetch(`/api/admin/products?region=${region}&page=${page}&limit=${perPage}`);
        const data = await response.json();
        
        if (data.error) {
          console.error('❌ API Error:', data.error);
          break;
        }
        
        if (data.data && data.data.length > 0) {
          allProducts = [...allProducts, ...data.data];
          totalCount = data.totalCount || allProducts.length;
          hasMore = data.data.length === perPage && allProducts.length < totalCount;
          page++;
          console.log(`📦 Fetched batch ${page - 1}: ${data.data.length} products (total so far: ${allProducts.length}/${totalCount})`);
        } else {
          hasMore = false;
        }
      }
      
      if (allProducts.length === 0) {
        console.error('❌ No products fetched from database!');
        toast.error('Failed to fetch products for similarity check');
        return;
      }
      
      console.log(`✅ Fetched ${allProducts.length} products from ${region} region (${region === 'UK' ? 'wp_products' : 'us_products'})`);
      
      // Get the correct product name field based on region
      const productNameField = region === 'UK' ? 'name' : 'product_title';
      console.log(`📝 Sample products from database:`, allProducts.slice(0, 5).map((p: any) => p[productNameField] || p.name || 'N/A'));
      
      // Check each vendor product for similarity matches
      const productsWithMatchesSet = new Set<string>();
      let totalMatchesFound = 0;
      let checkedCount = 0;
      
      for (const vp of vendorProducts) {
        if (!vp.name || !vp.id) {
          console.warn(`⚠️ Skipping vendor product with missing name or id:`, vp);
          continue;
        }
        
        checkedCount++;
        
        // Calculate similarity for all products
        const matches = allProducts
          .map((product: any) => {
            // Get product name from correct field (name for UK, product_title for US)
            const productName = product[productNameField] || product.name;
            if (!productName) return null;
            
            const similarity = calculateSimilarity(vp.name.trim(), productName.trim());
            return {
              ...product,
              productName, // Store the actual name used
              similarity
            };
          })
          .filter((p: any) => p !== null && p.similarity >= 85)
          .sort((a: any, b: any) => b.similarity - a.similarity);
        
        if (matches.length > 0) {
          // Ensure ID is converted to string for consistent Set lookup
          const vpId = String(vp.id);
          productsWithMatchesSet.add(vpId);
          totalMatchesFound += matches.length;
          // Log matches for debugging
          console.log(`✅ Match found for vendor product "${vp.name}":`, matches.slice(0, 3).map((m: any) => `${m.productName || m.name} (${m.similarity}%)`));
        }
        
        // Log progress every 100 products
        if (checkedCount % 100 === 0) {
          console.log(`⏳ Progress: Checked ${checkedCount}/${vendorProducts.length} vendor products, found ${productsWithMatchesSet.size} with matches`);
        }
      }
      
      setProductsWithMatches(productsWithMatchesSet);
      console.log(`✅ Similarity check complete!`);
      console.log(`   - Checked: ${checkedCount} vendor products`);
      console.log(`   - Products with matches: ${productsWithMatchesSet.size}`);
      console.log(`   - Total matches found: ${totalMatchesFound}`);
      
      if (productsWithMatchesSet.size === 0) {
        console.warn(`⚠️ No similarity matches found (85%+ threshold)`);
        console.warn(`   Sample vendor products:`, vendorProducts.slice(0, 3).map((vp: any) => vp.name));
        const productNameField = region === 'UK' ? 'name' : 'product_title';
        console.warn(`   Sample database products:`, allProducts.slice(0, 3).map((p: any) => p[productNameField] || p.name || 'N/A'));
        
        // Test a specific comparison
        if (vendorProducts.length > 0 && allProducts.length > 0) {
          const testVp = vendorProducts[0];
          const testProduct = allProducts[0];
          const testProductName = testProduct[productNameField] || testProduct.name;
          const testSimilarity = calculateSimilarity(testVp.name, testProductName);
          console.log(`🧪 Test comparison: "${testVp.name}" vs "${testProductName}" = ${testSimilarity}%`);
        }
      } else {
        toast.success(`Found ${productsWithMatchesSet.size} products with 85%+ similarity matches!`);
      }
    } catch (error) {
      console.error('❌ Error checking similarity matches:', error);
      toast.error('Failed to check similarity matches');
    }
  };

  const handleSearchSuggestions = async (searchValue: string, rowId: string, isManualSearch: boolean = false) => {
    if (!searchValue || searchValue.trim().length === 0) {
      return;
    }
    
    setSearchLoading(true);
    // Use lower threshold (50%) for manual searches, 85% for auto-searches
    const minSimilarity = isManualSearch ? 50 : 85;
    const results = await searchSimilarProducts(searchValue, minSimilarity);
    setSearchLoading(false);
    
    // Find the vendor product to get vendor ID
    const vendorProduct = vendorProductMappings.find((vp: any) => String(vp.id) === String(rowId));
    if (!vendorProduct) {
      console.error('Vendor product not found for rowId:', rowId);
      return;
    }
    
    const vendorIdToFind = region === 'UK' ? vendorProduct.vendor_id : vendorProduct.us_vendor_id;
    
    // AUTO-MAP 100% matches immediately
    const exactMatches = results.filter((r: any) => r.similarity === 100 || r.similarity >= 99.9);
    if (exactMatches.length > 0) {
      const bestMatch = exactMatches[0]; // Use the first 100% match
      console.log('🎯 Found 100% match, auto-mapping immediately:', {
        vendorProduct: vendorProduct.name,
        productId: bestMatch.id,
        productName: bestMatch.name,
        similarity: bestMatch.similarity
      });
      
      // Auto-map immediately
      await handleCreateMapping(vendorProduct.name, bestMatch.id, vendorIdToFind);
      
      // Don't show suggestions for exact matches - they're already mapped
      return;
    }
    
    setSearchSuggestions(prev => {
      const newMap = new Map(prev);
      newMap.set(rowId, results);
      return newMap;
    });
    
    // Update productsWithMatches if results found with 85%+
    const highSimilarityResults = results.filter((r: any) => r.similarity >= 85);
    if (highSimilarityResults.length > 0) {
      setProductsWithMatches(prev => new Set([...Array.from(prev), String(rowId)]));
    }
  };

  const searchSimilarProducts = async (vendorProductName: string, minSimilarity: number = 85) => {
    try {
      if (!vendorProductName || vendorProductName.trim().length === 0) {
        return [];
      }

      // Fetch all products in batches to calculate similarity
      let allProducts: any[] = [];
      let page = 1;
      const perPage = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const response = await fetch(`/api/admin/products?region=${region}&page=${page}&limit=${perPage}`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          allProducts = [...allProducts, ...data.data];
          hasMore = data.data.length === perPage && allProducts.length < (data.totalCount || 0);
          page++;
        } else {
          hasMore = false;
        }
      }
      
      console.log(`🔍 Searching ${allProducts.length} products for matches to "${vendorProductName}"`);
      
      // Get the correct product name field based on region
      const productNameField = region === 'UK' ? 'name' : 'product_title';
      
      // Calculate similarity for each product
      const productsWithSimilarity = allProducts.map((product: any) => {
        const productName = product[productNameField] || product.name || '';
        const similarity = calculateSimilarity(vendorProductName, productName);
        return {
          ...product,
          name: productName, // Ensure name field is set for display
          similarity
        };
      });
      
      // Filter by similarity threshold and sort by similarity (highest first)
      const matches = productsWithSimilarity
        .filter((p: any) => p.similarity >= minSimilarity)
        .sort((a: any, b: any) => b.similarity - a.similarity)
        .slice(0, 20); // Show top 20 matches for manual searches
      
      console.log(`✅ Found ${matches.length} products with ${minSimilarity}%+ similarity:`, matches.slice(0, 5).map((m: any) => `${m.name} (${m.similarity}%)`));
      
      return matches;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  if (!adminKey) {
    return null;
  }

  const activeVendors = vendors.filter((v) => region === 'UK' ? v.is_active : v.status === 'active');
  const inactiveVendors = vendors.filter((v) => region === 'UK' ? !v.is_active : v.status !== 'active');
  const vendorsWithWebsites = vendors.filter((v) => v.website);

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && (region === 'UK' ? v.is_active : v.status === 'active')) ||
      (filterStatus === 'inactive' && (region === 'UK' ? !v.is_active : v.status !== 'active'));
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <div className="flex min-h-screen bg-slate-950">
        {/* Sidebar */}
        <div className="group w-20 hover:w-72 bg-slate-900 border-r border-slate-800 p-4 hover:p-6 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
          <div className="flex items-center justify-center group-hover:justify-between mb-8">
            <h2 className="text-sm font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Manage vendors and products</h2>
            <button className="h-8 w-8 flex-shrink-0 rounded-lg hover:bg-slate-800/50 transition-all duration-300 flex items-center justify-center text-xl" title="Toggle theme">
              <span className="sr-only">Toggle theme</span>
              🌙
            </button>
          </div>

          {/* Region Selector */}
          <div className="mb-8">
            <p className="text-xs text-slate-500 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Region</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setRegion('UK')}
                className={`flex items-center justify-start overflow-hidden p-2 group-hover:px-3 group-hover:py-2 rounded-lg transition-all duration-300 ${
                  region === 'UK' 
                    ? 'bg-transparent group-hover:bg-primary text-primary-foreground' 
                    : 'bg-transparent group-hover:bg-slate-800 group-hover:border group-hover:border-slate-700'
                }`}
                title="United Kingdom"
              >
                <span className="text-2xl flex-shrink-0 ml-[45%] group-hover:ml-0 transition-all duration-300">🇬🇧</span>
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm">United Kingdom</span>
              </button>
              <button
                onClick={() => setRegion('US')}
                className={`flex items-center justify-start overflow-hidden p-2 group-hover:px-3 group-hover:py-2 rounded-lg transition-all duration-300 ${
                  region === 'US' 
                    ? 'bg-transparent group-hover:bg-primary text-primary-foreground' 
                    : 'bg-transparent group-hover:bg-slate-800 group-hover:border group-hover:border-slate-700'
                }`}
                title="United States"
              >
                <span className="text-2xl flex-shrink-0 ml-[45%] group-hover:ml-0 transition-all duration-300">🇺🇸</span>
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm">United States</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4 mb-8">
            <div className="bg-transparent group-hover:bg-slate-800/50 border border-transparent group-hover:border-slate-700 p-2 group-hover:p-4 rounded-lg cursor-pointer transition-all duration-300" title={`${vendors.length} Total Vendors`}>
              <div className="flex items-center justify-center group-hover:justify-between gap-3">
                <div className="min-w-0 flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-2xl font-bold text-white">{vendors.length}</p>
                  <p className="text-xs text-slate-400 whitespace-nowrap">Total Vendors</p>
                </div>
                <Users className="h-6 w-6 text-slate-400 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-transparent group-hover:bg-slate-800/50 border border-transparent group-hover:border-slate-700 p-2 group-hover:p-4 rounded-lg cursor-pointer transition-all duration-300" title={`${activeVendors.length} Active Vendors`}>
              <div className="flex items-center justify-center group-hover:justify-between gap-3">
                <div className="min-w-0 flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-2xl font-bold text-white">{activeVendors.length}</p>
                  <p className="text-xs text-slate-400 whitespace-nowrap">Active Vendors</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-transparent group-hover:bg-slate-800/50 border border-transparent group-hover:border-slate-700 p-2 group-hover:p-4 rounded-lg cursor-pointer transition-all duration-300" title={`${totalCount || products.length} Total Products`}>
              <div className="flex items-center justify-center group-hover:justify-between gap-3">
                <div className="min-w-0 flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-2xl font-bold text-white">{totalCount || products.length}</p>
                  <p className="text-xs text-slate-400 whitespace-nowrap">Total Products</p>
                </div>
                <Package className="h-6 w-6 text-slate-400 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-transparent group-hover:bg-slate-800/50 border border-transparent group-hover:border-slate-700 p-2 group-hover:p-4 rounded-lg cursor-pointer transition-all duration-300" title="£0.00 Avg. Price">
              <div className="flex items-center justify-center group-hover:justify-between gap-3">
                <div className="min-w-0 flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-2xl font-bold text-white">£0.00</p>
                  <p className="text-xs text-slate-400 whitespace-nowrap">Avg. Price</p>
                </div>
                <span className="text-slate-400 text-2xl flex-shrink-0">💷</span>
              </div>
            </div>
          </div>

          {/* Vendor Management */}
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Vendor Management</p>
            <div className="relative mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search vendors..."
                className="pl-9 bg-slate-800 border-slate-700 text-sm"
              />
            </div>
            <button
              className="w-full flex items-center justify-center overflow-hidden p-2 group-hover:px-3 group-hover:py-2 rounded-lg bg-transparent group-hover:bg-slate-800 group-hover:border group-hover:border-slate-700 transition-all duration-300 text-slate-300"
              title="Add Vendor"
            >
              <Plus className="h-5 w-5 flex-shrink-0" />
              <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm">Add Vendor</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header - Compact */}
          <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800/50 px-6 py-3 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-white">NP Admin</h1>
                <div className="h-4 w-px bg-slate-700" />
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">Live</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Region: {region}</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>
            </div>

            {/* Tabs - Grouped & Compact */}
            <div className="flex items-center gap-1 mt-3 -mb-3 overflow-x-auto pb-3">
              {/* Data Management */}
              <div className="flex items-center bg-slate-800/30 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('vendors')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'vendors'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Vendors
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'products'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Package className="h-3.5 w-3.5" />
                  Products
                </button>
              </div>

              <div className="h-4 w-px bg-slate-700/50 mx-1" />

              {/* Mapping & Sync */}
              <div className="flex items-center bg-slate-800/30 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('vendor-products')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'vendor-products'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Vendor Data
                </button>
                <button
                  onClick={() => setActiveTab('vendor-mappings')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'vendor-mappings'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  Mappings
                </button>
                <button
                  onClick={() => setActiveTab('unmapped')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'unmapped'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-400/70 hover:text-amber-400'
                  }`}
                >
                  <span className="text-sm">⚠</span>
                  Unmapped
                </button>
              </div>

              <div className="h-4 w-px bg-slate-700/50 mx-1" />

              {/* Marketing */}
              <div className="flex items-center bg-slate-800/30 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('signups')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'signups'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Signups
                </button>
                <button
                  onClick={() => setActiveTab('offers')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'offers'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-sm">🎁</span>
                  Offers
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'applications'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Store className="h-3.5 w-3.5" />
                  Applications
                  {applicationsPendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full leading-none">
                      {applicationsPendingCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="h-4 w-px bg-slate-700/50 mx-1" />

              {/* Tools */}
              <div className="flex items-center bg-slate-800/30 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'upload'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UploadIcon className="h-3.5 w-3.5" />
                  Upload
                </button>
                <button
                  onClick={() => setActiveTab('currency-converter')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'currency-converter'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-sm">💱</span>
                  Currency
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            {activeTab === 'vendors' && (
              <div className="space-y-4">
                {/* Stats Bar - Compact inline */}
                <div className="flex items-center justify-between bg-slate-800/30 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">Total</span>
                      <span className="text-white font-semibold">{vendors.length}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-500 text-xs">Active</span>
                      <span className="text-emerald-400 font-semibold">{activeVendors.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-slate-500 text-xs">Inactive</span>
                      <span className="text-red-400 font-semibold">{inactiveVendors.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-slate-500 text-xs">With Site</span>
                      <span className="text-blue-400 font-semibold">{vendorsWithWebsites.length}</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Add Vendor
                  </Button>
                </div>

                {/* Search and Filters - Compact */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <Input
                      placeholder="Search vendors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-8 text-sm bg-slate-900/50 border-slate-700/50 focus:border-slate-600"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-8 px-3 bg-slate-900/50 border border-slate-700/50 rounded-md text-xs text-slate-300 focus:border-slate-600"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-8 px-3 bg-slate-900/50 border border-slate-700/50 rounded-md text-xs text-slate-300 focus:border-slate-600"
                  >
                    <option value="name">A-Z</option>
                    <option value="date">Recent</option>
                  </select>
                </div>

                {/* Vendor Cards - More compact spacing */}
                <div className="space-y-2">
                  {filteredVendors.map((vendor) => (
                    <VendorCard
                      key={`vendor-${vendor.id}-${vendor.shipping_info || ''}`}
                      vendor={vendor}
                      region={region}
                      onUpdate={handleUpdateVendor}
                      onDelete={handleDeleteVendor}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-4">
                {/* Stats Bar - Compact inline */}
                <div className="flex items-center justify-between bg-slate-800/30 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">Total</span>
                      <span className="text-white font-semibold">{totalCount || products.length}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="text-slate-500 text-xs">Brands</span>
                      <span className="text-purple-400 font-semibold">{new Set(products.map(p => p.brand || (p.name || p.product_title || '').split(' ')[0]).filter(Boolean)).size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-500 text-xs">With Images</span>
                      <span className="text-emerald-400 font-semibold">{products.filter(p => p.image_url).length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <span className="text-slate-500 text-xs">Avg Strength</span>
                      <span className="text-orange-400 font-semibold">
                        {products.length > 0 && products.filter(p => p.strength_mg).length > 0
                          ? Math.round(products.filter(p => p.strength_mg).reduce((acc, p) => acc + parseFloat(p.strength_mg || 0), 0) / products.filter(p => p.strength_mg).length)
                          : 0}mg
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700">
                      Export CSV
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add Product
                    </Button>
                  </div>
                </div>

                {/* Search and Filters - Compact */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          loadProducts();
                        }
                      }}
                      className="pl-9 h-8 text-sm bg-slate-900/50 border-slate-700/50 focus:border-slate-600"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-8 px-3 bg-slate-900/50 border border-slate-700/50 rounded-md text-xs text-slate-300"
                  >
                    <option value="name">A-Z Name</option>
                    <option value="brand">By Brand</option>
                    <option value="date">Recent</option>
                  </select>
                  <Button
                    size="sm"
                    onClick={() => { setCurrentPage(1); loadProducts(); }}
                    className="h-8 bg-slate-700 hover:bg-slate-600 text-xs"
                  >
                    <Search className="h-3 w-3 mr-1" /> Search
                  </Button>
                </div>

                {/* Products Table View */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-900/30 rounded-lg border border-slate-800/50 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-800/50 bg-slate-800/30">
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Product</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Brand</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Flavour</th>
                            <th className="text-center px-3 py-2 text-xs font-medium text-slate-500 uppercase">Strength</th>
                            <th className="text-center px-3 py-2 text-xs font-medium text-slate-500 uppercase">Image</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-slate-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-800/20 transition-colors group">
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  {product.image_url ? (
                                    <img src={product.image_url} alt="" className="w-8 h-8 object-cover rounded" />
                                  ) : (
                                    <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
                                      <Package className="h-4 w-4 text-slate-600" />
                                    </div>
                                  )}
                                  <span className="text-sm text-white font-medium truncate max-w-[200px]">
                                    {product.name || product.product_title}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <span className="text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-300">
                                  {product.brand || (product.name || product.product_title || '').split(' ')[0] || '-'}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-slate-400 max-w-[150px] truncate">
                                {product.flavour || (product.name || product.product_title || '').split(' ').slice(1).join(' ') || '-'}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {product.strength_mg ? (
                                  <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded">
                                    {product.strength_mg}mg
                                  </span>
                                ) : (
                                  <span className="text-slate-600">-</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {product.image_url ? (
                                  <span className="text-emerald-400">✓</span>
                                ) : (
                                  <span className="text-slate-600">✗</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-white">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-red-400">
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                        <div className="text-sm text-slate-400">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} products
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="border-slate-800"
                          >
                            First
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="border-slate-800"
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className="w-10 border-slate-800"
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="border-slate-800"
                          >
                            Next
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="border-slate-800"
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    )}

                    {products.length === 0 && !loading && (
                      <div className="text-center py-12 text-slate-400">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No products found</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'vendor-products' && (
              <div className="space-y-6">
                {/* Upload CSV Section */}
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <UploadIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Upload Vendor Products CSV</h3>
                      <p className="text-sm text-slate-400">Import vendor products from CSV file</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-sm font-medium text-slate-300 mb-2">
                          {uploading ? 'Uploading...' : 'Click to upload CSV file'}
                        </p>
                        <p className="text-xs text-slate-500">
                          CSV files only • Maximum 10MB
                        </p>
                      </div>
                    </label>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />

                    {uploadResult && (
                      <div className={`p-4 rounded-lg border ${
                        uploadResult.success 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-red-500/10 border-red-500/20'
                      }`}>
                        <div className="flex items-center gap-3">
                          {uploadResult.success ? (
                            <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                          )}
                          <div>
                            {uploadResult.success ? (
                              <div>
                                <p className="font-medium text-green-400">Upload Successful</p>
                                <p className="text-sm text-slate-300">
                                  Processed: {uploadResult.processed} | Inserted: {uploadResult.inserted}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium text-red-400">Upload Failed</p>
                                <p className="text-sm text-slate-300">{uploadResult.error}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search vendor products by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          loadVendorProducts();
                        }
                      }}
                      className="pl-10 bg-slate-900 border-slate-800"
                    />
                  </div>
                  <select
                    value={selectedVendorFilter}
                    onChange={(e) => setSelectedVendorFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 min-w-[200px]"
                  >
                    <option value="all">All Vendors</option>
                    {Array.from(new Set(vendorProducts.map(vp => region === 'UK' ? vp.vendor_id : vp.us_vendor_id)))
                      .filter(Boolean)
                      .map((vendorId) => {
                        const vendor = vendors.find(v => v.id === vendorId);
                        return (
                          <option key={vendorId} value={vendorId}>
                            {vendor?.name || `Vendor ${vendorId}`}
                          </option>
                        );
                      })}
                  </select>
                  <Button
                    onClick={loadVendorProducts}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-8 px-3 bg-slate-900/50 border border-slate-700/50 rounded-md text-xs text-slate-300"
                  >
                    <option value="name">A-Z</option>
                    <option value="date">Recent</option>
                  </select>
                </div>

                {/* Stats Bar - Compact inline */}
                {(() => {
                  const filteredVendorProducts = vendorProducts.filter((vp) => {
                    const matchesSearch = vp.name?.toLowerCase().includes(searchTerm.toLowerCase());
                    const vendorIdToCheck = region === 'UK' ? vp.vendor_id : vp.us_vendor_id;
                    const matchesVendor = selectedVendorFilter === 'all' || vendorIdToCheck === selectedVendorFilter || vendorIdToCheck?.toString() === selectedVendorFilter;
                    return matchesSearch && matchesVendor;
                  });
                  const inStock = filteredVendorProducts.filter(vp => vp.stock_status === 'in_stock').length;
                  const outOfStock = filteredVendorProducts.filter(vp => vp.stock_status === 'out_of_stock').length;
                  const vendorCount = new Set(filteredVendorProducts.map(vp => region === 'UK' ? vp.vendor_id : vp.us_vendor_id)).size;

                  return (
                    <div className="flex items-center justify-between bg-slate-800/30 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs">Total</span>
                          <span className="text-white font-semibold">{filteredVendorProducts.length}</span>
                        </div>
                        <div className="h-4 w-px bg-slate-700" />
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-slate-500 text-xs">In Stock</span>
                          <span className="text-emerald-400 font-semibold">{inStock}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          <span className="text-slate-500 text-xs">Out</span>
                          <span className="text-red-400 font-semibold">{outOfStock}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-400" />
                          <span className="text-slate-500 text-xs">Vendors</span>
                          <span className="text-purple-400 font-semibold">{vendorCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700">
                          Export CSV
                        </Button>
                      </div>
                    </div>
                  );
                })()}

                {/* Vendor Products Table */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : vendorProducts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No vendor products found</p>
                    <p className="text-sm mt-2">Upload a CSV file to get started</p>
                  </div>
                ) : (() => {
                  // Filter vendor products based on search and vendor filter
                  const filteredVendorProducts = vendorProducts.filter((vp) => {
                    const matchesSearch = !searchTerm || vp.name?.toLowerCase().includes(searchTerm.toLowerCase());
                    const vendorIdToCheck = region === 'UK' ? vp.vendor_id : vp.us_vendor_id;
                    // Handle both string and number comparisons
                    const vendorIdStr = vendorIdToCheck?.toString();
                    const filterIdStr = selectedVendorFilter?.toString();
                    const matchesVendor = selectedVendorFilter === 'all' || vendorIdStr === filterIdStr || vendorIdToCheck === selectedVendorFilter || vendorIdToCheck === parseInt(selectedVendorFilter);
                    
                    return matchesSearch && matchesVendor;
                  });
                  
                  // Debug logging
                  if (selectedVendorFilter !== 'all') {
                    console.log(`🔍 Filtering by vendor: ${selectedVendorFilter}, Found ${filteredVendorProducts.length} products out of ${vendorProducts.length} total`);
                    console.log(`📦 Sample vendor IDs in products:`, vendorProducts.slice(0, 5).map(vp => ({
                      name: vp.name,
                      vendor_id: region === 'UK' ? vp.vendor_id : vp.us_vendor_id
                    })));
                  }

                  // Calculate pagination
                  const totalVendorPages = Math.ceil(filteredVendorProducts.length / vendorProductsPerPage);
                  const startIndex = (vendorProductsPage - 1) * vendorProductsPerPage;
                  const endIndex = startIndex + vendorProductsPerPage;
                  const paginatedVendorProducts = filteredVendorProducts.slice(startIndex, endIndex);

                  return (
                    <>
                      {/* Compact Table View */}
                      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-800/50 border-b border-slate-700">
                              <tr>
                                <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase">Product</th>
                                <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase">Vendor</th>
                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-400 uppercase">Status</th>
                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-400 uppercase">1</th>
                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-400 uppercase">3</th>
                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-400 uppercase">5</th>
                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-400 uppercase">10</th>
                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-400 uppercase">20</th>
                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-400 uppercase">URL</th>
                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-400 uppercase"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {paginatedVendorProducts.map((vp) => {
                                const vendorIdToFind = region === 'UK' ? vp.vendor_id : vp.us_vendor_id;
                                const vendor = vendors.find(v => v.id === vendorIdToFind);
                                return (
                                  <tr key={vp.id} className="hover:bg-slate-800/30">
                                    <td className="px-3 py-2">
                                      <span className="text-sm text-white truncate max-w-[180px] block" title={vp.name}>{vp.name}</span>
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className="text-xs text-slate-400">{vendor?.name || '-'}</span>
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${vp.stock_status === 'in_stock' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {vp.stock_status === 'in_stock' ? '✓' : '✗'}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2 text-center text-xs text-slate-300">{vp.price_1pack || '-'}</td>
                                    <td className="px-2 py-2 text-center text-xs text-slate-300">{vp.price_3pack || '-'}</td>
                                    <td className="px-2 py-2 text-center text-xs text-slate-300">{vp.price_5pack || '-'}</td>
                                    <td className="px-2 py-2 text-center text-xs text-slate-300">{vp.price_10pack || '-'}</td>
                                    <td className="px-2 py-2 text-center text-xs text-slate-300">{vp.price_20pack || '-'}</td>
                                    <td className="px-2 py-2 text-center">
                                      {vp.url && (
                                        <a href={vp.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                          <Globe className="h-3 w-3" />
                                        </a>
                                      )}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDeleteVendorProduct(vp.id)}
                                        className="h-6 w-6 text-slate-500 hover:text-red-400"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination Controls */}
                      {totalVendorPages > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-6">
                          <div className="text-sm text-slate-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredVendorProducts.length)} of {filteredVendorProducts.length} vendor products
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setVendorProductsPage(1)}
                              disabled={vendorProductsPage === 1}
                              className="border-slate-800"
                            >
                              First
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setVendorProductsPage(vendorProductsPage - 1)}
                              disabled={vendorProductsPage === 1}
                              className="border-slate-800"
                            >
                              Previous
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, totalVendorPages) }, (_, i) => {
                                let pageNum;
                                if (totalVendorPages <= 5) {
                                  pageNum = i + 1;
                                } else if (vendorProductsPage <= 3) {
                                  pageNum = i + 1;
                                } else if (vendorProductsPage >= totalVendorPages - 2) {
                                  pageNum = totalVendorPages - 4 + i;
                                } else {
                                  pageNum = vendorProductsPage - 2 + i;
                                }
                                return (
                                  <Button
                                    key={i}
                                    variant={vendorProductsPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setVendorProductsPage(pageNum)}
                                    className={vendorProductsPage === pageNum ? "" : "border-slate-800"}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setVendorProductsPage(vendorProductsPage + 1)}
                              disabled={vendorProductsPage === totalVendorPages}
                              className="border-slate-800"
                            >
                              Next
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setVendorProductsPage(totalVendorPages)}
                              disabled={vendorProductsPage === totalVendorPages}
                              className="border-slate-800"
                            >
                              Last
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {activeTab === 'vendor-mappings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Vendor Products Management</h2>
                    <p className="text-slate-400">
                      {vendorProductMappings.length} vendor products • 
                      <span className="text-green-400 ml-1">{vendorProductMappings.filter((vp: any) => vp.is_mapped).length} mapped</span> • 
                      <span className="text-yellow-400 ml-1">{vendorProductMappings.filter((vp: any) => !vp.is_mapped).length} unmapped</span>
                      {productsWithMatches.size > 0 && (
                        <> • <span className="text-blue-400 ml-1">{productsWithMatches.size} with 85%+ matches</span></>
                      )}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const unmapped = vendorProductMappings.filter((vp: any) => !vp.is_mapped);
                          if (unmapped.length > 0) {
                            toast.info(`Checking ${unmapped.length} unmapped products for similarity matches...`);
                            await checkSimilarityMatches(unmapped);
                            toast.success('Similarity check complete!');
                          } else {
                            toast.info('No unmapped products to check');
                          }
                        }}
                        className="border-slate-800 text-xs"
                        disabled={loading}
                      >
                        🔍 Re-check Similarity Matches
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={autoMatchAll100Percent}
                        className="border-green-800 text-green-400 hover:bg-green-900/20 text-xs"
                        disabled={loading}
                      >
                        🎯 Auto-Match All 100% Matches
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Compact Filters Bar */}
                <div className="flex items-center gap-3 flex-wrap bg-slate-800/30 rounded-lg px-4 py-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <Input
                      placeholder="Search..."
                      value={mappingsSearchTerm}
                      onChange={(e) => setMappingsSearchTerm(e.target.value)}
                      className="h-8 pl-8 text-xs bg-slate-900 border-slate-700"
                    />
                  </div>
                  <select
                    value={selectedVendorFilter}
                    onChange={(e) => setSelectedVendorFilter(e.target.value)}
                    className="h-8 px-3 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-300"
                  >
                    <option value="all">All Vendors</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                    ))}
                  </select>
                  <select
                    value={mappingsBrandFilter}
                    onChange={(e) => setMappingsBrandFilter(e.target.value)}
                    className="h-8 px-3 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-300"
                  >
                    <option value="all">All Brands</option>
                    {Array.from(new Set(vendorProductMappings.map(m => m.name?.split(' ')[0]).filter(Boolean))).map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  <select
                    value={mappingsStatusFilter}
                    onChange={(e) => setMappingsStatusFilter(e.target.value)}
                    className="h-8 px-3 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-300"
                  >
                    <option value="all">All Status</option>
                    <option value="mapped">Mapped</option>
                    <option value="unmapped">Unmapped</option>
                  </select>
                  <select
                    value={mappingsSimilarityFilter}
                    onChange={(e) => setMappingsSimilarityFilter(e.target.value)}
                    className="h-8 px-3 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-300"
                  >
                    <option value="all">All Matches</option>
                    <option value="has_matches">Has 85%+</option>
                    <option value="no_matches">No Match</option>
                  </select>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setMappingsBrandFilter('all');
                      setMappingsStatusFilter('all');
                      setMappingsSimilarityFilter('all');
                      setMappingsSearchTerm('');
                      setSelectedVendorFilter('all');
                    }}
                    className="h-8 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </Button>
                </div>

                {/* Mappings Table */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : vendorProductMappings.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No vendor product mappings found</p>
                    <p className="text-sm mt-2">Upload vendor products to create mappings</p>
                  </div>
                ) : (() => {
                  // Filter vendor products for mapping
                  const filteredMappings = vendorProductMappings.filter((vp) => {
                    if (!vp.name) return false;

                    const matchesSearch = vp.name?.toLowerCase().includes(mappingsSearchTerm.toLowerCase());
                    const vendorIdToCheck = region === 'UK' ? vp.vendor_id : vp.us_vendor_id;
                    // Robust vendor ID comparison - handle both string and number types
                    const matchesVendor = selectedVendorFilter === 'all' || 
                      vendorIdToCheck === selectedVendorFilter || 
                      vendorIdToCheck?.toString() === selectedVendorFilter ||
                      vendorIdToCheck === parseInt(selectedVendorFilter) ||
                      parseInt(vendorIdToCheck?.toString() || '0') === parseInt(selectedVendorFilter);
                    const brand = vp.name?.split(' ')[0];
                    const matchesBrand = mappingsBrandFilter === 'all' || brand === mappingsBrandFilter;
                    const matchesStatus = 
                      mappingsStatusFilter === 'all' || 
                      (mappingsStatusFilter === 'mapped' && vp.is_mapped) ||
                      (mappingsStatusFilter === 'unmapped' && !vp.is_mapped);
                    const hasMatches = productsWithMatches.has(String(vp.id));
                    const matchesSimilarity = 
                      mappingsSimilarityFilter === 'all' ||
                      (mappingsSimilarityFilter === 'has_matches' && hasMatches) ||
                      (mappingsSimilarityFilter === 'no_matches' && !hasMatches);

                    return matchesSearch && matchesVendor && matchesBrand && matchesStatus && matchesSimilarity;
                  });

                  // Pagination
                  const totalMappingsPages = Math.ceil(filteredMappings.length / mappingsPerPage);
                  const startIndex = (mappingsPage - 1) * mappingsPerPage;
                  const endIndex = startIndex + mappingsPerPage;
                  const paginatedMappings = filteredMappings.slice(startIndex, endIndex);

                  return (
                    <>
                      {/* Table */}
                      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-800/50 border-b border-slate-700">
                              <tr>
                                <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase">Product</th>
                                <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase">Brand</th>
                                <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase w-56">Mapped To</th>
                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-400 uppercase">Status</th>
                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-400 uppercase">URL</th>
                                <th className="text-center px-1 py-2 text-[10px] font-medium text-slate-400">1</th>
                                <th className="text-center px-1 py-2 text-[10px] font-medium text-slate-400">3</th>
                                <th className="text-center px-1 py-2 text-[10px] font-medium text-slate-400">5</th>
                                <th className="text-center px-1 py-2 text-[10px] font-medium text-slate-400">10</th>
                                <th className="text-center px-1 py-2 text-[10px] font-medium text-slate-400">15</th>
                                <th className="text-center px-1 py-2 text-[10px] font-medium text-slate-400">20</th>
                                <th className="text-center px-1 py-2 text-[10px] font-medium text-slate-400">25</th>
                                <th className="text-center px-1 py-2 text-[10px] font-medium text-slate-400">30</th>
                                <th className="text-center px-1 py-2 text-[10px] font-medium text-slate-400">50</th>
                                <th className="text-center px-1 py-2 text-[10px] font-medium text-slate-400">100</th>
                                <th className="text-center px-2 py-2 text-xs font-medium text-slate-400 uppercase"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {paginatedMappings.map((vp) => {
                                const mappedProduct = vp.mapped_product;
                                const brand = vp.name?.split(' ')[0] || '';
                                const vendorIdToFind = region === 'UK' ? vp.vendor_id : vp.us_vendor_id;
                                const vendor = vendors.find(v => v.id === vendorIdToFind);

                                const hasMatches = productsWithMatches.has(String(vp.id));
                                
                                return (
                                  <tr key={vp.id} className="hover:bg-slate-800/30">
                                    <td className="px-3 py-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-white truncate max-w-[180px]" title={vp.name}>{vp.name || 'N/A'}</span>
                                        <span className="text-[10px] text-slate-500">({vendor?.name || '-'})</span>
                                        {hasMatches && !vp.is_mapped && <span className="text-blue-400 text-[10px]" title="Has 85%+ match">⚡</span>}
                                      </div>
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-slate-400">{brand}</td>
                                    <td className="px-3 py-1.5">
                                      {vp.is_mapped && mappedProduct ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-green-400 truncate max-w-[150px]" title={mappedProduct.name}>{mappedProduct.name}</span>
                                          <button
                                            className="text-[10px] text-red-400 hover:text-red-300"
                                            onClick={() => {
                                              if (vp.mapping?.id) {
                                                fetch(`/api/vendor-product-mappings?id=${vp.mapping.id}&region=${region}`, { method: 'DELETE' })
                                                  .then(() => { toast.success('Unmapped'); loadVendorProductMappings(); });
                                              }
                                            }}
                                          >✕</button>
                                        </div>
                                      ) : (
                                        <div className="relative">
                                          <div className="flex items-center gap-1">
                                            <div className="relative flex-1">
                                              <Input
                                                placeholder="Search..."
                                                className="h-6 text-[11px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 px-2"
                                                onFocus={() => {
                                                  setActiveSearchRow(vp.id);
                                                  // Auto-search with vendor product name when focused (85% threshold)
                                                  if (!searchSuggestions.has(vp.id)) {
                                                    handleSearchSuggestions(vp.name, vp.id, false);
                                                  }
                                                }}
                                                onBlur={() => {
                                                  // Delay to allow clicking on suggestions
                                                  setTimeout(() => setActiveSearchRow(null), 200);
                                                }}
                                                onChange={async (e) => {
                                                  const searchValue = e.target.value;
                                                  if (searchValue.length >= 2) {
                                                    // Manual search - use lower threshold (50%) to show more results
                                                    await handleSearchSuggestions(searchValue, vp.id, true);
                                                  } else if (searchValue.length === 0) {
                                                    // Reset to vendor product name search (85% threshold)
                                                    await handleSearchSuggestions(vp.name, vp.id, false);
                                                  }
                                                }}
                                                onKeyDown={async (e) => {
                                                  if (e.key === 'Enter') {
                                                    const searchValue = e.currentTarget.value || vp.name;
                                                    // Manual search - use lower threshold
                                                    await handleSearchSuggestions(searchValue, vp.id, true);
                                                  }
                                                }}
                                              />
                                              {activeSearchRow === vp.id && searchSuggestions.has(vp.id) && (
                                                <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded shadow-xl max-h-48 overflow-y-auto">
                                                  {searchSuggestions.get(vp.id)!.length > 0 ? (
                                                    searchSuggestions.get(vp.id)!.map((suggestion: any) => (
                                                      <div
                                                        key={suggestion.id}
                                                        className="px-2 py-1.5 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-b-0"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={async (e) => {
                                                          e.preventDefault();
                                                          e.stopPropagation();
                                                          setActiveSearchRow(null);
                                                          toast.loading('Mapping...', { id: 'mapping-status' });
                                                          try { await handleCreateMapping(vp.name, suggestion.id, vendorIdToFind); }
                                                          catch { toast.error('Failed', { id: 'mapping-status' }); }
                                                          return false;
                                                        }}
                                                      >
                                                        <div className="flex items-center justify-between gap-2">
                                                          <span className="text-[11px] text-white truncate">{suggestion.name}</span>
                                                          <span className={`text-[10px] font-medium ${suggestion.similarity >= 95 ? 'text-green-400' : suggestion.similarity >= 85 ? 'text-blue-400' : 'text-yellow-400'}`}>
                                                            {Math.round(suggestion.similarity || 0)}%
                                                          </span>
                                                        </div>
                                                      </div>
                                                    ))
                                                  ) : (
                                                    <div className="px-2 py-2 text-center text-[10px] text-slate-400">
                                                      {searchLoading ? 'Searching...' : 'No matches'}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                              {searchLoading && activeSearchRow === vp.id && (
                                                <div className="absolute right-2 top-2">
                                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                                                </div>
                                              )}
                                            </div>
                                            <button
                                              className="h-6 px-2 text-[10px] bg-blue-600 hover:bg-blue-700 text-white rounded"
                                              onClick={async () => {
                                                setSearchLoading(true);
                                                const results = await searchSimilarProducts(vp.name);
                                                setSearchLoading(false);
                                                if (results.length > 0) {
                                                  const exactMatch = results.find((p: any) => p.name?.toLowerCase() === vp.name?.toLowerCase());
                                                  if (exactMatch) {
                                                    await handleCreateMapping(vp.name, exactMatch.id, vendorIdToFind);
                                                  } else {
                                                    setSearchSuggestions(prev => { const newMap = new Map(prev); newMap.set(vp.id, results); return newMap; });
                                                    setActiveSearchRow(vp.id);
                                                    toast.success(`${results.length} matches`);
                                                  }
                                                } else {
                                                  toast.error('No match');
                                                }
                                              }}
                                            >Auto</button>
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                      <span className={`text-[10px] ${vp.is_mapped ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {vp.is_mapped ? '✓' : '○'}
                                      </span>
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                      {vp.url && (
                                        <a href={vp.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                          <Globe className="h-3 w-3 mx-auto" />
                                        </a>
                                      )}
                                    </td>
                                    <td className="px-1 py-1.5 text-center text-[10px] text-slate-400">{vp.price_1pack || '-'}</td>
                                    <td className="px-1 py-1.5 text-center text-[10px] text-slate-400">{vp.price_3pack || '-'}</td>
                                    <td className="px-1 py-1.5 text-center text-[10px] text-slate-400">{vp.price_5pack || '-'}</td>
                                    <td className="px-1 py-1.5 text-center text-[10px] text-slate-400">{vp.price_10pack || '-'}</td>
                                    <td className="px-1 py-1.5 text-center text-[10px] text-slate-400">{vp.price_15pack || '-'}</td>
                                    <td className="px-1 py-1.5 text-center text-[10px] text-slate-400">{vp.price_20pack || '-'}</td>
                                    <td className="px-1 py-1.5 text-center text-[10px] text-slate-400">{vp.price_25pack || '-'}</td>
                                    <td className="px-1 py-1.5 text-center text-[10px] text-slate-400">{vp.price_30pack || '-'}</td>
                                    <td className="px-1 py-1.5 text-center text-[10px] text-slate-400">{vp.price_50pack || '-'}</td>
                                    <td className="px-1 py-1.5 text-center text-[10px] text-slate-400">{vp.price_100pack || '-'}</td>
                                    <td className="px-2 py-1.5 text-center">
                                      <button
                                        className="text-slate-500 hover:text-red-400 text-xs"
                                        onClick={() => handleDeleteVendorProduct(vp.id)}
                                      >✕</button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      {totalMappingsPages > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-6">
                          <div className="text-sm text-slate-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredMappings.length)} of {filteredMappings.length} mappings
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setMappingsPage(1)}
                              disabled={mappingsPage === 1}
                              className="border-slate-800"
                            >
                              First
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setMappingsPage(mappingsPage - 1)}
                              disabled={mappingsPage === 1}
                              className="border-slate-800"
                            >
                              Previous
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, totalMappingsPages) }, (_, i) => {
                                let pageNum;
                                if (totalMappingsPages <= 5) {
                                  pageNum = i + 1;
                                } else if (mappingsPage <= 3) {
                                  pageNum = i + 1;
                                } else if (mappingsPage >= totalMappingsPages - 2) {
                                  pageNum = totalMappingsPages - 4 + i;
                                } else {
                                  pageNum = mappingsPage - 2 + i;
                                }
                                return (
                                  <Button
                                    key={i}
                                    variant={mappingsPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setMappingsPage(pageNum)}
                                    className={mappingsPage === pageNum ? "" : "border-slate-800"}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setMappingsPage(mappingsPage + 1)}
                              disabled={mappingsPage === totalMappingsPages}
                              className="border-slate-800"
                            >
                              Next
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setMappingsPage(totalMappingsPages)}
                              disabled={mappingsPage === totalMappingsPages}
                              className="border-slate-800"
                            >
                              Last
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {activeTab === 'signups' && (
              <div className="space-y-4">
                {/* Stats Bar - Compact inline */}
                <div className="flex items-center justify-between bg-slate-800/30 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">Total</span>
                      <span className="text-white font-semibold">{signupsTotalCount}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-500 text-xs">Active</span>
                      <span className="text-emerald-400 font-semibold">{signups.filter((s: any) => s.is_active).length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span className="text-slate-500 text-xs">Inactive</span>
                      <span className="text-slate-400 font-semibold">{signups.filter((s: any) => !s.is_active).length}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const csvContent = [
                          ['Email', 'Source', 'Status', 'Created At'].join(','),
                          ...signups.map((s: any) => [
                            s.email,
                            s.source,
                            s.is_active ? 'Active' : 'Inactive',
                            new Date(s.created_at).toLocaleDateString()
                          ].join(','))
                        ].join('\n');
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `signups-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        toast.success('Signups exported to CSV');
                      }}
                      className="h-7 text-xs border-slate-700"
                    >
                      📥 Export CSV
                    </Button>
                  </div>
                </div>

                {/* Filters - Compact inline */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <Input
                      placeholder="Search by email..."
                      value={signupsSearch}
                      onChange={(e) => {
                        setSignupsSearch(e.target.value);
                        setSignupsPage(1);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          loadSignups();
                        }
                      }}
                      className="pl-9 h-8 text-sm bg-slate-900/50 border-slate-700/50 focus:border-slate-600"
                    />
                  </div>
                  <select
                    value={signupsSourceFilter}
                    onChange={(e) => {
                      setSignupsSourceFilter(e.target.value);
                      setSignupsPage(1);
                    }}
                    className="h-8 px-3 bg-slate-900/50 border border-slate-700/50 rounded-md text-xs text-slate-300"
                  >
                    <option value="all">All Sources</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="us-newsletter">US Newsletter</option>
                    <option value="footer">Footer</option>
                    <option value="popup">Popup</option>
                    <option value="homepage">Homepage</option>
                  </select>
                  <select
                    value={signupsStatusFilter}
                    onChange={(e) => {
                      setSignupsStatusFilter(e.target.value);
                      setSignupsPage(1);
                    }}
                    className="h-8 px-3 bg-slate-900/50 border border-slate-700/50 rounded-md text-xs text-slate-300"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Signups Table */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                  </div>
                ) : signups.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No signups found</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-900/30 rounded-lg border border-slate-800/50 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-800/50 bg-slate-800/30">
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Email</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Source</th>
                            <th className="text-center px-3 py-2 text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Date</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-slate-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                          {signups.map((signup: any) => (
                            <tr key={signup.id} className="hover:bg-slate-800/20 transition-colors group">
                              <td className="px-3 py-2 text-sm text-white">{signup.email}</td>
                              <td className="px-3 py-2">
                                <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400">
                                  {signup.source}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {signup.is_active ? (
                                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-400">
                                {new Date(signup.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`h-6 px-2 text-xs ${signup.is_active ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                                    onClick={async () => {
                                      const response = await fetch('/api/admin/signups', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          id: signup.id,
                                          is_active: !signup.is_active
                                        })
                                      });

                                      if (response.ok) {
                                        toast.success(`Signup ${signup.is_active ? 'deactivated' : 'activated'}`);
                                        loadSignups();
                                      } else {
                                        toast.error('Failed to update signup');
                                      }
                                    }}
                                  >
                                    {signup.is_active ? 'Pause' : 'Activate'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                                    onClick={async () => {
                                      if (confirm(`Delete signup for ${signup.email}?`)) {
                                        const response = await fetch(`/api/admin/signups?id=${signup.id}`, {
                                          method: 'DELETE'
                                        });

                                        if (response.ok) {
                                          toast.success('Signup deleted');
                                          loadSignups();
                                        } else {
                                          toast.error('Failed to delete signup');
                                        }
                                      }
                                    }}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination - Compact */}
                    {signupsTotalPages > 1 && (
                      <div className="flex justify-between items-center pt-3">
                        <p className="text-xs text-slate-500">
                          {(signupsPage - 1) * signupsPerPage + 1}-{Math.min(signupsPage * signupsPerPage, signupsTotalCount)} of {signupsTotalCount}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSignupsPage(1)}
                            disabled={signupsPage === 1}
                            className="h-7 px-2 text-xs border-slate-700"
                          >
                            First
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs border-slate-700"
                            onClick={() => {
                              setSignupsPage(signupsPage - 1);
                            }}
                            disabled={signupsPage === 1}
                            className="border-slate-800"
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, signupsTotalPages) }, (_, i) => {
                              let pageNum;
                              if (signupsTotalPages <= 5) {
                                pageNum = i + 1;
                              } else if (signupsPage <= 3) {
                                pageNum = i + 1;
                              } else if (signupsPage >= signupsTotalPages - 2) {
                                pageNum = signupsTotalPages - 4 + i;
                              } else {
                                pageNum = signupsPage - 2 + i;
                              }
                              
                              return (
                                <Button
                                  key={i}
                                  variant={signupsPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    setSignupsPage(pageNum);
                                  }}
                                  className={signupsPage === pageNum ? "" : "border-slate-800"}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSignupsPage(signupsPage + 1);
                            }}
                            disabled={signupsPage === signupsTotalPages}
                            className="border-slate-800"
                          >
                            Next
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSignupsPage(signupsTotalPages);
                            }}
                            disabled={signupsPage === signupsTotalPages}
                            className="border-slate-800"
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Vendor CSV Upload & Import</h2>
                  <p className="text-slate-400">Upload vendor product CSV files and map them to existing products</p>
                </div>

                {/* Instructions Card */}
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Vendor CSV Upload Instructions</h3>
                      <p className="text-sm text-slate-400">Follow these steps to successfully upload and import vendor product data for mapping</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column - Format Requirements */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        📋 Vendor CSV Format Requirements
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>File must be in CSV format (.csv)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>First row should contain column headers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Required columns: Name, URL, Brand</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Pack columns: Any pack size (e.g., 1 Pack, 3 Packs, 5 Packs, 10 Packs, 20 Packs)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Flexible naming: "Pack", "Packs", "Can", "Cans", "Unit", "Units", "Pcs", "Pieces"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Maximum file size: 10MB</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span className="font-semibold text-yellow-400">Select vendor before uploading</span>
                        </li>
                      </ul>

                      <div className="mt-4 p-3 bg-slate-800/50 rounded border border-slate-700">
                        <h5 className="text-xs font-semibold text-white mb-2">💡 Flexible Pack Structure</h5>
                        <ul className="space-y-1 text-xs text-slate-400">
                          <li>• Supports any pack size: 1, 2, 3, 5, 6, 10, 12, 15, 20, 25, 30, 50, etc.</li>
                          <li>• Automatically maps to closest standard pack size</li>
                          <li>• Works with "Pack/Packs", "Can/Cans", "Unit/Units", "Pcs", "Pieces" naming</li>
                          <li>• Custom pack sizes are mapped to the nearest standard size</li>
                          <li>• Use bulk autolink for exact name matches</li>
                        </ul>
                      </div>
                    </div>

                    {/* Right Column - Supported Column Names */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        🔧 Supported Column Names
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-slate-400 mb-1">Product Name:</p>
                          <p className="text-slate-300 font-mono text-xs">"Name", "name", "product_name"</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">Brand:</p>
                          <p className="text-slate-300 font-mono text-xs">"Brand", "brand", "manufacturer"</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">URL:</p>
                          <p className="text-slate-300 font-mono text-xs">"URL", "url", "link"</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">UK Packs:</p>
                          <p className="text-slate-300 font-mono text-xs">"1 Pack", "3 Packs", "5 Packs", "10 Packs", "20 Packs"</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">US Cans:</p>
                          <p className="text-slate-300 font-mono text-xs">"1 Can", "5 Cans", "10 Cans", "25 Cans", "30 Cans", "50 Cans"</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">Units:</p>
                          <p className="text-slate-300 font-mono text-xs">"1 Unit", "3 Units", "6 Units", etc.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Upload Section */}
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <div className="space-y-4">
                    {/* Vendor Selection */}
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">
                        Select Vendor <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={selectedVendorFilter}
                        onChange={(e) => setSelectedVendorFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">-- Select a Vendor --</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                      {selectedVendorFilter === 'all' && (
                        <p className="text-xs text-yellow-400 mt-2">⚠️ Please select a vendor before uploading</p>
                      )}
                    </div>

                    {/* File Upload Area */}
                    <div>
                      <input
                        id="csv-upload-input"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        disabled={uploading || selectedVendorFilter === 'all'}
                        className="hidden"
                      />
                      <label 
                        htmlFor="csv-upload-input"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`block border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                          uploading 
                            ? 'border-blue-500 bg-blue-500/5 cursor-wait' 
                            : selectedVendorFilter === 'all'
                            ? 'border-slate-700 bg-slate-800/30 cursor-not-allowed'
                            : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50 cursor-pointer'
                        }`}
                      >
                        <UploadIcon className={`h-16 w-16 mx-auto mb-4 ${uploading ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
                        <p className="text-lg font-medium text-white mb-2">
                          {uploading ? 'Uploading...' : 'Upload CSV File'}
                        </p>
                        <p className="text-sm text-slate-400 mb-4">
                          Drag and drop your CSV file here, or click to browse
                        </p>
                        <span
                          className={`inline-block px-6 py-2 rounded-lg font-medium transition-colors ${
                            uploading || selectedVendorFilter === 'all'
                              ? 'bg-slate-700 text-slate-500'
                              : 'bg-white text-black hover:bg-slate-200'
                          }`}
                        >
                          <FileSpreadsheet className="inline h-4 w-4 mr-2" />
                          Choose File
                        </span>
                      </label>
                    </div>

                    {/* Upload Result */}
                    {uploadResult && (
                      <div className={`p-4 rounded-lg border ${
                        uploadResult.success 
                          ? 'bg-green-500/10 border-green-500/50' 
                          : 'bg-red-500/10 border-red-500/50'
                      }`}>
                        <div className="flex items-start gap-3">
                          {uploadResult.success ? (
                            <div className="p-2 bg-green-500/20 rounded">
                              <FileSpreadsheet className="h-5 w-5 text-green-400" />
                            </div>
                          ) : (
                            <div className="p-2 bg-red-500/20 rounded">
                              <X className="h-5 w-5 text-red-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            {uploadResult.success ? (
                              <div>
                                <p className="font-medium text-green-400 mb-1">Upload Successful</p>
                                <p className="text-sm text-slate-300">{uploadResult.message}</p>
                                {uploadResult.updated > 0 && (
                                  <p className="text-xs text-green-400 mt-1">✓ {uploadResult.updated} products updated (mappings preserved)</p>
                                )}
                                {uploadResult.inserted > 0 && (
                                  <p className="text-xs text-blue-400 mt-1">+ {uploadResult.inserted} new products added</p>
                                )}
                                {uploadResult.autoMapped > 0 && (
                                  <p className="text-xs text-purple-400 mt-1">🔗 {uploadResult.autoMapped} products auto-mapped (exact name match)</p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium text-red-400 mb-1">Upload Failed</p>
                                <p className="text-sm text-slate-300">{uploadResult.error}</p>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setUploadResult(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'currency-converter' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Currency Converter</h2>
                  <p className="text-slate-400">
                    Mark vendors that use EUR currency and need their prices converted to GBP for accurate UK pricing.
                  </p>
                </div>

                {/* Currency Converter Table */}
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-slate-400">
                          {vendors.filter((v: any) => v.needs_currency_conversion && v.currency === 'EUR').length} vendors marked for EUR to GBP conversion
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {vendors.map((vendor) => (
                        <CurrencyConverterVendorRow
                          key={vendor.id}
                          vendor={vendor}
                          onUpdate={handleUpdateVendor}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'offers' && (
              <div className="space-y-4">
                {/* Stats Bar */}
                <div className="flex items-center justify-between bg-slate-800/30 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-white font-medium">Vendor Offers</span>
                    <div className="h-4 w-px bg-slate-700" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-500 text-xs">Active</span>
                      <span className="text-emerald-400 font-semibold">{vendors.filter((v: any) => v.offer_type && v.offer_type !== null).length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">Total Vendors</span>
                      <span className="text-white font-semibold">{vendors.length}</span>
                    </div>
                  </div>
                </div>

                {/* Offers Table */}
                <div className="bg-slate-900/30 rounded-lg border border-slate-800/50 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800/50 bg-slate-800/30">
                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Vendor</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Offer Type</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Value</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Description</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                      {vendors.map((vendor) => (
                        <OfferVendorRow
                          key={vendor.id}
                          vendor={vendor}
                          onUpdate={handleUpdateVendor}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'unmapped' && (
              <div className="space-y-4">
                {/* Stats & Filters Bar */}
                <div className="flex items-center justify-between bg-slate-800/30 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">Found</span>
                      <span className="text-white font-semibold">{unmappedTotalCount}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700" />
                    <select
                      value={unmappedStatusFilter}
                      onChange={(e) => setUnmappedStatusFilter(e.target.value)}
                      className="h-7 px-2 bg-slate-900/50 border border-slate-700/50 rounded text-xs text-slate-300"
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="approved">✓ Approved</option>
                      <option value="rejected">✗ Rejected</option>
                      <option value="mapped">🔗 Mapped</option>
                      <option value="all">All</option>
                    </select>
                    <select
                      value={unmappedVendorFilter}
                      onChange={(e) => setUnmappedVendorFilter(e.target.value)}
                      className="h-7 px-2 bg-slate-900/50 border border-slate-700/50 rounded text-xs text-slate-300"
                    >
                      <option value="all">All Vendors</option>
                      {unmappedVendors.map(vendor => (
                        <option key={vendor} value={vendor}>{vendor}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-500" />
                    <Input
                      value={unmappedSearch}
                      onChange={(e) => setUnmappedSearch(e.target.value)}
                      placeholder="Search products..."
                      className="pl-7 h-7 text-xs bg-slate-900/50 border-slate-700/50"
                    />
                  </div>
                </div>

                {/* Products Table */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
                  </div>
                ) : unmappedProducts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No unmapped products found</p>
                  </div>
                ) : (
                  <div className="bg-slate-900/30 rounded-lg border border-slate-800/50 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800/50 bg-slate-800/30">
                          <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Product</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Vendor</th>
                          <th className="text-center px-3 py-2 text-xs font-medium text-slate-500 uppercase">Stores</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Prices</th>
                          <th className="text-center px-3 py-2 text-xs font-medium text-slate-500 uppercase">Status</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-slate-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/30">
                        {unmappedProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer" onClick={() => setShowProductDetail(product)}>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                {product.image_url && (
                                  <img src={product.image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0 bg-slate-800" />
                                )}
                                <div>
                                  <span className="text-sm text-white font-medium">{product.product_name}</span>
                                  {product.source_url && (
                                    <a
                                      href={product.source_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="block text-xs text-blue-400 hover:underline truncate max-w-[250px]"
                                    >
                                      View source →
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                                {product.source_vendor}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="text-sm text-emerald-400 font-medium">{product.total_stores}</span>
                            </td>
                            <td className="px-3 py-2">
                              {product.source_prices && Object.keys(product.source_prices).length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(product.source_prices).slice(0, 3).map(([tier, price]) => (
                                    <span key={tier} className="text-xs px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300">
                                      {tier}: {price as string}
                                    </span>
                                  ))}
                                  {Object.keys(product.source_prices).length > 3 && (
                                    <span className="text-xs text-slate-500">+{Object.keys(product.source_prices).length - 3}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-600 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                product.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                product.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                product.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                'bg-purple-500/10 text-purple-400'
                              }`}>
                                {product.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                              {product.status === 'pending' && (
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const name = product.product_name;
                                      const brand = name.split(' ')[0];
                                      setCreateForm({ id: product.id, product, name, brand, strength_mg: '', flavour: '', format: '', pouch_count: '', image_url: product.image_url || '' });
                                    }}
                                    disabled={actionLoading === product.id}
                                    className="h-6 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    {actionLoading === product.id ? '...' : 'Create'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setShowMapDialog(product);
                                      setMapSearchTerm('');
                                      setMapSearchResults([]);
                                    }}
                                    disabled={actionLoading === product.id}
                                    className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                                  >
                                    Map
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => setConfirmAction({ id: product.id, action: 'reject', product })}
                                    disabled={actionLoading === product.id}
                                    className="h-6 px-2 text-xs bg-red-600 hover:bg-red-700"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {product.status !== 'pending' && product.mapped_product_id && (
                                <span className="text-xs text-slate-500">#{product.mapped_product_id}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {unmappedTotalPages > 1 && (
                      <div className="flex justify-between items-center px-3 py-2 border-t border-slate-800/50">
                        <span className="text-xs text-slate-500">Page {unmappedPage} of {unmappedTotalPages}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUnmappedPage(p => Math.max(1, p - 1))}
                            disabled={unmappedPage === 1}
                            className="h-6 px-2 text-xs border-slate-700"
                          >
                            Prev
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUnmappedPage(p => Math.min(unmappedTotalPages, p + 1))}
                            disabled={unmappedPage === unmappedTotalPages}
                            className="h-6 px-2 text-xs border-slate-700"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Product Detail Modal */}
                {showProductDetail && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowProductDetail(null)}>
                    <Card className="bg-slate-900 border-slate-700 p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">Product Details</h3>
                        <button onClick={() => setShowProductDetail(null)} className="text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-5">
                        {/* Product header with image */}
                        <div className="flex gap-4">
                          {showProductDetail.image_url ? (
                            <img src={showProductDetail.image_url} alt={showProductDetail.product_name} className="w-24 h-24 rounded-lg object-cover bg-slate-800 flex-shrink-0" />
                          ) : (
                            <div className="w-24 h-24 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                              <Package className="w-8 h-8 text-slate-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-lg leading-tight">{showProductDetail.product_name}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">{showProductDetail.source_vendor}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                showProductDetail.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                showProductDetail.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                showProductDetail.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                'bg-purple-500/10 text-purple-400'
                              }`}>{showProductDetail.status}</span>
                            </div>
                            {showProductDetail.source_url && (
                              <a href={showProductDetail.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-2 block truncate">
                                {showProductDetail.source_url}
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Prices */}
                        {showProductDetail.source_prices && Object.keys(showProductDetail.source_prices).length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-slate-500 uppercase mb-2">Prices</h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Object.entries(showProductDetail.source_prices).map(([tier, price]) => (
                                <div key={tier} className="bg-slate-800/50 rounded-lg px-3 py-2">
                                  <span className="text-xs text-slate-500 block">{tier}</span>
                                  <span className="text-sm text-white font-medium">{price as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Available at other stores */}
                        {showProductDetail.other_stores && showProductDetail.other_stores.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-slate-500 uppercase mb-2">Available at {showProductDetail.total_stores} store{showProductDetail.total_stores !== 1 ? 's' : ''}</h5>
                            <div className="space-y-1.5">
                              {showProductDetail.other_stores.map((store: any, idx: number) => (
                                <div key={idx} className="bg-slate-800/50 rounded-lg px-3 py-2 flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm text-white">{store.vendorName || store.vendor || 'Unknown'}</span>
                                    <span className="text-xs text-slate-500 ml-2">{store.productName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {store.matchConfidence != null && (
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${store.matchConfidence >= 0.9 ? 'bg-emerald-500/10 text-emerald-400' : store.matchConfidence >= 0.7 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {Math.round(store.matchConfidence * 100)}%
                                      </span>
                                    )}
                                    {store.url && (
                                      <a href={store.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline" onClick={(e) => e.stopPropagation()}>Link</a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-800/30 rounded px-3 py-2">
                            <span className="text-slate-500 block">Created</span>
                            <span className="text-slate-300">{showProductDetail.created_at ? new Date(showProductDetail.created_at).toLocaleDateString() : '-'}</span>
                          </div>
                          <div className="bg-slate-800/30 rounded px-3 py-2">
                            <span className="text-slate-500 block">Last Updated</span>
                            <span className="text-slate-300">{showProductDetail.updated_at ? new Date(showProductDetail.updated_at).toLocaleDateString() : '-'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        {showProductDetail.status === 'pending' && (
                          <div className="flex gap-2 pt-2 border-t border-slate-800">
                            <Button
                              size="sm"
                              onClick={() => {
                                const name = showProductDetail.product_name;
                                const brand = name.split(' ')[0];
                                setShowProductDetail(null);
                                setCreateForm({ id: showProductDetail.id, product: showProductDetail, name, brand, strength_mg: '', flavour: '', format: '', pouch_count: '', image_url: showProductDetail.image_url || '' });
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                            >
                              Create Product
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => { setShowProductDetail(null); setShowMapDialog(showProductDetail); setMapSearchTerm(''); setMapSearchResults([]); }}
                              className="bg-blue-600 hover:bg-blue-700 text-xs"
                            >
                              Map to Existing
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => { setShowProductDetail(null); setConfirmAction({ id: showProductDetail.id, action: 'reject', product: showProductDetail }); }}
                              className="bg-red-600 hover:bg-red-700 text-xs"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {/* Confirm Action Dialog */}
                {confirmAction && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setConfirmAction(null)}>
                    <Card className="bg-slate-900 border-slate-700 p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {confirmAction.action === 'create' ? 'Create New Product?' : 'Reject Product?'}
                      </h3>
                      <p className="text-sm text-slate-400 mb-1">
                        {confirmAction.action === 'create'
                          ? 'This will create a new product in the database and map it to this vendor.'
                          : 'This will mark this product suggestion as rejected.'}
                      </p>
                      <div className="bg-slate-800/50 rounded-lg px-3 py-2 mb-4 flex items-center gap-3">
                        {confirmAction.product.image_url && (
                          <img src={confirmAction.product.image_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm text-white font-medium">{confirmAction.product.product_name}</p>
                          <p className="text-xs text-slate-500">{confirmAction.product.source_vendor}</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setConfirmAction(null)} className="text-xs border-slate-700">
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            handleUnmappedAction(confirmAction.id, confirmAction.action);
                            setConfirmAction(null);
                          }}
                          disabled={actionLoading === confirmAction.id}
                          className={`text-xs ${confirmAction.action === 'create' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                          {actionLoading === confirmAction.id ? '...' : confirmAction.action === 'create' ? 'Yes, Create' : 'Yes, Reject'}
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Create Product Form */}
                {createForm && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setCreateForm(null)}>
                    <Card className="bg-slate-900 border-slate-700 p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">Create New Product</h3>
                        <button onClick={() => setCreateForm(null)} className="text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Image preview */}
                        <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                          {createForm.image_url ? (
                            <img src={createForm.image_url} alt="" className="w-16 h-16 rounded object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded bg-slate-700 flex items-center justify-center flex-shrink-0">
                              <Package className="w-6 h-6 text-slate-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-slate-500">Source: {createForm.product.source_vendor}</span>
                            <p className="text-xs text-slate-400 truncate">{createForm.product.product_name}</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Product Name</label>
                          <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Brand</label>
                            <Input value={createForm.brand} onChange={(e) => setCreateForm({ ...createForm, brand: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Strength (mg)</label>
                            <Input value={createForm.strength_mg} onChange={(e) => setCreateForm({ ...createForm, strength_mg: e.target.value })} placeholder="e.g. 10" className="bg-slate-800 border-slate-700 text-white" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Flavour</label>
                            <Input value={createForm.flavour} onChange={(e) => setCreateForm({ ...createForm, flavour: e.target.value })} placeholder="e.g. Mint" className="bg-slate-800 border-slate-700 text-white" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Format</label>
                            <Input value={createForm.format} onChange={(e) => setCreateForm({ ...createForm, format: e.target.value })} placeholder="e.g. Slim" className="bg-slate-800 border-slate-700 text-white" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Pouch Count</label>
                            <Input value={createForm.pouch_count} onChange={(e) => setCreateForm({ ...createForm, pouch_count: e.target.value })} placeholder="e.g. 20" className="bg-slate-800 border-slate-700 text-white" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Image URL</label>
                            <Input value={createForm.image_url} onChange={(e) => setCreateForm({ ...createForm, image_url: e.target.value })} placeholder="https://..." className="bg-slate-800 border-slate-700 text-white text-xs" />
                          </div>
                        </div>

                        {/* Prices from source */}
                        {createForm.product.source_prices && Object.keys(createForm.product.source_prices).length > 0 && (
                          <div className="bg-slate-800/30 rounded p-2">
                            <span className="text-xs text-slate-500">Source prices:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(createForm.product.source_prices).map(([tier, price]) => (
                                <span key={tier} className="text-xs px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300">{tier}: {price as string}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                          <Button size="sm" variant="outline" onClick={() => setCreateForm(null)} className="text-xs border-slate-700">Cancel</Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              handleUnmappedAction(createForm.id, 'create', undefined, {
                                name: createForm.name,
                                brand: createForm.brand,
                                image_url: createForm.image_url,
                                strength_mg: createForm.strength_mg ? parseFloat(createForm.strength_mg) : null,
                                flavour: createForm.flavour || null,
                                format: createForm.format || null,
                                pouch_count: createForm.pouch_count ? parseInt(createForm.pouch_count) : null,
                              });
                              setCreateForm(null);
                            }}
                            disabled={!createForm.name || actionLoading === createForm.id}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700"
                          >
                            {actionLoading === createForm.id ? '...' : 'Create Product'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Map Dialog */}
                {showMapDialog && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <Card className="bg-slate-900 border-slate-700 p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Map to Existing Product</h3>
                          <p className="text-sm text-slate-400 mt-1">
                            Mapping: {showMapDialog.product_name}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowMapDialog(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <Input
                            value={mapSearchTerm}
                            onChange={(e) => {
                              setMapSearchTerm(e.target.value);
                              searchProductsForMapping(e.target.value);
                            }}
                            placeholder="Search for existing product..."
                            className="bg-slate-800 border-slate-700 text-white"
                          />
                        </div>

                        {mapSearchLoading && (
                          <div className="text-center py-4 text-slate-400">Searching...</div>
                        )}

                        {mapSearchResults.length > 0 && (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {mapSearchResults.map((product) => (
                              <div
                                key={product.id}
                                className="p-3 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                                onClick={() => handleUnmappedAction(showMapDialog.id, 'map', product.id)}
                              >
                                <div>
                                  <p className="text-white font-medium">{product.name}</p>
                                  <p className="text-sm text-slate-400">{product.brand}</p>
                                </div>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  Select
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {mapSearchTerm && mapSearchResults.length === 0 && !mapSearchLoading && (
                          <div className="text-center py-4 text-slate-400">
                            No products found. Try a different search term.
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-4">
                {/* Credentials Banner */}
                {approvedCredentials && (
                  <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-emerald-400 mb-2">Store Credentials Generated</h3>
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-300">
                            Email: <span className="text-white font-mono">{approvedCredentials.email}</span>
                          </p>
                          <p className="text-slate-300">
                            Password: <span className="text-white font-mono">{approvedCredentials.password}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`Email: ${approvedCredentials.email}\nPassword: ${approvedCredentials.password}`);
                            toast.success('Credentials copied!');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
                        >
                          <ClipboardCopy className="h-3 w-3" />
                          Copy
                        </button>
                        <button
                          onClick={() => setApprovedCredentials(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats & Filters */}
                <div className="flex items-center justify-between bg-slate-800/30 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">Total</span>
                      <span className="text-white font-semibold">{applicationsTotal}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700" />
                    <select
                      value={applicationsStatusFilter}
                      onChange={(e) => { setApplicationsStatusFilter(e.target.value); setApplicationsPage(1); }}
                      className="h-7 px-2 bg-slate-900/50 border border-slate-700/50 rounded text-xs text-slate-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                </div>

                {/* Applications Table */}
                {applicationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Store className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No applications found</p>
                  </div>
                ) : (
                  <div className="bg-slate-900/30 rounded-lg border border-slate-800/50 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800/50 bg-slate-800/30">
                          <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Store</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Email</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Website</th>
                          <th className="text-center px-3 py-2 text-xs font-medium text-slate-500 uppercase">Country</th>
                          <th className="text-center px-3 py-2 text-xs font-medium text-slate-500 uppercase">Status</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Date</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-slate-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/30">
                        {applications.map((app: any) => (
                          <tr key={app.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="px-3 py-2">
                              <span className="text-sm text-white font-medium">{app.store_name}</span>
                              {app.message && (
                                <p className="text-xs text-slate-500 truncate max-w-[200px]" title={app.message}>{app.message}</p>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-sm text-slate-300">{app.contact_email}</span>
                            </td>
                            <td className="px-3 py-2">
                              {app.website_url ? (
                                <a href={app.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate block max-w-[180px]">
                                  {app.website_url.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <span className="text-xs text-slate-600">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded uppercase">
                                {app.country}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                app.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                'bg-red-500/10 text-red-400'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-xs text-slate-400">
                                {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              {app.status === 'pending' && (
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApplicationAction(app.id, 'approve')}
                                    disabled={applicationActionLoading === app.id}
                                    className="h-6 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    {applicationActionLoading === app.id ? '...' : 'Approve'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApplicationAction(app.id, 'reject')}
                                    disabled={applicationActionLoading === app.id}
                                    className="h-6 px-2 text-xs bg-red-600 hover:bg-red-700"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {applicationsTotalPages > 1 && (
                      <div className="flex justify-between items-center px-3 py-2 border-t border-slate-800/50">
                        <span className="text-xs text-slate-500">Page {applicationsPage} of {applicationsTotalPages}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setApplicationsPage(p => Math.max(1, p - 1))}
                            disabled={applicationsPage === 1}
                            className="h-6 px-2 text-xs border-slate-700"
                          >
                            Prev
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setApplicationsPage(p => Math.min(applicationsTotalPages, p + 1))}
                            disabled={applicationsPage === applicationsTotalPages}
                            className="h-6 px-2 text-xs border-slate-700"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
