import Link from "next/link";
import Footer from "@/components/Footer";

export default function AGBsPage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">AGBs</span>
          </nav>
        </div>

        <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-10">Allgemeine Geschäftsbedingungen</h1>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">1. Geltungsbereich &amp; Vertragsschluss</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              1.1 Unsere Angebote, Lieferungen und Leistungen erfolgen ausschließlich auf Grundlage dieser Geschäftsbedingungen. Abweichende oder ergänzende Bedingungen des Bestellers werden nicht Vertragsbestandteil, es sei denn, wir stimmen ihrer Geltung ausdrücklich schriftlich zu.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              1.2 Unsere Angebote sind freibleibend. Ein Vertrag kommt erst durch unsere schriftliche Auftragsbestätigung oder durch die Auslieferung der Ware zustande.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              1.3 Der Besteller haftet für die Richtigkeit der von ihm beigestellten Unterlagen (Zeichnungen, Muster, Daten). Urheberrechte an unseren Mustern und Unterlagen verbleiben bei uns; eine Weitergabe an Dritte ist untersagt.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">2. Preise und Versand</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              2.1 Die Preise verstehen sich in Euro zuzüglich der jeweils geltenden gesetzlichen Mehrwertsteuer ab Werk Dornstetten. Verpackung, Fracht, Porto und Versicherung werden gesondert berechnet.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              2.2 Für Versand an Zweitadressen berechnen wir eine Pauschale von 8,50 EUR pro Sendung.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              2.3 Liegen zwischen Vertragsschluss und Lieferung mehr als vier Monate und treten unvorhersehbare Kostenerhöhungen (z. B. Rohstoffpreise, Löhne) ein, sind wir berechtigt, den Preis im angemessenen Verhältnis zu den gestiegenen Kosten anzupassen.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              2.4 Mit Erscheinen einer neuen Preisliste verlieren alle vorherigen Preisangaben ihre Gültigkeit. Für bereits bestätigte Aufträge gelten die zum Zeitpunkt der Bestätigung vereinbarten Preise, sofern nichts anderes vereinbart wurde.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">3. Lieferung und Höhere Gewalt</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              3.1 Teillieferungen sowie branchenübliche Mehr- oder Minderlieferungen bei Sonderanfertigungen (bis zu 10%) sind zulässig.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              3.2 Lieferzeiten sind unverbindlich, sofern sie nicht ausdrücklich als fix vereinbart wurden.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              3.3 Ereignisse höherer Gewalt, die uns die Leistung vorübergehend erschweren oder unmöglich machen (z.B. Streik, Pandemie, unverschuldete Betriebsstörungen), berechtigen uns, die Lieferung um die Dauer der Behinderung hinauszuschieben. Dauert die Störung länger als sechs Wochen, sind beide Parteien zum Rücktritt vom Vertrag berechtigt.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">4. Zahlungsbedingungen</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              4.1 Rechnungen sind sofort nach Erhalt fällig. Bei Zahlungsverzug sind wir berechtigt, Verzugszinsen in gesetzlicher Höhe (9 Prozentpunkte über dem Basiszinssatz im B2B-Bereich) zu fordern.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              4.2 Die Aufrechnung durch den Besteller ist nur zulässig, wenn seine Gegenansprüche rechtskräftig festgestellt oder von uns unbestritten sind. Ein Zurückbehaltungsrecht besteht nur, wenn der Gegenanspruch auf demselben Vertragsverhältnis beruht.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">5. Eigentumsvorbehalt</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              5.1 Die gelieferte Ware bleibt bis zur vollständigen Bezahlung sämtlicher Forderungen aus der Geschäftsverbindung unser Eigentum.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              5.2 Der Besteller ist zur Weiterveräußerung der Vorbehaltsware im ordentlichen Geschäftsgang berechtigt. Er tritt uns bereits jetzt alle Forderungen in Höhe des Rechnungsbetrages ab, die ihm aus der Weiterveräußerung gegen seine Abnehmer erwachsen (verlängerter Eigentumsvorbehalt).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">6. Gewährleistung und Mängelrüge</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              6.1 Der Besteller hat die Ware unverzüglich nach Erhalt zu untersuchen und Mängel schriftlich zu rügen (§ 377 HGB). Versteckte Mängel müssen unverzüglich nach Entdeckung schriftlich gemeldet werden.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              6.2 Bei berechtigten Mängeln leisten wir nach unserer Wahl Nachbesserung oder Ersatzlieferung.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              6.3 Die Gewährleistungsfrist beträgt 12 Monate ab Ablieferung der Ware.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              6.4 Für Sonderanfertigungen (insbes. Überlängen bei Fräs-/Bohrwerkzeugen), die nach kundenspezifischen Vorgaben gefertigt werden und außerhalb technischer Normen liegen, übernehmen wir keine Gewähr für die Standzeit oder Bruchfestigkeit unter Einsatzbedingungen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">7. Haftungsbeschränkung</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              7.1 Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              7.2 Bei leichter Fahrlässigkeit haften wir nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht). In diesem Fall ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              7.3 Die Haftung für Mängelfolgeschäden sowie die Haftung nach dem Produkthaftungsgesetz bleiben hiervon unberührt.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">8. Erfüllungsort und Gerichtsstand</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              8.1 Erfüllungsort für alle Verpflichtungen aus dem Vertragsverhältnis ist Dornstetten.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              8.2 Ist der Besteller Kaufmann, ist ausschließlicher Gerichtsstand Dornstetten (bzw. das zuständige Amts-/Landgericht). Es gilt ausschließlich deutsches Recht unter Ausschluss des UN-Kaufrechts (CISG).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">9. Urheberrechtsschutz (Katalog-Nachdruck)</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sämtliche Inhalte unserer Kataloge, Prospekte und Online-Präsenzen (Bilder, Texte, Grafiken) sind urheberrechtlich geschützt. Jede Vervielfältigung, Verbreitung oder öffentliche Wiedergabe, auch auszugsweise, bedarf unserer vorherigen schriftlichen Zustimmung.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">10. Salvatorische Klausel</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sollten einzelne Bestimmungen dieser Bedingungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Anstelle der unwirksamen Bestimmung gelten die gesetzlichen Vorschriften.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">11. Datenschutz</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Wir verarbeiten personenbezogene Daten des Bestellers ausschließlich im Einklang mit den geltenden Datenschutzvorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO). Personenbezogene Daten werden erhoben und verarbeitet, soweit dies zur Vertragsabwicklung, Bearbeitung von Anfragen, Durchführung von Bestellungen über unseren Online-Shop oder unsere Formulare sowie zur Betreuung durch unsere Vertriebsmitarbeiter erforderlich ist. Darüber hinaus verwenden wir Kontaktdaten für eigene werbliche Zwecke (z. B. E-Mail-Informationen zu Produkten und Leistungen), sofern eine entsprechende Einwilligung vorliegt oder eine gesetzliche Erlaubnis besteht. Eine Weitergabe an Dritte erfolgt nur, soweit dies zur Vertragsdurchführung notwendig ist (z. B. Versanddienstleister, IT-Dienstleister) oder wir gesetzlich dazu verpflichtet sind. Weitere Informationen zu Art, Umfang und Zweck der Datenverarbeitung sowie zu den Rechten der betroffenen Personen sind in unserer gesonderten Datenschutzerklärung auf unserer Website geregelt.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
