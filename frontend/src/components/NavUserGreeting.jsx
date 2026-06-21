export default function NavUserGreeting({ name, className = '' }) {
  if (!name) return null;

  return (
    <span
      className={`font-semibold text-slate-700 truncate ${className}`}
      title={`Hi, ${name}`}
    >
      Hi, <span className="text-indigo-600">{name}</span>
    </span>
  );
}
