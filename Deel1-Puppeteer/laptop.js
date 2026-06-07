import puppeteer from "puppeteer"
import fs from "fs"

async function scrapeLaptops() {
  const browser = await puppeteer.launch({ headless: "new" })
  const page = await browser.newPage()
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
  )

  const linkWindowsLaptops = "https://www.coolblue.be/nl/laptops/windows/aanbevolen-voor-studie"
  const linkMacbookLaptops = "https://www.coolblue.be/nl/laptops/apple-macbook/geschikt-voor-studenten"
  const laptops = []

  console.log("Ophalen Windows-laptops")
  laptops.push(...(await ophalenAlleLaptops(page, linkWindowsLaptops, "Windows")))
  console.log(`Totaal aantal laptops: ${laptops.length}`)

  console.log("Ophalen MacBooks")
  laptops.push(...(await ophalenAlleLaptops(page, linkMacbookLaptops, "Apple")))
  console.log(`Totaal aantal laptops: ${laptops.length}`)

  console.log("Laptops filteren")
  const filteredLaptops = laptops.filter((laptop) => {
    // Tekst "-500," omzetten naar een float => alles behalve een getal of komma wordt weggelaten
    const price = parseFloat(laptop.price.replace(/[^\d,]/g, "").replace(",", ".").replace("-",""))
    const reviews = Number(laptop.aantalReviews.replace(/[^\d]/g, ""))
    return reviews >= 1 && price > 800 && price < 1500 
  })
  console.log(`Totaal aantal laptops na het filteren: ${filteredLaptops.length}`)

  // Details ophalen
  for (let i = 0; i < filteredLaptops.length; i++) {
    const laptop = filteredLaptops[i]
    let link = "https://www.coolblue.be"

    link += laptop.detailsPage
    console.log(`(${i+1}/${filteredLaptops.length}) Details ophalen van ${link}`)
    await page.goto(link, { waitUntil: "networkidle0" })

    const specifications = await page.$$eval("tbody .css-1u8qly9", (rows) => {
    const data = {}
    const expectedSpecs = [
      "Schermdiagonaal",
      "Processor",
      "Intern werkgeheugen (RAM)",
      "Totale opslagcapaciteit"
    ]

    rows.forEach((row) => {
      const key = row.querySelector(".css-1l15cut")?.textContent.trim()
      const value = row.querySelector(".css-7wsoqo")?.textContent.trim() || "Data ontbreekt"

      // Als er een "spec" en "spec-waarde" is, en deze voldoet aan de verwachte specs, wordt deze toegevoegd
      if (key && value && expectedSpecs.includes(key)) {
        data[key] = value
      }
    })

    return data
  })

    laptop.specifications = specifications
  }

  // JSON-object aanmaken met titel als key en producten als value
  const jsonData = {
    filteredLaptops,
  }

  // Json product omzetten naar JSON-bestand (null & 2 helpen bij leesbaarheid)
  fs.writeFileSync("./laptops.json", JSON.stringify(jsonData, null, 2))

  await browser.close()
}

async function ophalenAlleLaptops(page, link, platform) {
  await page.goto(link, { waitUntil: "networkidle0" })

  let scrapedLaptops = []
  let pagesChecked = 0
  let nextPageBtn = true

  // Loop stopt als nextPageBtn niet bestaat of na 2 pagina's
  while (nextPageBtn && pagesChecked < 2) {
    pagesChecked++

    scrapedLaptops = scrapedLaptops.concat(await ophalenLaptopsPerPagina(page, platform))

    nextPageBtn = await page.$('a[aria-label="Ga naar de volgende pagina"]')

    if (nextPageBtn) {
      const href = await page.$eval('a[aria-label="Ga naar de volgende pagina"]', (element) =>
        element.getAttribute("href")
      )
      const nextUrl = new URL(href, link).toString()
      await page.goto(nextUrl, { waitUntil: "networkidle0" })
    }
  }

  return scrapedLaptops
}

async function ophalenLaptopsPerPagina(page, platform) {
  return await page.$$eval(
    ".product-card",
    (rows, platform) => {
      return rows.map((row) => ({
        title: row.querySelector(".product-card__title")?.textContent.trim() || "Een naamloos product",
        price: row.querySelector(".sales-price__current")?.textContent.trim() || "",
        aantalReviews: row.querySelector(".review-rating__reviews")?.textContent.trim() || "Geen info over reviews gevonden",
        availability: row.querySelector(".color--available")?.textContent.trim() || "Online uitverkocht",
        detailsPage: row.querySelector(".product-card__title a")?.getAttribute("href") || "",
        platform,
      }))
    },
    platform
  )
}

// async function detailsOphalen(page, laptops)
// {
//   await page.goto()
//   return await page.
// }

export { scrapeLaptops }
