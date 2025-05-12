export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-gray-400">
      <div className="py-12 px-4  sm:px-6 lg:px-8 text-center">
        &copy; {currentYear} Classifieds Platform. All rights reserved.
      </div>
    </footer>
  );
}