const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const axios = require("axios");

// Usar os plugins do puppeteer-extra
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-quic",
      "--disable-http2",
      "--disable-extensions",
    ],
  });
  const page = await browser.newPage();

  // Função de espera
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Clear cookies and cache
  await page.deleteCookie(...(await page.cookies()));

  // Navigate to the login page
  await page.goto("https://my.xm.com/pt/member/login", {
    waitUntil: "networkidle2",
  });
  console.log("Página de login carregada.");

  // Click the "Continuar" button to accept cookies
  await page.waitForSelector(".js-acceptAllCookies", { visible: true });
  await page.click(".js-acceptAllCookies");
  console.log("Cookies aceitos.");
  await wait(5000); // Wait for 5 seconds

  // Fill in the email and password using the name attribute
  await page.type("#login_user", "cadastrei@pm.me");
  await page.type("#login_pass", "Rumoaos10d!");
  console.log("Preenchendo email e senha...");

  // Click the login button
  await page.click('button[type="submit"]');
  console.log("Clicando no botão de login...");

  // Wait for a specific element on the next page to ensure successful login
  try {
    await page.waitForSelector("#dropdownAccount", {
      visible: true,
      timeout: 60000,
    });
    console.log("Login bem-sucedido.");
  } catch (error) {
    console.error("Erro de timeout durante a navegação após o login:", error);
    await page.screenshot({ path: "login-error.png" });
    await browser.close();
    return;
  }

  // Navigate to the trades report page
  await page.goto("https://my.xm.com/pt/member/report_open", {
    waitUntil: "networkidle2",
  });
  console.log("Página de relatório de operações carregada.");

  // Change the filter to show 100 operations
  await page.select("select.tabulator-page-size", "100");
  await page.waitForSelector("select.tabulator-page-size", { visible: true });

  // Click the refresh button
  await page.click("#report-button");
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // Function to fetch trades data
  const fetchTrades = async () => {
    const trades = await page.evaluate(() => {
      const rows = Array.from(
        document.querySelectorAll(".tabulator-table .tabulator-row")
      );
      return rows.map((row) => {
        const cells = row.querySelectorAll(".tabulator-cell");
        console.log("Trade aberta :", {
          id: cells[1].innerText.trim(),
          time: cells[2].innerText.trim(),
          type: cells[3].innerText.trim(),
          symbol: cells[4].innerText.trim(),
          lots: cells[5].innerText.trim(),
          o_price: cells[6].innerText.trim(),
          sl: cells[7].innerText.trim(),
          tp: cells[8].innerText.trim(),
          pl: cells[9].innerText.trim(),
        });
        return {
          id: cells[1].innerText.trim(),
          time: cells[2].innerText.trim(),
          type: cells[3].innerText.trim(),
          symbol: cells[4].innerText.trim(),
          lots: cells[5].innerText.trim(),
          o_price: cells[6].innerText.trim(),
          sl: cells[7].innerText.trim(),
          tp: cells[8].innerText.trim(),
          pl: cells[9].innerText.trim(),
        };
      });
    });
    return trades;
  };

  // Initial fetch of trades
  let previousTrades = await fetchTrades();

  // Function to check for closed trades
  const checkForClosedTrades = async () => {
    // Click the refresh button
    await page.click("#report-button");
    await wait(2000); // Wait for the refresh to complete

    const currentTrades = await fetchTrades();

    // Find closed trades
    const closedTrades = previousTrades.filter(
      (prevTrade) =>
        !currentTrades.find((currTrade) => currTrade.id === prevTrade.id)
    );

    // If there are closed trades, send POST request
    if (closedTrades.length > 0) {
      for (const trade of closedTrades) {
        console.log("Operação fechada no lucro: ", trade);
        try {
          await axios.post("YOUR_API_ENDPOINT", {
            tradeId: trade.id,
            status: "closed on profit",
          });
        } catch (error) {
          console.error("Error sending POST request:", error);
        }
      }
    }

    previousTrades = currentTrades;
  };

  // Check for closed trades every minute
  setInterval(checkForClosedTrades, 60000);
})();
