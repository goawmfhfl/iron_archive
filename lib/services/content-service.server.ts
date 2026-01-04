import { createClient } from "@/lib/supabase/server";
import type { ReadMargnet } from "@/lib/types/content";

/**
 * 모든 컨텐츠 조회 (서버 사이드)
 */
export async function getAllContents(): Promise<ReadMargnet[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("read_margnet")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`컨텐츠 조회 실패: ${error.message}`);
  }

  return (data || []) as ReadMargnet[];
}

/**
 * 컨텐츠 ID로 조회 (서버 사이드)
 */
export async function getContentById(id: string): Promise<ReadMargnet | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("read_margnet")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw new Error(`컨텐츠 조회 실패: ${error.message}`);
  }

  return data as ReadMargnet;
}
