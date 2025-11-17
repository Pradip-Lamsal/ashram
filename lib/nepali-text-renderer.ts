// Cache for rendered images
const imageCache = new Map<string, string>();

interface NepaliTextConfig {
  omSymbol?: string;
  sanskritText?: string;
  mainTitle: string;
  subtitle: string;
  width: number;
  height: number;
  fontSize: {
    om?: number;
    sanskrit?: number;
    main: number;
    sub: number;
  };
  colors: {
    om?: string;
    sanskrit?: string;
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
    // Wait for fonts to load first
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        renderCanvasContent();
      });
    } else {
      // Fallback for older browsers
      setTimeout(renderCanvasContent, 100);
    }

    function renderCanvasContent() {
      // Create canvas element
      const canvas = document.createElement("canvas");
      canvas.width = config.width;
      canvas.height = config.height;
      const ctx = canvas.getContext("2d")!;

      // Clear canvas
      ctx.clearRect(0, 0, config.width, config.height);

      ctx.textAlign = "center";
      let currentY = 25;

      // Render OM symbol if provided
      if (config.omSymbol) {
        ctx.font = `${
          config.fontSize.om || 20
        }px "NotoSansDevanagari", "MuktaLocal", "Noto Sans Devanagari", "PoppinsLocal", "MontserratLocal", "Poppins", "Montserrat", "Mangal", "Lohit Devanagari", "Gargi", "Kalimati", sans-serif`;
        ctx.fillStyle = config.colors.om || "#FF6600";
        ctx.fillText(config.omSymbol, config.width / 2, currentY);
        currentY += 25;
      }

      // Render Sanskrit text if provided
      if (config.sanskritText) {
        ctx.font = `${
          config.fontSize.sanskrit || 14
        }px "NotoSansDevanagari", "MuktaLocal", "Noto Sans Devanagari", "PoppinsLocal", "MontserratLocal", "Poppins", "Montserrat", "Mangal", "Lohit Devanagari", "Gargi", "Kalimati", sans-serif`;
        ctx.fillStyle = config.colors.sanskrit || "#B43200";
        ctx.fillText(config.sanskritText, config.width / 2, currentY);
        currentY += 25;
      }

      // Set font for main title with local fonts priority
      ctx.font = `bold ${config.fontSize.main}px "NotoSansDevanagari", "MuktaLocal", "Noto Sans Devanagari", "PoppinsLocal", "MontserratLocal", "Poppins", "Montserrat", "Mangal", "Lohit Devanagari", "Gargi", "Kalimati", sans-serif`;
      ctx.fillStyle = config.colors.main;
      ctx.fillText(config.mainTitle, config.width / 2, currentY);
      currentY += 20;

      // Set font for subtitle with local fonts priority
      ctx.font = `${config.fontSize.sub}px "NotoSansDevanagari", "MuktaLocal", "Noto Sans Devanagari", "PoppinsLocal", "MontserratLocal", "Poppins", "Montserrat", "Mangal", "Lohit Devanagari", "Gargi", "Kalimati", sans-serif`;
      ctx.fillStyle = config.colors.sub;
      ctx.fillText(config.subtitle, config.width / 2, currentY);

      // Convert to base64
      const base64Image = canvas.toDataURL("image/png");

      // Cache result
      imageCache.set(cacheKey, base64Image);

      console.log("✅ Complete Nepali header image rendered (client-side)");
      resolve(base64Image);
    }
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

    // Register the Nepali font for Canvas to use - prioritize local fonts
    const possibleFontPaths = [
      path.join(
        process.cwd(),
        "public/Noto_Sans_Devanagari/static/NotoSansDevanagari-Regular.ttf"
      ),
      path.join(
        process.cwd(),
        "public/Noto_Sans_Devanagari/static/NotoSansDevanagari-Medium.ttf"
      ),
      path.join(process.cwd(), "public/Mukta/Mukta-Regular.ttf"),
      path.join(process.cwd(), "out/fonts/NotoSansDevanagari-Regular.ttf"),
      path.join(
        process.cwd(),
        "public/fonts/static/NotoSansDevanagari-Regular.ttf"
      ),
      path.join(process.cwd(), "public/noto-devanagari.ttf"),
      path.join(process.cwd(), "build/fonts/NotoSansDevanagari-Regular.ttf"),
    ];
    let fontRegistered = false;
    for (const fontPath of possibleFontPaths) {
      try {
        // Only import fs on server side
        if (typeof window === "undefined") {
          const fs = await import("fs");
          if (fs.existsSync(fontPath)) {
            registerFont(fontPath, { family: "Noto Sans Devanagari" });
            console.log("✅ Nepali font registered for Canvas:", fontPath);
            fontRegistered = true;
            break;
          }
        }
      } catch (fontError) {
        console.warn("⚠️ Could not register font at:", fontPath, fontError);
      }
    }

    if (!fontRegistered) {
      console.error("❌ No Nepali font could be registered for Canvas");
    }

    // Create canvas
    const canvas = createCanvas(config.width, config.height);
    const ctx = canvas.getContext("2d");

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, config.width, config.height);

    ctx.textAlign = "center";
    let currentY = 25;

    // Render OM symbol if provided
    if (config.omSymbol) {
      ctx.font = `${
        config.fontSize.om || 20
      }px "NotoSansDevanagari", "MuktaLocal", "Noto Sans Devanagari", "PoppinsLocal", "MontserratLocal", "DejaVu Sans", sans-serif`;
      ctx.fillStyle = config.colors.om || "#FF6600";
      ctx.fillText(config.omSymbol, config.width / 2, currentY);
      currentY += 25;
    }

    // Render Sanskrit text if provided
    if (config.sanskritText) {
      ctx.font = `${
        config.fontSize.sanskrit || 14
      }px "NotoSansDevanagari", "MuktaLocal", "Noto Sans Devanagari", "PoppinsLocal", "MontserratLocal", "DejaVu Sans", sans-serif`;
      ctx.fillStyle = config.colors.sanskrit || "#B43200";
      ctx.fillText(config.sanskritText, config.width / 2, currentY);
      currentY += 25;
    }

    // Set font for main title with local fonts priority
    ctx.font = `bold ${config.fontSize.main}px "NotoSansDevanagari", "MuktaLocal", "Noto Sans Devanagari", "PoppinsLocal", "MontserratLocal", "DejaVu Sans", sans-serif`;
    ctx.fillStyle = config.colors.main;
    ctx.fillText(config.mainTitle, config.width / 2, currentY);
    currentY += 20;

    // Set font for subtitle with local fonts priority
    ctx.font = `${config.fontSize.sub}px "NotoSansDevanagari", "MuktaLocal", "Noto Sans Devanagari", "PoppinsLocal", "MontserratLocal", "DejaVu Sans", sans-serif`;
    ctx.fillStyle = config.colors.sub;
    ctx.fillText(config.subtitle, config.width / 2, currentY);

    // Convert canvas to base64 PNG
    const base64Image = canvas.toDataURL("image/png");

    // Cache the result
    imageCache.set(cacheKey, base64Image);

    console.log("✅ Complete Nepali header image rendered (server-side)");
    return base64Image;
  } catch (error) {
    console.error(
      "⚠️ Server-side canvas rendering failed, returning null:",
      error
    );
    return null;
  }
}

// Default configuration for the complete organization header
export const DEFAULT_NEPALI_HEADER_CONFIG: NepaliTextConfig = {
  omSymbol: "ॐ",
  sanskritText: "श्रीराधासर्वेश्वरो विजयते",
  mainTitle: "श्री जगद्‌गुरु आश्रम एवं जगत्‌नारायण मन्दिर",
  subtitle: "व्यवस्थापन तथा सञ्चालन समिति",
  width: 500,
  height: 140, // Increased height to accommodate OM and Sanskrit text
  fontSize: {
    om: 20,
    sanskrit: 14,
    main: 16,
    sub: 14,
  },
  colors: {
    om: "#FF6600", // Orange for OM symbol
    sanskrit: "#B43200", // Dark orange for Sanskrit text
    main: "#000000", // Black for main title
    sub: "#333333", // Dark gray for subtitle
  },
};

// Convenience function for PDF generation
export async function getNepaliHeaderImage(): Promise<string | null> {
  return renderNepaliHeaderAsImage(DEFAULT_NEPALI_HEADER_CONFIG);
}
