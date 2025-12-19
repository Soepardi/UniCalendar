export const AdUnit = ({ slotId, format = "auto" }: { slotId: string, format?: "auto" | "rectangle" | "vertical" }) => {
    return (
        <div className="w-full h-full min-h-[250px] bg-gray-100 dark:bg-zinc-800 border-2 border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center text-gray-400 text-sm">
            <div className="text-center">
                <p className="font-mono text-xs mb-1">ADVERTISEMENT</p>
                <p className="font-bold">Slot: {slotId}</p>
                <p>Format: {format}</p>
            </div>
        </div>
    );
};
