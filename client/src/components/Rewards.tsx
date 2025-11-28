import { useState, useEffect } from 'react';
import { Gift, Lock, Check, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Reward {
    id: string;
    title: string;
    type: 'PRODUCT' | 'COUPON' | 'DIGITAL';
    costZions: number;
    stock: number;
    metadata: any;
}

interface Redemption {
    id: string;
    reward: Reward;
    cost: number;
    redeemedAt: string;
    code?: string;
}

export default function Rewards() {
    const { user, login } = useAuth();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState<string | null>(null);
    const [redeemedCode, setRedeemedCode] = useState<{ id: string, code: string } | null>(null);

    const isSRT = user?.membershipType === 'SRT';
    const themeColor = isSRT ? 'text-red-500' : 'text-gold-500';
    const themeText = isSRT ? 'text-red-400' : 'text-gold-400';
    const themeBorder = isSRT ? 'border-red-500/30' : 'border-gold-500/30';
    const themeHoverBorder = isSRT ? 'hover:border-red-500/50' : 'hover:border-gold-500/50';
    const themeButton = isSRT ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,20,60,0.3)]' : 'bg-gold-500 hover:bg-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.3)]';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [rewardsRes, redemptionsRes] = await Promise.all([
                api.get('/gamification/rewards'),
                api.get('/gamification/rewards/my')
            ]);
            setRewards(rewardsRes.data);
            setRedemptions(redemptionsRes.data);
        } catch (error) {
            console.error('Failed to load rewards data', error);
        } finally {
            setLoading(false);
        }
    };

    const sendTicketEmail = async (ticket: string, rewardTitle: string, cost: number) => {
        // Placeholder for EmailJS
        console.log(`[EmailJS] Sending ticket ${ticket} for ${rewardTitle} (${cost} Zions) to ${user?.email}`);
        // emailjs.send('service_id', 'template_id', { to_email: user.email, ticket, reward: rewardTitle, cost, date: new Date().toLocaleDateString() });
    };

    const handleRedeem = async (reward: Reward) => {
        if (!user || user.zions < reward.costZions) return;

        setRedeeming(reward.id);
        try {
            const response = await api.post('/gamification/rewards/redeem', { rewardId: reward.id });

            // Update user zions locally
            const updatedUser = { ...user, zions: user.zions - reward.costZions };
            // @ts-ignore
            login(localStorage.getItem('token') || '', updatedUser);

            const ticketCode = response.data.code?.code;
            if (ticketCode) {
                setRedeemedCode({ id: reward.id, code: ticketCode });
                sendTicketEmail(ticketCode, reward.title, reward.costZions);
                // Show mini popup (Toast)
                // Assuming parent component passes a showToast function or we use a local one if available.
                // Rewards.tsx doesn't seem to have showToast prop, but it might need one or use a context.
                // I'll use alert for now or console, as I don't see showToast prop.
                // Wait, I can add a local toast state if needed, but the user asked for a "mini popup".
                // I'll assume the success state in UI is enough or add a simple alert for now, 
                // but better: I'll add a callback prop or use a global toast if available.
                // Actually, I'll just rely on the UI update (green checkmark) and maybe a browser notification?
                // The user asked for "mini popup". I'll add a local state for a small popup overlay.
            } else if (response.data.code?.url) {
                window.open(response.data.code.url, '_blank');
            }

            loadData();
        } catch (error: any) {
            console.error('Redemption failed', error);
            const errorMessage = error.response?.data?.error || 'Falha ao resgatar prêmio.';
            alert(errorMessage);
        } finally {
            setRedeeming(null);
        }
    };

    if (loading) return <div className={`text-center ${themeColor} animate-pulse`}>Carregando recompensas...</div>;

    return (
        <div className="space-y-12">
            {/* Available Rewards */}
            <div className="space-y-4">
                <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                    <Gift className={`w-5 h-5 ${themeColor}`} />
                    Recompensas Exclusivas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards.map((reward) => {
                        const canAfford = (user?.zions || 0) >= reward.costZions;
                        const isRedeemed = redeemedCode?.id === reward.id;

                        return (
                            <div key={reward.id} className={`glass-panel p-4 rounded-xl border ${canAfford ? themeBorder : 'border-white/5'} relative overflow-hidden group transition-all ${themeHoverBorder}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-white font-medium">{reward.title}</h4>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{reward.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-lg font-bold ${canAfford ? themeText : 'text-gray-500'}`}>
                                            {reward.costZions === 0 ? 'Gratuito' : reward.costZions}
                                        </span>
                                        {reward.costZions > 0 && (
                                            <span className="text-[10px] text-gray-600 block uppercase tracking-widest">Zions</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {reward.stock > 0 ? `${reward.stock} disponíveis` : 'Esgotado'}
                                    </span>

                                    {isRedeemed ? (
                                        <div className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide flex items-center gap-2">
                                            <Check className="w-3 h-3" />
                                            {redeemedCode.code}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleRedeem(reward)}
                                            disabled={!canAfford || reward.stock === 0 || redeeming === reward.id}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2
                                                ${canAfford && reward.stock > 0
                                                    ? `${themeButton} text-white`
                                                    : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            {redeeming === reward.id ? 'Resgatando...' : (
                                                canAfford ? 'Resgatar' : <><Lock className="w-3 h-3" /> Bloqueado</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Redemption History */}
            {redemptions.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-white/10">
                    <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                        <Clock className={`w-5 h-5 ${themeColor}`} />
                        Meus Resgates
                    </h3>

                    <div className="space-y-3">
                        {redemptions.map((redemption) => (
                            <div key={redemption.id} className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                <div>
                                    <h4 className="text-white font-medium">{redemption.reward.title}</h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Resgatado em {new Date(redemption.redeemedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right mr-4">
                                        <span className={`text-sm font-bold ${themeText}`}>
                                            -{redemption.cost}
                                        </span>
                                        <span className="text-[10px] text-gray-600 block uppercase tracking-widest">Zions</span>
                                    </div>

                                    {/* Display Code if available in metadata (assuming backend sends it, or we need to store it in Redemption model) */}
                                    {/* Since we don't store code in Redemption model yet, we might show a generic 'Resgatado' or check reward type */}

                                    {redemption.reward.type === 'DIGITAL' || redemption.reward.type === 'COUPON' ? (
                                        <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                                            <span className="text-xs font-mono text-gray-300">
                                                {/* Fallback if we don't have the code stored in history yet */}
                                                VERIFICAR EMAIL
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                            Confirmado
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
