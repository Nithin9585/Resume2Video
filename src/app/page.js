
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative flex justify-center items-center h-screen overflow-hidden"> 
      <Link href="/resume">
        <Button className="bg-transparent hover:text-blue-300 hover:border-white border-blue-400 border-2 rounded-md hover:scale-110 text-white p-2 transition-all duration-300 ease-in-out cursor-pointer">
          Click here
        </Button>
      </Link>
    </div>
  );
}
