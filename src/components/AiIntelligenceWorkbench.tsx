import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Sparkles,
  AlertOctagon,
  Users,
  Shield,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  Info,
} from 'lucide-react';

export const AiIntelligenceWorkbench: React.FC = () => {
  const { analyzeEmergencyText, createEmergencyReport, setActiveView, setCommandCenterTab } = useDisaster();

  const [inputText, setInputText] = useState<string>(
    'My father is unconscious and we are trapped on the second floor.'
  );
  const [locationText, setLocationText] = useState<string>(
    'Sector Charlie - 148 Maplewood Ave (Water entering ground floor)'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>({
    category: 'Medical + Trapped Person',
    priority: 'CRITICAL',
    peopleAffected: 2,
    requiredResources: ['Ambulance', 'Rescue Team'],
    confidenceScore: 94,
    triageSummary:
      'Identified critical medical distress (unconsciousness) compounded by structural trap on the 2nd floor with rising water.',
    isAiGenerated: true,
  });

  const sampleScenarios = [
    {
      title: 'Unconscious Father & Trapped (Prompt Spec)',
      text: 'My father is unconscious and we are trapped on the second floor.',
      location: '148 Maplewood Ave, Sector Charlie',
    },
    {
      title: 'Collapsed Bridge with Submerged Cars',
      text: 'Bridge near government school collapsed into creek, 3 passenger cars submerged under bridge.',
      location: 'Route 4 Bridge, Sector Alpha',
    },
    {
      title: 'Nursing Home Power & Oxygen Failure',
      text: 'Power generator failed at senior care home. 9 elderly patients on oxygen concentrators running out of battery.',
      location: 'Oakridge Senior Residence, Sector Bravo',
    },
    {
      title: 'Rooftop Flood Stranded Family',
      text: 'Water reached second floor awning. 8 people including two toddlers stranded on flat tin roof.',
      location: 'Terrace Commercial Row, Sector Delta',
    },
  ];

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const res = await analyzeEmergencyText(inputText);
      setAnalysisResult(res);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInjectAsIncident = async () => {
    if (!analysisResult) return;
    await createEmergencyReport({
      emergencyType: analysisResult.category || 'Medical Emergency',
      priority: analysisResult.priority || 'CRITICAL',
      peopleCount: analysisResult.peopleAffected || 2,
      description: inputText,
      locationName: locationText,
    });
    setCommandCenterTab('live_map');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Natural Language Disaster Parsing
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 font-semibold border border-blue-800">
              Gemini 3.8 Flash
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>AI Emergency Intelligence Workbench</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Extracts triage priority, life hazards, estimated affected civilians, and required response assets from unformatted disaster messages.
          </p>
        </div>

        {/* Clear Disclaimer */}
        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 max-w-md">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px] leading-tight font-medium">
            AI-assisted classification — requires human verification. AI assists coordinators but never determines final rescue priority autonomously.
          </span>
        </div>
      </div>

      {/* Main Grid: Input & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Message & Scenario Presets */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white">Emergency Message Input</h3>

          {/* Sample scenario pills */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              Select Preset Disaster Scenario:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleScenarios.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(sc.text);
                    setLocationText(sc.location);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left text-xs transition-colors"
                >
                  <div className="font-semibold text-cyan-300">{sc.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{sc.text}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Raw Civilian Message Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              placeholder="Enter civilian emergency message..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Location Context / GPS Sector
            </label>
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Submit Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Gemini Triage Model...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Emergency</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI Structured Extraction Results */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>AI Triage Output</span>
                {analysisResult && (
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Confidence: {analysisResult.confidenceScore}%
                  </span>
                )}
              </h3>

              <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                Requires Human Verification
              </span>
            </div>

            {analysisResult ? (
              <div className="space-y-4">
                {/* Category & Priority Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                      Category
                    </span>
                    <div className="text-sm font-bold text-white">
                      {analysisResult.category}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                      Recommended Priority
                    </span>
                    <div className="text-sm font-extrabold text-rose-400 font-mono">
                      🔴 {analysisResult.priority}
                    </div>
                  </div>
                </div>

                {/* People Affected & Resources */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                      People Affected
                    </span>
                    <div className="text-xl font-bold font-mono text-amber-400">
                      {analysisResult.peopleAffected} individuals
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                      Confidence Score
                    </span>
                    <div className="text-xl font-bold font-mono text-cyan-400">
                      {analysisResult.confidenceScore}%
                    </div>
                  </div>
                </div>

                {/* Required Resources Needed */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">
                    Required Emergency Resources
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.requiredResources?.map((res: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl bg-blue-950 text-cyan-300 font-semibold text-xs border border-blue-800"
                      >
                        ✓ {res}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clinical / Dispatch Assessment Summary */}
                <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-cyan-300 block">
                    Synthesized Triage Assessment:
                  </span>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {analysisResult.triageSummary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Enter an emergency message and click "Analyze Emergency"
              </div>
            )}
          </div>

          {/* Action: Inject directly into live incident dispatch queue */}
          {analysisResult && (
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleInjectAsIncident}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-800/60 transition-colors flex items-center justify-center gap-2"
              >
                <span>Dispatch Verified Incident to Live Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
