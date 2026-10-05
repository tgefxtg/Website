import Link from "next/link";
import { Mountain } from "lucide-react";
export function Brand() {
  return (
    <Link href="/#main" className="brand" aria-label="Abha Tourist Center home">
      <Mountain size={39} strokeWidth={1.3} />
      <span>
        ABHA<span>TOURIST CENTER</span>
      </span>
    </Link>
  );
}
