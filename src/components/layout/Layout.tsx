import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Header />
            <main className="pt-16">
                <Outlet />
            </main>
            <footer className="py-8 text-center border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Made with ❤️ by <span className="font-semibold text-gradient">Ankit Raj</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    AlgoVision - Algorithm Visualizer © 2026
                </p>
            </footer>
        </div>
    );
}
