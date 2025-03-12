import fs from "fs/promises";
import path from "path";
import { Supplier, RawMaterial, Warehouse } from "./data-collection-utils";
import { SupplierMaterialPricing } from "../types/types";

const DATA_DIR = path.join(process.cwd(), "data");
const SUPPLIERS_FILE = path.join(DATA_DIR, "suppliers.json");
const MATERIALS_FILE = path.join(DATA_DIR, "materials.json");
const WAREHOUSES_FILE = path.join(DATA_DIR, "warehouses.json");
const SUPPLIER_PRICING_FILE = path.join(
  DATA_DIR,
  "supplier-material-pricing.json"
);

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic function to read JSON file
async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.writeFile(filePath, "[]");
      return [];
    }
    throw error;
  }
}

// Generic function to write JSON file
async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Suppliers
export async function saveSuppliers(suppliers: Supplier[]): Promise<void> {
  await ensureDataDir();
  await writeJsonFile(SUPPLIERS_FILE, suppliers);
}

export async function loadSuppliers(): Promise<Supplier[]> {
  await ensureDataDir();
  return readJsonFile<Supplier>(SUPPLIERS_FILE);
}

// Raw Materials
export async function saveMaterials(materials: RawMaterial[]): Promise<void> {
  await ensureDataDir();
  await writeJsonFile(MATERIALS_FILE, materials);
}

export async function loadMaterials(): Promise<RawMaterial[]> {
  await ensureDataDir();
  return readJsonFile<RawMaterial>(MATERIALS_FILE);
}

// Warehouses
export async function saveWarehouses(warehouses: Warehouse[]): Promise<void> {
  await ensureDataDir();
  await writeJsonFile(WAREHOUSES_FILE, warehouses);
}

export async function loadWarehouses(): Promise<Warehouse[]> {
  await ensureDataDir();
  return readJsonFile<Warehouse>(WAREHOUSES_FILE);
}

// Supplier Material Pricing
export async function saveSupplierPricing(
  pricing: SupplierMaterialPricing[]
): Promise<void> {
  await ensureDataDir();
  await writeJsonFile(SUPPLIER_PRICING_FILE, pricing);
}

export async function loadSupplierPricing(): Promise<
  SupplierMaterialPricing[]
> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(SUPPLIER_PRICING_FILE, "utf-8");
    const jsonData = JSON.parse(data);
    return jsonData.supplierMaterialPricing || [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.writeFile(
        SUPPLIER_PRICING_FILE,
        JSON.stringify({ supplierMaterialPricing: [] })
      );
      return [];
    }
    throw error;
  }
}

// Backup functionality
export async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(DATA_DIR, "backups", timestamp);

  await fs.mkdir(backupDir, { recursive: true });

  const suppliers = await loadSuppliers();
  const materials = await loadMaterials();
  const warehouses = await loadWarehouses();

  await Promise.all([
    writeJsonFile(path.join(backupDir, "suppliers.json"), suppliers),
    writeJsonFile(path.join(backupDir, "materials.json"), materials),
    writeJsonFile(path.join(backupDir, "warehouses.json"), warehouses),
  ]);

  return backupDir;
}

// Restore from backup
export async function restoreFromBackup(backupDir: string): Promise<void> {
  const suppliers = await readJsonFile<Supplier>(
    path.join(backupDir, "suppliers.json")
  );
  const materials = await readJsonFile<RawMaterial>(
    path.join(backupDir, "materials.json")
  );
  const warehouses = await readJsonFile<Warehouse>(
    path.join(backupDir, "warehouses.json")
  );

  await Promise.all([
    saveSuppliers(suppliers),
    saveMaterials(materials),
    saveWarehouses(warehouses),
  ]);
}
