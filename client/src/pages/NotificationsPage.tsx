import { useEffect, useState } from 'react';
import Header from '../components/Header';
import LuxuriousBackground from '../components/LuxuriousBackground';
import api from '../services/api';
import { Bell, Heart, MessageCircle, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Notification {
    id: string;
    type: 'LIKE' | 'COMMENT' | 'SYSTEM' | 'BADGE';
    content: string;
    createdAt: string;
    read: boolean;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();
    const isSRT = user?.membershipType === 'SRT';

    const themeGradient = isSRT ? 'from-red-400 via-white to-red-400' : 'from-gold-200 via-gold-400 to-gold-200';
    const themeText = isSRT ? 'text-red-400' : 'text-gold-400';
    const themeBg = isSRT ? 'bg-red-500/10' : 'bg-gold-500/10';
    const themeBorder = isSRT ? 'border-red-500/30' : 'border-gold-500/30';
    const themeShadow = isSRT ? 'shadow-[0_0_15px_rgba(220,20,60,0.1)]' : 'shadow-[0_0_15px_rgba(212,175,55,0.1)]';
    const themeIconBg = isSRT ? 'bg-red-500/20' : 'bg-gold-500/20';
    const themeDot = isSRT ? 'bg-red-500 shadow-[0_0_10px_#DC143C]' : 'bg-gold-500 shadow-[0_0_10px_#D4AF37]';
    const themeLoading = isSRT ? 'text-red-500/50' : 'text-gold-500/50';
    const themeEmptyIcon = isSRT ? 'text-red-500/30' : 'text-gold-500/30';

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/notifications');
                setNotifications(response.data);
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Agora';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <div className="min-h-screen text-white font-sans selection:bg-gold-500/30 relative">
            <LuxuriousBackground />
            <Header />

            <main className="pt-48 pb-20 px-4 max-w-2xl mx-auto space-y-8 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Voltar"
                    >
                        <ArrowLeft className={`w-6 h-6 ${themeText}`} />
                    </button>
                    <h1 className={`text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>
                        Todas as Notificações
                    </h1>
                </div>

                {loading ? (
                    <div className={`text-center py-10 ${themeLoading} animate-pulse`}>
                        Carregando notificações...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm animate-fade-in">
                        <Bell className={`w-12 h-12 ${themeEmptyIcon} mx-auto mb-4`} />
                        <p className="text-gray-400 font-serif text-xl">Sem notificações no momento</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                                className={`
                                    p-6 rounded-xl border transition-all duration-300 cursor-pointer flex gap-4 items-start
                                    ${!notification.read
                                        ? `${themeBg} ${themeBorder} ${themeShadow}`
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                                `}
                            >
                                <div className={`p-2 rounded-full shrink-0 ${!notification.read ? `${themeIconBg} ${themeText}` : 'bg-white/5 text-gray-400'}`}>
                                    {notification.type === 'LIKE' && <Heart className="w-5 h-5" />}
                                    {notification.type === 'COMMENT' && <MessageCircle className="w-5 h-5" />}
                                    {notification.type === 'BADGE' && <Star className="w-5 h-5" />}
                                    {notification.type === 'SYSTEM' && <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-lg leading-snug mb-2 ${!notification.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                                        {notification.content}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                                        {getTimeAgo(notification.createdAt)}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className={`w-2 h-2 rounded-full mt-2 ${themeDot}`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
