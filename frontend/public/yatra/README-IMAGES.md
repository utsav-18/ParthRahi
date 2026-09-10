# Yatra images — drop real photos here

Anything in `frontend/public/yatra/` is served at `/yatra/<filename>`.
In the admin (`/admin/events` → a yatra → "Hero image URLs" / itinerary "image"),
paste the path exactly, e.g. `/yatra/kamakhya-hero.jpg`.

## Specs
- Format: JPG (or WebP). Width ~1600px for hero, ~1000px for day photos.
- Keep each file under ~400 KB (compress at tinypng.com or squoosh.app).
- Landscape orientation. No text/watermarks baked in.
- Use photos you own or that are licensed for commercial use
  (Unsplash, Pexels, Wikimedia Commons "CC BY-SA", or your own trip photos).

## Shopping list

### Kamakhya Devi · Sikkim · Darjeeling Yatra  (slug: kamakhya-sikkim-darjeeling-yatra)
| filename | what it should show |
|---|---|
| kamakhya-hero.jpg        | Kamakhya Mandir, Nilachal Hill, Guwahati (wide) |
| kamakhya-temple.jpg      | Kamakhya temple close-up / entrance |
| kamakhya-day02.jpg       | Umananda island / Brahmaputra ferry |
| kamakhya-day03.jpg       | Umiam (Barapani) Lake, Shillong |
| kamakhya-day04.jpg       | Nohkalikai / Seven Sisters Falls, Cherrapunji |
| kamakhya-day06.jpg       | MG Marg or a Gangtok monastery (Do-Drul Chorten) |
| kamakhya-day07.jpg       | Nathula Pass / Tsomgo Lake with snow |
| kamakhya-day08.jpg       | Char Dham / Samdruptse statue, Namchi |
| kamakhya-day10.jpg       | Tiger Hill sunrise over Kanchenjunga, Darjeeling |
| kamakhya-day11.jpg       | Mirik Lake |
| kamakhya-map.jpg         | route map screenshot (Google My Maps → export as image) |

### Tirth Yatra 2026  (slug: tirth-yatra-2026)
| filename | what it should show |
|---|---|
| tirth-hero.jpg           | Kashi Vishwanath corridor / Ganga Aarti at Varanasi |
| tirth-varanasi.jpg       | Dashashwamedh Ghat aarti |
| tirth-vindhyachal.jpg    | Vindhyavasini Devi temple, Mirzapur |
| tirth-ayodhya.jpg        | Ram Mandir / Hanuman Garhi, Ayodhya |
| tirth-mathura.jpg        | Prem Mandir or Banke Bihari, Vrindavan |
| tirth-map.jpg            | route map screenshot |

After adding files, run:  `cd backend && node utils/seedYatras.js`
(the seed points at these paths and falls back to stock photos for any that are missing).
