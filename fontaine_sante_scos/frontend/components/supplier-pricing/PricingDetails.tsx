import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SupplierMaterialPricing } from "@/lib/types";
import { LineChart } from "@/components/ui/line-chart";

interface PricingDetailsProps {
  pricing: SupplierMaterialPricing & {
    material?: { name: string };
  };
  onClose: () => void;
}

export function PricingDetails({ pricing, onClose }: PricingDetailsProps) {
  // Prepare price history data for the chart
  const priceHistoryData =
    pricing.priceHistory?.map((entry) => ({
      date: new Date(entry.date),
      price: entry.price,
    })) || [];

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Pricing Details - {pricing.material?.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Current Price:</span>{" "}
                {formatCurrency(pricing.unitPrice, pricing.currency)}
              </div>
              <div>
                <span className="font-medium">Currency:</span>{" "}
                {pricing.currency || "USD"}
              </div>
              <div>
                <span className="font-medium">Minimum Order:</span>{" "}
                {pricing.minOrderQuantity
                  ? `${pricing.minOrderQuantity} units`
                  : "Not specified"}
              </div>
              <div>
                <span className="font-medium">Lead Time:</span>{" "}
                {pricing.leadTime
                  ? `${pricing.leadTime} days`
                  : "Not specified"}
              </div>
              <div>
                <span className="font-medium">Transport Cost:</span>{" "}
                {pricing.transportCost
                  ? formatCurrency(pricing.transportCost, pricing.currency)
                  : "Not specified"}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <Badge variant={pricing.isPreferred ? "default" : "secondary"}>
                  {pricing.isPreferred ? "Preferred" : "Standard"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Volume Discounts */}
          <Card>
            <CardHeader>
              <CardTitle>Volume Discounts</CardTitle>
              <CardDescription>
                Discounts based on order quantity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pricing.volumeDiscounts && pricing.volumeDiscounts.length > 0 ? (
                <div className="space-y-2">
                  {pricing.volumeDiscounts.map((discount, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>≥ {discount.quantity} units</span>
                      <Badge variant="secondary">
                        {discount.discountPercentage}% off
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No volume discounts available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Price History Chart */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>
                Historical price changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {priceHistoryData.length > 0 ? (
                <div className="h-[300px]">
                  <LineChart
                    data={priceHistoryData}
                    xField="date"
                    yField="price"
                    tooltipFormat={(value) =>
                      formatCurrency(value, pricing.currency)
                    }
                  />
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No price history available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Last Negotiation:</span>{" "}
                {pricing.lastNegotiation
                  ? formatDate(new Date(pricing.lastNegotiation))
                  : "Not recorded"}
              </div>
              <div>
                <span className="font-medium">Next Review:</span>{" "}
                {pricing.nextReview
                  ? formatDate(new Date(pricing.nextReview))
                  : "Not scheduled"}
              </div>
              {pricing.notes && (
                <div>
                  <span className="font-medium">Notes:</span>
                  <p className="mt-1 text-muted-foreground">{pricing.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
