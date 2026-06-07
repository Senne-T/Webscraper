import { test, expect } from "@playwright/test"

test("Frontend has list of games", async ({ page }) => {
  await page.goto("http://localhost:4321/astro-build")

  // Kijk of er een gamelist aanwezizg is
  const gameList = page.locator("#game-list")
  await expect(gameList).toBeVisible()

  // Kijk of er items in de lijst zitten
  const gameItems = gameList.locator("#game-item")
  const count = await gameItems.count()
  await expect(count).toBeGreaterThan(0)
})

test("Frontend has searchinput to filter by names", async ({ page }) => {
  await page.goto("http://localhost:4321/astro-build")

  // Kijk of inputfield aanewizg is
  const input = page.locator("#search-input")
  await expect(input).toBeVisible()
})

test("Frontend shows correct games after filtering with slider", async ({ page }) => {
  await page.goto("http://localhost:4321/astro-build")

  // Kijk of er een inputslider aanwezig is en hier een waarde aangeven
  const input = page.locator("#labels-range-input")
  await expect(input).toBeVisible()
  input.fill("10")

  // Op de zoekknop klikken
  const button = page.locator("#search-btn")
  await button.click()

  // Alle gameitems ophalen en doorloopen
  const gameItems = page.locator("#game-item")

  for (let i = 0; i < (await gameItems.count()); i++) {
    const item = gameItems.nth(i)
    const isVisible = await item.isVisible()

    // Als het item zichtbaar is kijken naar de discount
    if (isVisible) {
      const discountText = await item.locator("#game-discount").textContent()
      const discountValue = discountText?.replace("%", "").replace(" ", "")
      const discount = discountValue !== "N/A" ? Number(discountValue) : 0
      expect(discount).toBeGreaterThanOrEqual(10)
    }
  }
})

test("Frontend shows correct games after filtering with searchinput and silder", async ({ page }) => {
  await page.goto("http://localhost:4321/astro-build")

  // Kijk of er een inputfield aanwezig is en hier een waarde aangeven
  const searchInput = page.locator("#search-input")
  await expect(searchInput).toBeVisible()
  searchInput.fill("Necesse")

  // Kijk of er een inputslider aanwezig is en hier een waarde aangeven
  const discountInput = page.locator("#labels-range-input")
  await expect(discountInput).toBeVisible()
  discountInput.fill("10")

  // Op de zoekknop klikken
  const button = page.locator("#search-btn")
  await button.click()

  // Alle gameitems ophalen en doorloopen
  const gameItems = page.locator("#game-item")

  for (let i = 0; i < (await gameItems.count()); i++) {
    const item = gameItems.nth(i)
    const isVisible = await item.isVisible()

    // Als het item zichtbaar is kijken naar de discount en title
    if (isVisible) {
      const discountText = await item.locator("#game-discount").textContent()
      const discountValue = discountText?.replace("%", "").replace(" ", "")
      const discount = discountValue !== "N/A" ? Number(discountValue) : 0
      expect(discount).toBeGreaterThanOrEqual(10)

      const title = await item.locator("#game-title").textContent()
      expect(title, "Necesse")
    }
  }
})
