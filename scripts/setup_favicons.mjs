import fs from "fs";
import path from "path";

const logoPath = path.join(process.cwd(), "public", "logo.png");
if (fs.existsSync(logoPath)) {
  const targets = [
    path.join(process.cwd(), "public", "icon.png"),
    path.join(process.cwd(), "public", "apple-touch-icon.png"),
    path.join(process.cwd(), "public", "apple-touch-icon-precomposed.png"),
    path.join(process.cwd(), "app", "icon.png"),
    path.join(process.cwd(), "app", "apple-icon.png"),
    path.join(process.cwd(), "public", "favicon.ico"),
    path.join(process.cwd(), "app", "favicon.ico"),
  ];

  for (const target of targets) {
    fs.copyFileSync(logoPath, target);
    console.log(`Copied logo to: ${target}`);
  }
}
