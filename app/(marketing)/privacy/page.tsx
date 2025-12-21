import Link from 'next/link';
import { ArrowLeft, Mail, Shield } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-gradient-to-r from-cevace-blue to-orange-600 text-white">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Terug naar home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-semibold">Privacyverklaring</h1>
                    <p className="text-white/80 mt-2">Versie: januari 2026</p>
                </div>
            </header>

            {/* Intro */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <p className="text-lg leading-relaxed text-gray-700">
                        Cevace (hierna: "Cevace", "wij", "ons") verwerkt persoonsgegevens uitsluitend binnen de Europese Unie en uitsluitend onder de voorwaarden van de Algemene Verordening Gegevensbescherming (AVG). Deze privacyverklaring legt uit welke gegevens wij verwerken, waarom wij dat doen, hoe wij jouw gegevens beveiligen en welke rechten jij hebt.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-gray-700">
                        <Mail className="w-5 h-5" />
                        <span>Contact: </span>
                        <a href="mailto:privacy@cevace.com" className="text-blue-600 hover:text-blue-700 font-medium">
                            privacy@cevace.com
                        </a>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <article className="space-y-16">

                    {/* Section 1 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            1. Wat is Cevace?
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Cevace is een online platform dat gebruikers ondersteunt bij solliciteren en carrièreontwikkeling. Onze diensten omvatten onder meer profieloptimalisatie, analyses van cv's en motivatiebrieven, coaching, contentgeneratie, ATS-scoremodellen en gepersonaliseerde adviezen.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            2. Ons fundament: 100% EU-data-sovereiniteit
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Cevace is volledig ontworpen volgens Europese datasoevereiniteit. Dat betekent:
                        </p>
                        <ol className="space-y-3 text-gray-700 mb-6">
                            <li className="flex gap-3">
                                <span className="font-semibold text-black flex-shrink-0">1.</span>
                                <span>De volledige hostingstack bevindt zich binnen de Europese Unie.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-semibold text-black flex-shrink-0">2.</span>
                                <span>Wij gebruiken uitsluitend Europese cloudproviders en Europese tools.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-semibold text-black flex-shrink-0">3.</span>
                                <span>Er vindt geen enkele doorgifte plaats naar de Verenigde Staten of andere derde landen zonder passendheidsbesluit.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-semibold text-black flex-shrink-0">4.</span>
                                <span>Er worden geen Amerikaanse SaaS-tools, scripts, CDN's, AI-diensten, monitoringsoftware, trackers, analytics of andere technologieën gebruikt die onder de Amerikaanse CLOUD Act vallen.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-semibold text-black flex-shrink-0">5.</span>
                                <span>Onze contracten met leveranciers verbieden datadoorgifte buiten de EU, inclusief indirecte doorgifte via subverwerkers.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-semibold text-black flex-shrink-0">6.</span>
                                <span>AI-functionaliteiten die door Cevace worden aangeboden draaien uitsluitend op EU-servers of door onszelf beheerde modellen.</span>
                            </li>
                        </ol>
                        <div className="bg-gray-50 border-l-4 border-blue-600 p-4 flex items-start gap-3">
                            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <p className="font-semibold text-blue-900">
                                Cevace hanteert een zero-transfer policy. Dit is strenger dan de minimale AVG-eis.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            3. Welke gegevens verzamelen wij?
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Wij verzamelen uitsluitend gegevens die noodzakelijk zijn om onze diensten uit te voeren.
                        </p>

                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: '18px' }}>A. Account- en profielgegevens</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Naam</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Adresgegevens</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>E-mailadres</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Wachtwoord (versleuteld, nooit zichtbaar voor ons)</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Eventuele profielfoto</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Communicatievoorkeuren</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Tijdzone en taalinstellingen</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: '18px' }}>B. Sollicitatie- en carrièredoelen</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Door jou ingevulde werkervaring</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Opleidingen</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Vaardigheden</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>CV-documenten (indien geüpload)</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Motivatiebrieven</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Functievoorkeuren</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Ingevoerde teksten voor AI-analyses</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: '18px' }}>C. Platformactiviteit</h3>
                                <p className="text-gray-700 mb-2">
                                    Logbestanden met functionele technische data (IP-adres geanonimiseerd, sessie-ID's, foutmeldingen).
                                </p>
                                <p className="text-sm text-gray-600 italic">
                                    Geen tracking en geen uitgebreide profilering buiten de dienst zelf.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: '18px' }}>D. Betaalgegevens</h3>
                                <p className="text-gray-700 mb-3">Wij gebruiken een volledig EU-gebaseerde PSP. Wij ontvangen:</p>
                                <ul className="space-y-2 text-gray-700 mb-3">
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Betaalstatus</li>
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Transactie-ID</li>
                                </ul>
                                <p className="text-sm text-gray-600 italic">Wij ontvangen geen volledige bankgegevens.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            4. Doelen van de verwerking
                        </h2>
                        <p className="text-gray-700 mb-4">Wij verwerken jouw gegevens voor:</p>
                        <ol className="space-y-3 text-gray-700 mb-4">
                            <li className="flex gap-3"><span className="font-semibold text-black">1.</span><span>Het aanbieden van het Cevace-platform en alle functionaliteiten binnen jouw account.</span></li>
                            <li className="flex gap-3"><span className="font-semibold text-black">2.</span><span>Het genereren van adviezen, analyses, AI-output en profieloptimalisaties.</span></li>
                            <li className="flex gap-3"><span className="font-semibold text-black">3.</span><span>Klantenservice.</span></li>
                            <li className="flex gap-3"><span className="font-semibold text-black">4.</span><span>Foutdiagnose en beveiliging van het platform.</span></li>
                            <li className="flex gap-3"><span className="font-semibold text-black">5.</span><span>Facturatie, administratie en naleving van wettelijke verplichtingen.</span></li>
                            <li className="flex gap-3"><span className="font-semibold text-black">6.</span><span>Verbetering van onze diensten, uitsluitend binnen het EU-datasysteem.</span></li>
                        </ol>
                        <p className="text-gray-700">
                            Wij gebruiken geen persoonsgegevens voor advertentietargeting, doorverkoop of uitwisseling met externe partijen.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            5. Wat is onze wettelijke grondslag?
                        </h2>
                        <p className="text-gray-700 mb-6">Wij verwerken persoonsgegevens op basis van:</p>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: '18px' }}>1. Uitvoering van een overeenkomst</h3>
                                <p className="text-gray-700">Toegang tot je account, gebruik van het platform, analyses van je cv.</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: '18px' }}>2. Toestemming</h3>
                                <p className="text-gray-700">Uitsluitend voor functies waar jij expliciet toestemming voor geeft, zoals optionele AI-analyses of e-mails met tips.</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: '18px' }}>3. Wettelijke verplichting</h3>
                                <p className="text-gray-700">Administratie en fiscale bewaarplichten.</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: '18px' }}>4. Gerechtvaardigd belang</h3>
                                <p className="text-gray-700 mb-2">Beveiliging van het platform, foutoplossing, misbruikpreventie.</p>
                                <p className="text-sm text-gray-600 italic">Wij gebruiken deze grondslag niet voor marketing of tracking.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            6. Wie heeft toegang tot jouw gegevens?
                        </h2>
                        <p className="text-gray-700 mb-4">Uitsluitend de volgende categorieën:</p>
                        <ol className="space-y-3 text-gray-700 mb-4">
                            <li className="flex gap-3"><span className="font-semibold text-black">1.</span><span>Medewerkers van Cevace die toegang nodig hebben voor support of technische taken.</span></li>
                            <li className="flex gap-3"><span className="font-semibold text-black">2.</span><span>Europese cloudproviders (hosting, databases) die als verwerker optreden.</span></li>
                            <li className="flex gap-3"><span className="font-semibold text-black">3.</span><span>Betaaldienstverleners binnen de EU.</span></li>
                        </ol>
                        <p className="text-gray-700">
                            Er zijn geen externe partijen die jouw gegevens ontvangen voor marketing, reclame, verkoop of dataverrijking.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            7. Geen doorgifte buiten de EU
                        </h2>
                        <p className="text-gray-700 mb-4">Cevace verwerkt geen gegevens buiten de Europese Unie.</p>
                        <p className="text-gray-700 mb-3">Wij:</p>
                        <ul className="space-y-2 text-gray-700 mb-4">
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>gebruiken geen Amerikaanse subverwerkers</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>hebben geen contractuele relaties met niet-EU tools</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>blokkeren via technische maatregelen dat scripts van derde partijen kunnen laden</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>gebruiken geen embedded content van externe providers die data verzamelen</li>
                        </ul>
                        <p className="text-gray-700">
                            Wij voldoen hiermee volledig aan Schrems II, EDPB-richtlijnen 01/2020 en 05/2021 en de eisen rond internationale doorgifte.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            8. Bewaartermijnen
                        </h2>
                        <p className="text-gray-700 mb-6">Wij hanteren strikte dataminimalisatie.</p>

                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-2">
                                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: '18px' }}>1. Accountgegevens</h3>
                                <p className="text-gray-700">Worden bewaard zolang jouw account actief is.</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-2">
                                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: '18px' }}>2. CV's, brieven en analyses</h3>
                                <p className="text-gray-700">Worden maximaal 24 maanden na inactiviteit verwijderd, tenzij jij ze eerder verwijdert.</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-2">
                                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: '18px' }}>3. Betaalgegevens</h3>
                                <p className="text-gray-700">Worden 7 jaar bewaard op grond van fiscale verplichtingen.</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-2">
                                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: '18px' }}>4. Logbestanden</h3>
                                <p className="text-gray-700">Worden maximaal 90 dagen bewaard.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            9. Jouw rechten
                        </h2>
                        <p className="text-gray-700 mb-4">Onder de AVG heb jij recht op:</p>
                        <div className="bg-gray-50 rounded-lg p-6">
                            <ul className="space-y-3 text-gray-700 mb-6">
                                <li className="flex items-center gap-3"><span className="text-black font-semibold">✓</span>Recht op inzage</li>
                                <li className="flex items-center gap-3"><span className="text-black font-semibold">✓</span>Recht op rectificatie</li>
                                <li className="flex items-center gap-3"><span className="text-black font-semibold">✓</span>Recht op verwijdering (recht op vergetelheid)</li>
                                <li className="flex items-center gap-3"><span className="text-black font-semibold">✓</span>Recht op beperking van de verwerking</li>
                                <li className="flex items-center gap-3"><span className="text-black font-semibold">✓</span>Recht op dataportabiliteit</li>
                                <li className="flex items-center gap-3"><span className="text-black font-semibold">✓</span>Recht op bezwaar</li>
                                <li className="flex items-center gap-3"><span className="text-black font-semibold">✓</span>Recht om toestemming in te trekken</li>
                                <li className="flex items-center gap-3"><span className="text-black font-semibold">✓</span>Het recht om niet onderworpen te worden aan geautomatiseerde besluitvorming zonder menselijke tussenkomst</li>
                            </ul>
                            <p className="text-gray-700">
                                Je kunt deze rechten uitoefenen via <a href="mailto:privacy@cevace.com" className="text-blue-600 hover:text-blue-700 font-medium underline">privacy@cevace.com</a>.
                            </p>
                        </div>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            10. Beveiliging
                        </h2>
                        <p className="text-gray-700 mb-4">Cevace gebruikt meerdere lagen beveiliging, waaronder:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>End-to-end beveiliging binnen onze EU-infrastructuur</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Encryptie in transit (TLS 1.3)</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Encryptie at rest</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Geïsoleerde databases</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Alarm- en monitoring op ongeautoriseerde toegang</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Strikte toegangsprotocollen</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Regelmatige penetratietests door onafhankelijke EU-partijen</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Zero-trust beleid voor interne tools en medewerkers</li>
                        </ul>
                    </section>

                    {/* Section 11 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            11. Kunstmatige intelligentie-gebruik
                        </h2>
                        <p className="text-gray-700 mb-4">Onze kunstmatige intelligentie-functionaliteiten draaien:</p>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>uitsluitend binnen de EU</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>op modellen die wij zelf hosten of door EU-dienstverleners worden gehost</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>zonder dat gegevens worden gebruikt voor training door derden</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>Door input te geven aan AI-functionaliteiten blijft de data binnen dezelfde beveiligde EU-omgeving</li>
                        </ul>
                    </section>

                    {/* Section 12 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            12. Cookies en tracking
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Cevace gebruikt geen trackingcookies, geen third-party cookies en geen Amerikaanse analytics.
                        </p>
                        <p className="text-gray-700 mb-3">Wij gebruiken:</p>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>uitsluitend noodzakelijke functionele cookies</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span>optionele first-party analytics die volledig anoniem zijn (EU-software, geen IP's, geen cross-site tracking, geen fingerprints)</li>
                        </ul>
                    </section>

                    {/* Section 13 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            13. Klachten
                        </h2>
                        <p className="text-gray-700">
                            Je kunt een klacht indienen bij jouw nationale toezichthouder. In Nederland is dit de Autoriteit Persoonsgegevens.
                        </p>
                    </section>

                    {/* Section 14 */}
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-6 pb-3 border-b-2" style={{ borderColor: '#E7E8EA', fontSize: '24px' }}>
                            14. Wijzigingen
                        </h2>
                        <p className="text-gray-700">
                            Cevace kan deze privacyverklaring wijzigen wanneer de wetgeving verandert of wanneer onze diensten worden uitgebreid. De meest recente versie staat altijd op deze pagina.
                        </p>
                    </section>

                    {/* Contact CTA */}
                    <section className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
                        <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: '18px' }}>Vragen over jouw privacy?</h3>
                        <p className="text-gray-700 mb-6">
                            Ons privacy team staat klaar om al je vragen te beantwoorden.
                        </p>
                        <a
                            href="mailto:privacy@cevace.com"
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl"
                            style={{ color: '#FFFFFF' }}
                        >
                            <Mail className="w-5 h-5" />
                            Neem contact op
                        </a>
                    </section>

                </article>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 mt-20">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="text-center">
                        <p className="text-sm">© 2026 Cevace. Alle rechten voorbehouden.</p>
                        <p className="text-xs text-gray-500 mt-2">Laatste update: januari 2026</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
