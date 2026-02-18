'use client';

import { useState } from 'react';

export function RegistrationForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            course_id: formData.get('course_id'),
            batch_preference: formData.get('batch_preference'),
            documents: {
                name: formData.get('name'),
                phone: formData.get('phone'),
            }
        };

        try {
            const response = await fetch('/api/v1/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setIsSuccess(true);
            } else {
                const errData = await response.json();
                setError(errData.message || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="p-8 text-center bg-green-50 rounded-lg border border-green-200">
                <h2 className="text-2xl font-bold text-green-800">Registration Submitted!</h2>
                <p className="mt-2 text-green-600">Your application is now undergoing Academic Review. We will notify you once verified.</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Join Our Institute</h2>
            <p className="text-gray-500 mb-8">Start your journey today. Fill in the details below to register.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                        name="name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="e.g. John Doe"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                        <input
                            name="phone"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="017XXXXXXXX"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Course</label>
                        <select
                            name="course_id"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
                        >
                            <option value="">Choose a course...</option>
                            <option value="web-dev">Full Stack Web Development</option>
                            <option value="graphic">Professional Graphic Design</option>
                            <option value="dm">Digital Marketing</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Preference (Optional)</label>
                    <input
                        name="batch_preference"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Morning / Evening / Weekend"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transform transition active:scale-[0.98] disabled:opacity-50"
                >
                    {isSubmitting ? 'Processing...' : 'Complete Registration'}
                </button>
            </form>
        </div>
    );
}
