"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, collection, query, orderBy, limit, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { BELT_MAP } from "@/lib/belts";
import { Header } from "@/components/Header";
import { Watermark } from "@/components/Watermark";
import { Calendar, Newspaper, UserCheck, BookOpen, Award, Heart, ShieldAlert, MapPin, Clock, LogOut } from "lucide-react";

interface UserProfile {
  fullName: string;
  belt: string;
  role: "aluno" | "instrutor" | "sensei";
}

interface ScheduleItem {
  id: string;
  dateStr: string;
  timeStr: string;
  title: string;
  location: string;
  focus: string;
}

interface FeedPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorName: string;
  isSenseiNotice: boolean;
  createdAtStr: string;
  likes: string[];
}

const TREINO_PADRAO: ScheduleItem = {
  id: "default-1",
  dateStr: "Sexta-feira, 02/10/2026",
  timeStr: "19:00 - 20:30",
  title: "Treino de Kihon e Kata",
  location: "Dojo Central DKK",
  focus: "Aperfeiçoamento de Bases e Kata Jion",
};

const FEED_PADRAO: FeedPost[] = [
  {
    id: "post-1",
    title: "Aviso Oficial: Preparatório para o Exame de Faixa",
    content: "Atenção a todos os atletas de graduação Marrom e Roxa: os treinos de sexta-feira focarão na revisão detalhada dos Katas superiores e Bunkai.",
    authorName: "Sensei Jailton",
    isSenseiNotice: true,
    createdAtStr: "02/10/2026",
    likes: [],
  },
  {
    id: "post-2",
    title: "Boas-vindas ao App ProjectOn DKK!",
    content: "Plataforma oficial da associação Dragão Karatê Do Kyokai no ar. Acesse a biblioteca de vídeos e acompanhe a agenda de eventos.",
    authorName: "Administração DKK",
    isSenseiNotice: false,
    createdAtStr: "01/10/2026",
    likes: [],
  },
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nextClass, setNextClass] = useState<ScheduleItem | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          }
        } catch (err) {
          console.error("Erro ao carregar perfil:", err);
        }
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchData() {
      // 1. Próximo treino
      try {
        const scheduleRef = collection(db, "schedule");
        const qSchedule = query(scheduleRef, orderBy("timestamp", "asc"), limit(1));
        const scheduleSnap = await getDocs(qSchedule);
        if (!scheduleSnap.empty) {
          const docData = scheduleSnap.docs[0];
          setNextClass({ id: docData.id, ...docData.data() } as ScheduleItem);
        } else {
          setNextClass(TREINO_PADRAO);
        }
      } catch (err) {
        console.error("Erro ao buscar treinos:", err);
        setNextClass(TREINO_PADRAO);
      }

      // 2. Feed de notícias
      try {
        const feedRef = collection(db, "feed_posts");
        const qFeed = query(feedRef, orderBy("createdAt", "desc"), limit(10));
        const feedSnap = await getDocs(qFeed);
        if (!feedSnap.empty) {
          const posts = feedSnap.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              ...data,
              id: docSnap.id,
              createdAtStr: data.createdAtStr ?? "",
              likes: Array.isArray(data.likes) ? data.likes : [],
            };
          }) as FeedPost[];
          setFeedPosts(posts);
        } else {
          setFeedPosts(FEED_PADRAO);
        }
      } catch (err) {
        console.error("Erro ao carregar feed:", err);
        setFeedPosts(FEED_PADRAO);
      }
    }

    fetchData();
  }, []);

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    const post = feedPosts.find((p) => p.id === postId);
    if (!post) return;

    const hasLiked = post.likes.includes(currentUser.uid);
    const updatedLikes = hasLiked
      ? post.likes.filter((id) => id !== currentUser.uid)
      : [...post.likes, currentUser.uid];

    setFeedPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: updatedLikes } : p)));

    try {
      const postRef = doc(db, "feed_posts", postId);
      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
      });
    } catch (err) {
      console.error("Erro ao atualizar curtida no Firestore:", err);
    }
  };

  const beltInfo = profile ? BELT_MAP[profile.belt] || BELT_MAP["1_kyu_marrom"] : BELT_MAP["1_kyu_marrom"];

  return (
    <div className="min-h-screen bg-dragao-white text-dragao-black flex flex-col relative pb-20">
      <Header />
      <Watermark />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 z-10 space-y-6">
        {/* CARD DO ALUNO / SENSEI */}
        <section className="bg-gradient-to-r from-dragao-black to-neutral-800 text-dragao-white p-5 rounded-2xl shadow-xl relative overflow-hidden border-l-8 border-dragao-red">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-dragao-red bg-dragao-white/10 px-2.5 py-0.5 rounded-full">
                  {profile ? profile.role : "Visitante"}
                </span>
                {currentUser && (
                  <button onClick={() => auth.signOut()} className="text-xs text-neutral-400 hover:text-dragao-red flex items-center gap-1 ml-2">
                    <LogOut className="w-3 h-3" /> Sair
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-black mt-2">{profile ? profile.fullName : "João Paulo O Alipio"}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${beltInfo.colorClass} ${beltInfo.borderClass}`}>
                  Graduação: {beltInfo.label}
                </div>
              </div>
            </div>

            {!currentUser && (
              <div className="flex items-center gap-2">
                <Link href="/cadastro" className="px-4 py-2 bg-dragao-red text-white text-xs font-bold rounded-xl hover:bg-dragao-redHover transition-colors flex items-center gap-1 shadow-md">
                  <UserCheck className="w-4 h-4" /> Cadastrar
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CARD DE PRÓXIMO TREINO */}
        {nextClass && (
          <section className="bg-dragao-gray p-5 rounded-2xl border border-neutral-200 shadow-sm relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-dragao-red font-bold">
                <Calendar className="w-5 h-5" />
                <h3>Próximo Treino Agendado</h3>
              </div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Agenda DKK</span>
            </div>
            <div className="bg-dragao-white p-4 rounded-xl border border-neutral-200 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-lg font-black text-dragao-black">{nextClass.dateStr}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-dragao-red" /> {nextClass.timeStr}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-dragao-red" /> {nextClass.location}</span>
                </div>
                <p className="text-xs text-neutral-500 font-medium pt-1">Foco: {nextClass.focus}</p>
              </div>
              <span className="text-xs bg-dragao-red/10 text-dragao-red font-bold px-3 py-1.5 rounded-lg text-center self-start sm:self-center">
                Confirmado
              </span>
            </div>
          </section>
        )}

        {/* MENU DE ATALHOS RÁPIDOS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Conhecimento", icon: BookOpen, color: "border-dragao-red", href: "/conhecimento" },
            { label: "Avaliações", icon: Award, color: "border-dragao-black", href: "#" },
            { label: "Eventos", icon: Calendar, color: "border-dragao-red", href: "#" },
            { label: "Cadastro", icon: UserCheck, color: "border-dragao-black", href: "/cadastro" },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={`p-4 bg-dragao-white border-2 ${item.color} rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 group active:scale-95`}
            >
              <item.icon className="w-6 h-6 text-dragao-red group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-dragao-black">{item.label}</span>
            </Link>
          ))}
        </section>

        {/* FEED DE NOTÍCIAS E COMUNICADOS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-dragao-black flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-dragao-red" />
              Feed &amp; Comunicados DKK
            </h3>
          </div>

          <div className="space-y-3">
            {feedPosts.map((post) => {
              const isLiked = currentUser ? post.likes.includes(currentUser.uid) : false;
              return (
                <article
                  key={post.id}
                  className={`bg-dragao-white border rounded-2xl p-5 shadow-sm space-y-3 transition-all ${
                    post.isSenseiNotice ? "border-l-8 border-l-dragao-red border-neutral-200" : "border-neutral-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {post.isSenseiNotice && (
                        <span className="bg-dragao-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> AVISO DO SENSEI
                        </span>
                      )}
                      <span className="text-xs font-bold text-neutral-700">{post.authorName}</span>
                    </div>
                    <span className="text-xs text-neutral-400">{post.createdAtStr}</span>
                  </div>

                  <h4 className="font-bold text-dragao-black text-base">{post.title}</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">{post.content}</p>

                  {post.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover rounded-xl border border-neutral-200" />
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                        isLiked ? "text-dragao-red" : "text-neutral-400 hover:text-dragao-red"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-dragao-red" : ""}`} />
                      <span>{post.likes.length} Curtidas</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
