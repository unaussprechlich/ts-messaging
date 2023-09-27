---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "ts-messaging"
  text: Introduce type consistency to any messaging stack.
  tagline: "Opinionated DX in 🚧"
  image: 
    src: /logo_transparent.png
    alt: ts-messaging logo
  actions:
    - theme: brand
      text: Quickstart
      link: /guide/quickstart
    - theme: alt
      text: View on GitHub
      link: https://github.com/unaussprechlich/ts-messaging

features:
  - title: Type consistent
    icon: 🧱
    details: Never process a message without knowing its type.
  - title: In-code schema definition
    icon: 📝
    details: Define the schema of your messages exactly where it is needed.
  - title: Validation
    icon: ✔️
    details: Each message is automatically validated against the schema.
---
<style>
:root {
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #000f50 60%, #47caff 40%);
  --vp-home-hero-image-filter: blur(10px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(72px);
  }
}
</style>

