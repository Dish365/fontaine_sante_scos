import { NextRequest, NextResponse } from "next/server";
import {
  getSupplierPricing,
  addSupplierPricing,
  updateSupplierPricing,
  deleteSupplierPricing,
} from "@/lib/data-collection-utils";

// GET /api/data-collection/supplier-pricing
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supplierId = searchParams.get("supplierId");
    const materialId = searchParams.get("materialId");

    const pricing = await getSupplierPricing();

    // Filter by supplier and/or material if specified
    const filteredPricing = pricing.filter((p) => {
      if (supplierId && materialId) {
        return p.supplierId === supplierId && p.materialId === materialId;
      } else if (supplierId) {
        return p.supplierId === supplierId;
      } else if (materialId) {
        return p.materialId === materialId;
      }
      return true;
    });

    return NextResponse.json({ pricing: filteredPricing });
  } catch (error) {
    console.error("Failed to fetch supplier pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier pricing" },
      { status: 500 }
    );
  }
}

// POST /api/data-collection/supplier-pricing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "supplierId",
      "materialId",
      "unitPrice",
      "currency",
    ] as const;
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          fields: missingFields,
          message: `Please provide: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Add the pricing record
    const pricing = await addSupplierPricing(body);

    return NextResponse.json(
      {
        success: true,
        message: "Supplier pricing added successfully",
        pricing,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add supplier pricing:", error);
    return NextResponse.json(
      {
        error: "Failed to add supplier pricing",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// PUT /api/data-collection/supplier-pricing
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing pricing ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const pricing = await updateSupplierPricing(id, body);

    return NextResponse.json({
      success: true,
      message: "Supplier pricing updated successfully",
      pricing,
    });
  } catch (error) {
    console.error("Failed to update supplier pricing:", error);
    return NextResponse.json(
      { error: "Failed to update supplier pricing" },
      { status: 500 }
    );
  }
}

// DELETE /api/data-collection/supplier-pricing
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing pricing ID" },
        { status: 400 }
      );
    }

    await deleteSupplierPricing(id);

    return NextResponse.json({
      success: true,
      message: "Supplier pricing deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete supplier pricing:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier pricing" },
      { status: 500 }
    );
  }
}
