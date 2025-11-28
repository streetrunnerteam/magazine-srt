import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LuxuriousBackground from '../components/LuxuriousBackground';
import Header from '../components/Header';
import { Plus, Trash2, Gift, Edit2, X, User as UserIcon, Check, Key, Shield } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import ToastNotification from '../components/ToastNotification';
import AdminCreatePost from '../components/AdminCreatePost';
import AdminCreateAnnouncement from '../components/AdminCreateAnnouncement';

interface Reward {
    id: string;
    title: string;
    type: 'PRODUCT' | 'COUPON' | 'DIGITAL';
    costZions: number;
    stock: number;
}

interface InviteRequest {
    id: string;
    name: string;
    email: string;
    instagram: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MEMBER';
    createdAt: string;
    trophies: number;
    membershipType?: 'MAGAZINE' | 'SRT';
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [requests, setRequests] = useState<InviteRequest[]>([]);
    const [usersList, setUsersList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [newReward, setNewReward] = useState<Partial<Reward>>({
        title: '',
        type: 'DIGITAL',
        costZions: 100,
        stock: 10
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; rewardId: string | null }>({
        isOpen: false,
        rewardId: null
    });
    const [toast, setToast] = useState({ message: '', isVisible: false, type: 'success' as 'success' | 'error' | 'info' });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, isVisible: true, type });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rewardsRes, requestsRes, usersRes] = await Promise.all([
                api.get('/gamification/rewards'),
                api.get('/invites'),
                api.get('/users')
            ]);
            setRewards(rewardsRes.data);
            setRequests(requestsRes.data);
            setUsersList(usersRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
            showToast('Erro ao carregar dados', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateReward = async () => {
        try {
            await api.post('/gamification/rewards', newReward);
            setNewReward({ title: '', type: 'DIGITAL', costZions: 100, stock: 10 });
            fetchData(); // Refresh all data
            showToast('Recompensa criada com sucesso!', 'success');
        } catch (error) {
            console.error('Failed to create reward', error);
            showToast('Erro ao criar recompensa', 'error');
        }
    };

    const handleDeleteReward = async () => {
        if (!deleteModal.rewardId) return;
        try {
            await api.delete(`/gamification/rewards/${deleteModal.rewardId}`);
            setRewards(rewards.filter(r => r.id !== deleteModal.rewardId));
            setDeleteModal({ isOpen: false, rewardId: null });
            showToast('Recompensa removida com sucesso', 'success');
        } catch (error) {
            console.error('Failed to delete reward', error);
            showToast('Erro ao remover recompensa', 'error');
        }
    };

    const handleApproveRequest = async (id: string) => {
        try {
            const response = await api.post(`/invites/${id}/approve`);
            setRequests(requests.filter(r => r.id !== id));

            // Show password to admin
            const password = response.data.generatedPassword;
            // Use a long duration or sticky toast for the password
            showToast(`Aprovado! Senha gerada: ${password} (Copie agora!)`, 'success');

            // Also log to console for backup
            console.log(`Password for ${id}: ${password}`);

            // Optional: Copy to clipboard automatically
            navigator.clipboard.writeText(password).then(() => {
                showToast(`Senha ${password} copiada para a área de transferência!`, 'success');
            }).catch(() => {
                // If clipboard fails, just show the password
                alert(`Usuário criado! A senha temporária é: ${password}\n\nPor favor, envie para o usuário.`);
            });

        } catch (error) {
            console.error('Failed to approve request', error);
            showToast('Erro ao aprovar solicitação', 'error');
        }
    };

    const handleRejectRequest = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja rejeitar esta solicitação?')) return;
        try {
            await api.post(`/invites/${id}/reject`);
            setRequests(requests.filter(r => r.id !== id));
            showToast('Solicitação rejeitada', 'info');
        } catch (error) {
            console.error('Failed to reject request', error);
            showToast('Erro ao rejeitar solicitação', 'error');
        }
    };

    const handleResetPassword = async (userId: string, userName: string) => {
        if (!window.confirm(`Tem certeza que deseja gerar uma nova senha para ${userName}?`)) return;
        try {
            const response = await api.post(`/users/${userId}/reset-password`);
            const password = response.data.generatedPassword;

            showToast(`Senha gerada para ${userName}: ${password} (Copie agora!)`, 'success');

            navigator.clipboard.writeText(password).then(() => {
                showToast(`Senha copiada!`, 'success');
            }).catch(() => {
                alert(`Senha gerada para ${userName}: ${password}`);
            });
        } catch (error) {
            console.error('Failed to reset password', error);
            showToast('Erro ao gerar senha', 'error');
        }
    };

    const handleToggleMembership = async (userId: string, currentType: 'MAGAZINE' | 'SRT' | undefined) => {
        const newType = currentType === 'SRT' ? 'MAGAZINE' : 'SRT';
        try {
            await api.put(`/users/${userId}/membership`, { membershipType: newType });
            setUsersList(usersList.map(u => u.id === userId ? { ...u, membershipType: newType } : u));
            showToast(`Membro alterado para ${newType}`, 'success');
        } catch (error) {
            console.error('Failed to update membership', error);
            showToast('Erro ao alterar tipo de membro', 'error');
        }
    };

    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="min-h-screen text-white font-sans selection:bg-gold-500/30 relative">
            <LuxuriousBackground />
            <Header />

            <ToastNotification
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                type={toast.type}
            />

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, rewardId: null })}
                onConfirm={handleDeleteReward}
                title="Remover Recompensa"
                message="Tem certeza que deseja remover esta recompensa? Ela não estará mais disponível para os usuários."
                confirmText="Remover"
                isDestructive={true}
            />



            <div className="max-w-7xl mx-auto pt-32 pb-32 px-4 relative z-10">
                <h1 className="text-3xl font-serif text-gold-300 mb-8">Painel Administrativo</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1: Actions */}
                    <div className="space-y-8 h-fit">
                        <AdminCreatePost showToast={showToast} />
                        <AdminCreateAnnouncement showToast={showToast} />

                        {/* Create Reward Form */}
                        <div className="glass-panel p-6 rounded-xl h-fit">
                            <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-gold-400" /> Nova Recompensa
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={newReward.title}
                                        onChange={e => setNewReward({ ...newReward, title: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold-500/50 outline-none"
                                        placeholder="Ex: Cupom 10%"
                                        aria-label="Título da recompensa"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                                    <select
                                        value={newReward.type}
                                        onChange={e => setNewReward({ ...newReward, type: e.target.value as any })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold-500/50 outline-none"
                                        aria-label="Tipo de recompensa"
                                    >
                                        <option value="DIGITAL">Digital</option>
                                        <option value="PRODUCT">Produto Físico</option>
                                        <option value="COUPON">Cupom</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Custo (Zions)</label>
                                        <input
                                            type="number"
                                            value={newReward.costZions}
                                            onChange={e => setNewReward({ ...newReward, costZions: parseInt(e.target.value) })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold-500/50 outline-none"
                                            aria-label="Custo em troféus"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Estoque</label>
                                        <input
                                            type="number"
                                            value={newReward.stock}
                                            onChange={e => setNewReward({ ...newReward, stock: parseInt(e.target.value) })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold-500/50 outline-none"
                                            aria-label="Quantidade em estoque"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleCreateReward}
                                    className="w-full bg-gold-500 text-black font-medium py-2 rounded-lg hover:bg-gold-400 transition-colors mt-4"
                                >
                                    Criar Recompensa
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Rewards List */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Admin Stats Edit */}
                        <div className="glass-panel p-6 rounded-xl">
                            <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-gold-400" /> Editar Meus Status
                            </h2>
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-400 mb-1">Meus Troféus</label>
                                    <input
                                        type="number"
                                        defaultValue={user?.trophies || 0}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold-500/50 outline-none"
                                        aria-label="Editar meus troféus"
                                        onBlur={async (e) => {
                                            const newTrophies = parseInt(e.target.value);
                                            if (!isNaN(newTrophies)) {
                                                try {
                                                    await api.put('/users/me', { trophies: newTrophies });
                                                    showToast('Troféus atualizados!', 'success');
                                                    window.location.reload();
                                                } catch (error) {
                                                    console.error('Failed to update trophies', error);
                                                    showToast('Erro ao atualizar troféus. Verifique se você tem permissão.', 'error');
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 pb-3">
                                    *Edição em tempo real (Admin)
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-xl">
                            <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-gold-400" /> Recompensas Ativas
                            </h2>

                            {loading ? (
                                <div className="text-center py-10 text-gray-500">Carregando...</div>
                            ) : rewards.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">Nenhuma recompensa cadastrada.</div>
                            ) : (
                                <div className="space-y-4">
                                    {rewards.map(reward => (
                                        <div key={reward.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-gold-500/20 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
                                                    <Gift className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-white">{reward.title}</h3>
                                                    <p className="text-xs text-gray-400">
                                                        {reward.costZions} Zions • {reward.stock} em estoque • {reward.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, rewardId: reward.id })}
                                                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                                    aria-label={`Remover recompensa ${reward.title}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Member Requests Card */}
                    <div className="glass-panel p-6 rounded-xl h-fit">
                        <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-gold-400" /> Solicitações de Membros
                        </h2>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-4 text-gray-500">Carregando...</div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">Nenhuma solicitação pendente.</div>
                            ) : (
                                <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                    {requests.map((request) => (
                                        <div key={request.id} className="bg-white/5 rounded-lg p-4 border border-white/5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-white text-sm">{request.name}</h3>
                                                    <p className="text-xs text-gray-400">{request.email}</p>
                                                    {request.instagram && (
                                                        <p className="text-xs text-gold-400/80 mt-1">{request.instagram}</p>
                                                    )}
                                                    <p className="text-[10px] text-gray-600 mt-1">
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveRequest(request.id)}
                                                    className="flex-1 bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 text-xs py-2 rounded transition-colors border border-gold-500/20 flex items-center justify-center gap-1"
                                                    aria-label={`Aprovar ${request.name}`}
                                                >
                                                    <Check className="w-3 h-3" /> Aprovar
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(request.id)}
                                                    className="px-3 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs rounded transition-colors flex items-center justify-center"
                                                    aria-label={`Rejeitar ${request.name}`}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-center text-xs text-gray-500 pt-2">
                                Total: {requests.length} solicitações pendentes
                            </p>
                        </div>
                    </div>

                    {/* Registered Users List */}
                    <div className="glass-panel p-6 rounded-xl h-fit lg:col-span-3">
                        <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gold-400" /> Membros Registrados
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-gray-400 border-b border-white/10">
                                        <th className="py-3 px-4">Nome</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Função</th>
                                        <th className="py-3 px-4">Membro</th>
                                        <th className="py-3 px-4">Troféus</th>
                                        <th className="py-3 px-4">Data Registro</th>
                                        <th className="py-3 px-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersList.map(u => (
                                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 font-medium text-white">{u.name}</td>
                                            <td className="py-3 px-4 text-gray-400 text-sm">{u.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs px-2 py-1 rounded ${u.role === 'ADMIN' ? 'bg-gold-500/20 text-gold-400' : 'bg-white/10 text-gray-300'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => handleToggleMembership(u.id, u.membershipType)}
                                                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${u.membershipType === 'SRT' ? 'bg-red-600' : 'bg-gold-500'}`}
                                                    title={`Alternar para ${u.membershipType === 'SRT' ? 'Magazine' : 'SRT'}`}
                                                >
                                                    <span
                                                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${u.membershipType === 'SRT' ? 'translate-x-6' : 'translate-x-0'}`}
                                                    />
                                                </button>
                                                <span className="ml-2 text-xs text-gray-400">{u.membershipType || 'MAGAZINE'}</span>
                                            </td>
                                            <td className="py-3 px-4 text-gold-400">{u.trophies} 🏆</td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => handleResetPassword(u.id, u.name)}
                                                    className="p-2 bg-white/5 hover:bg-gold-500/20 text-gray-400 hover:text-gold-400 rounded transition-colors"
                                                    title="Gerar Nova Senha"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
