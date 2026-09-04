import { expect, test } from "@playwright/test";

test("customer can sign in, select a product, and complete checkout", async ({ page, request }) => {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `shopper-${unique}@example.com`;
  const password = "TestShopper2026!";

  const registerResponse = await request.post("/api/register", { data: { email, password } });
  expect(registerResponse.ok()).toBeTruthy();

  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(/\/$/);

  const productsResponse = await request.get("http://127.0.0.1:3001/api/products");
  expect(productsResponse.ok()).toBeTruthy();
  const products = await productsResponse.json();
  const product = products.find((item: { inStock: number }) => item.inStock > 0);
  expect(product).toBeTruthy();

  await page.goto(`/product/${product.slug}`);
  await page.getByRole("button", { name: /add to cart/i }).click();
  await page.goto("/cart");
  await page.getByRole("link", { name: "Checkout" }).click();

  await page.getByLabel(/Name \*/).fill("Test");
  await page.getByLabel(/Lastname \*/).fill("Shopper");
  await page.getByLabel(/Phone number/).fill("+41 79 123 45 67");
  await page.getByLabel("Email address *").fill(email);
  await page.getByLabel("Company *").fill("Example Shop AG");
  await page.getByLabel("Address *", { exact: true }).fill("Bahnhofstrasse 10");
  await page.getByLabel(/Apartment/).fill("2A");
  await page.getByLabel("City *").fill("Zurich");
  await page.getByLabel("Country *").fill("Switzerland");
  await page.getByLabel("Postal code *").fill("8001");

  await page.getByRole("button", { name: /continue to secure payment/i }).click();
  await expect(page).toHaveURL(/\/checkout\/success\?.*mock=true/);
  await expect(page.getByRole("heading", { name: "Payment received" })).toBeVisible();
  await expect(page.getByText("Thank you. Your order is confirmed")).toBeVisible();
});
