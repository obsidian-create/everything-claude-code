# Obsidian Global Events — Editing Guide

## Quick-change locations

| What to change | File | Where |
|---|---|---|
| Brand colors | `css/style.css` | `:root { ... }` — top of file |
| Company address / email | `index.html` | `#contact` section + footer |
| Hero headline / tagline | `index.html` | `#hero .hero-content` |
| About text & stats | `index.html` | `#about` section |
| Portfolio projects | `index.html` | `#portfolio` — each `<article class="portfolio-card">` |
| Certificates | `index.html` | `#certificates` — each `<div class="cert-card">` |
| Services / expertise | `index.html` | `#expertise` — each `<article class="expertise-card">` |
| Contact form recipient | `contact.php` | `RECIPIENT_EMAIL` constant |
| 3D scene intensity | `js/three-scene.js` | `CFG` object at top |
| Camera scroll path | `js/three-scene.js` | `cameraPath` object |

## Adding your own images

Place images in `assets/images/` and update the `src` attributes:

```
assets/images/
  about-hero.jpg      → About section portrait/team photo
  project-01.jpg      → Portfolio card 1
  project-02.jpg      → Portfolio card 2
  project-03.jpg      → Portfolio card 3
  project-04.jpg      → Portfolio card 4
  project-05.jpg      → Portfolio card 5
  project-06.jpg      → Portfolio card 6
  cert-01.jpg         → Certificate/award 1
  cert-02.jpg         → Certificate/award 2
  cert-03.jpg         → Certificate/award 3
  cert-04.jpg         → Certificate/award 4
```

Recommended sizes:
- About photo: 560 × 680 px (portrait)
- Portfolio cards: 840 × 560 px (landscape 3:2)
- Certificates: 640 × 440 px

## Adding more portfolio projects

Copy this block inside `<div class="portfolio-track" id="portfolioTrack">`:

```html
<article class="portfolio-card">
  <div class="portfolio-img-wrap">
    <img src="assets/images/project-XX.jpg" alt="Event description" width="480" height="320" loading="lazy" />
    <div class="portfolio-overlay">
      <span class="portfolio-tag">Tag</span>
    </div>
  </div>
  <div class="portfolio-info">
    <h3>Event Name</h3>
    <p>Location · Year · Details</p>
  </div>
</article>
```

## Uploading to IONOS

1. Log in to IONOS → Hosting → File Manager (or use FTP)
2. Upload the entire `website/` folder contents to your `public_html` (or `htdocs`) directory
3. Make sure `contact.php` is in the same folder as `index.html`
4. Set PHP version to 8.0+ in IONOS hosting settings

## Changing the color palette

Edit the `:root` block in `css/style.css`:

```css
:root {
  --clr-bg:        #0b1120;   /* main background */
  --clr-gold:      #c8a858;   /* accent gold */
  --clr-gold-light:#e8c87a;   /* hover gold */
  /* ... */
}
```
