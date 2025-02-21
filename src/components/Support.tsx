import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Send, Play } from 'lucide-react';
import toast from 'react-hot-toast';

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: 'How is my trust score calculated?',
    answer: 'Your trust score is calculated based on multiple factors including verified references, professional history, and social media presence. Each component is weighted differently based on its reliability and relevance.',
  },
  {
    question: 'How can I improve my score?',
    answer: 'You can improve your score by adding verified references, connecting professional social media accounts, and maintaining a consistent online presence. Regular updates to your profile also help.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we use industry-standard encryption and security measures to protect your data. Your information is only shared with your explicit consent and in accordance with our privacy policy.',
  },
];

export function Support() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
    setContactForm({ email: '', message: '' });
  };

  return (
    <div className="bg-sidebar rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Support & Help</h2>
        <HelpCircle size={24} className="text-primary" />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="bg-background rounded-lg">
              <button
                className="w-full px-4 py-3 flex items-center justify-between text-left"
                onClick={() => setOpenFaq(openFaq === faq.question ? null : faq.question)}
              >
                <span className="font-medium">{faq.question}</span>
                {openFaq === faq.question ? (
                  <ChevronUp size={16} className="text-primary" />
                ) : (
                  <ChevronDown size={16} className="text-primary" />
                )}
              </button>
              {openFaq === faq.question && (
                <div className="px-4 pb-3 text-gray-400">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <button className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors">
          <Play size={16} />
          <span>Watch Tutorial</span>
        </button>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Contact Us</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              className="w-full bg-background border border-primary/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className="w-full bg-background border border-primary/20 rounded-lg px-3 py-2 h-32 focus:outline-none focus:border-primary"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center space-x-2 w-full bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors"
          >
            <Send size={16} />
            <span>Send Message</span>
          </button>
        </form>
      </div>
    </div>
  );
}