import { useEffect, useState } from 'react';
import api from '../services/api';
import { Trophy, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RankingModal from './RankingModal';

interface RankedUser {
    id: string;
    name: string;
    points: number;
    avatarUrl?: string;
}

export default function Ranking() {
    const [users, setUsers] = useState<RankedUser[]>([]);
    const { user } = useAuth();
    const isSRT = user?.membershipType === 'SRT';

    const themeColor = isSRT ? 'text-red-500' : 'text-gold-400';
    const themeBorder = isSRT ? 'border-red-500/20' : 'border-gold-500/20';
    const themeBg = isSRT ? 'bg-red-500/10' : 'bg-gold-500/10';

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const response = await api.get('/gamification/ranking');
                setUsers(response.data);
            } catch (error) {
                console.error('Failed to fetch ranking', error);
            }
        };

        fetchRanking();
    }, []);

    return (
        <>
            <div className={`glass-panel rounded-xl p-6 border ${themeBorder}`}>
                <div className="flex items-center gap-3 mb-6">
                    <Trophy className={`w-6 h-6 ${themeColor}`} />
                    <h3 className="text-xl font-serif text-white tracking-wider uppercase">Ranking Elite</h3>
                </div>

                <div className="space-y-4 mb-6">
                    {users.map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <span className={`text-lg font-bold w-6 text-center ${index < 3 ? themeColor : 'text-gray-500'}`}>
                                    {index + 1}
                                </span>
                                <div className={`w-10 h-10 rounded-full ${themeBg} border ${isSRT ? 'border-red-500/30' : 'border-gold-500/30'} overflow-hidden flex items-center justify-center`}>
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className={`w-5 h-5 ${isSRT ? 'text-red-500/50' : 'text-gold-500/50'}`} />
                                    )}
                                </div>
                                <div>
                                    <p className={`text-white font-medium text-sm group-hover:${isSRT ? 'text-red-300' : 'text-gold-300'} transition-colors`}>{user.name}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{user.points} Troféus</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className={`w-full py-3 rounded-xl border ${isSRT ? 'border-red-500/20 hover:bg-red-500/10 text-red-400' : 'border-gold-500/20 hover:bg-gold-500/10 text-gold-400'} transition-colors text-xs font-bold uppercase tracking-widest`}
                >
                    Ver Ranking Completo
                </button>
            </div>

            <RankingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isSRT={isSRT}
            />
        </>
    );
}
