import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "../../../server/errors";
import { getServerContext } from "../../../server/supabase";
import { getSettings, updateSettings } from "../../../server/services";

export async function GET(request: NextRequest) {
  try {
    const { client, userId } = await getServerContext(request);
    return NextResponse.json(await getSettings(client, userId));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { client, userId } = await getServerContext(request);
    return NextResponse.json(await updateSettings(client, userId, await request.json()));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
