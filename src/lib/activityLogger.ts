import { supabase } from "@/integrations/supabase/client";

export const logActivity = async (action: string, details: Record<string, unknown> = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("activity_log").insert([{
    user_id: user.id,
    action,
    details: details as any,
  }]);
};
