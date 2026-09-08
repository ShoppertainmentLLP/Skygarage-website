/*
  One FAQ set, used by /about/faq and by the homepage accordion. Sharing the source is what
  keeps the FAQPage schema on both pages consistent — Google penalises the two drifting apart
  more readily than it rewards having the markup at all (audit §11.5).
*/
export type Faq = [question: string, answer: string];

export const GENERAL_FAQS: Faq[] = [
  [
    'What does Cars911 cost?',
    'Nothing, for car owners. You send one request, garages quote, and you pay the garage directly for whatever work you approve. Cars911 charges owners no fee and takes no cut of your repair.',
  ],
  [
    'How many quotes will I get?',
    'Usually three to five, depending on how many verified garages in your area handle that job. Quotes normally arrive within the hour during working hours.',
  ],
  [
    'Am I committed once I request quotes?',
    'No. A request is not a booking. You can read every quote and book none of them, and nobody will keep chasing you.',
  ],
  [
    'How are garages verified?',
    'Every garage passes a 100-point audit before it can quote: valid trade licence and insurance, a facility and equipment inspection, workmanship spot checks on completed jobs, its customer and complaint history, and written warranty terms.',
  ],
  [
    'Why do quotes for the same job differ so much?',
    'Three reasons, in order of size: the labour rate, whether the parts are genuine, OEM or aftermarket, and what the garage has actually included. Compare those three and the rest is genuinely price.',
  ],
  [
    'Who holds the warranty on the work?',
    'The garage that does the work. The warranty length is written on the quote before you book, which is why it sits next to the price when you compare.',
  ],
  [
    'Do you offer pick and drop?',
    'Many garages do. Add it when you book an appointment and the driver details come with your confirmation.',
  ],
  [
    'Can you help if I have already broken down?',
    'Yes — that is roadside assistance, dispatched 24 hours a day across every emirate. Jump starts, flat tyres, towing and mobile mechanics. If it cannot be fixed where you are, we tow you to a network garage and you still get quotes for the repair.',
  ],
  [
    'Which emirates do you cover?',
    'All seven, plus Al Ain, with the densest garage coverage in Dubai, Abu Dhabi and Sharjah.',
  ],
  [
    'Can you service my car brand?',
    'Almost certainly. Most network garages are all-makes workshops, and several specialise — German, Japanese and Korean makes all have dedicated specialists in the network.',
  ],
];

/** The six a first-time visitor asks, for the homepage. */
export const HOME_FAQS: Faq[] = [
  GENERAL_FAQS[0],
  GENERAL_FAQS[1],
  GENERAL_FAQS[2],
  GENERAL_FAQS[3],
  GENERAL_FAQS[4],
  GENERAL_FAQS[7],
];

export function faqSchema(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
