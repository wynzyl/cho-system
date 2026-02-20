import { requireRole } from "@/lib/auth"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function PharmacyPage() {
  const session = await requireRole(["ADMIN", "PHARMACY"])

  return (
    <div>
      <h1 className="text-2xl font-bold">Pharmacy</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome, {session.name}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>To Dispense</CardTitle>
            <CardDescription>Prescriptions ready for dispensing</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Stock management</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items needing reorder</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
