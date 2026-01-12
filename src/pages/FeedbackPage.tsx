import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Send,
    Star,
    CheckCircle,
    AlertCircle,
    Loader2,
    User,
    Mail,
    MessageSquare,
    AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Web3Forms - Free form submission service (no backend required)
// Get your access key from: https://web3forms.com (takes 1 minute, free)
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || 'YOUR_ACCESS_KEY_HERE';

interface FormData {
    name: string;
    email: string;
    experience: number;
    improvements: string;
    issues: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    experience?: string;
}

export function FeedbackPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        experience: 0,
        improvements: '',
        issues: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [hoverRating, setHoverRating] = useState(0);

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        if (field === 'name' && !formData.name.trim()) {
            setErrors((prev) => ({ ...prev, name: 'Name is required' }));
        } else if (field === 'email') {
            if (!formData.email.trim()) {
                setErrors((prev) => ({ ...prev, email: 'Email is required' }));
            } else if (!validateEmail(formData.email)) {
                setErrors((prev) => ({ ...prev, email: 'Please enter a valid email' }));
            }
        }
    };

    const handleStarClick = (rating: number) => {
        setFormData((prev) => ({ ...prev, experience: rating }));
        setTouched((prev) => ({ ...prev, experience: true }));
        setErrors((prev) => ({ ...prev, experience: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.experience) newErrors.experience = 'Please rate your experience';

        setErrors(newErrors);
        setTouched({ name: true, email: true, experience: true });

        if (Object.keys(newErrors).length > 0) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            // Web3Forms submission - no backend needed!
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_KEY,
                    subject: `AlgoVision Feedback from ${formData.name}`,
                    from_name: 'AlgoVision Feedback',
                    name: formData.name,
                    email: formData.email,
                    experience_rating: `${'⭐'.repeat(formData.experience)} (${formData.experience}/5)`,
                    suggestions: formData.improvements || 'None provided',
                    issues_faced: formData.issues || 'None reported',
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to send feedback');
            }

            console.log('Feedback sent successfully');
            setSubmitStatus('success');
            setFormData({ name: '', email: '', experience: 0, improvements: '', issues: '' });
            setTouched({});
            setErrors({});
        } catch (error) {
            console.error('Failed to send feedback:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid =
        formData.name.trim() &&
        formData.email.trim() &&
        validateEmail(formData.email) &&
        formData.experience > 0;

    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <Link to="/" className="control-btn" aria-label="Back to home">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Feedback ✨
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Help us improve AlgoVision with your feedback
                        </p>
                    </div>
                </motion.div>

                {/* Success Message */}
                <AnimatePresence>
                    {submitStatus === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 flex items-center gap-3"
                        >
                            <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                                    Thank you for your feedback! 🎉
                                </p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    We appreciate your time helping us improve.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {submitStatus === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 flex items-center gap-3"
                        >
                            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-red-700 dark:text-red-300">
                                    Failed to submit
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    Please try again later.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg space-y-6"
                >
                    {/* Name Field */}
                    <div>
                        <label
                            htmlFor="name"
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                        >
                            <User className="w-4 h-4" />
                            Your Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('name')}
                                className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none ${errors.name && touched.name
                                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900'
                                    }`}
                                placeholder="Enter your name"
                            />
                            {formData.name && !errors.name && (
                                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                            )}
                        </div>
                        {errors.name && touched.name && (
                            <p className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                <AlertTriangle className="w-4 h-4" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                        >
                            <Mail className="w-4 h-4" />
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('email')}
                                className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none ${errors.email && touched.email
                                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900'
                                    }`}
                                placeholder="your.email@example.com"
                            />
                            {formData.email && validateEmail(formData.email) && (
                                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                            )}
                        </div>
                        {errors.email && touched.email && (
                            <p className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                <AlertTriangle className="w-4 h-4" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Star Rating */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
                            <Star className="w-4 h-4" />
                            How was your experience? <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => handleStarClick(rating)}
                                        onMouseEnter={() => setHoverRating(rating)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 rounded-lg transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-400"
                                    >
                                        <Star
                                            className={`w-10 h-10 transition-colors duration-150 ${rating <= (hoverRating || formData.experience)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-slate-300 dark:text-slate-600'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {(hoverRating || formData.experience) > 0 && (
                                <span className={`text-lg font-semibold ${(hoverRating || formData.experience) <= 1 ? 'text-red-500' :
                                    (hoverRating || formData.experience) === 2 ? 'text-orange-500' :
                                        (hoverRating || formData.experience) === 3 ? 'text-yellow-500' :
                                            (hoverRating || formData.experience) === 4 ? 'text-lime-500' :
                                                'text-emerald-500'
                                    }`}>
                                    {ratingLabels[hoverRating || formData.experience]}
                                </span>
                            )}
                        </div>
                        {errors.experience && touched.experience && (
                            <p className="flex items-center gap-1 text-sm text-red-500 mt-2">
                                <AlertTriangle className="w-4 h-4" />
                                {errors.experience}
                            </p>
                        )}
                    </div>

                    {/* Improvements */}
                    <div>
                        <label
                            htmlFor="improvements"
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Suggestions for improvement
                            <span className="text-xs text-slate-400">(Optional)</span>
                        </label>
                        <textarea
                            id="improvements"
                            name="improvements"
                            value={formData.improvements}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 resize-none"
                            placeholder="Share your ideas for making AlgoVision better..."
                        />
                        <p className="text-xs text-slate-400 mt-1 text-right">
                            {formData.improvements.length}/500
                        </p>
                    </div>

                    {/* Issues */}
                    <div>
                        <label
                            htmlFor="issues"
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                        >
                            <AlertCircle className="w-4 h-4" />
                            Did you face any issues?
                            <span className="text-xs text-slate-400">(Optional)</span>
                        </label>
                        <textarea
                            id="issues"
                            name="issues"
                            value={formData.issues}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 resize-none"
                            placeholder="Let us know if something didn't work as expected..."
                        />
                        <p className="text-xs text-slate-400 mt-1 text-right">
                            {formData.issues.length}/500
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-200 ${isFormValid && !isSubmitting
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
                            : isSubmitting
                                ? 'bg-primary-400 text-white cursor-wait'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
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
                    </button>
                </motion.form>

                {/* Contact */}
                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Or email us directly at{' '}
                    <a
                        href="mailto:wolfankit512@gmail.com"
                        className="text-primary-500 hover:underline font-medium"
                    >
                        wolfankit512@gmail.com
                    </a>
                </p>
            </div>
        </div>
    );
}
