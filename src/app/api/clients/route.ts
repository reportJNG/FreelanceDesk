import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "../../../server/errors";
import { getServerContext } from "../../../server/supabase";
import { createClientRow, listClients } from "../../../server/services";

export async function GET(request: NextRequest) {
  try {
    const { client, userId } = await getServerContext(request);
    return NextResponse.json(await listClients(client, userId, request.nextUrl.searchParams));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client, userId } = await getServerContext(request);
    return NextResponse.json(await createClientRow(client, userId, await request.json()));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
