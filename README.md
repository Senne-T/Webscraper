# Bewijsbeschrijving

Dit was een leuke opdracht om aan te werken. Toen we deze opdracht kregen was ik al een beetje meer ervaren met TypeScript dus wist ik voor een groot deel wel wat ik deed. Maar de opdracht had ook leuke uitdagingen.

Voor de opdracht moesten we zowel een bestaande website scrapen, als een UI maken om informatie die we gescraped hadden te tonen. Voor deze webpagina moesten we een aantal testen maken om de functionaliteit te garanderen.

## Tests

Voor de frontend zijn er end-to-end testen geschreven met Playwright. Die testen controleren vooral of de belangrijkste onderdelen van de pagina correct werken:

- de game-lijst is zichtbaar en bevat effectief items;
- het zoekveld is aanwezig om op naam te filteren;
- de slider voor korting werkt en toont enkel games die aan de gekozen drempel voldoen;
- de combinatie van zoekveld en slider blijft correct werken.

De testen staan in `Deel2-Astro/frontend/tests/frontend.spec.ts` en draaien tegen de gebouwde Astro-site. Daardoor wordt niet alleen de componentstructuur getest, maar ook het volledige gedrag van de pagina zoals een gebruiker het ervaart.

## CI/CD

De tests worden automatisch uitgevoerd via GitHub Actions. Bij elke push en pull request naar `main` wordt de frontend eerst gebouwd en daarna getest met Playwright. De workflow installeert de dependencies, bouwt de Astro-app, installeert de Playwright-browsers en voert vervolgens de e2e-tests uit.

Als de build en tests slagen, wordt de frontend als artifact bewaard en daarna automatisch gedeployed via FTP naar de hostingomgeving. Zo wordt gecontroleerd dat wijzigingen niet alleen lokaal werken, maar ook in de geautomatiseerde pipeline en op de live omgeving.

## Voorbeelden

Deze website laat een voorbeeld zien van de info die door de webscraper is opgehaald.

[Website](https://sennetm.be/astro-build)