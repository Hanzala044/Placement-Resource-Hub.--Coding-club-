import Image from "next/image";

/**
 * Single source of truth for the brand mark, used in the sidebar and
 * anywhere else the logo appears — swap the markup here once a final
 * logo asset (e.g. /public/logo.png) is added, instead of hunting
 * through every usage.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm shadow-black/5 ${className}`}>
      <Image 
        src="/logo.png" 
        alt="Logo" 
        width={32} 
        height={32} 
        className="h-full w-full object-contain p-1" 
      />
    </div>
  );
}
