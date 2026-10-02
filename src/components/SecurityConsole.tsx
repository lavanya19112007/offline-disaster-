import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { UserRole } from '../types/disaster';
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  FileCheck2,
  Users,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const SecurityConsole: React.FC = () => {
  const { auditLogs, userRole, setUserRole } = useDisaster();

  const [showDecrypted, setShowDecrypted] = useState<boolean>(true);

  const rolesMatrix = [
    {
      role: 'Citizen',
      canSendSos: true,
      canViewOwnReports: true,
      canViewPublicRelays: false,
      canDispatchTeams: false,
      canVerifyAi: false,
      canManageUsers: false,
    },
    {
      role: 'Responder',
      canSendSos: true,
      canViewOwnReports: true,
      canViewPublicRelays: true,
      canDispatchTeams: false,
      canVerifyAi: false,
      canManageUsers: false,
    },
    {
      role: 'Coordinator',
      canSendSos: true,
      canViewOwnReports: true,
      canViewPublicRelays: true,
      canDispatchTeams: true,
      canVerifyAi: true,
      canManageUsers: false,
    },
    {
      role: 'Administrator',
      canSendSos: true,
      canViewOwnReports: true,
      canViewPublicRelays: true,
      canDispatchTeams: true,
      canVerifyAi: true,
      canManageUsers: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Cryptographic Integrity & Data Protection
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800">
              AES-256-GCM / SHA-256 Verified
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span>Security, Privacy & Cryptographic Audit Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-knowledge mesh forwarding, anonymous device fingerprints, and immutable action logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Role:</span>
          <span className="text-xs font-bold text-cyan-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            {userRole}
          </span>
        </div>
      </div>

      {/* Grid: 1. Encrypted Packet Inspector & 2. Role Access Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Encrypted Packet Inspector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>P2P Packet Payload Inspector</span>
              </h3>

              <button
                onClick={() => setShowDecrypted(!showDecrypted)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
              >
                {showDecrypted ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Peer Node Ciphertext</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Decrypt as Command Coordinator</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {showDecrypted
                ? 'Authorized View: Message decrypted using Command Center ephemeral private key.'
                : 'Zero-Knowledge View: Intermediate mesh relay nodes only see encrypted bytes and anonymous routing headers.'}
            </p>

            {/* Code / Hex viewer box */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <div className="text-[10px] text-slate-500 flex justify-between border-b border-slate-800/80 pb-1.5">
                <span>HEADER: [DEST: GATEWAY-SAT] [HOPS: 3] [ANON_ID: NODE-7F12]</span>
                <span className="text-cyan-400">CIPHER: AES-GCM-256</span>
              </div>

              {showDecrypted ? (
                <div className="space-y-1.5 text-emerald-400">
                  <div>// Decrypted Payload:</div>
                  <div className="text-white">
                    {`{\n  "emergencyType": "Medical Emergency",\n  "priority": "CRITICAL",\n  "peopleAffected": 2,\n  "text": "My father is unconscious and trapped on 2nd floor",\n  "gps": "34.0522 N, 118.2437 W",\n  "integrityHash": "sha256:8f2a41d99b"\n}`}
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-slate-500 break-all">
                  <div className="text-amber-400">// Encrypted In-Transit Ciphertext (Zero Knowledge):</div>
                  <div>
                    6f8a41bc992d11e4a3b821099238fa01928472bb582a938cde110091823746a
                    918274619bca00129482736152a9c8e19283746192837461928374619283746
                    019283746192837461928374619283746192837461928374619283746192837
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Personal identifying data is stripped at the device level. Only anonymous device tokens and emergency triage vectors are broadcast.
            </span>
          </div>
        </div>

        {/* Role-Based Access Control (RBAC) Matrix */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Role-Based Access Control Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enforces least-privilege principles across citizens, responders, and coordinators
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2">Role</th>
                  <th className="py-2 text-center">Send SOS</th>
                  <th className="py-2 text-center">Live Map</th>
                  <th className="py-2 text-center">Dispatch</th>
                  <th className="py-2 text-center">Verify AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rolesMatrix.map((r, i) => (
                  <tr
                    key={i}
                    onClick={() => setUserRole(r.role as UserRole)}
                    className={`cursor-pointer transition-colors ${
                      userRole === r.role ? 'bg-cyan-950/40 font-bold text-cyan-300' : 'text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 font-semibold">
                      {r.role} {userRole === r.role && '★'}
                    </td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                    <td className="py-2.5 text-center">
                      {r.canViewPublicRelays ? (
                        <span className="text-emerald-400">✓</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center">
                      {r.canDispatchTeams ? (
                        <span className="text-emerald-400">✓</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center">
                      {r.canVerifyAi ? (
                        <span className="text-emerald-400">✓</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Click any row to switch your simulation context to that role.
          </p>
        </div>
      </div>

      {/* Tamper-Evident Security Audit Logs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Immutable Audit Logs</span>
            </h3>
            <p className="text-xs text-slate-400">
              Every priority override, dispatch action, and human certification is cryptographically hashed
            </p>
          </div>

          <span className="text-xs text-cyan-400 font-mono">
            {auditLogs.length} Security Events Recorded
          </span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold">{log.action}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">{log.actorRole} ({log.actorId})</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                </div>
                <p className="text-slate-200">{log.details}</p>
              </div>

              <div className="font-mono text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800 shrink-0">
                {log.securityHash}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
