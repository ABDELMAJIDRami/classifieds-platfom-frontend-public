'use client';
import {useState, useEffect, useContext} from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from "@/core/network/axios";
import {UserContext} from "@/core/contexts/UserContext";
import {Category} from "@/core/interfaces/Category";
import {Subcategory} from "@/core/interfaces/Subcategory";
import {Country} from "@/core/interfaces/Country";
import {City} from "@/core/interfaces/City";
import {Ad} from "@/core/interfaces/Ad";
import {getCurrentAdVersionFor} from "@/core/helpers";


export default function EditAdPage() {
  const {user, isFetchingUser} = useContext(UserContext);
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;

  console.log('adId', adId)

  const [ad, setAd] = useState<Ad | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    // Todo: below needs backend adjustment to work
    // categoryId: '',
    // subcategoryId: '',
    // countryId: '',
    // cityId: '',
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [adResponse, categoriesResponse, countriesResponse] = await Promise.all([
        axios.get(`/ads/my/${adId}`),
        axios.get(`/categories`),
        axios.get(`/locations/countries`)
      ]);

      const adData = adResponse.data;

      console.log('adData', adData)
      setAd(adData);
      setCategories(categoriesResponse.data);
      setCountries(countriesResponse.data);
      // Set initial form data
      setFormData({
        title: getCurrentAdVersionFor(adData).title,
        description: getCurrentAdVersionFor(adData).description,
        price: getCurrentAdVersionFor(adData).price.toString(),
        // Todo: below needs backend adjustment to work
        // categoryId: adData.category.id.toString(),
        // subcategoryId: adData.subcategory ? adData.subcategory.id.toString() : '',
        // countryId: adData.city.country.id.toString(),
        // cityId: adData.city.id.toString(),
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      errors.price = 'Price must be a positive number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
      };

      await axios.patch(`/ads/${adId}`, payload);

      setSuccessMessage('Ad updated successfully! Your changes will be reviewed by a moderator.');

      router.push(`/my-ads?success=updated`);
    } catch (err) {
      setError(`Error updating ad: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error updating ad:', err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!user && !isFetchingUser) {
      router.push(`/auth/signin`);
    }
  }, [user, isFetchingUser]);

  // Fetch ad data, categories, and locations
  useEffect(() => {
    fetchData().then();
  }, [user, isFetchingUser]);

  console.log(formData)

  // Update subcategories when category changes
  useEffect(() => {
    if (ad?.category.id && categories.length > 0) {
      const selectedCategory = categories.find(cat => cat.id === ad?.category.id);
      if (selectedCategory) {
        setSubcategories(selectedCategory.subcategories || []);
      }
    }
  }, [ad?.category, categories]);

  // Update cities when country changes
  useEffect(() => {
    if (ad?.city.country && countries.length > 0) {
      const selectedCountry = countries.find(country => country.id === ad?.city.country.id);
      if (selectedCountry) {
        setCities(selectedCountry.cities || []);
      }
    }
  }, [ad?.city.country, countries]);

  if (isFetchingUser || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error && error.includes('not authorized')) {
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
              <p className="text-sm text-red-700">You are not authorized to edit this ad.</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Link 
            href="/my-ads" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Go to My Ads
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Ad</h1>
        <p className="text-gray-600">Update your ad information below. All fields marked with * are required.</p>
        
        {ad && (
          <div className="mt-4 flex items-center">
            <span className="mr-2">Current status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              getCurrentAdVersionFor(ad).status === 'approved' ? 'bg-green-100 text-green-800' :
              getCurrentAdVersionFor(ad).status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {getCurrentAdVersionFor(ad).status.charAt(0).toUpperCase() + getCurrentAdVersionFor(ad).status.slice(1)}
            </span>
          </div>
        )}
        
        {ad && getCurrentAdVersionFor(ad).status === 'rejected' && getCurrentAdVersionFor(ad).rejectionReason && (
          <div className="mt-2 bg-red-50 p-3 rounded-md">
            <p className="text-sm font-medium text-red-800">Rejection reason:</p>
            <p className="text-sm text-red-700">{getCurrentAdVersionFor(ad).rejectionReason}</p>
          </div>
        )}
      </div>
      
      {error && !error.includes('not authorized') && (
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
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter a descriptive title for your ad"
          />
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Provide a detailed description of what you're selling"
          ></textarea>
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
            Price ($) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter the price"
          />
          {validationErrors.price && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="categoryId" className="block text-gray-700 font-medium mb-2">
              Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={ad?.category.id}
              onChange={handleInputChange}
              disabled
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {validationErrors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.categoryId}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="subcategoryId" className="block text-gray-700 font-medium mb-2">
              Subcategory
            </label>
            <select
              id="subcategoryId"
              name="subcategoryId"
              value={ad?.subcategory?.id}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a subcategory (optional)</option>
              {subcategories.map(subcategory => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="countryId" className="block text-gray-700 font-medium mb-2">
              Country *
            </label>
            <select
              id="countryId"
              name="countryId"
              value={ad?.city.country.id}
              disabled
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.countryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {validationErrors.countryId && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.countryId}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="cityId" className="block text-gray-700 font-medium mb-2">
              City *
            </label>
            <select
              id="cityId"
              name="cityId"
              value={ad?.city.id}
              onChange={handleInputChange}
              disabled
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.cityId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a city</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {validationErrors.cityId && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.cityId}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Link
            href={`/ads/${adId}`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Ad'}
          </button>
        </div>
      </form>
    </div>
  );
}