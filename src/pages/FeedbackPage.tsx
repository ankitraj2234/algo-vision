import { useState, useEffect } from 'react';
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
    Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';

// EmailJS configuration
emailjs.init('YOUR_PUBLIC_KEY');

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
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Validation
    const validateField = (name: string, value: string | number): string | undefined => {
        switch (name) {
            case 'name':
                if (!value || (typeof value === 'string' && value.trim().length === 0)) {
                    return 'Name is required';
                }
                if (typeof value === 'string' && value.trim().length < 2) {
                    return 'Name must be at least 2 characters';
                }
                break;
            case 'email':
                if (!value || (typeof value === 'string' && value.trim().length === 0)) {
                    return 'Email is required';
                }
                if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Please enter a valid email address';
                }
                break;
            case 'experience':
                if (!value || value === 0) {
                    return 'Please rate your experience';
                }
                break;
        }
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        newErrors.name = validateField('name', formData.name);
        newErrors.email = validateField('email', formData.email);
        newErrors.experience = validateField('experience', formData.experience);

        setErrors(newErrors);
        return !newErrors.name && !newErrors.email && !newErrors.experience;
    };

    useEffect(() => {
        // Validate on change for touched fields
        const newErrors: FormErrors = {};
        if (touched.name) newErrors.name = validateField('name', formData.name);
        if (touched.email) newErrors.email = validateField('email', formData.email);
        if (touched.experience) newErrors.experience = validateField('experience', formData.experience);
        setErrors(newErrors);
    }, [formData, touched]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setFocusedField(null);
    };

    const handleFocus = (field: string) => {
        setFocusedField(field);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all as touched
        setTouched({ name: true, email: true, experience: true });

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                experience_rating: formData.experience,
                improvements: formData.improvements || 'None provided',
                issues: formData.issues || 'None reported',
                to_email: 'ar443203@gmail.com',
            };

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log('Feedback submitted:', templateParams);
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

    const isFormValid = !errors.name && !errors.email && !errors.experience &&
        formData.name && formData.email && formData.experience > 0;

    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const ratingColors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-emerald-500'];

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Feedback
                            <motion.span
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                            >
                                <Sparkles className="w-6 h-6 text-yellow-400" />
                            </motion.span>
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
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                            >
                                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            </motion.div>
                            <div>
                                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                                    🎉 Thank you for your feedback!
                                </p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    We appreciate you taking the time to help us improve.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {submitStatus === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 border border-red-200 dark:border-red-800 flex items-center gap-3"
                        >
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
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
                </AnimatePresence>

                {/* Feedback Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="algo-card overflow-visible"
                >
                    <div className="space-y-6">
                        {/* Name Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label
                                htmlFor="name"
                                className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white mb-2"
                            >
                                <User className="w-4 h-4" />
                                Your Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <motion.input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    onFocus={() => handleFocus('name')}
                                    onBlur={() => handleBlur('name')}
                                    animate={{
                                        boxShadow: focusedField === 'name'
                                            ? '0 0 0 3px rgba(79, 70, 229, 0.3)'
                                            : errors.name && touched.name
                                                ? '0 0 0 2px rgba(239, 68, 68, 0.3)'
                                                : '0 0 0 0px transparent',
                                    }}
                                    className={`input-field transition-all duration-200 ${errors.name && touched.name
                                            ? 'border-red-500 dark:border-red-500'
                                            : focusedField === 'name'
                                                ? 'border-primary-500 dark:border-primary-400'
                                                : ''
                                        }`}
                                    placeholder="Enter your name"
                                />
                                <AnimatePresence>
                                    {formData.name && !errors.name && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                        >
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <AnimatePresence>
                                {errors.name && touched.name && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="flex items-center gap-1 text-sm text-red-500 mt-1"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        {errors.name}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Email Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label
                                htmlFor="email"
                                className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white mb-2"
                            >
                                <Mail className="w-4 h-4" />
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <motion.input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onFocus={() => handleFocus('email')}
                                    onBlur={() => handleBlur('email')}
                                    animate={{
                                        boxShadow: focusedField === 'email'
                                            ? '0 0 0 3px rgba(79, 70, 229, 0.3)'
                                            : errors.email && touched.email
                                                ? '0 0 0 2px rgba(239, 68, 68, 0.3)'
                                                : '0 0 0 0px transparent',
                                    }}
                                    className={`input-field transition-all duration-200 ${errors.email && touched.email
                                            ? 'border-red-500 dark:border-red-500'
                                            : focusedField === 'email'
                                                ? 'border-primary-500 dark:border-primary-400'
                                                : ''
                                        }`}
                                    placeholder="your.email@example.com"
                                />
                                <AnimatePresence>
                                    {formData.email && !errors.email && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                        >
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <AnimatePresence>
                                {errors.email && touched.email && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="flex items-center gap-1 text-sm text-red-500 mt-1"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        {errors.email}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Experience Rating */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white mb-3">
                                <Star className="w-4 h-4" />
                                How was your experience? <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <motion.button
                                            key={rating}
                                            type="button"
                                            whileHover={{ scale: 1.2, rotate: rating <= (hoverRating || formData.experience) ? 5 : 0 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => {
                                                setFormData((prev) => ({ ...prev, experience: rating }));
                                                setTouched((prev) => ({ ...prev, experience: true }));
                                            }}
                                            onMouseEnter={() => setHoverRating(rating)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: rating <= (hoverRating || formData.experience) ? [1, 1.1, 1] : 1,
                                                }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Star
                                                    className={`w-10 h-10 transition-all duration-200 ${rating <= (hoverRating || formData.experience)
                                                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                                                            : 'text-slate-300 dark:text-slate-600'
                                                        }`}
                                                />
                                            </motion.div>
                                        </motion.button>
                                    ))}
                                </div>
                                <AnimatePresence mode="wait">
                                    {(hoverRating || formData.experience) > 0 && (
                                        <motion.span
                                            key={hoverRating || formData.experience}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className={`text-lg font-semibold ${ratingColors[hoverRating || formData.experience]}`}
                                        >
                                            {ratingLabels[hoverRating || formData.experience]}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                            <AnimatePresence>
                                {errors.experience && touched.experience && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="flex items-center gap-1 text-sm text-red-500 mt-2"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        {errors.experience}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Improvements */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label
                                htmlFor="improvements"
                                className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white mb-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                What improvements would you suggest?
                                <span className="text-xs text-slate-400">(Optional)</span>
                            </label>
                            <motion.textarea
                                id="improvements"
                                name="improvements"
                                value={formData.improvements}
                                onChange={handleInputChange}
                                onFocus={() => handleFocus('improvements')}
                                onBlur={() => handleBlur('improvements')}
                                rows={3}
                                animate={{
                                    boxShadow: focusedField === 'improvements'
                                        ? '0 0 0 3px rgba(79, 70, 229, 0.3)'
                                        : '0 0 0 0px transparent',
                                }}
                                className={`input-field resize-none transition-all duration-200 ${focusedField === 'improvements' ? 'border-primary-500 dark:border-primary-400' : ''
                                    }`}
                                placeholder="Share your ideas for making AlgoVision better..."
                            />
                            <p className="text-xs text-slate-400 mt-1 text-right">
                                {formData.improvements.length}/500
                            </p>
                        </motion.div>

                        {/* Issues */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label
                                htmlFor="issues"
                                className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white mb-2"
                            >
                                <AlertCircle className="w-4 h-4" />
                                Did you face any issues?
                                <span className="text-xs text-slate-400">(Optional)</span>
                            </label>
                            <motion.textarea
                                id="issues"
                                name="issues"
                                value={formData.issues}
                                onChange={handleInputChange}
                                onFocus={() => handleFocus('issues')}
                                onBlur={() => handleBlur('issues')}
                                rows={3}
                                animate={{
                                    boxShadow: focusedField === 'issues'
                                        ? '0 0 0 3px rgba(79, 70, 229, 0.3)'
                                        : '0 0 0 0px transparent',
                                }}
                                className={`input-field resize-none transition-all duration-200 ${focusedField === 'issues' ? 'border-primary-500 dark:border-primary-400' : ''
                                    }`}
                                placeholder="Let us know if something didn't work as expected..."
                            />
                            <p className="text-xs text-slate-400 mt-1 text-right">
                                {formData.issues.length}/500
                            </p>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
                                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${isFormValid && !isSubmitting
                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40'
                                        : isSubmitting
                                            ? 'bg-primary-400 text-white cursor-wait'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Sending your feedback...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Feedback
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.form>

                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-center"
                >
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        You can also reach us directly at{' '}
                        <a
                            href="mailto:ar443203@gmail.com"
                            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                            ar443203@gmail.com
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
