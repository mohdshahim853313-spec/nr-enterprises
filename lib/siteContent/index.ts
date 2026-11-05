/**
 * 🌟 NR Enterprises Site Content Master Index
 * 
 * Yeh file sabhi pages ke modular content configurations ko aggregate karti hai
 * aur Admin Content (/admin/content) ke defaultData me supply karti hai.
 */

import { homeContent } from "./home";
import { collectionsContent } from "./collections";
import { legacyContent } from "./legacy";
import { aboutContent } from "./about";
import { contactContent } from "./contact";

export { homeContent, collectionsContent, legacyContent, aboutContent, contactContent };

export const defaultData: Record<string, any> = {
  home: homeContent,
  collections: collectionsContent,
  legacy: legacyContent,
  about: aboutContent,
  contact: contactContent,
};

export default defaultData;
