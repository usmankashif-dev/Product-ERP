import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <img 
                            src="/logo.png" 
                            alt="Highlife Logo" 
                            className="h-20 w-auto object-contain mx-auto mb-4"
                        />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Highlife</h1>
                    <p className="text-gray-600 text-sm mt-2">Manage your business efficiently</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                    {children}
                </div>

                {/* Footer Links */}
                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>Secure Authentication</p>
                </div>
            </div>
        </div>
    );
}
