/**
 * Seed script for the Yatra / Events module.
 * Usage:  node utils/seedYatras.js
 * Idempotent — upserts by slug, never touches seatsBooked on an existing doc.
 *
 * Images: pic('local-name.jpg', 'unsplashId') returns /yatra/local-name.jpg
 * when that file exists in frontend/public/yatra/, otherwise a stock photo.
 * So the site looks fine now and upgrades automatically as you add real photos.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Yatra = require('../models/Yatra');
const Testimonial = require('../models/Testimonial');

const PUBLIC_YATRA_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'yatra');
const stock = (id, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`;
const pic = (localName, unsplashId, w) => {
  try {
    if (localName && fs.existsSync(path.join(PUBLIC_YATRA_DIR, localName))) {
      return `/yatra/${localName}`;
    }
  } catch { /* ignore */ }
  return stock(unsplashId, w);
};

/* ------------------------------------------------------------------ *
 * 1. Tirth Yatra 2026 — Varanasi · Ayodhya · Mathura · Vrindavan
 * ------------------------------------------------------------------ */
const tirthYatra2026 = {
  slug: 'tirth-yatra-2026',
  title: 'Tirth Yatra 2026 — Kashi · Ayodhya · Mathura Vrindavan',
  tagline:
    'A guided 5-day pilgrimage from Bihar covering Kashi Vishwanath, Vindhyachal Devi, Ram Janmabhoomi and the Braj Bhoomi of Mathura–Vrindavan.',
  category: 'bus',
  heroImages: [
    pic('tirth-hero.jpg', '1561361513-2d000a50f0dc'),
    pic('tirth-varanasi.jpg', '1596797882870-8c33deeac224'),
    pic('tirth-ayodhya.jpg', '1548013146-72479768bada'),
    pic('tirth-mathura.jpg', '1524492412937-b28074a5d7da'),
  ],
  mapImageUrl: pic('tirth-map.jpg', '1524661135-423995f22d0b'),
  route: ['Varanasi', 'Vindhyachal', 'Ayodhya', 'Mathura', 'Vrindavan'],
  highlights: [
    'Kashi Vishwanath Corridor darshan + evening Ganga Aarti at Dashashwamedh Ghat',
    'Vindhyavasini Devi darshan on the Trikon Parikrama',
    'Shri Ram Janmabhoomi Mandir and Hanuman Garhi at Ayodhya',
    'Full day in Braj Bhoomi — Krishna Janmasthan, Banke Bihari, Prem Mandir',
    'Pure-veg satvik meals, an AC sleeper bus, and a tour manager with the group throughout',
  ],
  startingPoint: 'Dumraon, Buxar (Bihar)',
  departureDates: [
    new Date('2026-03-29T20:00:00+05:30'),
    new Date('2026-05-17T20:00:00+05:30'),
    new Date('2026-10-25T20:00:00+05:30'),
  ],
  durationDays: 5,
  durationNights: 4,
  vehicleType: 'AC Sleeper Bus (2x1 berths)',
  totalSeats: 36,
  seatsBooked: 0,
  reportingTime: '7:00 PM',
  departureTime: '8:00 PM',
  price: {
    amount: 5500,
    currency: 'INR',
    unit: 'per person',
    advanceAmount: 1000,
    variants: [
      { label: 'Non-AC hotel room (twin/triple sharing)', amount: 5500 },
      { label: 'AC hotel room (twin/triple sharing)', amount: 6500 },
    ],
  },
  quickInclusions: [
    { icon: '🛏️', label: 'AC Sleeper Bus' },
    { icon: '🏨', label: 'Hotel Stay' },
    { icon: '🍽️', label: 'Breakfast + Dinner' },
    { icon: '🧭', label: 'Tour Manager' },
  ],
  itinerary: [
    {
      dayNumber: 1,
      title: 'Dumraon → Varanasi (Kashi)',
      image: pic('tirth-varanasi.jpg', '1596797882870-8c33deeac224', 1000),
      stayNight: 'Hotel in Varanasi',
      activities: [
        { time: '8:00 PM (prev night)', description: 'Board the AC sleeper bus at Dumraon after a short pre-departure briefing by the tour manager.', icon: '🚌' },
        { time: 'Early morning', description: 'Arrive Varanasi, freshen up at the hotel, tea served.', icon: '🏨' },
        { time: 'Morning', description: 'Kashi Vishwanath Corridor darshan (regular queue) and Kaal Bhairav temple.', icon: '🛕' },
        { time: 'Evening', description: 'Ganga Aarti at Dashashwamedh Ghat from a shared boat.', icon: '🪔' },
      ],
    },
    {
      dayNumber: 2,
      title: 'Varanasi → Vindhyachal',
      image: pic('tirth-vindhyachal.jpg', '1609920658906-8223bd289001', 1000),
      stayNight: 'Overnight sleeper bus towards Ayodhya',
      activities: [
        { time: 'Morning', description: 'Check out, drive to Vindhyachal for Vindhyavasini Devi darshan.', icon: '⛰️' },
        { time: 'Afternoon', description: 'Ashtabhuja & Kali Khoh temples of the Trikon Parikrama (time permitting).', icon: '🛕' },
        { time: 'Night', description: 'Overnight drive towards Ayodhya. Dinner en route.', icon: '🌙' },
      ],
    },
    {
      dayNumber: 3,
      title: 'Ayodhya Dham',
      image: pic('tirth-ayodhya.jpg', '1548013146-72479768bada', 1000),
      stayNight: 'Hotel in Ayodhya',
      activities: [
        { time: 'Morning', description: 'Shri Ram Janmabhoomi Mandir darshan.', icon: '🏯' },
        { time: 'Day', description: 'Hanuman Garhi, Kanak Bhawan and Saryu Ghat aarti.', icon: '🕉️' },
      ],
    },
    {
      dayNumber: 4,
      title: 'Mathura & Vrindavan (Braj Bhoomi)',
      image: pic('tirth-mathura.jpg', '1524492412937-b28074a5d7da', 1000),
      stayNight: 'Overnight sleeper bus towards Dumraon',
      activities: [
        { time: 'Morning', description: 'Drive to Mathura — Shri Krishna Janmasthan darshan.', icon: '🪈' },
        { time: 'Afternoon', description: 'Vrindavan — Banke Bihari, Prem Mandir and ISKCON temple.', icon: '🛕' },
        { time: '8:00 PM', description: 'Begin the return journey towards Dumraon.', icon: '🚌' },
      ],
    },
    {
      dayNumber: 5,
      title: 'Return to Dumraon',
      stayNight: 'Tour ends',
      activities: [
        { time: 'Evening', description: 'Arrive Dumraon, Buxar. Tour concludes.', icon: '🏁' },
      ],
    },
  ],
  inclusions: [
    'Full journey by private AC sleeper bus (2x1 berths) for the whole route',
    'Hotel accommodation for 4 nights (twin / triple sharing)',
    'Daily breakfast and dinner (pure vegetarian, no onion–garlic)',
    'Experienced ParthRahi tour manager travelling with the group',
    'Shared boat for the Ganga Aarti at Varanasi',
    'All toll, parking, driver and vehicle charges',
    '24x7 medical first-aid kit and on-call assistance',
  ],
  exclusions: [
    'Lunch, snacks and any personal expenses',
    'VIP / special darshan and aarti tickets',
    'Entry tickets, camera fees and guide charges inside monuments',
    'Any cost arising from natural calamity, roadblock or events beyond control',
    'GST if applicable, and anything not listed under inclusions',
  ],
  importantNotes: [
    'Every traveller must carry an original government photo ID (Aadhaar / Voter ID) plus one photocopy.',
    'Seats are confirmed only after the advance payment is received and a booking reference is issued.',
    'Darshan timings depend on temple authorities and crowd — the itinerary order may be re-sequenced for your comfort.',
    'One soft bag (up to 15 kg) plus one small handbag per traveller — hard trolleys are hard to store on a sleeper bus.',
  ],
  rulesAndFacilities: [
    { title: 'The Sleeper Bus', description: 'A private AC sleeper bus with 2x1 berths, curtains, reading light and charging points travels with the group throughout. The overnight travel legs are spent on the bus; the other nights are in hotels. Shared berths are allotted same-gender for cabins unless you book as a couple / family. Two comfort stops are made on each overnight leg.' },
    { title: 'Food & Tea', description: 'Pure vegetarian breakfast and dinner are included and prepared without onion and garlic. Morning tea is served at the hotel. Lunch is on your own so you can eat light on travel days.' },
    { title: 'Stay', description: 'Clean budget-to-standard hotels on twin / triple sharing near the temple areas. AC rooms are available on the AC fare. Single-occupancy room on request at extra cost, subject to availability.' },
    { title: 'Travel & Luggage', description: 'A private AC sleeper bus with 2x1 berths is used throughout. Please report 1 hour before departure. Keep luggage to one soft bag (15 kg) + one handbag. Berths are allotted same-gender for shared cabins unless you book as a couple / family.' },
    { title: 'Health & Safety', description: 'A first-aid kit travels with the group and the tour manager can help arrange a doctor or hospital — treatment cost is borne by the traveller. Inform us in advance about any medical condition.' },
    { title: 'Cancellation & Refund', description: 'Advance is fully adjustable if you inform us 15+ days before departure. 50% of the tour cost is refundable between 15 and 7 days. No refund within 7 days of departure. Refunds are processed within 10 working days.' },
  ],
  termsAndConditions: [
    'ParthRahi acts as a travel facilitator and is not responsible for temple / darshan closures or government restrictions.',
    'Management may adjust the route, hotel or sequence for safety, weather or operational reasons without reducing the core inclusions.',
    'Travellers are expected to follow the group timetable; the bus cannot wait beyond the announced time.',
    'Any misconduct, intoxication or behaviour that endangers the group may lead to removal from the tour without refund.',
    'By booking, the lead traveller confirms they have read the itinerary, fare inclusions and cancellation policy on this page.',
  ],
  faqs: [
    { q: 'Where does the bus start from and can I join on the way?', a: 'The sleeper bus starts at Dumraon (Buxar). Pickups at Buxar and Ara are possible on request — tell us on WhatsApp after booking and we will add your stop.' },
    { q: 'Is the yatra suitable for elderly parents?', a: 'Yes, most of our travellers are 55+. Darshan is in the regular line and involves some walking and standing. Wheelchair assistance at temples can be arranged if you inform us in advance.' },
    { q: 'What should we pack?', a: 'Light cotton clothes, a shawl for early mornings, comfortable walking shoes, personal medicines, and a photo ID. A detailed packing list is sent on WhatsApp after booking.' },
    { q: 'How is the advance paid?', a: 'Reserve online, then pay ₹1,000 per seat by UPI or on WhatsApp. Your seats are held meanwhile and confirmed once we receive the advance.' },
  ],
  freebies: ['Complimentary Rudraksha mala for every traveller', 'Free pick-up point coordination on WhatsApp'],
  brochurePdfUrl: '',
  status: 'published',
  metaTitle: 'Tirth Yatra 2026 — Kashi, Ayodhya, Mathura & Vrindavan by Sleeper Bus | ParthRahi',
  metaDescription:
    '5 days / 4 nights guided pilgrimage from Dumraon (Bihar) covering Kashi Vishwanath, Vindhyachal Devi, Ayodhya Ram Mandir, Mathura and Vrindavan. Private AC sleeper bus, hotel stay and meals included. Reserve online with ₹1,000 advance.',
};

