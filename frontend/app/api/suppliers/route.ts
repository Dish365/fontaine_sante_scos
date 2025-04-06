import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import suppliersData from "@/data/suppliers.json";
import { withCache } from "@/lib/apiCache";

// GET handler to retrieve all suppliers
export async function GET() {
  // Use caching utility with a key for this endpoint
  return withCache("GET-/api/suppliers", async () => {
    try {
      return NextResponse.json({ suppliers: suppliersData });
    } catch (error) {
      console.error("Error loading suppliers:", error);
      return NextResponse.json(
        { error: "Failed to load suppliers" },
        { status: 500 }
      );
    }
  });
}

// POST handler to add a new supplier (in-memory only in this version)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSupplier = {
      ...body,
      id: `supplier-${uuidv4()}`,
    };
    return NextResponse.json({ supplier: newSupplier });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}

// PUT handler to update a supplier (in-memory only in this version)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const updatedSupplier = { ...updates, id };
    return NextResponse.json({ supplier: updatedSupplier });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a supplier (in-memory only in this version)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    // Find the supplier to return in response
    // @ts-ignore - suppliersData is a JSON import with a structure that matches our Supplier type
    const supplier = suppliersData.find((s) => s.id === id);
    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ supplier, success: true });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
