import Link from "next/link";
import Footer from "@/components/Footer";

export default function DatenschutzPage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Datenschutz</span>
          </nav>
        </div>

        <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-10">Datenschutzerklärung</h1>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">1. Verantwortlicher</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>BuKaRa GmbH</strong><br />
              Siemensstraße 24<br />
              72280 Dornstetten<br />
              <br />
              Tel.: +49 7443 / 9661-0<br />
              E-Mail: info@bukara.de<br />
              Web: www.bukara.de<br />
              <br />
              Geschäftsführer: Stefan Burkhardt, Felix Burkhardt
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">2. Allgemeines zur Datenverarbeitung</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung personenbezogener Daten erfolgt regelmäßig nur nach Einwilligung des Nutzers. Eine Ausnahme gilt in solchen Fällen, in denen eine vorherige Einholung einer Einwilligung aus tatsächlichen Gründen nicht möglich ist und die Verarbeitung der Daten durch gesetzliche Vorschriften gestattet ist.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">3. Rechtsgrundlagen der Datenverarbeitung</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Soweit wir für Verarbeitungsvorgänge personenbezogener Daten eine Einwilligung der betroffenen Person einholen, dient Art. 6 Abs. 1 lit. a DSGVO als Rechtsgrundlage. Bei der Verarbeitung von personenbezogenen Daten, die zur Erfüllung eines Vertrages erforderlich ist, dient Art. 6 Abs. 1 lit. b DSGVO als Rechtsgrundlage. Soweit eine Verarbeitung zur Wahrung unserer berechtigten Interessen erforderlich ist, dient Art. 6 Abs. 1 lit. f DSGVO als Rechtsgrundlage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">4. Bereitstellung der Website und Erstellung von Logfiles</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Bei jedem Aufruf unserer Website erfasst unser System automatisiert Daten und Informationen des aufrufenden Rechners. Folgende Daten werden dabei erhoben:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 leading-relaxed mb-3 space-y-1">
              <li>IP-Adresse des Nutzers (anonymisiert)</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Browsertyp und -version</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer-URL (zuvor besuchte Seite)</li>
              <li>Abgerufene Seiten und Dateien</li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed">
              Die Daten werden in Logfiles gespeichert. Eine Speicherung dieser Daten zusammen mit anderen personenbezogenen Daten des Nutzers findet nicht statt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die vorübergehende Speicherung dient der Sicherstellung der Systemsicherheit und -stabilität. Die Daten werden nach spätestens 7 Tagen gelöscht.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">5. Kontaktformular und E-Mail-Kontakt</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Wenn Sie uns per Kontaktformular oder E-Mail Anfragen zukommen lassen, werden Ihre Angaben inklusive der von Ihnen angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b oder lit. f DSGVO. Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">6. Cookies</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Unsere Website verwendet Cookies. Bei Cookies handelt es sich um Textdateien, die im Internetbrowser bzw. vom Internetbrowser auf dem Computersystem des Nutzers gespeichert werden. Ruft ein Nutzer eine Website auf, so kann ein Cookie auf dem Betriebssystem des Nutzers gespeichert werden. Dieser Cookie enthält eine charakteristische Zeichenfolge, die eine eindeutige Identifizierung des Browsers beim erneuten Aufrufen der Website ermöglicht.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Wir setzen technisch notwendige Cookies ein, die für den Betrieb der Website erforderlich sind. Darüber hinaus können Cookies eingesetzt werden, um die Nutzererfahrung zu verbessern. Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell ausschließen sowie das automatische Löschen der Cookies beim Schließen des Browsers aktivieren.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">7. B2B-Portal / Registrierung</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sofern Sie sich in unserem B2B-Portal registrieren, werden die dabei eingegebenen Daten (z. B. Name, Unternehmen, E-Mail-Adresse, Telefonnummer) zum Zweck der Vertragsanbahnung und -durchführung verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Die Daten werden so lange gespeichert, wie das Nutzerkonto besteht und gesetzliche Aufbewahrungsfristen es erfordern.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">8. Bestellungen und Zahlungsabwicklung</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Im Rahmen von Bestellungen verarbeiten wir Ihre personenbezogenen Daten (z. B. Name, Lieferanschrift, Zahlungsinformationen) zur Abwicklung des Kaufvertrages. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Wir geben Ihre Daten nur insoweit an Dritte weiter, als dies zur Vertragserfüllung (z. B. Versanddienstleister) notwendig ist. Daten zu abgeschlossenen Verträgen werden gemäß den gesetzlichen Aufbewahrungsfristen (bis zu 10 Jahre) gespeichert.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">9. Ihre Rechte als betroffene Person</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 leading-relaxed mb-3 space-y-1">
              <li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO)</li>
              <li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
              <li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO)</li>
              <li><strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
              <li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
              <li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Zur Geltendmachung Ihrer Rechte wenden Sie sich bitte an: info@bukara.de
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren. Die zuständige Aufsichtsbehörde in Baden-Württemberg ist der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg (LfDI BW), www.baden-wuerttemberg.datenschutz.de.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">10. Datensicherheit</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL/TLS-Verfahren (Secure Socket Layer / Transport Layer Security) in Verbindung mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird. In der Regel handelt es sich dabei um eine 256-Bit-Verschlüsselung. Ob eine einzelne Seite unseres Internetauftrittes verschlüsselt übertragen wird, erkennen Sie an der geschlossenen Darstellung des Schlüssel- beziehungsweise Schloss-Symbols in der Statusleiste Ihres Browsers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">11. Aktualität und Änderung dieser Datenschutzerklärung</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Mai 2026. Durch die Weiterentwicklung unserer Website und Angebote oder aufgrund geänderter gesetzlicher bzw. behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern. Die jeweils aktuelle Datenschutzerklärung kann jederzeit auf dieser Seite von Ihnen abgerufen und ausgedruckt werden.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
