import { HackData, HackType } from '@Apps/terminal/commands/hack/hack.type';

const hackSequences: Record<HackType, HackData[]> = {
  [HackType.Mainframe]: [
    { text: "🔍 Scanning network topology...", type: "info" },
    { text: "📡 Establishing connection to target...", type: "info" },
    { text: "🔓 Bypassing authentication protocols...", type: "progress" },
    { text: "⚡ Exploiting buffer overflow vulnerability...", type: "info" },
    { text: "🛡️ Circumventing intrusion detection...", type: "progress" },
    { text: "🔐 Cracking encryption layer...", type: "info" },
    { text: "👑 Escalating privileges to root...", type: "info" },
    { text: "✅ Access granted! Welcome, Admin.", type: "success" }
  ],
  [HackType.Database]: [
    { text: "🗄️ Connecting to database cluster...", type: "info" },
    { text: "🔍 Enumerating table structures...", type: "progress" },
    { text: "💉 Injecting SQL payload...", type: "info" },
    { text: "🚫 Bypassing WAF filters...", type: "progress" },
    { text: "📊 Extracting sensitive records...", type: "info" },
    { text: "🔒 Decrypting stored passwords...", type: "info" },
    { text: "✅ Database compromised successfully!", type: "success" }
  ],
  [HackType.Satellite]: [
    { text: "🛰️ Acquiring satellite uplink...", type: "info" },
    { text: "📶 Synchronizing orbital parameters...", type: "progress" },
    { text: "🌍 Triangulating ground station...", type: "info" },
    { text: "⚡ Overriding command protocols...", type: "progress" },
    { text: "🎯 Redirecting data stream...", type: "info" },
    { text: "✅ Satellite control established!", type: "success" }
  ]
};

export { hackSequences };