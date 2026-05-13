import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "../../../../../server/errors";
import { getServerContext } from "../../../../../server/supabase";
import { exportCsv } from "../../../../../server/services";

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const exportName = name.endsWith(".csv") ? name.slice(0, -4) : name;
    const { client, userId } = await getServerContext(request);
    const csv = await exportCsv(client, userId, exportName);
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${exportName}.csv"`,
      },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
