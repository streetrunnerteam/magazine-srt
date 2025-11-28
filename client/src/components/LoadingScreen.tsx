

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
            <div className="relative">
                <h1 className="text-4xl md:text-6xl font-serif font-bold animate-gold-shimmer tracking-[0.2em]">
                    MAGAZINE
                </h1>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-gold-400/80 text-sm uppercase tracking-[0.3em] font-light animate-pulse">
                    Carregando...
                </p>
            </div>
        </div>
    );
}
