import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import LuxuriousBackground from '../components/LuxuriousBackground';
import { Check, Star, Shield, Zap } from 'lucide-react';
import { initMercadoPago } from '@mercadopago/sdk-react';

// Initialize Mercado Pago
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY || '', { locale: 'pt-BR' });

export default function SrtLogPage() {
    const { user } = useAuth();
    const isSRT = user?.membershipType === 'SRT';
    const [loading, setLoading] = useState<string | null>(null);

    // Theme Colors
    const themeAccent = isSRT ? 'text-red-500' : 'text-gold-500';
    const themeButton = isSRT ? 'bg-red-600 hover:bg-red-500' : 'bg-gold-500 hover:bg-gold-400';
    const themeBorder = isSRT ? 'border-red-500/30' : 'border-gold-500/30';
    const themeGlow = isSRT ? 'shadow-red-500/20' : 'shadow-gold-500/20';
    const plans = [
        {
            id: 'stock',
            name: 'SRT LOG Stock',
            price: 5,
            displayPrice: 'R$ 5',
            period: '/mês',
            description: 'Carros originais, prontos para serem conduzidos.',
            features: [
                '4 carros por mês',
                '1 todo sábado',
                'Acesso à coleção básica',
                'Suporte padrão'
            ],
            icon: Shield,
            highlight: false
        },
        {
            id: 'signature',
            name: 'SRT LOG Signature',
            price: 15,
            displayPrice: 'R$ 15',
            period: '/mês',
            description: 'Carros exclusivos da nova atualização. Modelos selecionados, edição limitada.',
            features: [
                'Modelos Selecionados*',
                'Edição Limitada',
                'Acesso antecipado',
                'Suporte VIP 24/7',
                'Badge Exclusivo no Perfil'
            ],
            icon: Star,
            highlight: true
        },
        {
            id: 'plotted',
            name: 'SRT LOG Plotted',
            price: 10,
            displayPrice: 'R$ 10',
            period: '/mês',
            description: 'Carros personalizados, com identidade SRT.',
            features: [
                '4 carros por mês',
                '1 todo sábado',
                'Personalização exclusiva',
                'Acesso à coleção custom'
            ],
            icon: Zap,
            highlight: false
        }
    ];

    const handleSubscribe = async (plan: typeof plans[0]) => {
        try {
            setLoading(plan.id);
            const response = await fetch('http://localhost:3000/api/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: plan.name,
                    price: plan.price,
                    planId: plan.id
                }),
            });

            const data = await response.json();

            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                alert('Erro ao iniciar pagamento. Tente novamente.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao conectar com o servidor.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen text-white font-sans selection:bg-gold-500/30 relative overflow-x-hidden">
            <LuxuriousBackground />
            <Header />

            <div className="relative z-10 pt-48 pb-20 px-4 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-20 animate-fade-in-down">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                        <Star className={`w-4 h-4 ${themeAccent}`} />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Nova Assinatura Premium</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight flex flex-col items-center">
                        Anunciamos a <br />
                        <div className="relative mt-0 group">
                            <div className={`absolute inset-0 ${isSRT ? 'bg-red-600' : 'bg-gold-500'} blur-[40px] opacity-40 group-hover:opacity-60 transition-opacity duration-500 rounded-full`} />
                            <img
                                src="/assets/srt-log-logo.png"
                                alt="SRT LOG"
                                className="h-48 md:h-64 w-auto relative z-10 drop-shadow-2xl invert brightness-0"
                            />
                        </div>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Nem todo carro criado é igual. Alguns carregam um nome. <br />
                        Escolha seu plano e defina seu legado na elite.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.id}
                            className={`relative group p-8 rounded-3xl backdrop-blur-xl border transition-all duration-500 
                                ${plan.highlight
                                    ? `bg-white/10 ${themeBorder} scale-105 shadow-2xl ${themeGlow} z-10`
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-[1.02]'
                                }
                                ${index === 1 ? 'delay-150' : index === 2 ? 'delay-300' : ''}
                            `}
                        >
                            {plan.highlight && (
                                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full ${themeButton} text-white text-xs font-bold uppercase tracking-widest shadow-lg`}>
                                    Mais Popular
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${themeAccent}`}>
                                <plan.icon className="w-6 h-6" />
                            </div>

                            <h3 className="text-2xl font-serif text-white mb-2">{plan.name}</h3>
                            <p className="text-sm text-gray-400 mb-6 min-h-[40px]">{plan.description}</p>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className={`text-4xl font-bold ${plan.highlight ? themeAccent : 'text-white'}`}>
                                    {plan.displayPrice}
                                </span>
                                <span className="text-gray-500">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                        <Check className={`w-4 h-4 mt-0.5 ${themeAccent}`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={loading === plan.id}
                                className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all transform active:scale-[0.98]
                                    ${plan.highlight
                                        ? `${themeButton} text-white shadow-lg`
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                    }
                                    ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                onClick={() => handleSubscribe(plan)}
                            >
                                {loading === plan.id ? 'Processando...' : 'Assinar Agora'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="text-center mt-16 text-gray-500 text-sm font-light">
                    <p>* A disponibilidade de modelos pode variar conforme cada atualização.</p>
                    <p className="mt-2">Disponível em breve para membros SRT. Assine e receba acesso prioritário à nova coleção.</p>
                </div>
            </div>
        </div>
    );
}
