"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Header } from "@/components/Header";
import { Watermark } from "@/components/Watermark";
import { User, Shield, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";

const inputBase =
  "w-full p-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-dragao-red";

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Passo 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");

  // Passo 2 (responsável, só para menores)
  const [guardianName, setGuardianName] = useState("");
  const [guardianCpf, setGuardianCpf] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianKinship, setGuardianKinship] = useState("");
  const [guardianTermAccepted, setGuardianTermAccepted] = useState(false);

  // Passo 3
  const [belt, setBelt] = useState("7_kyu_branca");
  const [dojoUnit, setDojoUnit] = useState("Sede Principal");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const isMinor = (): boolean => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age < 18;
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!fullName || !email || !password || !birthDate || !phone) {
        setError("Preencha todos os campos obrigatórios do Passo 1.");
        return;
      }
      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
    }
    if (step === 2 && isMinor()) {
      if (!guardianName || !guardianCpf || !guardianPhone || !guardianKinship || !guardianTermAccepted) {
        setError("Para menores de 18 anos, todos os dados do responsável e o aceite do termo são obrigatórios.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!termsAccepted) {
      setError("Você precisa aceitar os Termos de Uso e o Regulamento DKK.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const minor = isMinor();

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName,
        email,
        birthDate,
        phone,
        isMinor: minor,
        guardianData: minor
          ? {
              name: guardianName,
              cpf: guardianCpf,
              phone: guardianPhone,
              kinship: guardianKinship,
              acceptedTermAt: new Date().toISOString(),
            }
          : null,
        belt,
        // Todo cadastro novo nasce como aluno. Só o Sensei promove alguém a instrutor/sensei.
        role: "aluno",
        dojoUnit,
        termsAcceptedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        setError("Este e-mail já está cadastrado.");
      } else if (code === "auth/invalid-email") {
        setError("E-mail inválido.");
      } else if (code === "auth/unauthorized-domain") {
        setError("Domínio não autorizado no Firebase. Avise o administrador do sistema.");
      } else {
        setError("Não foi possível concluir o cadastro. Confira os dados e tente de novo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dragao-white text-dragao-black flex flex-col relative pb-20">
      <Header />
      <Watermark />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 z-10 my-4">
        <div className="bg-dragao-white border-2 border-dragao-red rounded-2xl p-6 shadow-lg space-y-6">
          <div>
            <h2 className="text-xl font-black text-dragao-black uppercase tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-dragao-red" />
              Cadastro de Atleta / Membro
            </h2>
            <p className="text-xs text-neutral-500 mt-1">Preencha os passos para criar seu perfil DKK</p>
          </div>

          <div className="flex items-center justify-between border-b pb-4 border-neutral-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === i
                      ? "bg-dragao-red text-dragao-white"
                      : step > i
                      ? "bg-dragao-black text-dragao-white"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {step > i ? <CheckCircle className="w-4 h-4" /> : i}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">
                  {i === 1 ? "Pessoais" : i === 2 ? "Maioridade" : "Graduação"}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-dragao-red p-3 rounded text-xs text-dragao-red font-bold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* PASSO 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-dragao-red uppercase">Passo 1: Dados pessoais</h3>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Nome completo *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex.: João Paulo O Alipio"
                  className={`${inputBase} bg-neutral-50`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className={`${inputBase} bg-neutral-50`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Senha *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={`${inputBase} bg-neutral-50`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(83) 99999-9999"
                    className={`${inputBase} bg-neutral-50`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Data de nascimento *</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={`${inputBase} bg-neutral-50`}
                />
              </div>
            </div>
          )}

          {/* PASSO 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-dragao-red uppercase">Passo 2: Verificação de maioridade</h3>

              {isMinor() ? (
                <div className="space-y-4 bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <Shield className="w-5 h-5 text-amber-700 shrink-0" />
                    <span>Menor de 18 anos: os dados do responsável legal são obrigatórios.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Nome do responsável legal *</label>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Nome do pai, mãe ou tutor legal"
                      className={`${inputBase} bg-white`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">CPF do responsável *</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={guardianCpf}
                        onChange={(e) => setGuardianCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className={`${inputBase} bg-white`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Telefone de emergência *</label>
                      <input
                        type="tel"
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        placeholder="(83) 99999-9999"
                        className={`${inputBase} bg-white`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Grau de parentesco *</label>
                    <select
                      value={guardianKinship}
                      onChange={(e) => setGuardianKinship(e.target.value)}
                      className={`${inputBase} bg-white`}
                    >
                      <option value="">Selecione...</option>
                      <option value="Pai/Mãe">Pai / Mãe</option>
                      <option value="Tutor Legal">Tutor legal</option>
                      <option value="Avô/Avó">Avô / Avó</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <label className="flex items-start gap-2 text-xs text-neutral-700 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={guardianTermAccepted}
                      onChange={(e) => setGuardianTermAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-dragao-red focus:ring-dragao-red"
                    />
                    <span>
                      Eu, como responsável legal, autorizo a participação do menor nos treinos e eventos da associação DKK.
                    </span>
                  </label>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Maior de idade. Pode seguir sem dados de responsável.</span>
                </div>
              )}
            </div>
          )}

          {/* PASSO 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-dragao-red uppercase">Passo 3: Graduação e dojo</h3>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Graduação atual *</label>
                <select
                  value={belt}
                  onChange={(e) => setBelt(e.target.value)}
                  className={`${inputBase} bg-neutral-50 font-semibold`}
                >
                  <option value="7_kyu_branca">Branca (7° Kyu)</option>
                  <option value="6_kyu_amarela">Amarela (6° Kyu)</option>
                  <option value="5_kyu_vermelha">Vermelha (5° Kyu)</option>
                  <option value="4_kyu_laranja">Laranja (4° Kyu)</option>
                  <option value="3_kyu_verde">Verde (3° Kyu)</option>
                  <option value="2_kyu_roxa">Roxa (2° Kyu)</option>
                  <option value="1_kyu_marrom">Marrom (1° Kyu)</option>
                  <option value="1_dan_preta">Preta (1° Dan em diante)</option>
                </select>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs text-neutral-600">
                Seu acesso inicial é de <strong>Aluno</strong>. Acessos de Instrutor e Sensei são liberados pelo Sensei responsável.
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Unidade / Dojo DKK *</label>
                <input
                  type="text"
                  value={dojoUnit}
                  onChange={(e) => setDojoUnit(e.target.value)}
                  placeholder="Ex.: Sede Principal"
                  className={`${inputBase} bg-neutral-50`}
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-neutral-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-dragao-red focus:ring-dragao-red"
                />
                <span>
                  Li e aceito os <strong>Termos de Uso, Estatuto e Regulamento Interno</strong> da Dragão Karatê Do Kyokai.
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-neutral-100"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-dragao-red text-dragao-white font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-dragao-redHover transition-colors shadow-md"
              >
                Próximo <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-dragao-black text-dragao-white font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-neutral-800 transition-colors shadow-md disabled:opacity-50"
              >
                {loading ? "Finalizando..." : "Concluir cadastro"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
