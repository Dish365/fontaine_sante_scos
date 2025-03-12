import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(process.cwd(), "data", "suppliers.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const suppliers = JSON.parse(fileContent);

    const supplier = suppliers.find((s: any) => s.id === params.id);

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error reading supplier:", error);
    return NextResponse.json(
      { error: "Failed to load supplier" },
      { status: 500 }
    );
  }
}
