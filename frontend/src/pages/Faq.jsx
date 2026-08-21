import { useState } from 'react';
import '../styles/Faq.css';

const faqs = [
    {
        question: 'Γιατί μπλε οικονομία;',
        answer: 'Η «μπλε» οικονομία αφορά την υπεύθυνη χρήση των υδάτινων πόρων και την προστασία των θαλασσών. Προωθεί ανάπτυξη που δεν εξαντλεί το περιβάλλον: από την επεξεργασία θαλάσσιων αποβλήτων μέχρι θαλάσσια αιολική ενέργεια και ενέργεια από τα κύματα.',
    },
    {
        question: 'Σε τι βοηθάει;',
        answer: 'Βελτιώνει την ποιότητα των υδάτων και της θαλάσσιας ζωής, μειώνει την υπεραλιεία και δημιουργεί νέες επιχειρηματικές ευκαιρίες στην ενέργεια, την αλιεία, τη βιοτεχνολογία και τις τεχνολογίες καθαρισμού του νερού.',
    },
    {
        question: 'What is Hook&Grab?',
        answer: 'Hook&Grab is a circular marketplace for coastal communities: buy, sell, or trade used marine gear, rent boats instead of buying new ones, and share know-how in the forum.',
    },
    {
        question: 'How do rentals work?',
        answer: 'Choose a boat, pick your dates, and send a booking request. The owner approves or rejects it from their profile. Rejected dates become available again.',
    },
    {
        question: 'Do I need an account?',
        answer: 'You can browse freely. An account is needed to list products or boats, request a rental, upload a profile photo, or post in the forum.',
    },
    {
        question: 'Is there payment on the platform?',
        answer: 'Not yet. Listings connect people directly so gear and boats stay in use locally, with less waste and fewer new purchases.',
    },
];

function Faq() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div className="site-container">
            <div className="content-container">
                <section className="faq-section">
                    <article className="box5">
                        <h2>Frequently Asked Questions</h2>
                        {faqs.map((item, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div className={`faq-item ${isOpen ? 'open' : ''}`} key={item.question}>
                                    <button
                                        type="button"
                                        className="faq-question"
                                        onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                        aria-expanded={isOpen}
                                    >
                                        {item.question}
                                    </button>
                                    {isOpen && <p>{item.answer}</p>}
                                </div>
                            );
                        })}
                    </article>
                </section>
            </div>
        </div>
    );
}

export default Faq;
