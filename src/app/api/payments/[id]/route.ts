import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "../../../../server/errors";
import { getServerContext } from "../../../../server/supabase";
import { deletePayment, getPayment, updatePayment } from "../../../../server/services";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { client, userId } = await getServerContext(request);
    return NextResponse.json(await getPayment(client, userId, id));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { client, userId } = await getServerContext(request);
    return NextResponse.json(await updatePayment(client, userId, id, await request.json()));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { client, userId } = await getServerContext(request);
    return NextResponse.json(await deletePayment(client, userId, id));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
