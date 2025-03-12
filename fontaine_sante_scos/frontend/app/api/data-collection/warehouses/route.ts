import { NextRequest, NextResponse } from "next/server";
import {
  getWarehouses,
  addWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "@/lib/data-collection-utils";
import { Warehouse } from "@/lib/types";

// GET /api/data-collection/warehouses
export async function GET() {
  try {
    const warehouses = await getWarehouses();
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}

// POST /api/data-collection/warehouses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.type || !body.location) {
      return NextResponse.json(
        { error: "Missing required fields: name, type, location" },
        { status: 400 }
      );
    }

    const warehouse = await addWarehouse(body);
    return NextResponse.json(
      { message: "Warehouse added successfully", warehouse },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding warehouse:", error);
    return NextResponse.json(
      { error: "Failed to add warehouse" },
      { status: 500 }
    );
  }
}

// PUT /api/data-collection/warehouses?id={warehouseId}
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Warehouse ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updatedWarehouse = await updateWarehouse(id, body);

    return NextResponse.json({
      message: "Warehouse updated successfully",
      warehouse: updatedWarehouse,
    });
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to update warehouse" },
      { status: 500 }
    );
  }
}

// DELETE /api/data-collection/warehouses?id={warehouseId}
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Warehouse ID is required" },
        { status: 400 }
      );
    }

    await deleteWarehouse(id);

    return NextResponse.json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 }
    );
  }
}
