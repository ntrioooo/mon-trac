import { db, initializeDatabase } from "@/lib/db";
import type { Settings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";

export const settingsRepository = {
  async get(): Promise<Settings> {
    await initializeDatabase();
    const settings = await db.settings.get(DEFAULT_SETTINGS.id);
    return settings || DEFAULT_SETTINGS;
  },

  async update(data: Partial<Settings>): Promise<number> {
    const existing = await db.settings.get(DEFAULT_SETTINGS.id);
    const now = new Date().toISOString();

    if (!existing) {
      await db.settings.put({
        ...DEFAULT_SETTINGS,
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      return 1;
    }

    await db.settings.update(DEFAULT_SETTINGS.id, {
      ...data,
      updatedAt: now,
    });
    return 1;
  },

  async clear(): Promise<void> {
    await db.settings.clear();
  },
};