/* ------------------------------------------------------------------ *
 * 2. Kamakhya Devi · Sikkim · Darjeeling Yatra (flagship, by AC sleeper bus)
 * ------------------------------------------------------------------ */
const kamakhyaSikkim = {
  slug: 'kamakhya-sikkim-darjeeling-yatra',
  title: 'Kamakhya Devi · Sikkim · Darjeeling Yatra (by Sleeper Bus)',
  tagline:
    'A 13-day North-East pilgrimage and mountain journey by AC sleeper bus from Bihar — Maa Kamakhya at Guwahati, the falls of Cherrapunji, Gangtok & Nathula, and the tea hills of Darjeeling. No flights, no trains — one bus, one group, start to finish.',
  category: 'bus',
  heroImages: [
    pic('kamakhya-hero.jpg', '1626621341517-bbf3d9990a23'),
    pic('kamakhya-temple.jpg', '1609920658906-8223bd289001'),
    pic('kamakhya-day07.jpg', '1506905925346-21bda4d32df4'),
    pic('kamakhya-day10.jpg', '1544735716-392fe2489ffa'),
    pic('kamakhya-day06.jpg', '1519681393784-d120267933ba'),
    pic('kamakhya-day04.jpg', '1502920917128-1aa500764cbd'),
  ],
  mapImageUrl: pic('kamakhya-map.jpg', '1524661135-423995f22d0b'),
  route: [
    'Patna', 'Siliguri', 'Gangtok', 'Nathula Pass', 'Namchi',
    'Darjeeling', 'Mirik', 'Guwahati', 'Shillong', 'Cherrapunji',
  ],
  highlights: [
    'Maa Kamakhya darshan on Nilachal Hill, Guwahati',
    'Nathula Pass (India–China border, permit-based) and Tsomgo Lake',
    'Namchi Char Dham and the Guru Padmasambhava statue at Samdruptse',
    'Tiger Hill sunrise over Kanchenjunga + Darjeeling Toy Train',
    'Cherrapunji — Nohkalikai & Seven Sisters falls, Mawsmai caves',
    'One AC sleeper bus for the whole journey — your berth is your base',
  ],
  startingPoint: 'Patna (Bihar) — boarding also at Muzaffarpur & Purnea',
  departureDates: [
    new Date('2026-11-20T16:00:00+05:30'),
    new Date('2027-02-19T16:00:00+05:30'),
    new Date('2027-04-16T16:00:00+05:30'),
  ],
  durationDays: 13,
  durationNights: 12,
  vehicleType: 'AC Sleeper Bus (2x1 berths) — same bus throughout',
  totalSeats: 36,
  seatsBooked: 6,
  reportingTime: '3:00 PM (Patna boarding point)',
  departureTime: '4:00 PM — overnight sleeper to Siliguri',
  price: {
    amount: 21500,
    currency: 'INR',
    unit: 'per person',
    advanceAmount: 3000,
    variants: [
      { label: 'Sleeper berth — shared (2 per cabin)', amount: 21500 },
      { label: 'Sleeper berth — single occupancy (sole use)', amount: 27500 },
    ],
  },
  quickInclusions: [
    { icon: '🛏️', label: 'AC Sleeper Bus' },
    { icon: '🏨', label: '8 Nights Hotel' },
    { icon: '🍛', label: 'Breakfast + Dinner' },
    { icon: '🧭', label: 'Guide + Manager' },
  ],
  itinerary: [
    {
      dayNumber: 1, title: 'Patna → overnight sleeper to Siliguri',
      image: pic('kamakhya-day01.jpg', '1502920917128-1aa500764cbd', 1000),
      stayNight: 'On the AC sleeper bus',
      activities: [
        { time: '3:00 PM', description: 'Report at the Patna boarding point, meet your tour manager, berth allotment and briefing.', icon: '🧭' },
        { time: '4:00 PM', description: 'Depart Patna by AC sleeper bus. Boarding pickups at Muzaffarpur and Purnea on the way.', icon: '🛏️' },
        { time: 'Night', description: 'Dinner stop en route. Overnight journey towards Siliguri.', icon: '🌙' },
      ],
    },
    {
      dayNumber: 2, title: 'Siliguri → Gangtok (Sikkim)',
      image: pic('kamakhya-day02.jpg', '1512343879784-a960bf40e7f2', 1000),
      stayNight: 'Hotel in Gangtok',
      activities: [
        { time: 'Morning', description: 'Reach Siliguri, freshen up and breakfast. Sikkim entry permit formalities.', icon: '📄' },
        { time: 'Day', description: 'Drive up to Gangtok (approx. 4–5 hrs) along the Teesta river. Hotel check-in, rest.', icon: '🏔️' },
      ],
    },
    {
      dayNumber: 3, title: 'Gangtok local sightseeing',
      image: pic('kamakhya-day03.jpg', '1519681393784-d120267933ba', 1000),
      stayNight: 'Hotel in Gangtok',
      activities: [
        { time: 'Day', description: 'Tashi View Point, Ganesh Tok, Hanuman Tok and the Do-Drul Chorten (Buddhist stupa).', icon: '☸️' },
        { time: 'Afternoon', description: 'Ropeway ride and Flower Exhibition Centre; evening free at MG Marg.', icon: '🚡' },
      ],
    },
    {
      dayNumber: 4, title: 'Nathula Pass & Tsomgo Lake excursion',
      image: pic('kamakhya-day04.jpg', '1506905925346-21bda4d32df4', 1000),
      stayNight: 'Hotel in Gangtok',
      activities: [
        { time: 'Early morning', description: 'Local vehicles to Tsomgo (Changu) Lake at 12,400 ft, then onward to Nathula Pass — the India–China border (permit-dependent).', icon: '🏔️' },
        { time: 'Return', description: 'Baba Harbhajan Singh Mandir on the way back to Gangtok.', icon: '🛕' },
      ],
    },
    {
      dayNumber: 5, title: 'Gangtok → Namchi (South Sikkim)',
      image: pic('kamakhya-day05.jpg', '1477587458883-47145ed94245', 1000),
      stayNight: 'Hotel in Namchi / Jorethang',
      activities: [
        { time: 'Day', description: 'Char Dham (Solophok) and the 108-ft Siddhesvara Dham, then the Samdruptse Guru Padmasambhava statue.', icon: '🕉️' },
        { time: 'Evening', description: 'Hotel stay in Namchi / Jorethang area.', icon: '🏨' },
      ],
    },
    {
      dayNumber: 6, title: 'Namchi → Darjeeling',
      image: pic('kamakhya-day06.jpg', '1544735716-392fe2489ffa', 1000),
      stayNight: 'Hotel in Darjeeling',
      activities: [
        { time: 'Morning', description: 'Drive to Darjeeling, the “Queen of the Hills”.', icon: '🚌' },
        { time: 'Afternoon', description: 'Peace Pagoda, Padmaja Naidu Zoo and the Himalayan Mountaineering Institute.', icon: '🐼' },
      ],
    },
    {
      dayNumber: 7, title: 'Darjeeling — Tiger Hill sunrise & tea gardens',
      image: pic('kamakhya-day07.jpg', '1544735716-392fe2489ffa', 1000),
      stayNight: 'Hotel in Darjeeling',
      activities: [
        { time: 'Pre-dawn', description: 'Tiger Hill for the sunrise over Kanchenjunga, then Batasia Loop and Ghoom Monastery.', icon: '🌄' },
        { time: 'Day', description: 'Happy Valley tea garden visit and the Darjeeling Himalayan “Toy Train” joy ride (as available).', icon: '🚂' },
      ],
    },
    {
      dayNumber: 8, title: 'Darjeeling → Mirik → Siliguri → overnight to Guwahati',
      image: pic('kamakhya-day08.jpg', '1470071459604-3b5ec3a7fe05', 1000),
      stayNight: 'On the AC sleeper bus',
      activities: [
        { time: 'Morning', description: 'Drive down via Mirik Lake for a last hill stop, then reach Siliguri.', icon: '🏞️' },
        { time: 'Evening', description: 'Board the sleeper bus again. Dinner stop, then overnight journey to Guwahati.', icon: '🛏️' },
      ],
    },
    {
      dayNumber: 9, title: 'Guwahati — Maa Kamakhya Darshan',
      image: pic('kamakhya-day09.jpg', '1609920658906-8223bd289001', 1000),
      stayNight: 'Hotel in Guwahati',
      activities: [
        { time: 'Late morning', description: 'Reach Guwahati, hotel check-in, rest and lunch.', icon: '🏨' },
        { time: 'Afternoon', description: 'Kamakhya Devi Mandir darshan on Nilachal Hill (regular line).', icon: '🛕' },
        { time: 'Evening', description: 'Umananda Island (Brahmaputra ferry) or an optional sunset river cruise.', icon: '⛴️' },
      ],
    },
    {
      dayNumber: 10, title: 'Guwahati → Shillong (via Umiam Lake)',
      image: pic('kamakhya-day10.jpg', '1476514525535-07fb3b4ae5f1', 1000),
      stayNight: 'Hotel in Shillong',
      activities: [
        { time: 'Morning', description: 'Early Kamakhya aarti (optional), then drive to Shillong with a photo stop at Umiam (Barapani) Lake.', icon: '🚌' },
        { time: 'Afternoon', description: 'Ward’s Lake, Cathedral and Police Bazaar walk.', icon: '🏞️' },
      ],
    },
    {
      dayNumber: 11, title: 'Cherrapunji day trip',
      image: pic('kamakhya-day11.jpg', '1502920917128-1aa500764cbd', 1000),
      stayNight: 'Hotel in Shillong',
      activities: [
        { time: 'Full day', description: 'Seven Sisters Falls, Nohkalikai Falls, Mawsmai limestone caves and the Arwah cave.', icon: '💧' },
        { time: 'Evening', description: 'Return to Shillong. Pack for the long ride home.', icon: '🎒' },
      ],
    },
    {
      dayNumber: 12, title: 'Shillong → Guwahati → overnight sleeper to Bihar',
      image: pic('kamakhya-day12.jpg', '1512343879784-a960bf40e7f2', 1000),
      stayNight: 'On the AC sleeper bus',
      activities: [
        { time: 'Morning', description: 'Drive back to Guwahati, last bazaar time for Assam silk and pithas.', icon: '🛍️' },
        { time: 'Afternoon', description: 'Board the sleeper bus. Dinner stop, then the overnight return journey.', icon: '🛏️' },
      ],
    },
    {
      dayNumber: 13, title: 'Arrive Purnea → Muzaffarpur → Patna',
      stayNight: 'Tour ends',
      activities: [
        { time: 'Day', description: 'Drop at Purnea and Muzaffarpur en route, reaching Patna by evening. Tour concludes.', icon: '🏁' },
      ],
    },
  ],
  inclusions: [
    'Full journey by private AC sleeper bus (2x1 berths) — Patna to Patna, the same bus throughout',
    '8 nights hotel accommodation on twin / triple sharing (Gangtok, Namchi, Darjeeling, Guwahati, Shillong)',
    '4 nights sleeper-berth stay on the bus (2 outbound, 2 return)',
    'All Sikkim entry permits and the Nathula Pass / Tsomgo Lake inner-line permit',
    'Local vehicles for the Nathula & Tsomgo excursion (as per hill rules)',
    'Daily breakfast and dinner (pure vegetarian; Jain meals on request)',
    'All sightseeing transfers, local guide charges, toll, parking and driver charges',
    'ParthRahi tour manager travelling with the group for all 13 days',
  ],
  exclusions: [
    'Nathula Pass extra vehicle charge if the border is open (₹500–₹800 per head, paid locally)',
    'Ropeway, Toy Train joy ride, Living Root Bridge trek and any optional activity',
    'All lunches, beverages, tips and personal shopping',
    'Monument / camera / video charges',
    'Any cost due to a landslide, roadblock, strike, breakdown or weather delay',
    'Anything not mentioned in the inclusions; GST as applicable',
  ],
  importantNotes: [
    'Documents required: original + photocopy of Voter ID or Passport (mandatory for Nathula Pass), 4 passport-size photographs, and Aadhaar for hotel check-in.',
    'Nathula Pass is open to Indian nationals only, stays closed on Mondays and Tuesdays, and the visit depends on Army / weather clearance on the day.',
    'This tour has two long overnight bus legs each way (Bihar⇄Siliguri, Siliguri⇄Guwahati). If long road journeys do not suit you, this is not the right yatra.',
    'Nathula is a moderate-altitude point (~4,300 m). Travellers with heart, asthma or severe BP conditions should carry a doctor’s fitness note.',
    'Seats/berths are confirmed only after the advance is received and a booking reference is issued.',
  ],
  rulesAndFacilities: [
    { title: 'The Sleeper Bus', description: 'A private AC sleeper coach with 2x1 berths, curtains, reading light and charging points. The same bus and driver-team stay with the group the whole trip, so your berth doubles as your locker. Two comfort / washroom stops are made on every overnight leg. Shared berths are allotted same-gender unless you book for a couple/family.' },
    { title: 'Food & Tea', description: 'Pure vegetarian breakfast and dinner are included at dhabas and hotels along the way and at the hill hotels. Bed-tea at the hotels. Jain / low-oil meals can be arranged with 7 days notice. Lunch is on your own.' },
    { title: 'Hotels', description: 'Clean 3-star or good 3-star-equivalent hotels on twin / triple sharing. Room heaters in Gangtok, Namchi and Darjeeling in winter. Single-room supplement on request, subject to availability.' },
    { title: 'Permits & Luggage', description: 'ParthRahi arranges all Sikkim and Nathula permits — carry the original photo ID used for the permit. One soft bag (up to 15 kg) plus one small handbag per traveller; hard trolleys are hard to store on a sleeper bus.' },
    { title: 'Health, Altitude & Safety', description: 'Carry personal medicines, a warm jacket, sunscreen and motion-sickness tablets (useful on the hill roads). A first-aid kit and portable oxygen travel with the group. The tour manager can arrange a doctor; treatment / evacuation cost is borne by the traveller — travel insurance is strongly recommended.' },
    { title: 'Cancellation & Refund', description: 'Advance (₹3,000) is adjustable to a future ParthRahi yatra if you cancel 30+ days before departure. 30–15 days: 60% of the tour cost refundable. 15–8 days: 30% refundable. Within 7 days: no refund. Refunds are processed in 10–15 working days.' },
  ],
  termsAndConditions: [
    'ParthRahi is a travel organiser; hotels, permit authorities and local transport are independent service providers and their rules apply.',
    'The company is not liable for delay, loss or damage caused by weather, landslide, roadblock, strike, vehicle breakdown, border closure or any force-majeure event.',
    'The itinerary is a plan of intent — the sequence of days, the night halts and the choice of a hotel of similar category may change on ground.',
    'The group timetable is binding; the bus cannot wait beyond the announced time, and travellers who leave the tour midway are not entitled to a refund for the unused portion.',
    'Full payment must reach ParthRahi at least 20 days before departure, failing which the booking may be released.',
    'By paying the advance the lead traveller accepts this itinerary, the fare inclusions / exclusions and the cancellation policy shown on this page for all travellers in the booking.',
  ],
  faqs: [
    { q: 'Is the whole trip really by bus — no flight or train?', a: 'Yes. It is one private AC sleeper bus from Patna and back. Only the Nathula & Tsomgo excursion uses small local vehicles, because a big bus is not allowed on that road. There is no flight and no train on this yatra.' },
    { q: 'How are the overnight bus journeys?', a: 'You get a proper sleeper berth with a curtain, light and charging point, and the bus makes two washroom / tea stops each night. There are two overnight legs going (Bihar→Siliguri, Siliguri→Guwahati) and two coming back. If long road travel does not suit you, please pick a shorter yatra instead.' },
    { q: 'Is Nathula Pass guaranteed?', a: 'No operator can guarantee Nathula — it needs an Army permit and clear weather on the day, and it is shut on Mondays and Tuesdays. We plan it for a permitted day. If it is closed for weather / Army orders it is not refundable, as is standard for hill tours.' },
    { q: 'What documents do we carry?', a: 'Original + photocopy of Voter ID or Passport (Voter ID / Passport is mandatory for Nathula), Aadhaar for hotels, and 4 passport-size photos per person. We handle the permit paperwork.' },
    { q: 'What is the advance and when is the balance due?', a: '₹3,000 per seat to reserve your berth. The full balance must reach us at least 20 days before departure.' },
  ],
  freebies: [
    'All Sikkim & Nathula permit handling at no service fee',
    'ParthRahi travel kit — lanyard, route card and a Kanchenjunga sunrise checklist',
  ],
  brochurePdfUrl: '',
  status: 'published',
  metaTitle: 'Kamakhya Devi, Sikkim & Darjeeling Yatra by Sleeper Bus — 13 Days from Bihar | ParthRahi',
  metaDescription:
    '13 days / 12 nights guided North-East India yatra by private AC sleeper bus from Patna — Maa Kamakhya at Guwahati, Gangtok, Nathula Pass, Namchi Char Dham, Darjeeling and Cherrapunji. No flights, no trains. Permits, hotels and meals included. Reserve with ₹3,000 advance.',
};

