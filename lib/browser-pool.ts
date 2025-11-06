import puppeteer, { Browser, Page } from "puppeteer";
import puppeteerCore from "puppeteer-core";

// Function to get browser launch configuration based on environment
const getBrowserConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";

  if (isVercel || isProduction) {
    // Use puppeteer-core with chrome-aws-lambda or custom Chrome
    const executablePath =
      process.env.CHROME_EXECUTABLE_PATH ||
      "/opt/render/bin/chrome" || // Render.com
      "/usr/bin/google-chrome" || // Some cloud providers
      undefined;

    return {
      launch: puppeteerCore.launch,
      config: {
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
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
          "--font-render-hinting=none",
          "--disable-font-subpixel-positioning",
          "--enable-font-antialiasing",
          "--force-color-profile=srgb",
        ],
        executablePath,
        headless: true,
      },
    };
  } else {
    // Local development
    return {
      launch: puppeteer.launch,
      config: {
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
          "--max_old_space_size=512",
          "--font-render-hinting=none",
          "--disable-font-subpixel-positioning",
          "--enable-font-antialiasing",
          "--force-color-profile=srgb",
        ],
      },
    };
  }
};

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
      const browserConfig = getBrowserConfig();
      this.browser = await browserConfig.launch(browserConfig.config);
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
