import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
            staggerChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        transition: {
            duration: 0.3,
        },
    },
};

const itemVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

export function PageTransition({ children }: PageTransitionProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedItem({ children }: { children: ReactNode }) {
    return (
        <motion.div variants={itemVariants}>
            {children}
        </motion.div>
    );
}

// Staggered container for landing animations
export function StaggerContainer({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={{
                initial: {},
                animate: {
                    transition: {
                        staggerChildren: 0.1,
                        delayChildren: delay,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

// Bounce in animation for elements
export function BounceIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 50 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay,
                },
            }}
        >
            {children}
        </motion.div>
    );
}

// Slide in from side
export function SlideIn({
    children,
    direction = 'left',
    delay = 0
}: {
    children: ReactNode;
    direction?: 'left' | 'right' | 'up' | 'down';
    delay?: number;
}) {
    const directionMap = {
        left: { x: -50, y: 0 },
        right: { x: 50, y: 0 },
        up: { x: 0, y: -50 },
        down: { x: 0, y: 50 },
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directionMap[direction],
            }}
            animate={{
                opacity: 1,
                x: 0,
                y: 0,
                transition: {
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay,
                },
            }}
        >
            {children}
        </motion.div>
    );
}

// Fade up animation
export function FadeUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
                opacity: 1,
                y: 0,
                transition: {
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay,
                },
            }}
        >
            {children}
        </motion.div>
    );
}

// Scale fade animation
export function ScaleFade({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: 1,
                transition: {
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay,
                },
            }}
        >
            {children}
        </motion.div>
    );
}
