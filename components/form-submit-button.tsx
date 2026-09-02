export function FormSubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="submit" className="core_button core_button--primary">
      {children}
    </button>
  );
}
