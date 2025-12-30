import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reset Password</h2>

            {status && (
                <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded text-sm text-green-700">
                    {status}
                </div>
            )}

            <p className="text-sm text-gray-600 mb-6">
                Enter your email address and we'll send you a password reset link.
            </p>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-1" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-6 bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing ? 'Sending link...' : 'Send Reset Link'}
                </button>
            </form>

            <div className="mt-6 border-t border-gray-200 pt-4 text-center">
                <p className="text-sm text-gray-600">
                    Remember your password?{' '}
                    <Link
                        href={route('login')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
