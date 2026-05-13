import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "../../../../server/errors";
import { getServerContext } from "../../../../server/supabase";
import { clientValueReport } from "../../../../server/services";

export async function GET(request: NextRequest) {
  try {
    const { client, userId } = await getServerContext(request);
    return NextResponse.json(await clientValueReport(client, userId));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
