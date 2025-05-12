'use client';
import {useState, useEffect, useContext} from 'react';
import Link from 'next/link';
import axios from "@/core/network/axios";
import { Ad } from "@/core/interfaces/Ad";
import { getCurrentAdVersionFor } from "@/core/helpers";
import {UserContext} from "@/core/contexts/UserContext";

export default function Home() {
  const {user} = useContext(UserContext);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllAds = async () => {
      try {
        const response = await axios.get('/ads/public');
        setAds(response.data);
        setError(null);
      } catch (err) {
        setError(`Error loading ads: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error('Error fetching ads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAds();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Classifieds Platform</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse listings for items, services, and more in your area.
          </p>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Listings</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
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
        ) : ads.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-4">No ads available</h2>
            <p className="text-gray-600 mb-6">Be the first to post an ad on our platform!</p>
            <Link
              href={user ? "/ads/create" : "/auth/signin"}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Post Your First Ad
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {ads.map((ad) => {
                const currentVersion = getCurrentAdVersionFor(ad);
                return (
                  <li key={ad.id} className="hover:bg-gray-50">
                    <Link href='' className="block">
                    {/*<Link href={`/ads/${ad.id}`} className="block">*/}
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-blue-600 truncate">{currentVersion.title}</h3>
                            <div className="mt-1 flex items-center">
                              <span className="flex-shrink-0 text-gray-500 truncate mr-1">
                                {ad.city?.name}, {ad.city?.country?.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                • Posted on {formatDate(ad.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-medium text-green-600">${currentVersion.price}</span>
                            <p className="mt-1 text-sm text-gray-500">
                              Category: {ad.category?.name}
                              {ad.subcategory && ` > ${ad.subcategory.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {currentVersion.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
