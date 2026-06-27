import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-4">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#1e6bff]/10 text-[#1e6bff]">
              <Compass className="h-7 w-7" />
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#05070d]">Page not found</h1>
          <p className="mt-3 text-sm text-gray-600">
            The page you're looking for doesn't exist or may have moved.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-md bg-[#1e6bff] text-white font-medium shadow-md transition-colors hover:bg-[#1a5fe6]"
          >
            Back to home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
