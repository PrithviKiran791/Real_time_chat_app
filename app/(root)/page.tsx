import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Button asChild size="lg">
        <Link href="/conversations">
          <MessageSquarePlus className="mr-2 size-4" />
          Open conversations
        </Link>
      </Button>
    </div>
  );
}
