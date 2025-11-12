// Cache for rendered images
const imageCache = new Map<string, string>();

interface NepaliTextConfig {
  mainTitle: string;
  subtitle: string;
  width: number;
  height: number;
  fontSize: {
    main: number;
    sub: number;
  };
  colors: {
    main: string;
    sub: string;
  };
}

export async function renderNepaliHeaderAsImage(
  config: NepaliTextConfig
): Promise<string | null> {
  try {
    // Create cache key
    const cacheKey = `${config.mainTitle}-${config.subtitle}-${config.width}x${config.height}`;

    // Return cached image if available
    if (imageCache.has(cacheKey)) {
      console.log("📋 Using cached Nepali header image");
      return imageCache.get(cacheKey)!;
    }

    // Check if we're in a browser environment
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      return renderClientSide(config, cacheKey);
    } else {
      return await renderServerSide(config, cacheKey);
    }
  } catch (error) {
    console.error("❌ Failed to render Nepali header as image:", error);
    return null;
  }
}

// Client-side rendering using HTML5 Canvas
function renderClientSide(
  config: NepaliTextConfig,
  cacheKey: string
): Promise<string> {
  return new Promise((resolve) => {
    // Create canvas element
    const canvas = document.createElement("canvas");
    canvas.width = config.width;
    canvas.height = config.height;
    const ctx = canvas.getContext("2d")!;

    // Clear canvas
    ctx.clearRect(0, 0, config.width, config.height);

    // Set font for main title
    ctx.font = `${config.fontSize.main}px "Noto Sans Devanagari", sans-serif`;
    ctx.fillStyle = config.colors.main;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw main title
    const mainY = config.height * 0.35;
    ctx.fillText(config.mainTitle, config.width / 2, mainY);

    // Set font for subtitle
    ctx.font = `${config.fontSize.sub}px "Noto Sans Devanagari", sans-serif`;
    ctx.fillStyle = config.colors.sub;

    // Draw subtitle
    const subY = config.height * 0.65;
    ctx.fillText(config.subtitle, config.width / 2, subY);

    // Convert to base64
    const base64Image = canvas.toDataURL("image/png");

    // Cache result
    imageCache.set(cacheKey, base64Image);

    console.log("✅ Nepali header image rendered (client-side)");
    resolve(base64Image);
  });
}

// Server-side rendering using node canvas
async function renderServerSide(
  config: NepaliTextConfig,
  cacheKey: string
): Promise<string | null> {
  try {
    // Dynamic import to avoid issues if canvas is not available
    const { createCanvas, registerFont } = await import("canvas");
    const path = await import("path");

    // Register the Nepali font for Canvas to use
    try {
      const fontPath = path.join(
        process.cwd(),
        "out/fonts/NotoSansDevanagari-Regular.ttf"
      );
      registerFont(fontPath, { family: "Noto Sans Devanagari" });
      console.log("✅ Nepali font registered for Canvas:", fontPath);
    } catch (fontError) {
      console.warn("⚠️ Could not register Nepali font:", fontError);
    }

    // Create canvas
    const canvas = createCanvas(config.width, config.height);
    const ctx = canvas.getContext("2d");

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, config.width, config.height);

    // Set font for main title (use fallback font family)
    ctx.font = `${config.fontSize.main}px "Noto Sans Devanagari", "DejaVu Sans", sans-serif`;
    ctx.fillStyle = config.colors.main;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw main title
    const mainY = config.height * 0.35;
    ctx.fillText(config.mainTitle, config.width / 2, mainY);

    // Set font for subtitle
    ctx.font = `${config.fontSize.sub}px "Noto Sans Devanagari", "DejaVu Sans", sans-serif`;
    ctx.fillStyle = config.colors.sub;

    // Draw subtitle
    const subY = config.height * 0.65;
    ctx.fillText(config.subtitle, config.width / 2, subY);

    // Convert canvas to base64 PNG
    const base64Image = canvas.toDataURL("image/png");

    // Cache the result
    imageCache.set(cacheKey, base64Image);

    console.log("✅ Nepali header image rendered (server-side)");
    return base64Image;
  } catch (error) {
    console.error(
      "⚠️ Server-side canvas rendering failed, returning null:",
      error
    );
    return null;
  }
}

// Default configuration for the organization header
export const DEFAULT_NEPALI_HEADER_CONFIG: NepaliTextConfig = {
  mainTitle: "श्री जगद्‌गुरु आश्रम एवं जगत्‌नारायण मन्दिर",
  subtitle: "व्यवस्थापन तथा सञ्चालन समिति",
  width: 500,
  height: 120,
  fontSize: {
    main: 18,
    sub: 15,
  },
  colors: {
    main: "#000000",
    sub: "#141414",
  },
};

// Convenience function for PDF generation
export async function getNepaliHeaderImage(): Promise<string | null> {
  return renderNepaliHeaderAsImage(DEFAULT_NEPALI_HEADER_CONFIG);
}
