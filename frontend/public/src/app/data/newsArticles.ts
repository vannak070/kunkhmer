export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  featured: boolean;
  content: string;
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "1",
    title: "Prom Samnang vs Chan Rothana: Championship Fight Set for April 15",
    excerpt: "The highly anticipated championship bout between two of Cambodia's finest warriors has been officially confirmed for next month at the Olympic Stadium.",
    image: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800",
    category: "Events",
    author: "KKF Official",
    date: "2026-03-25",
    featured: true,
    content: "The Kun Khmer Federation is thrilled to announce the highly anticipated championship bout between Prom Samnang and Chan Rothana, scheduled for April 15th at the Olympic Stadium in Phnom Penh.\n\nThis showdown brings together two of Cambodia's most accomplished fighters, each with an impressive track record. Prom Samnang, the current champion, has successfully defended his title three times and boasts an outstanding record of 45-3-2. His opponent, Chan Rothana, is the top-ranked contender with a remarkable 42-5-1 record and a reputation for devastating knockout power.\n\nThe event is expected to draw over 15,000 spectators and will be broadcast live on multiple networks across Southeast Asia. Both fighters have completed their training camps and are in peak condition for what promises to be an unforgettable night of world-class Kun Khmer action.\n\nTickets go on sale next week, with prices ranging from $20 to $150. VIP packages including meet-and-greet opportunities with the fighters are also available."
  },
  {
    id: "2",
    title: "New State-of-the-Art Training Facility Opens in Phnom Penh",
    excerpt: "The Kun Khmer Federation unveils a world-class training center equipped with modern facilities for fighters.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
    category: "News",
    author: "Sports Desk",
    date: "2026-03-24",
    featured: false,
    content: "The Kun Khmer Federation officially opened its new state-of-the-art training facility in Phnom Penh yesterday, marking a significant milestone in the development of Cambodian martial arts.\n\nThe 5,000 square meter facility features multiple training rings, strength and conditioning areas, medical treatment rooms, and recovery facilities including ice baths and massage therapy rooms. The center also houses video analysis equipment and a performance tracking system to help fighters optimize their training.\n\n'This facility represents our commitment to developing world-class athletes,' said KKF President Sok Panha during the opening ceremony. 'We want to provide our fighters with the best possible training environment to compete on the international stage.'\n\nThe facility will be open to all registered KKF fighters and will host regular training camps led by top coaches from around the world. Applications for membership are now being accepted through the KKF website."
  },
  {
    id: "3",
    title: "Rising Star: Meet Thun Chanthy, Cambodia's Next Champion",
    excerpt: "An exclusive interview with the young fighter making waves in the Kun Khmer circuit.",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800",
    category: "Fighter Spotlight",
    author: "Maya Chen",
    date: "2026-03-22",
    featured: false,
    content: "At just 21 years old, Thun Chanthy is already being hailed as one of the most promising talents in Kun Khmer. With an undefeated record of 15-0, including 10 knockouts, the young fighter from Siem Reap has captured the attention of fans and experts alike.\n\n'I've been training since I was 8 years old,' Chanthy told us during our exclusive interview. 'Kun Khmer is not just a sport for me, it's a way of life and a connection to my heritage.'\n\nUnder the guidance of renowned coach Pich Sarun at the Angkor Warriors gym, Chanthy has developed a unique fighting style that blends traditional techniques with modern training methods. His combination of speed, power, and technical precision has made him a nightmare for opponents.\n\nNext month, Chanthy will face his toughest test yet when he takes on veteran fighter Sok Pisey for the lightweight championship. A win would make him the youngest champion in KKF history.\n\n'I'm ready for this challenge,' Chanthy says with quiet confidence. 'I've worked hard for this opportunity, and I won't let it pass me by.'"
  },
  {
    id: "4",
    title: "KKF Partners with International Muay Thai Federation for Cultural Exchange",
    excerpt: "Historic agreement strengthens ties between Cambodian and Thai martial arts communities.",
    image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800",
    category: "News",
    author: "International Desk",
    date: "2026-03-21",
    featured: false,
    content: "The Kun Khmer Federation has signed a groundbreaking partnership agreement with the International Muay Thai Federation to promote cultural exchange and mutual respect between the two ancient martial arts traditions.\n\nThe agreement, signed in Bangkok yesterday, establishes a framework for joint training camps, referee exchanges, and collaborative events that will showcase both Kun Khmer and Muay Thai to global audiences.\n\n'This partnership is about celebrating our shared heritage while recognizing the unique characteristics of each martial art,' said KKF President Sok Panha. 'We believe this will strengthen both communities and promote Southeast Asian martial arts worldwide.'\n\nThe first joint event is scheduled for June 2026, featuring exhibition matches and cultural performances from both countries. The partnership also includes provisions for coach education programs and youth development initiatives."
  },
  {
    id: "5",
    title: "Traditional Kun Khmer Techniques Featured in New Training Documentary",
    excerpt: "Award-winning filmmaker captures ancient fighting methods passed down through generations.",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
    category: "Training",
    author: "Culture Desk",
    date: "2026-03-20",
    featured: true,
    content: "A new documentary exploring the traditional techniques of Kun Khmer is set to premiere at the Angkor Film Festival next month. The film, titled 'The Way of the Khmer Warrior,' features master practitioners demonstrating ancient fighting methods that have been preserved for centuries.\n\nDirector Vanna Sok spent two years filming at training camps across Cambodia, documenting techniques that are rarely seen outside of traditional schools. The documentary includes interviews with legendary fighters and historians who explain the cultural significance of each movement.\n\n'These techniques represent more than just fighting methods,' explains master trainer Kun Bora, who appears in the film. 'They embody the spirit and resilience of the Cambodian people throughout history.'\n\nThe film will be available for streaming on international platforms starting in May, introducing global audiences to the rich traditions of Kun Khmer."
  },
  {
    id: "6",
    title: "Women's Division Sees Record Growth in 2026 Season",
    excerpt: "Female fighters continue to break barriers and attract new audiences to Kun Khmer.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    category: "News",
    author: "Sports Desk",
    date: "2026-03-18",
    featured: false,
    content: "The KKF women's division has experienced unprecedented growth this season, with registration numbers up 45% compared to last year. The surge reflects increasing recognition of female fighters and growing support for women's participation in the sport.\n\nSeveral female fighters have become household names, with their matches drawing record viewership and social media engagement. Champions like Sreymom Phan and Kolap Ny have become role models for young women across Cambodia.\n\n'The talent and dedication we're seeing in the women's division is absolutely remarkable,' said KKF Women's Division Coordinator Chenda Lim. 'These athletes are not only elite competitors but also ambassadors for the sport.'\n\nThe federation has announced plans to expand the women's division with additional weight classes and more frequent championship events to accommodate the growing interest."
  },
  {
    id: "7",
    title: "Youth Development Program Launches in Rural Provinces",
    excerpt: "KKF initiative brings training opportunities to underserved communities across Cambodia.",
    image: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800",
    category: "News",
    author: "Community Desk",
    date: "2026-03-15",
    featured: false,
    content: "The Kun Khmer Federation has launched an ambitious youth development program aimed at identifying and nurturing talent in rural provinces. The initiative provides free training, equipment, and mentorship to young people who might not otherwise have access to quality instruction.\n\nThe program operates in partnership with local schools and community centers in eight provinces, reaching over 500 young people in its first phase. Experienced coaches from Phnom Penh travel regularly to conduct training sessions and evaluate promising students.\n\n'Every child deserves the opportunity to learn their cultural heritage and develop their potential,' said program director Vibol Chea. 'This program is about more than creating fighters—it's about building character, discipline, and community.'\n\nThe federation plans to expand the program to all provinces by 2027, with scholarships available for exceptional students to train at the national facility in Phnom Penh."
  },
  {
    id: "8",
    title: "Veteran Fighter Sopheak Announces Retirement After Legendary Career",
    excerpt: "The beloved champion reflects on 15 years of unforgettable battles and memorable victories.",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800",
    category: "Fighter Spotlight",
    author: "Sports Desk",
    date: "2026-03-12",
    featured: false,
    content: "Kun Khmer legend Dara Sopheak announced his retirement yesterday, bringing an end to one of the most celebrated careers in the sport's modern era. With a professional record of 67-8-3 and four championship titles, Sopheak leaves behind an unmatched legacy.\n\nThe 36-year-old fighter made the announcement at an emotional press conference, thanking his fans, coaches, and fellow fighters for their support throughout his journey. His final match, scheduled for next month, will be a special exhibition bout with proceeds benefiting youth programs.\n\n'Kun Khmer gave me everything,' Sopheak said through tears. 'It taught me discipline, respect, and how to face adversity with courage. I'm proud of what I've accomplished, but I'm even more proud to have represented Cambodia on the world stage.'\n\nThe KKF will honor Sopheak at a special ceremony recognizing his contributions to the sport and his role as a mentor to younger fighters."
  },
  {
    id: "9",
    title: "New Weight Class System Approved for International Competition",
    excerpt: "KKF adopts standardized weight divisions to align with global martial arts federations.",
    image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800",
    category: "News",
    author: "Technical Committee",
    date: "2026-03-10",
    featured: false,
    content: "The Kun Khmer Federation has approved a new weight class system that will standardize divisions for international competition. The changes, effective July 1st, will bring KKF classifications in line with other major martial arts organizations.\n\nThe new system introduces eight weight classes for men and six for women, replacing the previous five-division structure. This change is expected to create more competitive matchups and provide clearer pathways for fighters to achieve championship status.\n\n'Standardization is essential for the global growth of Kun Khmer,' explained Technical Committee Chairman Veasna Ouk. 'This system will make it easier for our fighters to compete internationally and for international fighters to participate in our events.'\n\nAll current champions will be grandfathered into the new system, with transition matches scheduled to establish champions in the new divisions."
  },
  {
    id: "10",
    title: "Historic Stadium Renovation Project Begins Next Month",
    excerpt: "Olympic Stadium to receive major upgrades while preserving its iconic architectural heritage.",
    image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800",
    category: "Events",
    author: "Infrastructure Desk",
    date: "2026-03-08",
    featured: false,
    content: "The Olympic Stadium, home to Kun Khmer's biggest events, will undergo a comprehensive renovation starting in April. The project will modernize facilities while carefully preserving the stadium's distinctive mid-century architecture.\n\nPlanned improvements include upgraded seating, enhanced lighting and sound systems, new training facilities, and improved accessibility features. The renovation will be completed in phases to minimize disruption to scheduled events.\n\n'This stadium is a national treasure and a symbol of Cambodian sports,' said renovation project director Mony Rath. 'Our goal is to create a world-class venue that honors its history while meeting the needs of modern athletes and spectators.'\n\nThe $15 million project is funded through a combination of government support, private investment, and international sports development grants. Completion is expected by early 2027."
  },
  {
    id: "11",
    title: "International Training Camp Brings World-Class Coaches to Cambodia",
    excerpt: "Elite instructors from Thailand, Japan, and Netherlands share expertise with KKF fighters.",
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800",
    category: "Training",
    author: "International Desk",
    date: "2026-03-05",
    featured: false,
    content: "The KKF is hosting a month-long international training camp featuring some of the world's most respected combat sports coaches. The intensive program provides fighters with exposure to diverse training methodologies and advanced techniques.\n\nCoaches from Thailand's Sityodtong Gym, Japan's K-1 organization, and the Netherlands' Golden Glory have been working with KKF fighters daily, focusing on striking techniques, conditioning, and fight strategy. The camp has attracted over 80 fighters from across Cambodia.\n\n'This is an incredible opportunity for our athletes,' said KKF Training Director Bopha Meas. 'Learning from coaches with international experience helps our fighters develop versatile skills that will serve them well in any competition.'\n\nThe program includes morning technique sessions, afternoon sparring, and evening seminars on nutrition, recovery, and mental preparation."
  },
  {
    id: "12",
    title: "Mobile App Launch Brings Kun Khmer to Global Audience",
    excerpt: "New streaming platform offers live events, training content, and fighter profiles to fans worldwide.",
    image: "https://images.unsplash.com/photo-1551817958-d9d86fb29431?w=800",
    category: "News",
    author: "Tech Desk",
    date: "2026-03-02",
    featured: true,
    content: "The Kun Khmer Federation has launched its official mobile application, providing fans around the world with unprecedented access to live events, exclusive content, and comprehensive fighter information.\n\nThe app features live streaming of all major KKF events, on-demand replays, training tutorials from champion fighters, and detailed statistics on every registered athlete. Users can also purchase tickets, merchandise, and access virtual meet-and-greet sessions.\n\n'Digital accessibility is crucial for growing our sport globally,' said KKF Digital Director Sothea Rin. 'This app puts Kun Khmer in the pockets of fans everywhere, from Phnom Penh to Paris.'\n\nThe app is available for free download on iOS and Android, with premium subscriptions offering additional content and benefits."
  },
  {
    id: "13",
    title: "Medical Safety Standards Updated Following International Review",
    excerpt: "Comprehensive health protocols enhance fighter safety and meet global best practices.",
    image: "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800",
    category: "News",
    author: "Medical Committee",
    date: "2026-02-28",
    featured: false,
    content: "The KKF has implemented enhanced medical safety standards following a comprehensive review by international sports medicine experts. The new protocols cover pre-fight screening, ringside medical care, and post-fight monitoring.\n\nAll fighters must now undergo detailed medical examinations before being cleared to compete, including cardiovascular screening, neurological assessment, and vision testing. Ringside physicians receive specialized training in combat sports injuries.\n\n'Fighter safety is our absolute priority,' stated KKF Medical Director Dr. Kannitha Phum. 'These standards ensure that our athletes receive the best possible care while maintaining the competitive integrity of the sport.'\n\nThe federation has also established a concussion protocol requiring mandatory rest periods and medical clearance before fighters can return to training after head injuries."
  },
  {
    id: "14",
    title: "Legendary Coach Pich Sarun Celebrates 40 Years in Kun Khmer",
    excerpt: "Master trainer reflects on four decades of developing champions and preserving traditions.",
    image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=800",
    category: "Fighter Spotlight",
    author: "Heritage Desk",
    date: "2026-02-25",
    featured: false,
    content: "Master coach Pich Sarun was honored at a special ceremony marking his 40th anniversary in Kun Khmer. The 62-year-old trainer has produced over 30 champions and is widely regarded as one of the sport's most influential figures.\n\nSarun began his journey as a fighter in the 1980s before transitioning to coaching, where he developed a reputation for blending traditional techniques with modern training science. His Angkor Warriors gym has become a pilgrimage site for serious fighters.\n\n'Coach Sarun taught me that Kun Khmer is more than fighting—it's about honor, discipline, and representing your country with pride,' said heavyweight champion Virak Thun, one of Sarun's many successful students.\n\nThe federation presented Sarun with a Lifetime Achievement Award and announced the creation of a coaching scholarship program in his name."
  },
  {
    id: "15",
    title: "National Championship Series Expands to 12 Cities",
    excerpt: "Regional events provide more opportunities for fighters and bring world-class action to provinces.",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800",
    category: "Events",
    author: "Events Team",
    date: "2026-02-22",
    featured: true,
    content: "The KKF has announced an expanded National Championship Series that will visit 12 cities across Cambodia throughout 2026. The initiative aims to decentralize the sport and provide more fighters with opportunities to compete at the highest level.\n\nEach regional event will feature local fighters alongside established champions, with winners earning automatic qualification for the national finals in December. The series will also include youth competitions and amateur showcases.\n\n'We want every province to have access to championship-level Kun Khmer,' explained Events Director Raksmey Nhem. 'This series brings the excitement directly to communities nationwide and helps us identify new talent.'\n\nThe tour kicks off in Siem Reap in April, with stops planned for Battambang, Kampong Cham, Sihanoukville, and other major cities."
  },
  {
    id: "16",
    title: "Scientific Study Examines Traditional Training Methods",
    excerpt: "University researchers document effectiveness of ancient conditioning techniques.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    category: "Training",
    author: "Research Team",
    date: "2026-02-20",
    featured: false,
    content: "A groundbreaking study by the Royal University of Phnom Penh has scientifically validated many traditional Kun Khmer training methods that have been passed down through generations.\n\nResearchers monitored 50 fighters over six months, comparing traditional techniques like bamboo post striking, rope climbing, and meditation with modern strength and conditioning programs. The study found that traditional methods produced comparable or superior results in several key areas.\n\n'What our ancestors knew intuitively, we can now prove scientifically,' said lead researcher Dr. Sophea Chey. 'These traditional methods develop not just physical strength but mental resilience and body awareness that are crucial for combat sports.'\n\nThe study's findings have been published in the International Journal of Martial Arts Studies and are informing training programs at the national facility."
  },
  {
    id: "17",
    title: "Charity Exhibition Raises $50,000 for Children's Hospital",
    excerpt: "KKF stars come together for special event supporting pediatric medical care.",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
    category: "Events",
    author: "Community Desk",
    date: "2026-02-18",
    featured: false,
    content: "Top Kun Khmer fighters participated in a charity exhibition last Saturday, raising over $50,000 for the National Pediatric Hospital's new trauma center. The event featured exhibition matches, autograph sessions, and a silent auction of fight memorabilia.\n\nChampions including Prom Samnang, Sreymom Phan, and Dara Sopheak donated their time and fought reduced-round exhibition bouts to packed stands at the Olympic Stadium. All proceeds will fund medical equipment and training for pediatric emergency staff.\n\n'These fighters are true champions, not just in the ring but in their hearts,' said hospital director Dr. Chantha Sok. 'Their generosity will directly save children's lives.'\n\nThe KKF plans to make the charity exhibition an annual tradition, rotating beneficiaries among worthy causes each year."
  },
  {
    id: "18",
    title: "Anti-Doping Program Achieves 100% Compliance Rate",
    excerpt: "Comprehensive testing protocol ensures fair competition and athlete health.",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800",
    category: "News",
    author: "Integrity Committee",
    date: "2026-02-15",
    featured: false,
    content: "The KKF's anti-doping program has achieved a 100% compliance rate among registered fighters, according to the federation's annual integrity report. The comprehensive testing protocol includes random out-of-competition testing and mandatory pre-fight screening.\n\nThe program, which began in 2023, has tested over 500 fighters in the past year with zero positive results. The federation partners with a World Anti-Doping Agency accredited laboratory to ensure testing accuracy.\n\n'Clean sport is fundamental to fair competition and athlete health,' said Integrity Officer Vanna Sok. 'We're proud that our fighters understand and embrace this commitment.'\n\nThe KKF provides education programs to help fighters understand prohibited substances and the importance of clean competition."
  },
  {
    id: "19",
    title: "Virtual Reality Training Program Launches at National Facility",
    excerpt: "Cutting-edge technology enhances fighter preparation and tactical analysis.",
    image: "https://images.unsplash.com/photo-1617802690658-1173a812650d?w=800",
    category: "Training",
    author: "Tech Innovation",
    date: "2026-02-12",
    featured: true,
    content: "The KKF has introduced virtual reality training technology at its national facility, allowing fighters to practice against digital opponents and analyze techniques in immersive 3D environments.\n\nThe VR system creates realistic training scenarios, from sparring sessions to championship fight simulations. Fighters can review their movements from any angle, identify technical flaws, and experiment with strategies in a safe environment.\n\n'This technology complements traditional training by providing instant feedback and unlimited repetition,' explained Technology Director Pisey Thong. 'Fighters can visualize and practice against any style or opponent.'\n\nThe program has been particularly valuable for developing ring awareness and decision-making skills. Plans are underway to make the technology available at regional training centers."
  },
  {
    id: "20",
    title: "Cultural Heritage Initiative Preserves Ancient Kun Khmer Knowledge",
    excerpt: "KKF partners with UNESCO to document traditional techniques and oral histories.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    category: "News",
    author: "Cultural Affairs",
    date: "2026-02-10",
    featured: false,
    content: "The Kun Khmer Federation has launched a cultural heritage initiative in partnership with UNESCO to preserve ancient fighting techniques and oral histories before they are lost to time.\n\nThe project involves filming master practitioners demonstrating traditional techniques, recording interviews with elderly fighters, and digitizing historical documents. The archive will be made freely available to researchers and the public.\n\n'Kun Khmer is intangible cultural heritage that must be preserved for future generations,' said Heritage Director Bopha Mao. 'We're racing against time to capture knowledge from the oldest living masters.'\n\nThe initiative has already recorded over 100 hours of footage and interviewed 40 fighters over the age of 70, documenting techniques and stories that exist nowhere else."
  }
];
