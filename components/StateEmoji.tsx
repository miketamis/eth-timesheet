export default function StateEmoji({ state }: { state: number }) {
  return <span className="text-lg">{["✏️", "📤", "✅", "❌"][state]}</span>;
}
