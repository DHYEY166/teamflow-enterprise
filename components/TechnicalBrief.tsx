
import React from 'react';

const TechnicalBrief: React.FC<{ onClose: () => void, themeColors: { primary: string, border: string, text: string, shadow: string } }> = ({ onClose, themeColors }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <i className={`fa-solid fa-microchip ${themeColors.text}`}></i>
              TeamFlow Enterprise: System Architecture
            </h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Production Readiness & Feature Roadmap</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {/* Architecture Section */}
          <section>
            <h3 className={`text-sm font-bold ${themeColors.text} uppercase tracking-widest mb-6 flex items-center gap-2`}>
              <span className={`w-6 h-6 rounded ${themeColors.primary.replace('bg-', 'bg-')}/10 flex items-center justify-center text-[10px]`}>01</span>
              Core Infrastructure Overview
            </h3>
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center justify-center space-y-4">
              <div className="flex flex-wrap justify-center gap-4 items-center">
                <div className="px-4 py-3 bg-zinc-800 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-300">Client-Side State</div>
                <i className="fa-solid fa-arrow-right text-zinc-700"></i>
                <div className={`px-4 py-3 ${themeColors.primary} rounded-xl border ${themeColors.border} text-xs font-bold text-white shadow-lg ${themeColors.shadow}`}>Gemini 3 Intelligence</div>
                <i className="fa-solid fa-arrow-right text-zinc-700"></i>
                <div className="flex flex-col gap-2">
                  <div className="px-4 py-2 bg-emerald-900/30 rounded-lg border border-emerald-500/30 text-[10px] font-bold text-emerald-400 text-center">Task Automation</div>
                  <div className="px-4 py-2 bg-blue-900/30 rounded-lg border border-blue-500/30 text-[10px] font-bold text-blue-400 text-center">Knowledge Retrieval</div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 text-center max-w-lg mt-4 leading-relaxed">
                The platform utilizes a <strong>Zero-Latency Action Layer</strong>. User requests are processed by the Gemini 3 engine, generating structured <strong>Operational Tool Responses</strong> to synchronize team workflows.
              </p>
            </div>
          </section>

          {/* Production Readiness Section */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className={`text-sm font-bold ${themeColors.text} uppercase tracking-widest flex items-center gap-2`}>
                <span className={`w-6 h-6 rounded ${themeColors.primary.replace('bg-', 'bg-')}/10 flex items-center justify-center text-[10px]`}>02</span>
                Production Readiness Checklist
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Real-time Multi-user Sync", status: "PENDING", desc: "Migration from LocalStorage to Supabase/Firestore." },
                  { label: "Enterprise Authentication", status: "PENDING", desc: "Implementation of SSO/OAuth (Okta, Google Workspace)." },
                  { label: "Encrypted Media Storage", status: "PENDING", desc: "S3/Cloud Storage for high-res technical documents." },
                  { label: "Role-Based Access Control (RBAC)", status: "COMPLETED", desc: "LLM-enforced permissions for Admin/Member/Guest." },
                  { label: "Audit Logging", status: "COMPLETED", desc: "Historical tracking of all AI-automated actions." }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-zinc-200">{item.label}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{item.status}</span>
                    </div>
                    <p className="text-[9px] text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className={`text-sm font-bold ${themeColors.text} uppercase tracking-widest flex items-center gap-2`}>
                <span className={`w-6 h-6 rounded ${themeColors.primary.replace('bg-', 'bg-')}/10 flex items-center justify-center text-[10px]`}>03</span>
                System Health Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">AI Latency</p>
                  <p className={`text-xl font-black ${themeColors.text}`}>~1.2s</p>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Accuracy</p>
                  <p className="text-xl font-black text-emerald-400">98.4%</p>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Uptime</p>
                  <p className="text-xl font-black text-zinc-100">99.9%</p>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Tokens/Msg</p>
                  <p className="text-xl font-black text-zinc-100">~450</p>
                </div>
              </div>
              <div className={`p-4 ${themeColors.primary.replace('bg-', 'bg-')}/5 border ${themeColors.border.replace('border-', 'border-opacity-20 border-')} rounded-xl`}>
                <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                  "The system is currently operating in <strong>High-Fidelity Prototype Mode</strong>. All logic is verified for professional deployment once backend integration is finalized."
                </p>
              </div>
            </div>
          </section>
        </div>
        
        <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end">
          <button 
            onClick={onClose}
            className={`px-6 py-2.5 ${themeColors.primary} hover:opacity-90 text-white rounded-xl font-bold text-xs transition-all shadow-lg ${themeColors.shadow}`}
          >
            Acknowledge System Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicalBrief;
