import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import warehousesData from "@/data/warehouses.json";
import { withCache } from "@/lib/apiCache";

// GET handler to retrieve all warehouses
export async function GET() {
  // Use caching utility with a key for this endpoint
  return withCache("GET-/api/warehouses", async () => {
    try {
      return NextResponse.json({ warehouses: warehousesData });
    } catch (error) {
      console.error("Error loading warehouses:", error);
      return NextResponse.json(
        { error: "Failed to load warehouses" },
        { status: 500 }
      );
    }
  });
}

// POST handler to add a new warehouse (in-memory only in this version)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newWarehouse = {
      ...body,
      id: `warehouse-${uuidv4()}`,
    };
    return NextResponse.json({ warehouse: newWarehouse });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to create warehouse" },
      { status: 500 }
    );
  }
}

// PUT handler to update a warehouse (in-memory only in this version)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const updatedWarehouse = { ...updates, id };
    return NextResponse.json({ warehouse: updatedWarehouse });
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to update warehouse" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a warehouse (in-memory only in this version)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Warehouse ID is required" },
        { status: 400 }
      );
    }

    // Find the warehouse to return in response
    // @ts-ignore - warehousesData is a JSON import with a structure that matches our Warehouse type
    const warehouse = warehousesData.find((w) => w.id === id);
    if (!warehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ warehouse, success: true });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 }
    );
  }
}
