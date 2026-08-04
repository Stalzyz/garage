export function SectionHeader({
  number,
  title,
  theme = "light"
}: {
  number: string;
  title: string;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  
  return (
    <div className={`flex items-baseline gap-4 mb-16 border-b pb-6 ${isDark ? "border-white/10" : "border-black/10"}`}>
      <span className={`font-mono text-xs font-bold tracking-widest ${isDark ? "text-[#FAFAF8]/50" : "text-[#050505]/50"}`}>
        {number} —
      </span>
      <h3 className={`text-xl md:text-3xl font-sans tracking-tight ${isDark ? "text-[#FAFAF8]" : "text-[#050505]"}`}>
        {title}
      </h3>
    </div>
  );
}
