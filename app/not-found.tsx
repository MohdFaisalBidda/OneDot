import { NotFound as NotFoundComponent } from "@/components/custom/NotFound";

export default function NotFound() {
  return (
    <NotFoundComponent 
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      className="min-h-screen"
    />
  );
}