const yatras = [tirthYatra2026, kamakhyaSikkim];

/* ------------------------------------------------------------------ *
 * Testimonials — some yatra-specific, some agency-wide featured
 * ------------------------------------------------------------------ */
const testimonials = [
  {
    slug: 'tirth-yatra-2026', name: 'Sunita Devi', city: 'Buxar', rating: 5, isFeatured: true,
    message: 'Very well organised yatra. The sleeper bus was comfortable and the hotel food was fresh and satvik. Darshan at Kashi Vishwanath was smooth even in the crowd.',
  },
  {
    slug: 'tirth-yatra-2026', name: 'Ramesh Prasad', city: 'Dumraon', rating: 5,
    message: 'Booked seats for my parents. The ParthRahi tour manager stayed in touch on WhatsApp the whole trip and kept everyone together. Highly recommended.',
  },
  {
    slug: 'kamakhya-sikkim-darjeeling-yatra', name: 'Anjali & Mahesh Kulkarni', city: 'Pune', rating: 5, isFeatured: true,
    message: 'Kamakhya darshan, Nathula and the Tiger Hill sunrise — all three happened. The permits were handled for us and the hill vehicles were well maintained. Worth every rupee.',
  },
  {
    slug: 'kamakhya-sikkim-darjeeling-yatra', name: 'Retd. Col. S. Nair', city: 'Chandigarh', rating: 4,
    message: 'Good coordination for a large group. Nathula was closed the first day due to snow and the team rescheduled it to the next morning without fuss.',
  },
  {
    slug: null, name: 'Farida Sheikh', city: 'Mumbai', rating: 5, isFeatured: true,
    message: 'This was our third trip with ParthRahi. Clear pricing, no hidden charges, and someone always picks up the phone. That is rare.',
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const bySlug = {};
    for (const data of yatras) {
      const existing = await Yatra.findOne({ slug: data.slug });
      if (existing) {
        const preserved = existing.seatsBooked;
        existing.set({ ...data, seatsBooked: preserved });
        await existing.save();
        bySlug[data.slug] = existing;
        console.log(`Updated yatra "${existing.title}" (seatsBooked preserved: ${preserved})`);
      } else {
        const created = await Yatra.create(data);
        bySlug[data.slug] = created;
        console.log(`Created yatra "${created.title}" (${created._id})`);
      }
    }

    for (const t of testimonials) {
      const { slug, ...rest } = t;
      const yatraId = slug ? bySlug[slug]?._id || null : null;
      const found = await Testimonial.findOne({ name: rest.name, message: rest.message });
      if (!found) {
        await Testimonial.create({ ...rest, yatraId });
        console.log(`Created testimonial from ${rest.name}`);
      }
    }

    console.log('Seed complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();
