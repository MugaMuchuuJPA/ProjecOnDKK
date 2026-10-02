import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-dragao-white/90 backdrop-blur-md border-b-2 border-dragao-red px-4 py-2 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Ir para o painel inicial">
          <Image
            src="/logo-dragao.png"
            alt="Logo do Dragão Karatê Do Kyokai"
            width={367}
            height={520}
            priority
            className="h-11 w-auto"
          />
          <div>
            <h1 className="text-lg md:text-xl font-black text-dragao-black tracking-tight uppercase leading-tight">
              Dragão Karatê Do Kyokai
            </h1>
            <p className="text-xs text-dragao-red font-semibold tracking-wider">PROJECTON DKK</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
