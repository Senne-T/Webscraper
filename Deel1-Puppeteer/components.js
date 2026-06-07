import puppeteer from "puppeteer"
import fs, { link } from "fs"

// Scrape Playstations
async function scrapeComponents() {
  const browser = await puppeteer.launch({ headless: "new" })
  const page = await browser.newPage()
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
  )

  const baseUrl = "https://www.megekko.nl/Computer/Componenten"

  const gpuUrl =
    "https://www.megekko.nl/Computer/Componenten/Videokaarten/Nvidia-Videokaarten?f=f_vrrd-3_s-populair_pp-50_p-1_d-list_cf-"
  const cpuUrl =
    "https://www.megekko.nl/Computer/Componenten/Processoren/Socket-AM5-Processoren?f=f_vrrd-3_s-populair_pp-50_p-1_d-list_cf-"
  const motherboardUrl =
    "https://www.megekko.nl/Computer/Componenten/Moederborden/AMD-Socket-AM5-Moederborden?f=f_vrrd-3_s-populair_pp-50_p-1_d-list_cf-"
  const memoryUrl =
    "https://www.megekko.nl/Computer/Componenten/Geheugen/DDR5-Geheugen?f=f_vrrd-3_s-populair_pp-50_p-1_d-list_cf-"

  await page.goto(baseUrl, { waitUntil: "networkidle0" })

  console.log("Ophalen titels")
  const pageTitle = await page.$eval(".navTextHeader", (element) => element.textContent.trim())

  console.log("Ophalen componenten")
  const gpus = await scrapeComponent(page, gpuUrl)
  const cpus = await scrapeComponent(page, cpuUrl)
  const motherboards = await scrapeComponent(page, motherboardUrl)
  const memory = await scrapeComponent(page, memoryUrl)

  console.log("Filteren producten")
  const filteredGpus = filterComponents(gpus, 1000, 600)
  const filteredCpus = filterComponents(cpus, 700, 400)
  const filteredMotherboards = filterComponents(motherboards, 350, 250)
  const filteredMemory = filterComponents(memory, 140)

  console.log("Details ophalen gpus")
  await scrapeComponentSpecifications(page, filteredGpus)
  console.log("Details ophalen cpus")
  await scrapeComponentSpecifications(page, filteredCpus)
  console.log("Details ophalen motherboards")
  await scrapeComponentSpecifications(page, filteredMotherboards)
  console.log("Details ophalen memory")
  await scrapeComponentSpecifications(page, filteredMemory)

  console.log(filteredGpus)

  // JSON-object aanmaken met titel als key en producten als value
  const jsonData = {
    [pageTitle]: {
      "Graphic cards": filteredGpus,
      "Processors": filteredCpus,
      "Motherboards": filteredMotherboards,
      "Memory": filteredMemory,
    },
  }

  // Json product omzetten naar JSON-bestand (null & 2 helpen bij leesbaarheid)
  fs.writeFileSync("./components.json", JSON.stringify(jsonData, null, 2))

  await browser.close()
}

function filterComponents(components, maxPrice, minPrice = 0) {
  return components.filter((component) => {
    const productPrice = parseFloat(component.price.replace(/[^\d,]/g, "").replace(",", "."))
    return productPrice <= maxPrice && productPrice >= minPrice
  })
}

async function scrapeComponentSpecifications(page, components) {
  let i = 0
  for (const component of components) {
    i++
    console.log(`${i}/${components.length}`)
    component.details = await scrapeSpecifications(page, component.url)
  }
}

async function scrapeSpecifications(page, href) {
  await page.goto(href, { waitUntil: "networkidle0" })

  const specifications = await page.$$eval('[aria-label="Belangrijkste specificaties"] .prd_specsgridRow', (rows) => {
    const data = {}

    rows.forEach((row) => {
      const key = row.querySelector("th")?.textContent.trim()
      const value = row.querySelector("td")?.textContent.trim() || "Data ontbreekt"

      data[key] = value
    })

    return data
  })
  return specifications
}

async function scrapeComponent(page, href) {
  await page.goto(href, { waitUntil: "networkidle0" })

  const components = await page.$$eval(".prdContainer", (rows) => {
    return rows.map((row) => ({
      title: row.querySelector(".prdTitle").textContent.trim(),
      price: row.querySelector(".prsEuro").textContent.trim(),
      url: row.querySelector("a").href,
    }))
  })
  return components
}

export { scrapeComponents }
