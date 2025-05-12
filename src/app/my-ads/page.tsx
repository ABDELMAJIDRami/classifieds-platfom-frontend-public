'use client';
import {useState, useEffect, useContext, Suspense} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {UserContext} from "@/core/contexts/UserContext";
import axios from "@/core/network/axios";
import {Ad} from "@/core/interfaces/Ad";
import {getCurrentAdVersionFor} from "@/core/helpers";

function LoadingSpinner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );
}

function MyAdsPageContent() {
  const {user, isFetchingUser} = useContext(UserContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAds = async () => {
    if (!user) return;

    try {
      const response = await axios.get('/ads/my');

      setAds(response.data);
      setError(null);
    } catch (err) {
      setError(`Error loading ads: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error fetching ads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !isFetchingUser) {
      router.push('/auth/signin?callbackUrl=/my-ads');
    }
  }, [user, isFetchingUser]);

  useEffect(() => {
    if (successParam === 'created') {
      setSuccessMessage('Your ad has been created successfully and is pending approval.');
    } else if (successParam === 'updated') {
      setSuccessMessage('Your ad has been updated successfully and is pending approval.');
    }

    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successParam, successMessage]);

  useEffect(() => {
    fetchAds().then();
  }, [user]);

  const getStatusBadge = (status: string) => {
    let colorClasses = '';

    switch (status) {
      case 'approved':
        colorClasses = 'bg-green-100 text-green-800';
        break;
      case 'pending':
        colorClasses = 'bg-yellow-100 text-yellow-800';
        break;
      case 'rejected':
        colorClasses = 'bg-red-100 text-red-800';
        break;
      default:
        colorClasses = 'bg-gray-100 text-gray-800';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isFetchingUser || loading) {
    return <LoadingSpinner/>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Ads</h1>
        <Link
          href="/ads/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Post New Ad
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {ads.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">You haven&apos;t posted any ads yet</h2>
          <p className="text-gray-600 mb-6">Get started by posting your first ad. It&apos;s quick and easy!</p>
          <Link
            href="/ads/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Post Your First Ad
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {ads.map((ad) => (
              <li key={ad.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        <Link href={`/ads/${ad.id}`} className="hover:underline">
                          {getCurrentAdVersionFor(ad).title}
                        </Link>
                      </h2>
                      <div className="mt-1 flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          {ad.city.name}, {ad.city.country.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          Posted on {formatDate(ad.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-medium text-blue-600">
                          ${getCurrentAdVersionFor(ad).price}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="mb-2">
                        {getStatusBadge(getCurrentAdVersionFor(ad).status)}
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/ads/${ad.id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View
                        </Link>
                        <Link
                          href={`/ads/${ad.id}/edit`}
                          className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-500 mb-1">Version History:</p>
                    <div className="flex flex-wrap gap-2">
                      {ad.versions
                        .sort((a, b) => b.versionNumber - a.versionNumber)
                        .map((version) => (
                          <div
                            key={version.id}
                            className="text-xs px-2 py-1 rounded border border-gray-200"
                            title={version.rejectionReason || ''}
                          >
                            v{version.versionNumber}: {getStatusBadge(version.status)}
                            {version.versionNumber === getCurrentAdVersionFor(ad).versionNumber && (
                              <span className="ml-1 text-xs text-gray-500">(current)</span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {getCurrentAdVersionFor(ad).status === 'rejected' && getCurrentAdVersionFor(ad).rejectionReason && (
                    <div className="mt-3 bg-red-50 p-2 rounded-md">
                      <p className="text-xs font-medium text-red-800">Rejection reason:</p>
                      <p className="text-xs text-red-700">{getCurrentAdVersionFor(ad).rejectionReason}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function MyAdsPage() {
  return (
    <Suspense fallback={<LoadingSpinner/>}>
      <MyAdsPageContent/>
    </Suspense>
  );
}