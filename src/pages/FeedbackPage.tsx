import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';

// EmailJS configuration - initialized with public key
emailjs.init('YOUR_PUBLIC_KEY'); // Will be configured

interface FormData {
    name: string;
    email: string;
    experience: number;
    improvements: string;
    issues: string;
}

export function FeedbackPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        experience: 0,
        improvements: '',
        issues: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [hoverRating, setHoverRating] = useState(0);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            // For demo purposes, we'll simulate email sending
            // In production, configure EmailJS with your service
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                experience_rating: formData.experience,
                improvements: formData.improvements || 'None provided',
                issues: formData.issues || 'None reported',
                to_email: 'ar443203@gmail.com',
            };

            // Simulate API call (replace with actual EmailJS call when configured)
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Uncomment below when EmailJS is configured:
            // await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);

            console.log('Feedback submitted:', templateParams);
            setSubmitStatus('success');
            setFormData({ name: '', email: '', experience: 0, improvements: '', issues: '' });
        } catch (error) {
            console.error('Failed to send feedback:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.name && formData.email && formData.experience > 0;

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="control-btn" aria-label="Back to home">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Feedback</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Help us improve AlgoVision with your feedback
                        </p>
                    </div>
                </div>

                {/* Success Message */}
                {submitStatus === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3"
                    >
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                                Thank you for your feedback!
                            </p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                We appreciate you taking the time to help us improve.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center gap-3"
                    >
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-red-700 dark:text-red-300">
                                Failed to submit feedback
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Please try again later or contact us directly.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Feedback Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="algo-card"
                >
                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
                            >
                                Your Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="input-field"
                                placeholder="Enter your name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
                            >
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="input-field"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        {/* Experience Rating */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                How was your experience? <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <motion.button
                                        key={rating}
                                        type="button"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setFormData((prev) => ({ ...prev, experience: rating }))}
                                        onMouseEnter={() => setHoverRating(rating)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-2 rounded-lg transition-colors"
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${rating <= (hoverRating || formData.experience)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-slate-300 dark:text-slate-600'
                                                }`}
                                        />
                                    </motion.button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {formData.experience === 1 && 'Poor'}
                                {formData.experience === 2 && 'Fair'}
                                {formData.experience === 3 && 'Good'}
                                {formData.experience === 4 && 'Very Good'}
                                {formData.experience === 5 && 'Excellent'}
                            </p>
                        </div>

                        {/* Improvements */}
                        <div>
                            <label
                                htmlFor="improvements"
                                className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
                            >
                                What improvements would you suggest?
                            </label>
                            <textarea
                                id="improvements"
                                name="improvements"
                                value={formData.improvements}
                                onChange={handleInputChange}
                                rows={3}
                                className="input-field resize-none"
                                placeholder="Share your ideas for making AlgoVision better..."
                            />
                        </div>

                        {/* Issues */}
                        <div>
                            <label
                                htmlFor="issues"
                                className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
                            >
                                Did you face any issues?
                            </label>
                            <textarea
                                id="issues"
                                name="issues"
                                value={formData.issues}
                                onChange={handleInputChange}
                                rows={3}
                                className="input-field resize-none"
                                placeholder="Let us know if something didn't work as expected..."
                            />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                            whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                            className={`w-full btn ${isFormValid
                                    ? 'btn-primary'
                                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Submit Feedback
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.form>

                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                    <p>
                        You can also reach us directly at{' '}
                        <a
                            href="mailto:ar443203@gmail.com"
                            className="text-primary-600 dark:text-primary-400 hover:underline"
                        >
                            ar443203@gmail.com
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
