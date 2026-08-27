import { db } from "@/lib/db";
import type { Settings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";

export const settingsRepository = {
  async get(): Promise<Settings> {
    const settings = await db.settings.get(DEFAULT_SETTINGS.id);
    return settings ?? DEFAULT_SETTINGS;
  },

  async update(data: Partial<Settings>): Promise<number> {
    return db.settings.update(DEFAULT_SETTINGS.id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async clear(): Promise<void> {
    await db.settings.clear();
  },
};
