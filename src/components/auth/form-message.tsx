type FormMessageProps = {
  message: string | null;
  tone?: "error" | "success";
};

export function FormMessage({ message, tone = "error" }: FormMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p className={`form-message ${tone}`} role="status">
      {message}
    </p>
  );
}

