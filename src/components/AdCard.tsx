'use client';
import Link from 'next/link';
import Image from 'next/image';

interface AdCardProps {
  id: number;
  title: string;
  price: number;
  location: string;
  category: string;
  createdAt: string;
  imageUrl?: string;
}

export default function AdCard({ id, title, price, location, category, createdAt, imageUrl = '/placeholder.jpg' }: AdCardProps) {
  // Format the date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Format the price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <Link href={`/ads/${id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-48 w-full bg-gray-200">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">{title}</h3>
            <p className="text-lg font-bold text-blue-600">{formattedPrice}</p>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>{location}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {category}
            </span>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}