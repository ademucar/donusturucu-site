type Props = {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

export default function PrimaryButton({ onClick, disabled, children }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}