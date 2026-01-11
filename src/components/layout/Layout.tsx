import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';

// Smooth spring bounce from top - fast and professional
const pageVariants = {
    initial: {
        opacity: 0,
        y: -30,
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.8,
        },
    },
};

export function Layout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-x-hidden">
            <Header />
            <main className="pt-16">
                <motion.div
                    key={location.pathname}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                >
                    <Outlet />
                </motion.div>
            </main>
            <footer className="py-8 text-center border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400 inline-flex items-center justify-center gap-1">
                    Made with <FlaskConical className="w-4 h-4 text-primary-500" /> by <span className="font-semibold text-gradient">Ankit Raj</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    AlgoVision - Algorithm Visualizer © 2026
                </p>
            </footer>
        </div>
    );
}
