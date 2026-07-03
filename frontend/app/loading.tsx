export default function RootLoading() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#16826B]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-white/20 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-white/70 text-sm font-medium tracking-wide animate-pulse">Loading Dravya Labs...</p>
            </div>
        </div>
    );
}
