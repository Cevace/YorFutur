export default function ContactFormBlock({ headline, subheadline }: { headline: string; subheadline: string }) {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-cevace-blue mb-4">{headline}</h2>
                    <p className="text-gray-600">{subheadline}</p>
                </div>

                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Naam</label>
                            <input type="text" id="name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none transition-all" placeholder="Uw naam" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none transition-all" placeholder="uw@email.nl" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Onderwerp</label>
                        <select id="subject" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none transition-all bg-white">
                            <option>Ik wil meer informatie</option>
                            <option>Ik wil een afspraak maken</option>
                            <option>Ik heb een vraag</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Bericht</label>
                        <textarea id="message" rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none transition-all" placeholder="Waar kunnen we u mee helpen?"></textarea>
                    </div>

                    <button type="submit" className="w-full bg-cevace-blue text-white font-bold py-4 rounded-lg hover:bg-blue-900 transition-colors shadow-lg hover:shadow-xl">
                        Verstuur Bericht
                    </button>
                </form>
            </div>
        </section>
    );
}
