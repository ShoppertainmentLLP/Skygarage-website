/*
  The five steps of the funnel, in one place. The full page tells all five; the homepage
  condenses to the four that happen before the car is back on the road.
*/
export type Step = {
  title: string;
  /** Homepage length: one line. */
  short: string;
  /** The /about/how-it-works length. */
  long: string;
  icon: 'describe' | 'respond' | 'compare' | 'book' | 'review';
};

export const STEPS: Step[] = [
  {
    title: 'Describe the job',
    short: 'Pick a service or say what the car is doing. Under two minutes.',
    long: 'Pick a service or explain the problem in your own words. Add your car and where you are. Takes under two minutes.',
    icon: 'describe',
  },
  {
    title: 'Garages respond',
    short: 'Verified garages near you reply with written prices, usually the same day.',
    long: 'Only verified garages that handle your kind of job in your area see the request. They reply with prices, usually the same working day.',
    icon: 'respond',
  },
  {
    title: 'Compare openly',
    short: 'Price, warranty, rating and turnaround, side by side.',
    long: "Every quote sits next to the garage's warranty, rating, price band and turnaround. No phone-tag, no pressure.",
    icon: 'compare',
  },
  {
    title: 'Book and go',
    short: 'Book the garage you trust, with pick & drop if you want it.',
    long: 'Book the garage you choose — with pick & drop if you want it. Pay the garage directly; Cars911 charges owners nothing.',
    icon: 'book',
  },
  {
    title: 'Review the work',
    short: 'Your verified review shapes the next driver’s comparison.',
    long: 'Your review is verified against a real booking and shapes who wins the next comparison.',
    icon: 'review',
  },
];
