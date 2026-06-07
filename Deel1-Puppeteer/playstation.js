import puppeteer from "puppeteer"
import fs from "fs"

// Scrape Playstations
async function scrapePlaystations() {
  const browser = await puppeteer.launch({ headless: "new" })
  const page = await browser.newPage()
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
  )
  await page.goto("https://www.coolblue.be/nl/consoles/playstation5", { waitUntil: "networkidle0" })

  const pageTitle = await page.$eval(".filtered-search__header h1", (element) => element.textContent.trim())

  const products = await page.$$eval(".product-card", (rows) => {
    return rows.map((row) => ({
      productTitle: row.querySelector(".product-card__title")?.textContent.trim() || "Een naamloos product",
      price: row.querySelector(".sales-price__current")?.textContent.trim() || "",

      // Kijken of het beschikbaar is online
      availability: row.querySelector(".color--available")?.textContent.trim() || row.querySelector(".color--unavailable")?.textContent.trim() || "Uitverkocht",

      // Kijken of het beschikbaar is in de winkels
      storeAvailability: row.querySelector(".store-stock-overlay__product-card-availability-state")?.textContent.trim() || "Niet meer verkrijgbaar in onze Coolblue-winkels",
    }))
  })

  const filteredProducts = products.filter((product) => {
    // Tekst "-500," omzetten naar een float => alles behalve een getal of komma wordt weggelaten
    const price = parseFloat(product.price.replace(/[^\d,]/g, "").replace(",", "."))
    return price > 600 
  })

  console.log(pageTitle)
  console.log(filteredProducts)

  // JSON-object aanmaken met titel als key en producten als value
  const jsonData = {
    [pageTitle] : filteredProducts
  }

  // Json product omzetten naar JSON-bestand (null & 2 helpen bij leesbaarheid)
  fs.writeFileSync("./playstation.json", JSON.stringify(jsonData, null, 2))

  await browser.close()
}

export { scrapePlaystations }