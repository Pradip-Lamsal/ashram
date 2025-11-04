import puppeteer, { Browser, Page } from "puppeteer";

class BrowserPool {
  private static instance: BrowserPool;
  private browser: Browser | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): BrowserPool {
    if (!BrowserPool.instance) {
      BrowserPool.instance = new BrowserPool();
    }
    return BrowserPool.instance;
  }

  async initialize(): Promise<void> {
    if (this.browser && this.browser.isConnected()) {
      return;
    }

    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = this._createBrowser();

    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  private async _createBrowser(): Promise<void> {
    try {
      console.log("Creating new browser instance...");
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-extensions",
          "--disable-plugins",
          "--disable-images",
          "--disable-javascript",
          "--disable-web-security",
          "--memory-pressure-off",
          "--max_old_space_size=512", // Limit memory usage
        ],
      });
      console.log("Browser created successfully");
    } catch (error) {
      console.error("Failed to create browser:", error);
      this.browser = null;
      throw error;
    }
  }

  async getPage(): Promise<Page> {
    await this.initialize();

    if (!this.browser || !this.browser.isConnected()) {
      throw new Error("Browser is not available");
    }

    const page = await this.browser.newPage();

    // Set page timeout and other optimizations
    await page.setDefaultTimeout(15000);
    await page.setDefaultNavigationTimeout(15000);

    return page;
  }

  async cleanup(): Promise<void> {
    if (this.browser && this.browser.isConnected()) {
      console.log("Closing browser...");
      await this.browser.close();
      this.browser = null;
    }
  }

  // Method to check if browser is healthy
  isHealthy(): boolean {
    return this.browser !== null && this.browser.isConnected();
  }
}

export default BrowserPool;
