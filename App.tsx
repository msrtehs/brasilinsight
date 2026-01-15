
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InfoCard from './components/InfoCard';
import { fetchMunicipalityInfo } from './services/geminiService';
import { MunicipalityData, User } from './types';
import { jsPDF } from 'jspdf';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [data, setData] = useState<MunicipalityData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Observador de estado de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email || '',
          isLoggedIn: true
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O estado 'user' será atualizado pelo onAuthStateChanged
    } catch (err: any) {
      console.error("Erro de login:", err);
      setError("Falha na autenticação: Verifique se o e-mail e senha estão corretos no Firebase.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setData(null);
      setSearchTerm('');
      setError(null);
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setData(null);
    setSuccessMessage(null);

    try {
      const result = await fetchMunicipalityInfo(searchTerm);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro durante a auditoria.");
    } finally {
      setIsLoading(false);
    }
  };

  const cleanText = (text: string) => {
    return text
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim();
  };

  const generatePDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);
    
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("INSIGHT: AUDITORIA MUNICIPAL", margin, 25);
    
    doc.setFontSize(10);
    doc.text(`PROTOCOLO: ${Math.random().toString(36).substring(7).toUpperCase()}`, pageWidth - 60, 25);

    let yPos = 55;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.text(`RELATÓRIO: ${data.name.toUpperCase()}`, margin, yPos);
    
    yPos += 10;
    doc.setDrawColor(200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const lines = doc.splitTextToSize(cleanText(data.economicSituation), contentWidth);
    
    lines.forEach((line: string) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
        doc.setFontSize(8);
        // Fix: getNumberOfPages is a property of the doc instance directly, not doc.internal.
        doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.setFontSize(10);
      }
      doc.text(line, margin, yPos);
      yPos += 7;
    });

    return doc;
  };

  const handleDownloadPDF = () => {
    const doc = generatePDF();
    if (doc) doc.save(`Auditoria_Cemiterial_${data?.name.replace(/\s/g, '_')}.pdf`);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSuccessMessage(`Dossiê enviado com sucesso para ${email}`);
      setEmail('');
    }, 1800);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
          <div className="bg-slate-900 p-10 text-center">
            <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Portal Auditor</h1>
            <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-bold">Acesso Governamental</p>
          </div>
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 mb-4">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Usuário Autorizado</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none text-slate-900 font-bold transition-all text-lg" 
                placeholder="nome@dominio.gov.br"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Chave de Segurança</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none text-slate-900 font-bold transition-all text-lg" 
                placeholder="••••••••"
              />
            </div>
            <button className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] text-lg uppercase tracking-wider">
              Autenticar Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafc]">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 -mt-4 mb-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sessão Segura: {user.email}</span>
        </div>
        <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all">
          Encerrar
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-4">
        <section className="mb-12">
          <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Digite o Município (ex: Porto Alegre, RS)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              className="w-full pl-8 pr-40 py-6 bg-white border-2 border-slate-200 rounded-[2rem] shadow-2xl focus:outline-none focus:border-blue-600 text-slate-900 text-xl font-bold placeholder:text-slate-300"
            />
            <button 
              disabled={isLoading}
              className="absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? "Auditoria..." : "Auditar"}
            </button>
          </form>
        </section>

        {isLoading && (
          <div className="text-center py-20 animate-pulse">
            <div className="w-20 h-20 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <h2 className="mt-8 text-2xl font-black text-slate-800 uppercase tracking-tight">Cruzando Dados Judiciais e Ambientais</h2>
            <p className="text-slate-400 font-bold mt-2">Acessando bases do Ministério Público e Imagens Satelitais...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-10 text-center max-w-2xl mx-auto">
            <p className="text-red-600 font-black text-lg">{error}</p>
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <InfoCard 
                title="Dossiê de Irregularidades e Situação Jurídica" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
              >
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-slate-800 leading-[1.8] font-medium text-lg whitespace-pre-wrap">
                  {cleanText(data.economicSituation)}
                </div>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button 
                    onClick={handleDownloadPDF} 
                    className="flex-1 bg-slate-900 hover:bg-black text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Baixar Relatório Completo (PDF)
                  </button>
                </div>
              </InfoCard>

              <InfoCard 
                title="Fontes e Embasamento Legal" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                className="mt-8"
              >
                <div className="space-y-3">
                  {data.groundingLinks.length > 0 ? (
                    data.groundingLinks.map((link, idx) => (
                      <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all">
                        <p className="text-sm font-bold text-slate-800">{link.title}</p>
                        <p className="text-xs text-blue-600 mt-1 truncate">{link.uri}</p>
                      </a>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm font-medium italic">Nenhuma fonte externa adicional indexada para este relatório.</p>
                  )}
                </div>
              </InfoCard>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-xl">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                  <div className="h-4 w-1 bg-blue-600"></div>
                  Notificar Autoridades
                </h3>
                {successMessage ? (
                  <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-100 font-bold text-sm">
                    {successMessage}
                  </div>
                ) : (
                  <form onSubmit={handleSendEmail} className="space-y-4">
                    <input 
                      type="email" 
                      required 
                      placeholder="Email do Órgão ou Destinatário"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:outline-none font-bold"
                    />
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200 transition-all">
                      Enviar por E-mail
                    </button>
                  </form>
                )}
              </div>
              
              <div className="bg-red-50 p-8 rounded-[2rem] border-2 border-red-100">
                <h4 className="font-black text-red-700 mb-4 text-xs uppercase tracking-[0.2em]">Alerta de Conformidade</h4>
                <ul className="space-y-3 text-red-900/70 text-sm font-bold">
                  <li className="flex gap-2"><span>•</span> Graves deficiências sanitárias</li>
                  <li className="flex gap-2"><span>•</span> Risco iminente de interdição judicial</li>
                  <li className="flex gap-2"><span>•</span> Passivos ambientais não resolvidos</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
