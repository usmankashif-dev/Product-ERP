import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verify Email</h2>

            <p className="text-sm text-gray-600 mb-4">
                Thanks for signing up! Please check your email for a verification link to complete your registration.
            </p>

            {status === 'verification-link-sent' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded text-sm text-green-700">
                    A new verification link has been sent to your email.
                </div>
            )}

            <form onSubmit={submit} className="space-y-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing ? 'Sending...' : 'Resend Verification Email'}
                </button>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full border border-gray-300 text-gray-700 font-medium py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                    Log Out
                </Link>
            </form>
        </GuestLayout>
    );
}
