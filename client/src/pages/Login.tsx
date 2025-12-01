import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo-mgzn.png';
import logoSrt from '../assets/logo-srt.png';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loginAsVisitor } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

    const membershipType = location.state?.membershipType || localStorage.getItem('lastMembershipType') || 'MAGAZINE';
    const isSRT = membershipType === 'SRT';

    const onSubmit = async (data: LoginForm) => {
        try {
            const response = await api.post('/auth/login', data);
            login(response.data.token, response.data.user);
            navigate('/feed');
        } catch (error: any) {
            console.error('Login failed', error);
            setError('root', {
                message: error.response?.data?.error || 'Falha ao entrar. Verifique suas credenciais.',
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4">
            <ForgotPasswordModal
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
                isSRT={isSRT}
            />

            <div className={`z-10 w-full max-w-md glass-panel rounded-2xl p-10 relative overflow-hidden group ${isSRT ? 'border-red-600/50 bg-black/90' : 'border-gold-500/30'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${isSRT ? 'from-red-900/20 via-black to-red-900/10' : 'from-gold-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
                {isSRT && (
                    // eslint-disable-next-line react-dom/no-unsafe-inline-style
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(#cc0000 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }} />
                )}

                <div className="text-center mb-10 relative z-10">
                    <img
                        src={isSRT ? logoSrt : logo}
                        alt={isSRT ? "SRT" : "MAGAZINE"}
                        className={`mx-auto mb-6 ${isSRT ? 'h-20 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]' : 'h-32 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]'}`}
                    />
                    <h2 className={`text-3xl font-bold tracking-wide ${isSRT ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-500 drop-shadow-[0_0_10px_rgba(220,20,60,0.5)]' : 'text-gradient-gold'}`}>
                        {isSRT ? 'ACESSO MEMBRO' : 'Bem-vindo à Elite'}
                    </h2>
                    <p className="text-gray-400 text-sm mt-3 font-light tracking-widest uppercase">
                        {isSRT ? 'Street Runner Team' : 'Suas credenciais para o inatingível.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                    <div>
                        <label className={`block text-xs uppercase tracking-widest mb-2 font-bold ${isSRT ? 'text-red-400' : 'text-gold-300'}`}>Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white focus:outline-none transition-all duration-300 placeholder-gray-600 
                                ${isSRT
                                    ? 'border-red-500/20 focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(220,20,60,0.1)]'
                                    : 'border-gold-500/20 focus:border-gold-500/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                                }`}
                            placeholder="voce@exemplo.com"
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className={`block text-xs uppercase tracking-widest font-bold ${isSRT ? 'text-red-400' : 'text-gold-300'}`}>Senha</label>
                            <button
                                type="button"
                                onClick={() => setIsForgotPasswordOpen(true)}
                                className={`text-xs hover:underline ${isSRT ? 'text-red-400/70 hover:text-red-400' : 'text-gold-400/70 hover:text-gold-400'}`}
                            >
                                Esqueci minha senha
                            </button>
                        </div>
                        <input
                            {...register('password')}
                            type="password"
                            className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white focus:outline-none transition-all duration-300 placeholder-gray-600 
                                ${isSRT
                                    ? 'border-red-500/20 focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(220,20,60,0.1)]'
                                    : 'border-gold-500/20 focus:border-gold-500/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                                }`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full mt-6 ${isSRT ? 'btn-srt' : 'btn-primary'}`}
                    >
                        {isSubmitting ? 'Autenticando...' : 'Entrar'}
                    </button>
                    {errors.root && <p className="text-red-400 text-sm text-center mt-4">{errors.root.message}</p>}
                </form>

                <div className="mt-4 text-center relative z-10">
                    <button
                        onClick={() => {
                            loginAsVisitor();
                            navigate('/feed');
                        }}
                        className="text-gray-400 hover:text-white text-xs uppercase tracking-widest transition-colors"
                    >
                        Entrar como Visitante
                    </button>
                </div>

                <div className="mt-8 text-center relative z-10">
                    <p className="text-gray-500 text-xs tracking-wide">
                        Ainda não é membro?
                        <Link
                            to="/register"
                            state={{ membershipType }}
                            className={`font-bold ml-1 transition-colors ${isSRT ? 'text-red-400 hover:text-red-300' : 'text-gold-400 hover:text-gold-300'}`}
                        >
                            Criar Conta
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
