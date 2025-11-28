import { useState, useRef } from 'react';
import { Image as ImageIcon, Send, Megaphone, Upload } from 'lucide-react';
import api from '../services/api';

interface AdminCreateAnnouncementProps {
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function AdminCreateAnnouncement({ showToast }: AdminCreateAnnouncementProps) {
    const [title, setTitle] = useState('');
    const [tag, setTag] = useState('Lançamento');
    const [subscriptionType, setSubscriptionType] = useState('Assinatura Premium');
    const [description, setDescription] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [bgUrl, setBgUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !logoUrl || !bgUrl) {
            if (showToast) showToast('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        setLoading(true);

        try {
            await api.post('/announcements', {
                title,
                tag,
                subscriptionType,
                description,
                logoUrl,
                backgroundImageUrl: bgUrl
            });

            setTitle('');
            setDescription('');
            setLogoUrl('');
            setBgUrl('');
            if (showToast) showToast('Anúncio criado com sucesso!', 'success');
        } catch (error) {
            console.error('Failed to create announcement', error);
            if (showToast) showToast('Erro ao criar anúncio', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-50 pointer-events-none" />

            <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2 relative z-10">
                <Megaphone className="w-5 h-5 text-red-400" /> Criar Atualização/Novidade
            </h2>

            <div className="space-y-4 relative z-10">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Nome do Anúncio/Produto</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500/50 outline-none"
                        placeholder="Ex: Anunciamos a..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Tag</label>
                        <input
                            type="text"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500/50 outline-none"
                            placeholder="Ex: Lançamento"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Tipo de Assinatura</label>
                        <input
                            type="text"
                            value={subscriptionType}
                            onChange={(e) => setSubscriptionType(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500/50 outline-none"
                            placeholder="Ex: Assinatura Premium"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-400 mb-1">Descrição</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500/50 outline-none resize-none"
                        placeholder="Descrição do produto..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Logo Upload */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Logo/Ícone</label>
                        <div
                            onClick={() => logoInputRef.current?.click()}
                            className="border border-dashed border-white/20 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors h-24 relative overflow-hidden"
                        >
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-full object-contain" />
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-500">Upload Logo</span>
                                </>
                            )}
                            <input
                                type="file"
                                ref={logoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileSelect(e, setLogoUrl)}
                            />
                        </div>
                    </div>

                    {/* Background Upload */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Imagem de Fundo</label>
                        <div
                            onClick={() => bgInputRef.current?.click()}
                            className="border border-dashed border-white/20 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors h-24 relative overflow-hidden"
                        >
                            {bgUrl ? (
                                <img src={bgUrl} alt="Background" className="w-full h-full object-cover absolute inset-0 opacity-50" />
                            ) : (
                                <>
                                    <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-500">Upload Fundo</span>
                                </>
                            )}
                            <input
                                type="file"
                                ref={bgInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileSelect(e, setBgUrl)}
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? 'Criando...' : 'Criar Anúncio'}
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
