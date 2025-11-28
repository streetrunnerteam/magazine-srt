import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ToastNotificationProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    type?: 'success' | 'error' | 'info';
    duration?: number;
}

export default function ToastNotification({
    message,
    isVisible,
    onClose,
    type = 'success',
    duration = 3000
}: ToastNotificationProps) {
    const { theme } = useAuth();

    const themeBg = theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/60 border-white/10';
    const themeText = theme === 'light' ? 'text-gray-900' : 'text-white';
    const themeShadow = theme === 'light' ? 'shadow-xl' : 'shadow-[0_8px_32px_rgba(0,0,0,0.3)]';

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 20, x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`fixed bottom-8 left-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full ${themeBg} backdrop-blur-xl border ${themeShadow}`}
                >
                    <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-500/20 text-green-400' :
                        type === 'error' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                        }`}>
                        {type === 'success' && <Check className="w-4 h-4" />}
                        {type === 'error' && <AlertCircle className="w-4 h-4" />}
                        {type === 'info' && <Info className="w-4 h-4" />}
                    </div>
                    <span className={`text-sm font-medium ${themeText} tracking-wide`}>{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
