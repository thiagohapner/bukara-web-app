import KontoShell from "@/components/konto/KontoShell";
import PasswortForm from "./PasswortForm";

export default function KontoPasswortPage() {
  return (
    <KontoShell title="Passwort ändern" backHref="/konto" backLabel="Zurück zum Konto">
      <PasswortForm />
    </KontoShell>
  );
}
