import { DataCollectionContainer } from "@/components/data-collection/DataCollectionContainer";

export const metadata = {
  title: "Data Collection & Mapping | Fontaine Santé Framework",
  description:
    "Create a comprehensive inventory of raw materials and map your entire supply chain.",
};

export default function DataCollection() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DataCollectionContainer />
    </div>
  );
}
