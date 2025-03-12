import { NextRequest, NextResponse } from "next/server";
import {
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "@/lib/data-collection-utils";

// GET /api/data-collection/suppliers/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Fetching supplier with ID: ${params.id}`);
    const supplier = await getSupplierById(params.id);

    if (!supplier) {
      console.log(`Supplier with ID ${params.id} not found`);
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    console.log(`Successfully fetched supplier: ${supplier.name}`);
    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}

// PUT /api/data-collection/suppliers/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Ensure the ID in the body matches the URL parameter
    const supplierData = {
      ...body,
      id: params.id,
    };

    const updatedSupplier = await updateSupplier(supplierData);

    if (!updatedSupplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

// DELETE /api/data-collection/suppliers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteSupplier(params.id);

    if (!result) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
