import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as t from './schema';

/* Local convenience only: in production the environment comes from the host. */
try {
  process.loadEnvFile?.('.env');
} catch {
  // no .env here
}

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema: t });

async function seed() {
  await db.delete(t.reviews);
  await db.delete(t.garageServices);
  await db.delete(t.garageLocations);
  await db.delete(t.garageBrands);
  await db.delete(t.brands);
  await db.delete(t.garages);
  await db.delete(t.services);
  await db.delete(t.serviceCategories);
  await db.delete(t.locations);
  await db.delete(t.servicePackages);

  const [carService, carRepair, bodyShop, roadside] = await db
    .insert(t.serviceCategories)
    .values([
      {
        slug: 'car-service',
        name: 'Car Service',
        tagline: 'Scheduled servicing and inspections that keep your car reliable.',
        description:
          'From an oil change to a full manufacturer-schedule service and pre-purchase inspections, compare quotes from verified UAE garages for all routine maintenance.',
        sort: 1,
      },
      {
        slug: 'car-repair',
        name: 'Car Repair',
        tagline: 'Diagnostics and repairs for engine, gearbox, AC, brakes and electrics.',
        description:
          'When something breaks, get multiple quotes fast. Cars911 garages handle engine, transmission, suspension, AC, brake and electrical repairs with warranty-backed workmanship.',
        sort: 2,
      },
      {
        slug: 'body-shop',
        name: 'Body Shop',
        tagline: 'Dents, paint, protection and detailing from specialist workshops.',
        description:
          'Accident repair, dent removal, resprays, ceramic coating, paint protection film and detailing — quoted by body shops that show you the work before they start.',
        sort: 3,
      },
      {
        slug: 'roadside-assistance',
        name: 'Roadside Assistance',
        tagline: 'Help where the car stopped, 24 hours a day, across all emirates.',
        description:
          'Jump starts, flat tyres, towing and mobile mechanics dispatched to your location. If it cannot be fixed roadside, we tow you to a network garage and you still get quotes.',
        sort: 4,
      },
    ])
    .returning();

  const svc = (
    categoryId: number,
    slug: string,
    seoSlug: string,
    name: string,
    excerpt: string,
    priceFromAed: number | null,
    priceToAed: number | null,
    durationLabel: string | null,
    sort: number,
  ) => ({
    categoryId,
    slug,
    seoSlug,
    name,
    excerpt,
    description: excerpt,
    priceFromAed,
    priceToAed,
    durationLabel,
    sort,
  });

  const insertedServices = await db
    .insert(t.services)
    .values([
      // Car Service
      svc(carService.id, 'minor-service', 'minor-car-service-dubai', 'Minor Service', 'Oil and filter change, fluid top-ups and a multi-point safety check — ideal every 5,000–10,000 km.', 149, 399, '1–2 hours', 1),
      svc(carService.id, 'major-service', 'major-car-service-dubai', 'Major Service', 'Comprehensive manufacturer-schedule service including plugs, filters, fluids and a full inspection.', 499, 1499, '3–5 hours', 2),
      svc(carService.id, 'oil-change', 'car-oil-change-dubai', 'Oil Change', 'Engine oil and filter replaced with the grade your car actually calls for, plus a fluid top-up.', 99, 349, '30–60 minutes', 3),
      svc(carService.id, 'inspection', 'car-inspection-dubai', 'Inspection', 'Multi-point inspection with a written report — know exactly what your car needs before you spend.', 99, 249, 'about 1 hour', 4),
      svc(carService.id, 'full-service', 'full-car-service-dubai', 'Full Service', 'Complete annual service covering all filters, fluids, brakes check and diagnostics scan.', 399, 999, '2–4 hours', 5),
      svc(carService.id, 'interim-service', 'interim-car-service-dubai', 'Interim Service', 'Light service between scheduled visits for high-mileage drivers — oil, filter and safety check.', 129, 299, 'about 1 hour', 6),
      svc(carService.id, 'pre-purchase-inspection', 'pre-purchase-car-inspection-dubai', 'Pre-Purchase Inspection', 'Independent used-car check before you buy: body, mechanical, electronics and history flags.', 249, 599, '1–2 hours', 7),
      svc(carService.id, 'computer-diagnostics', 'car-computer-diagnostics-dubai', 'Computer Diagnostics', 'Full diagnostics scan, insurance inspections and 360° condition reports with the fault codes explained.', 149, 449, 'about 1 hour', 8),
      svc(carService.id, 'ev-hybrid-servicing', 'ev-hybrid-car-service-dubai', 'EV & Hybrid Servicing', 'High-voltage-trained workshops for electric and hybrid cars: battery health checks, cooling, brakes and software.', 199, 899, '1–3 hours', 9),
      svc(carService.id, 'mobile-mechanic', 'mobile-mechanic-dubai', 'Mobile Mechanic', 'A mechanic arrives at your home or office with the tools and the parts, and does the job in the parking space.', 149, 899, '1–3 hours', 10),

      // Car Repair
      svc(carRepair.id, 'engine-repair', 'car-engine-repair-dubai', 'Engine Repair', 'From misfires and overheating to full rebuilds — diagnosed and quoted by specialists.', 299, null, 'varies by fault', 1),
      svc(carRepair.id, 'transmission-repair', 'car-transmission-repair-dubai', 'Transmission Repair', 'Automatic and manual gearbox servicing, repairs and replacements with warranty.', 399, null, 'varies by fault', 2),
      svc(carRepair.id, 'brake-repair', 'car-brake-repair-dubai', 'Brake Repair', 'Pads, discs, callipers and brake fluid — safety-critical work done same day.', 179, 799, '1–3 hours', 3),
      svc(carRepair.id, 'ac-repair', 'car-ac-repair-dubai', 'AC Repair', 'AC not cooling? Gas refill, compressor, condenser and leak repairs built for UAE summers.', 149, 899, '1–4 hours', 4),
      svc(carRepair.id, 'battery-replacement', 'car-battery-replacement-dubai', 'Battery Replacement', 'Battery testing and replacement with the right cold-crank rating, fitted at the garage or at your door.', 199, 899, '30–45 minutes', 5),
      svc(carRepair.id, 'suspension-repair', 'car-suspension-repair-dubai', 'Suspension Repair', 'Shocks, struts, bushes, control arms and alignment for a smooth, safe ride.', 199, null, '2–6 hours', 6),
      svc(carRepair.id, 'electrical-repair', 'car-electrical-repair-dubai', 'Electrical Repair', 'Alternators, starters, sensors, wiring faults and parasitic drains traced properly rather than guessed at.', 199, null, 'varies by fault', 7),
      svc(carRepair.id, 'exhaust-system', 'car-exhaust-repair-dubai', 'Exhaust System', 'Exhaust repairs, replacements and performance upgrades with emissions compliance.', 149, null, '1–3 hours', 8),
      svc(carRepair.id, 'tyres-wheels', 'car-tyre-service-dubai', 'Tyres & Wheels', 'Tyre supply and fitting, balancing, alignment, rim repair and TPMS service.', 99, null, '30–90 minutes', 9),
      svc(carRepair.id, 'wheel-alignment', 'wheel-alignment-dubai', 'Wheel Alignment', 'Four-wheel laser alignment: stops the car pulling, stops the steering sitting crooked, and stops a new set of tyres wearing out on one edge.', 79, 299, '45–90 minutes', 10),
      svc(carRepair.id, 'wheel-balancing', 'wheel-balancing-dubai', 'Wheel Balancing', 'Wheels balanced on the machine to take the vibration out of the steering wheel and the seat at motorway speed.', 40, 150, '30–60 minutes', 11),

      // Body Shop
      svc(bodyShop.id, 'dent-repair', 'car-dent-repair-dubai', 'Dent Repair', 'Paintless dent removal and panel work for car-park dings, trolley marks and hail damage.', 199, null, '2 hours–2 days', 1),
      svc(bodyShop.id, 'paint-repair', 'car-paint-repair-dubai', 'Paint Repair', 'Panel and full-body resprays in booth-quality finish with proper colour matching.', 299, null, '1–5 days', 2),
      svc(bodyShop.id, 'ceramic-coating', 'ceramic-coating-dubai', 'Ceramic Coating', 'Hard protective layer over the paint that shrugs off sun, sand and washing marks.', 799, 3499, '1–2 days', 3),
      svc(bodyShop.id, 'ppf', 'paint-protection-film-dubai', 'Paint Protection Film (PPF)', 'Clear film over the panels that take the stone chips — bonnet, bumper, mirrors or the whole car.', 1499, 8999, '1–3 days', 4),
      svc(bodyShop.id, 'detailing', 'car-detailing-dubai', 'Detailing', 'Interior and exterior deep cleaning, polishing and paint correction.', 149, 999, '2–6 hours', 5),
      svc(bodyShop.id, 'wrapping-tinting', 'car-wrapping-dubai', 'Car Wrapping', 'Colour-change wraps, satin and matte finishes, and commercial branding, fitted by installers who wrap for a living.', 299, 3499, '1–2 days', 6),
      svc(bodyShop.id, 'car-wash', 'car-wash-dubai', 'Car Wash', 'Exterior wash, wheels and glass with an interior vacuum — from a maintenance wash between services to a full inside-out clean.', 25, 150, '20–60 minutes', 7),
      svc(bodyShop.id, 'mobile-car-wash', 'mobile-car-wash-dubai', 'Mobile Car Wash', 'A van arrives at your building or office car park with its own water and power and washes the car where it is parked.', 45, 180, '30–60 minutes', 8),
      svc(bodyShop.id, 'window-tinting', 'car-window-tinting-dubai', 'Window Tinting', 'Heat-rejection film fitted at the legal 50% visible-light limit, warrantied against bubbling and the purple fade cheap film gets here.', 299, 1499, '2–4 hours', 9),

      // Roadside Assistance
      svc(roadside.id, 'battery-jump-start', 'car-battery-jump-start-dubai', 'Battery Jump Start', 'A unit comes to you, starts the car and tests whether the battery will survive the next morning.', 99, 249, '20–45 minutes', 1),
      svc(roadside.id, 'flat-tyre', 'flat-tyre-repair-dubai', 'Flat Tyre', 'Spare fitted at the roadside, or the wheel taken away and the tyre repaired or replaced.', 99, 349, '20–40 minutes', 2),
      svc(roadside.id, 'towing', 'car-towing-dubai', 'Towing', 'Flatbed recovery to a network garage of your choice, anywhere in the UAE.', 199, 799, '30–90 minutes', 3),
      svc(roadside.id, 'emergency-mechanic', 'emergency-mobile-mechanic-dubai', 'Emergency Mechanic', 'A mobile mechanic diagnoses the fault where you are and fixes it on the spot when it can be fixed.', 149, 599, '30–90 minutes', 4),
    ])
    .returning();

  const emirateRows = await db
    .insert(t.locations)
    .values([
      { slug: 'dubai', name: 'Dubai', type: 'emirate' as const, sort: 1, blurb: 'The largest garage network in the UAE — from Al Quoz workshops to mobile mechanics across the city.' },
      { slug: 'abu-dhabi', name: 'Abu Dhabi', type: 'emirate' as const, sort: 2, blurb: 'Verified garages across Abu Dhabi city, Mussafah and beyond.' },
      { slug: 'sharjah', name: 'Sharjah', type: 'emirate' as const, sort: 3, blurb: 'Trusted workshops in Sharjah industrial areas with competitive pricing.' },
      { slug: 'ajman', name: 'Ajman', type: 'emirate' as const, sort: 4, blurb: 'Quality car servicing in Ajman without the Dubai price tag.' },
      { slug: 'ras-al-khaimah', name: 'Ras Al Khaimah', type: 'emirate' as const, sort: 5, blurb: 'RAK garages for servicing, repairs and roadside assistance.' },
      { slug: 'fujairah', name: 'Fujairah', type: 'emirate' as const, sort: 6, blurb: 'East-coast coverage for maintenance, repairs and recovery.' },
      { slug: 'umm-al-quwain', name: 'Umm Al Quwain', type: 'emirate' as const, sort: 7, blurb: 'Local garages in UAQ backed by the Cars911 network.' },
      { slug: 'al-ain', name: 'Al Ain', type: 'emirate' as const, sort: 8, blurb: 'Garden-city garages for every make and model.' },
    ])
    .returning();

  const dubai = emirateRows.find((l) => l.slug === 'dubai')!;

  const areaRows = await db
    .insert(t.locations)
    .values(
      [
        ['al-quoz', 'Al Quoz', 'Dubai’s garage district — the highest concentration of specialist workshops in the UAE.'],
        ['al-barsha', 'Al Barsha', 'Convenient servicing for Barsha and Tecom residents.'],
        ['business-bay', 'Business Bay', 'Fast turnaround and pick & drop for downtown professionals.'],
        ['deira', 'Deira', 'Established workshops on the Deira side with decades of experience.'],
        ['ras-al-khor', 'Ras Al Khor', 'Industrial-area garages with strong value pricing.'],
        ['dip', 'Dubai Investment Park', 'Serving DIP, Green Community and Expo City surroundings.'],
        ['al-qusais', 'Al Qusais', 'North-east Dubai coverage including Muhaisnah and Mirdif.'],
        ['jebel-ali', 'Jebel Ali', 'Fleet-friendly garages near JAFZA and Dubai South.'],
        ['dubai-marina', 'Dubai Marina', 'Tower living with no workshop for miles: Marina cars are serviced either by mobile mechanics working in the basement car parks or by garages in Al Quoz and Jebel Ali that collect from the building. Short-hop driving and salt-laden air off the water make batteries, brake discs and AC the three things that go first here.'],
        ['downtown-dubai', 'Downtown Dubai', 'Valet parking, underground bays and very little tolerance for a car being away for a week. Downtown requests skew heavily towards pick & drop servicing and same-day repairs, and towards mobile jobs — battery, wash, minor service — that can be finished in a residents\u2019 parking space between meetings.'],
        ['jumeirah', 'Jumeirah', 'Villa Dubai: two cars per household, long ownership and a strong preference for the same garage year after year. Jumeirah work leans towards scheduled servicing on family SUVs, paint correction and detailing kept up between services, and sand and salt washed out of the underbody before it does damage.'],
        ['dubai-silicon-oasis', 'Dubai Silicon Oasis', 'A self-contained community with its own small workshops and a commuter run down the Dubai\u2013Al Ain road every morning. High annual mileage means DSO cars come in for oil changes, brakes and tyres more often than the calendar suggests, and for AC service before the first hot week.'],
        ['motor-city', 'Motor City', 'The one district built around cars, with performance shops, tuners and specialists inside the community itself. Work here runs to brake and suspension upgrades, track preparation, tyres and geometry setup alongside ordinary servicing for the families in the towers above.'],
        ['jvc', 'Jumeirah Village Circle', 'Dubai\u2019s densest apartment district and one of its youngest car parcs, with heavy stop-start driving on the Circle and long queues at the exits. Batteries, gearbox oil and AC gas top the list, and mobile mechanics reach JVC faster than most residents can reach a garage.'],
        ['arabian-ranches', 'Arabian Ranches', 'Family SUVs, school runs and weekend desert trips, parked in villa driveways rather than shaded basements. Ranches cars need their cooling, suspension and tyres watched more closely than mileage alone suggests, and almost every booking here uses pick & drop from the villa.'],
        ['palm-jumeirah', 'Palm Jumeirah', 'Sea air on every side, which is the reason Palm cars corrode brake hardware and lose paint clarity faster than cars two kilometres inland. The bulk of the work here is protection rather than repair \u2014 ceramic coating, PPF, regular washing \u2014 alongside servicing collected from the building by the garage.'],
      ].map(([slug, name, blurb], i) => ({
        slug,
        name,
        type: 'area' as const,
        parentId: dubai.id,
        blurb,
        sort: i + 1,
      })),
    )
    .returning();

  const brandRows = await db
    .insert(t.brands)
    .values([
      {
        slug: 'bmw',
        name: 'BMW',
        origin: 'German',
        tagline: 'Specialist BMW servicing without the dealer invoice.',
        description:
          'BMWs are precise cars that punish guesswork. Cars911 garages with BMW experience use the diagnostic software the car expects, follow the condition-based service schedule, and quote genuine or OEM parts so you can see exactly what you are paying for.',
        commonJobs: ['Condition-based servicing', 'Cooling system and water pump', 'Timing chain and VANOS', 'Suspension bushes and arms', 'Coding after part replacement'],
        sort: 1,
      },
      {
        slug: 'mercedes-benz',
        name: 'Mercedes-Benz',
        origin: 'German',
        tagline: 'Service A and Service B, quoted by garages that do them properly.',
        description:
          'Mercedes servicing follows a fixed A/B schedule, and the cost difference between workshops is mostly parts and labour rate rather than the work itself. Compare quotes from garages that carry the right diagnostic access and know the common AIRMATIC and injector faults.',
        commonJobs: ['Service A and Service B', 'AIRMATIC suspension', 'Injector and glow plug work', 'Transmission oil and conductor plate', 'AC system repairs'],
        sort: 2,
      },
      {
        slug: 'audi',
        name: 'Audi',
        origin: 'German',
        tagline: 'Quattro drivetrains and TFSI engines, handled by people who know them.',
        description:
          'Audi work rewards specialists: oil consumption on older TFSI engines, DSG service intervals and quattro drivetrain checks all need the right tooling. Cars911 puts garages with that experience side by side so you can compare on warranty as well as price.',
        commonJobs: ['DSG and S tronic service', 'TFSI oil consumption and carbon cleaning', 'Quattro drivetrain checks', 'Electronic module coding', 'Suspension and drive shaft work'],
        sort: 3,
      },
      {
        slug: 'toyota',
        name: 'Toyota',
        origin: 'Japanese',
        tagline: 'The UAE’s most common car, serviced at sensible prices.',
        description:
          'Land Cruisers, Corollas, Camrys and Hiluxes are the backbone of UAE roads, and almost every garage in the network can service one. That means real competition on price — the same scheduled service can vary by several hundred dirhams between workshops.',
        commonJobs: ['Scheduled 10,000 km servicing', 'Timing belt and water pump', 'Suspension and bushes on Land Cruiser', 'AC compressor and radiator', 'Brake and clutch work'],
        sort: 4,
      },
      {
        slug: 'nissan',
        name: 'Nissan',
        origin: 'Japanese',
        tagline: 'Patrol, Altima and Sunny servicing across every emirate.',
        description:
          'Nissan servicing is well covered across the network, from Patrol suspension and gearbox work to routine servicing on Altimas and Sunnys. CVT gearboxes in particular need the correct fluid and procedure, which is worth confirming on the quote.',
        commonJobs: ['Scheduled servicing', 'CVT gearbox service', 'Patrol suspension and steering', 'AC and cooling in summer', 'Brake and battery replacement'],
        sort: 5,
      },
      {
        slug: 'porsche',
        name: 'Porsche',
        origin: 'German',
        tagline: 'Independent Porsche specialists with the diagnostic kit the car expects.',
        description:
          'A 911, Cayenne or Macan does not forgive an improvised service. The garages that take Porsche work in the network run PIWIS-level diagnostics, follow the schedule the car reports rather than a generic interval, and will tell you before they start whether a job needs genuine parts or whether a quality OEM equivalent is the sensible call.',
        commonJobs: ['Scheduled minor and major servicing', 'Coolant pipes and water pump', 'PDK gearbox service', 'Brake discs, pads and fluid', 'Suspension and air-spring replacement'],
        sort: 6,
      },
      {
        slug: 'range-rover',
        name: 'Range Rover',
        origin: 'British',
        tagline: 'The make that rewards a specialist and punishes a guess.',
        description:
          'Range Rovers are the most common luxury SUV on Dubai roads and the most commonly misdiagnosed. Air suspension, electronics and cooling are where the money goes, and a workshop that has seen the fault before will quote a repair where a generalist quotes a replacement. Every garage listed here has Land Rover diagnostic access.',
        commonJobs: ['Air suspension compressor and bags', 'Timing chain on supercharged V6 and V8', 'Cooling system and thermostat housing', 'Electrical and module faults', 'Full scheduled servicing'],
        sort: 7,
      },
      {
        slug: 'bentley',
        name: 'Bentley',
        origin: 'British',
        tagline: 'Dealer-level Bentley work without the dealer invoice.',
        description:
          'Bentley servicing is mostly patience and parts pricing. The specialists in the network quote the parts line by line so you can see where the money goes, and hold the same warranty terms on a Continental GT service that they do on anything else they touch.',
        commonJobs: ['Scheduled servicing and inspection', 'Air suspension and dampers', 'Brake discs and pads', 'W12 coil packs and plugs', 'Interior trim and leather repair'],
        sort: 8,
      },
      {
        slug: 'rolls-royce',
        name: 'Rolls-Royce',
        origin: 'British',
        tagline: 'A very short list of garages, verified for exactly this.',
        description:
          'Few independent workshops in the UAE are set up for a Phantom, Ghost or Cullinan, and the ones that are do not advertise loudly. Requests for Rolls-Royce work go only to garages that have the equipment, the insurance cover for the value of the car, and the discretion the owners expect.',
        commonJobs: ['Scheduled servicing', 'Air suspension and ride control', 'Brake system service', 'Paint correction and protection', 'Electronics and infotainment faults'],
        sort: 9,
      },
      {
        slug: 'ferrari',
        name: 'Ferrari',
        origin: 'Italian',
        tagline: 'Specialists for servicing, fluids and pre-track preparation.',
        description:
          'Ferrari servicing in the UAE splits between annual fluid-and-inspection work, which independents do well and considerably cheaper than the dealer, and major engine-out jobs, which belong with a specialist. The network tells you honestly which side of that line your car is on before you book.',
        commonJobs: ['Annual service and fluid change', 'Brake discs, pads and fluid', 'Clutch wear measurement and replacement', 'Suspension and geometry setup', 'Pre-track inspection and corner weighting'],
        sort: 10,
      },
      {
        slug: 'lamborghini',
        name: 'Lamborghini',
        origin: 'Italian',
        tagline: 'Huracán and Urus work from workshops that see them weekly.',
        description:
          'The Urus has quietly become an ordinary sight in Dubai, which means real competition for its servicing; the Huracán and Aventador stay specialist work. Both are covered by garages that hold the diagnostic access and the lifts to handle the ride height.',
        commonJobs: ['Scheduled servicing', 'Carbon-ceramic brake inspection and replacement', 'Clutch and gearbox service', 'Suspension lift system faults', 'Paint protection film'],
        sort: 11,
      },
      {
        slug: 'mclaren',
        name: 'McLaren',
        origin: 'British',
        tagline: 'Carbon-tub specialists, not general sports-car garages.',
        description:
          'McLaren work is a short list of jobs done precisely: fluids on schedule, brake and suspension inspection, and the hydraulic and electronic systems that make the car unusual. Requests are routed only to workshops with McLaren diagnostic access and experience of the carbon monocoque.',
        commonJobs: ['Annual service and fluids', 'Brake and hydraulic suspension inspection', 'Battery conditioning and electronics', 'Paint protection film and detailing', 'Pre-track preparation'],
        sort: 12,
      },
    ])
    .returning();

  const garageRows = await db
    .insert(t.garages)
    .values([
      {
        slug: 'apex-auto-care',
        name: 'Apex Auto Care',
        tier: 'premium' as const,
        description: 'German-car specialists in Al Quoz with dealer-level diagnostics, genuine parts and air-conditioned customer lounge.',
        phone: '+97143001111',
        whatsapp: '97143001111',
        warrantyMonths: 12,
        turnaroundHours: 24,
        priceBand: '$$$',
      },
      {
        slug: 'desert-line-garage',
        name: 'Desert Line Garage',
        tier: 'verified' as const,
        description: 'All-makes workshop in Al Qusais known for honest pricing and same-day minor services.',
        phone: '+97142002222',
        whatsapp: '97142002222',
        warrantyMonths: 6,
        turnaroundHours: 8,
        priceBand: '$$',
      },
      {
        slug: 'gulf-star-motors',
        name: 'Gulf Star Motors',
        tier: 'verified' as const,
        description: 'Family-run Sharjah garage covering Japanese and Korean brands, with recovery service.',
        phone: '+97165003333',
        whatsapp: '97165003333',
        warrantyMonths: 6,
        turnaroundHours: 12,
        priceBand: '$',
      },
      {
        slug: 'prime-shield-detailing',
        name: 'Prime Shield Detailing',
        tier: 'premium' as const,
        description: 'Ceramic coating, PPF and detailing studio in Al Barsha with climate-controlled bays.',
        phone: '+97144004444',
        whatsapp: '97144004444',
        warrantyMonths: 24,
        turnaroundHours: 48,
        priceBand: '$$$',
      },
      {
        slug: 'roadrunner-mobile-mechanics',
        name: 'RoadRunner Mobile Mechanics',
        tier: 'mobile' as const,
        description: 'Mobile mechanics covering all of Dubai — batteries, minor services and diagnostics at your doorstep.',
        phone: '+97150005555',
        whatsapp: '97150005555',
        warrantyMonths: 3,
        turnaroundHours: 2,
        priceBand: '$$',
      },
      {
        slug: 'capital-auto-hub',
        name: 'Capital Auto Hub',
        tier: 'verified' as const,
        description: 'Mussafah workshop serving Abu Dhabi fleets and private owners with full mechanical and body shop.',
        phone: '+97125006666',
        whatsapp: '97125006666',
        warrantyMonths: 12,
        turnaroundHours: 24,
        priceBand: '$$',
      },
    ])
    .returning();

  const bySlug = <T extends { slug: string }>(rows: T[]) =>
    Object.fromEntries(rows.map((r) => [r.slug, r]));
  const g = bySlug(garageRows);
  const s = bySlug(insertedServices);
  const loc = bySlug([...emirateRows, ...areaRows]);

  const b = bySlug(brandRows);

  const link = (
    garage: string,
    serviceSlugs: string[],
    locationSlugs: string[],
    brandSlugs: string[],
  ) => ({
    services: serviceSlugs.map((slug) => ({ garageId: g[garage].id, serviceId: s[slug].id })),
    locations: locationSlugs.map((slug) => ({ garageId: g[garage].id, locationId: loc[slug].id })),
    brands: brandSlugs.map((slug) => ({ garageId: g[garage].id, brandId: b[slug].id })),
  });

  const german = ['bmw', 'mercedes-benz', 'audi'];
  const japanese = ['toyota', 'nissan'];
  const luxury = ['porsche', 'range-rover', 'bentley', 'rolls-royce', 'ferrari', 'lamborghini', 'mclaren'];
  const allBrands = [...german, ...japanese];

  const links = [
    link('apex-auto-care', ['minor-service', 'major-service', 'full-service', 'engine-repair', 'transmission-repair', 'ac-repair', 'brake-repair', 'electrical-repair', 'computer-diagnostics', 'ev-hybrid-servicing', 'wheel-alignment'], ['dubai', 'al-quoz', 'motor-city', 'arabian-ranches'], [...german, 'porsche', 'range-rover']),
    link('desert-line-garage', ['minor-service', 'interim-service', 'oil-change', 'brake-repair', 'suspension-repair', 'battery-replacement', 'tyres-wheels', 'wheel-alignment', 'wheel-balancing', 'car-wash'], ['dubai', 'al-qusais', 'dubai-silicon-oasis', 'jvc'], allBrands),
    link('gulf-star-motors', ['minor-service', 'major-service', 'engine-repair', 'ac-repair', 'exhaust-system', 'inspection', 'towing', 'wheel-alignment', 'wheel-balancing'], ['sharjah'], japanese),
    link('prime-shield-detailing', ['detailing', 'ceramic-coating', 'ppf', 'wrapping-tinting', 'window-tinting', 'car-wash', 'paint-repair', 'dent-repair'], ['dubai', 'al-barsha', 'palm-jumeirah', 'jumeirah', 'dubai-marina'], [...allBrands, ...luxury]),
    link('roadrunner-mobile-mechanics', ['battery-replacement', 'oil-change', 'interim-service', 'computer-diagnostics', 'battery-jump-start', 'flat-tyre', 'emergency-mechanic', 'mobile-mechanic', 'mobile-car-wash'], ['dubai', 'business-bay', 'al-barsha', 'jebel-ali', 'dubai-marina', 'downtown-dubai', 'jvc', 'dubai-silicon-oasis', 'motor-city'], allBrands),
    link('capital-auto-hub', ['minor-service', 'major-service', 'dent-repair', 'paint-repair', 'brake-repair', 'electrical-repair', 'pre-purchase-inspection', 'towing', 'ev-hybrid-servicing', 'car-wash', 'wheel-alignment', 'wheel-balancing', 'window-tinting'], ['abu-dhabi'], [...allBrands, 'range-rover']),
  ];

  await db.insert(t.garageServices).values(links.flatMap((l) => l.services));
  await db.insert(t.garageLocations).values(links.flatMap((l) => l.locations));
  await db.insert(t.garageBrands).values(links.flatMap((l) => l.brands));

  await db.insert(t.reviews).values([
    { garageId: g['apex-auto-care'].id, serviceId: s['major-service'].id, authorName: 'Omar K.', rating: 5, comment: 'Dealer quality at half the price. My BMW feels brand new.', approved: true },
    { garageId: g['apex-auto-care'].id, serviceId: s['minor-service'].id, authorName: 'Sarah M.', rating: 4, comment: 'Great work, slightly busy on weekends — book ahead.', approved: true },
    { garageId: g['apex-auto-care'].id, serviceId: s['brake-repair'].id, authorName: 'Daniel V.', rating: 5, comment: 'Quoted pads and discs, found the discs were still within spec and only charged for pads. Told me before doing it.', approved: true },
    { garageId: g['desert-line-garage'].id, serviceId: s['minor-service'].id, authorName: 'Imran S.', rating: 5, comment: 'Honest guys. Quoted less than the dealer and finished the same day.', approved: true },
    { garageId: g['desert-line-garage'].id, serviceId: s['wheel-alignment'].id, authorName: 'Noor H.', rating: 5, comment: 'Car was pulling left after a pothole on Al Khail. Alignment sorted it in under an hour.', approved: true },
    { garageId: g['desert-line-garage'].id, serviceId: s['car-wash'].id, authorName: 'Yousef A.', rating: 4, comment: 'Good wash for the money. Interior vacuum was better than the mall places.', approved: true },
    { garageId: g['gulf-star-motors'].id, serviceId: s['ac-repair'].id, authorName: 'Fatima A.', rating: 4, comment: 'AC repair done quickly, fair price for Sharjah.', approved: true },
    { garageId: g['gulf-star-motors'].id, serviceId: s['ac-repair'].id, authorName: 'Rashid M.', rating: 5, comment: 'Regassed and found the leak in the condenser. Cold again through the whole summer.', approved: true },
    { garageId: g['prime-shield-detailing'].id, serviceId: s['ceramic-coating'].id, authorName: 'James R.', rating: 5, comment: 'The ceramic coating is flawless. Worth every dirham.', approved: true },
    { garageId: g['prime-shield-detailing'].id, serviceId: s['window-tinting'].id, authorName: 'Layla F.', rating: 5, comment: 'Tint is even, no bubbles, and they showed me the VLT reading before I paid.', approved: true },
    { garageId: g['prime-shield-detailing'].id, serviceId: s['detailing'].id, authorName: 'Marcus T.', rating: 4, comment: 'Interior came up like new. Took longer than quoted but they kept me updated.', approved: true },
    { garageId: g['roadrunner-mobile-mechanics'].id, serviceId: s['battery-replacement'].id, authorName: 'Aisha B.', rating: 5, comment: 'Battery died at the mall — they arrived in 40 minutes.', approved: true },
    { garageId: g['roadrunner-mobile-mechanics'].id, serviceId: s['mobile-car-wash'].id, authorName: 'Priya N.', rating: 5, comment: 'Washed the car in the JVC basement while I worked. No hose, no mess.', approved: true },
    { garageId: g['roadrunner-mobile-mechanics'].id, serviceId: s['mobile-mechanic'].id, authorName: 'Tom B.', rating: 4, comment: 'Did the service in my building car park. Cheaper than the dealer and I never left the desk.', approved: true },
    { garageId: g['capital-auto-hub'].id, serviceId: s['pre-purchase-inspection'].id, authorName: 'Khalid R.', rating: 5, comment: 'Inspection found accident repair the seller had not mentioned. Saved me a bad buy.', approved: true },
  ]);

  await db.insert(t.servicePackages).values([
    {
      slug: 'essential-care',
      name: 'Essential Care',
      description: 'Everything a daily driver needs to stay safe and reliable.',
      priceAed: 349,
      features: ['Minor service (oil + filter)', 'Multi-point safety inspection', 'Fluid top-ups', 'Battery & tyre health check', 'Service reminder tracking'],
      sort: 1,
    },
    {
      slug: 'complete-care',
      name: 'Complete Care',
      description: 'Our most popular package — a full service plus diagnostics.',
      priceAed: 749,
      features: ['Full service (all filters + fluids)', 'Computer diagnostics scan', 'Brake inspection & clean', 'AC performance check', 'Pick & drop included', '6-month workmanship warranty'],
      sort: 2,
    },
    {
      slug: 'premium-care',
      name: 'Premium Care',
      description: 'Major service with premium parts and full concierge handling.',
      priceAed: 1499,
      features: ['Major manufacturer-schedule service', 'Genuine or OEM parts', 'Full detail wash included', 'Pick & drop included', '12-month workmanship warranty', 'Dedicated service advisor'],
      sort: 3,
    },
  ]);

  console.log(
    `Seeded: ${insertedServices.length} services, ${emirateRows.length + areaRows.length} locations, ${brandRows.length} brands, ${garageRows.length} garages.`,
  );
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
