"use server";

import { revalidatePath } from "next/cache";
import { updateAppSetting as updateAppSettingService } from "@/lib/services/app-settings";
import { GENERIC_SAVE_FAILED_MSG, toUserFacingError } from "@/lib/user-messages";

export async function updateAppSetting(
  key: string,
  enabled: boolean
): Promise<{ error?: string }> {
  try {
    await updateAppSettingService(key, enabled);
    revalidatePath("/control-panel/lock-public-pages");
    return {};
  } catch (e) {
    return { error: toUserFacingError(e, GENERIC_SAVE_FAILED_MSG) };
  }
}
