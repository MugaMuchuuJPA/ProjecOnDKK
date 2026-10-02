"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Watermark } from "@/components/Watermark";
import { Search, BookOpen, Video, Download, ExternalLink } from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  category: "Apostila" | "Instrução" | "Regulamento";
  beltTarget: string;
  driveViewUrl: string;
  driveDownloadUrl: string;
  fileSize: string;
}

interface VideoItem {
  id: string;
  title: string;
  category: "Katas" | "Kihon" | "Kumite" | "Equipamentos" | "Instruções";
  youtubeEmbedId: string;
  duration: string;
  description: string;
}

// Dados de exemplo. Trocar pelos links reais do Google Drive e pelos IDs reais do YouTube da DKK.
const documents: DocumentItem[] = [
  {
    id: "doc-1",
    title: "Apostila Oficial DKK - Graduação Marrom (1° Kyu)",
    category: "Apostila",
    beltTarget: "Marrom (1° Kyu)",
    driveViewUrl: "https://drive.google.com/file/d/123456789/view",
    driveDownloadUrl: "https://drive.google.com/uc?export=download&id=123456789",
    fileSize: "3.4 MB",
  },
  {
    id: "doc-2",
    title: "Manual Didático de Equipamentos: Makiwara e Aparadores",
    category: "Instrução",
    beltTarget: "Geral",
    driveViewUrl: "https://drive.google.com/file/d/987654321/view",
    driveDownloadUrl: "https://drive.google.com/uc?export=download&id=987654321",
    fileSize: "1.8 MB",
  },
  {
    id: "doc-3",
    title: "Regulamento Técnico de Arbitragem e Competição DKK",
    category: "Regulamento",
    beltTarget: "Sensei / Instrutor",
    driveViewUrl: "https://drive.google.com/file/d/456789123/view",
    driveDownloadUrl: "https://drive.google.com/uc?export=download&id=456789123",
    fileSize: "2.1 MB",
  },
];

const videos: VideoItem[] = [
  {
    id: "vid-1",
    title: "Kata Jion completo - Execução e Ritmo",
    category: "Katas",
    youtubeEmbedId: "",
    duration: "04:15",
    description: "Detalhamento passo a passo do Kata Jion com atenção às bases e defesas.",
  },
  {
    id: "vid-2",
    title: "Treino de Kihon Avançado - Gyaku Zuki & Kime",
    category: "Kihon",
    youtubeEmbedId: "",
    duration: "08:30",
    description: "Orientações do Sensei Jailton sobre geração de potência e rotação de quadril.",
  },
  {
    id: "vid-3",
    title: "Uso correto de Aparadores e Saco de Pancadas",
    category: "Equipamentos",
    youtubeEmbedId: "",
    duration: "06:10",
    description: "Como estruturar o treino de impacto preservando articulações e aumentando explosão.",
  },
];

export default function ConhecimentoPage() {
  const [activeTab, setActiveTab] = useState<"docs" | "videos">("docs");
  const [searchTerm, setSearchTerm] = useState("");

  const termo = searchTerm.toLowerCase();

  const filteredDocs = documents.filter(
    (d) => d.title.toLowerCase().includes(termo) || d.beltTarget.toLowerCase().includes(termo)
  );

  const filteredVideos = videos.filter(
    (v) => v.title.toLowerCase().includes(termo) || v.description.toLowerCase().includes(termo)
  );

  return (
    <div className="min-h-screen bg-dragao-white text-dragao-black flex flex-col relative pb-20">
      <Header />
      <Watermark />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 z-10 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-dragao-black uppercase tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-dragao-red" />
            Aba de Conhecimento DKK
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Biblioteca de apostilas do Google Drive e acervo de vídeos do YouTube da associação.
          </p>
        </div>

        <div className="space-y-3 bg-dragao-gray p-4 rounded-2xl border border-neutral-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, Kata ou graduação..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-dragao-red"
              />
            </div>

            <div className="flex items-center gap-1 bg-neutral-200 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("docs")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === "docs" ? "bg-dragao-red text-white" : "text-neutral-600 hover:text-black"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Apostilas (Drive)
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === "videos" ? "bg-dragao-red text-white" : "text-neutral-600 hover:text-black"
                }`}
              >
                <Video className="w-3.5 h-3.5" /> Vídeos (YouTube)
              </button>
            </div>
          </div>
        </div>

        {activeTab === "docs" && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((docItem) => (
              <div
                key={docItem.id}
                className="bg-white border-2 border-neutral-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-dragao-red transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-dragao-red/10 text-dragao-red px-2 py-0.5 rounded-md">
                      {docItem.category}
                    </span>
                    <span className="text-xs text-neutral-400 font-semibold">{docItem.fileSize}</span>
                  </div>
                  <h3 className="font-bold text-dragao-black text-sm">{docItem.title}</h3>
                  <p className="text-xs text-neutral-500">Público-alvo: <strong>{docItem.beltTarget}</strong></p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                  <a
                    href={docItem.driveViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-neutral-100 text-neutral-800 text-xs font-bold rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Visualizar
                  </a>
                  <a
                    href={docItem.driveDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-dragao-red text-white text-xs font-bold rounded-xl hover:bg-dragao-redHover transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "videos" && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVideos.map((vidItem) => (
              <div
                key={vidItem.id}
                className="bg-white border-2 border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-dragao-red transition-all"
              >
                <div className="relative aspect-video bg-black">
                  {vidItem.youtubeEmbedId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${vidItem.youtubeEmbedId}`}
                      title={vidItem.title}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-neutral-300">
                      Vídeo em breve
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-dragao-black text-white px-2 py-0.5 rounded-md">
                      {vidItem.category}
                    </span>
                    <span className="text-xs text-neutral-400 font-semibold">{vidItem.duration}</span>
                  </div>
                  <h3 className="font-bold text-dragao-black text-sm">{vidItem.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{vidItem.description}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
