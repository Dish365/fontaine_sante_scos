import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";

const suppliersPath = path.join(process.cwd(), "data/suppliers.json");

export async function GET() {
  try {
    // Fix the path by removing the extra 'frontend' directory
    const filePath = path.join(process.cwd(), "data", "suppliers.json");

    console.log("Reading suppliers from:", filePath); // Debug log

    const fileContent = await fs.readFile(filePath, "utf-8");
    const suppliers = JSON.parse(fileContent);

    console.log(`Successfully loaded ${suppliers.length} suppliers`);

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error reading suppliers:", error);

    return NextResponse.json(
      {
        error: "Failed to load suppliers",
        details: error.message,
        path: path.join(process.cwd(), "data", "suppliers.json"), // Include path in error for debugging
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supplier = await request.json();

    // Read existing suppliers
    const data = await fs.readFile(suppliersPath, "utf8");
    const suppliers = JSON.parse(data);

    // Create new supplier with ID
    const newSupplier = {
      ...supplier,
      id: `sup-${nanoid()}`,
    };

    // Add to list
    suppliers.push(newSupplier);

    // Write back to file
    await fs.writeFile(suppliersPath, JSON.stringify(suppliers, null, 2));

    return NextResponse.json(newSupplier);
  } catch (error) {
    console.error("Error adding supplier:", error);
    return NextResponse.json(
      { error: "Failed to add supplier" },
      { status: 500 }
    );
  }
}
