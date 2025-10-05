import { Loader2 } from "lucide-react";
import React from "react";

function Loader() {
  return (
    <div className="flex justify-center items-center">
      <Loader2 className="animate-spin" size={4} />
    </div>
  );
}

export default Loader;
