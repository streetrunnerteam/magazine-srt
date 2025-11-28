import { Plus } from 'lucide-react';

interface CreatePostPillProps {
    onClick: () => void;
}

export default function CreatePostPill({ onClick }: CreatePostPillProps) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-gold-500 text-black px-6 py-3 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-105 transition-all duration-300 group animate-fade-in-up"
        >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-bold uppercase tracking-widest text-xs">Criar Post</span>
        </button>
    );
}
