import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "../../../../server/errors";
import { getServerContext } from "../../../../server/supabase";

export async function GET(request: NextRequest) {
  try {
    const { client } = await getServerContext(request);
    await client.from("profiles").select("id").limit(1).throwOnError();
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
