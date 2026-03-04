import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-simplingua-primary">
              Simplingua
            </h3>
            <p className="text-gray-600 text-sm">
              A constructed language for global communication
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Link href="/wiki/search" className="text-gray-600 hover:text-simplingua-primary transition">
              Wiki
            </Link>
            <Link href="/grammar" className="text-gray-600 hover:text-simplingua-primary transition">
              Grammar
            </Link>
            <Link href="/valva/posts" className="text-gray-600 hover:text-simplingua-primary transition">
              Forum (Valva)
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-simplingua-primary transition">
              About
            </Link>
          </div>

          <div className="text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Simplingua. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
