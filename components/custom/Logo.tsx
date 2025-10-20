import { APP_NAME } from "@/consts";
import Link from "next/link";

export function Logo() {
    return (
        <div className="flex justify-start items-center">
        <Link
          href={"/"}
          className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-5 font-serif"
        >
          {APP_NAME}
        </Link>
        <div className="ml-1 sm:ml-2 flex flex-col font-medium items-start justify-center text-[8px] sm:text-[10px] leading-tight text-muted-foreground border-l pl-1 sm:pl-2">
          <span>BETA</span>
          <span>1.0.1</span>
        </div>
      </div>
    );
}