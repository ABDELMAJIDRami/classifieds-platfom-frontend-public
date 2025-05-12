'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from "@/core/network/axios";
import { Ad } from "@/core/interfaces/Ad";
import { getCurrentAdVersionFor } from "@/core/helpers";
import Link from "next/link";

export default function AdViewPage() {
  const params = useParams();
  const adId = params.id as string;
  
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');

  const fetchAd = async () => {
    try {
      const response = await axios.get(`/ads/my/${adId}`);
      setAd(response.data);
      setError(null);
    } catch (err) {
      setError(`Error loading ad: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error fetching ad:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAd();
  }, [adId]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !ad) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Ad not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const currentVersion = getCurrentAdVersionFor(ad);
  
  // Placeholder images for empty images array
  const images = [{ url: 'https://placehold.co/800x600/e2e8f0/a0aec0?text=No+Image' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          {/* Left column - Images and Content */}
          <div className="md:w-2/3 p-6">
            {/* Content starts directly with tabs */}

            {/* Tabs */}
            <div className="mb-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'description'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Version History
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'description' ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{currentVersion.description}</p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ad Version History</h2>
                <div className="space-y-4">
                  {ad.versions && ad.versions.length > 0 ? (
                    [...ad.versions].sort((a, b) => b.versionNumber - a.versionNumber).map((version, index) => (
                      <div
                        key={version.id}
                        className={`p-4 rounded-lg ${
                          version.id === currentVersion.id
                            ? 'bg-blue-50 border border-blue-100'
                            : 'bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900 flex items-center">
                              {version.title}
                              {version.id === currentVersion.id && (
                                <span
                                  className="ml-2 text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                              <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                                version.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  version.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                              }`}>
                                {version.status?.charAt(0).toUpperCase() + version.status?.slice(1)}
                              </span>
                            </h3>
                            <p className="text-sm text-gray-500">
                              Price: ${version.price} • Version {version.versionNumber}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(version.createdAt)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{version.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No previous versions available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Ad info */}
          <div className="md:w-1/3 p-6 border-l border-gray-200">
            <div className="sticky top-8">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{currentVersion.title}</h1>
                <Link
                  href={`/ads/${adId}/edit`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit
                </Link>
              </div>
              <p className="text-xl font-semibold text-blue-600 mb-4">${currentVersion.price}</p>

              <div className="mb-6">
                <div className="flex items-center text-gray-600 mb-2">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>{ad.city.name}, {ad.city.country.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>Posted on {formatDate(ad.createdAt)}</span>
                </div>
                <div className="flex items-center text-gray-600 mt-2">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                  </svg>
                  <span>Category: {ad.category.name}</span>
                </div>
                {ad.subcategory && (
                  <div className="flex items-center text-gray-600 mt-2">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    <span>Subcategory: {ad.subcategory.name}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-3">
                  <div
                    className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                    <span
                      className="text-lg font-medium">{ad.user.firstName.charAt(0)}{ad.user.lastName.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">{ad.user.firstName} {ad.user.lastName}</h3>
                    {/*<p className="text-sm text-gray-500">Member since {new Date(ad.user.createdAt).getFullYear()}</p>*/}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
