import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import materialsData from "@/data/materials.json";
import { withCache } from "@/lib/apiCache";
import { RawMaterial } from "@/types/types";

// GET handler to retrieve all materials
export async function GET() {
  // Use caching utility with a key for this endpoint
  return withCache("GET-/api/materials", async () => {
    try {
      return NextResponse.json({ materials: materialsData });
    } catch (error) {
      console.error("Error loading materials:", error);
      return NextResponse.json(
        { error: "Failed to load materials" },
        { status: 500 }
      );
    }
  });
}

// POST handler to add a new material (in-memory only in this version)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newMaterial = {
      ...body,
      id: `material-${uuidv4()}`,
    };
    return NextResponse.json({ material: newMaterial });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { error: "Failed to create material" },
      { status: 500 }
    );
  }
}

// PUT handler to update a material (in-memory only in this version)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const updatedMaterial = { ...updates, id };
    return NextResponse.json({ material: updatedMaterial });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a material (in-memory only in this version)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    // Find the material to return in response
    // @ts-expect-error - materialsData is a JSON import with a structure that matches our RawMaterial type
    const material = materialsData.find((m) => m.id === id);
    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ material, success: true });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
