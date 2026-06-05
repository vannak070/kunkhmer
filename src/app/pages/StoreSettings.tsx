import { useState } from "react";
import { Settings, Globe, Lock, Mail, CreditCard, Truck, Users, FileText, Shield, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";

export function StoreSettings() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "KUN KHMER Official Store",
    currency: "USD",
    taxRate: "10",
    enablePayments: true,
    enableShipping: true,
    emailNotifications: true,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold">Store Settings</h1>
              <p className="text-gray-600 mt-1">
                Configure store preferences and integrations
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5" />
              <h3 className="font-bold">General Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Store Name</Label>
                <Input
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                />
              </div>
              <div>
                <Label>Store Logo URL</Label>
                <Input placeholder="https://..." />
              </div>
              <div>
                <Label>Store Description</Label>
                <Input placeholder="About your store..." />
              </div>
            </div>
          </Card>

          {/* Currency & Tax */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-bold">Currency & Tax</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Currency</Label>
                <Select value={storeSettings.currency} onValueChange={(value) => setStoreSettings({ ...storeSettings, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="KHR">KHR - Cambodian Riel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={storeSettings.taxRate}
                  onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* Payment Gateway */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" />
              <h3 className="font-bold">Payment Gateway</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Payments</Label>
                <Switch
                  checked={storeSettings.enablePayments}
                  onCheckedChange={(checked) => setStoreSettings({ ...storeSettings, enablePayments: checked })}
                />
              </div>
              <div>
                <Label>Payment Methods</Label>
                <div className="space-y-2 mt-2">
                  {["Credit Card", "PayPal", "Stripe", "Cash on Delivery"].map((method) => (
                    <div key={method} className="flex items-center gap-2">
                      <input type="checkbox" id={method} className="rounded" />
                      <label htmlFor={method} className="text-sm">{method}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5" />
              <h3 className="font-bold">Shipping Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Shipping</Label>
                <Switch
                  checked={storeSettings.enableShipping}
                  onCheckedChange={(checked) => setStoreSettings({ ...storeSettings, enableShipping: checked })}
                />
              </div>
              <div>
                <Label>Shipping Fee ($)</Label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div>
                <Label>Free Shipping Threshold ($)</Label>
                <Input type="number" placeholder="100.00" />
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5" />
              <h3 className="font-bold">Email & Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Email Notifications</Label>
                <Switch
                  checked={storeSettings.emailNotifications}
                  onCheckedChange={(checked) => setStoreSettings({ ...storeSettings, emailNotifications: checked })}
                />
              </div>
              <div>
                <Label>Admin Email</Label>
                <Input type="email" placeholder="admin@example.com" />
              </div>
              <div>
                <Label>SMTP Server (optional)</Label>
                <Input placeholder="smtp.gmail.com" />
              </div>
            </div>
          </Card>

          {/* User Roles */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" />
              <h3 className="font-bold">User Roles & Permissions</h3>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-gray-600">Full access to all features</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Manager</p>
                <p className="text-xs text-gray-600">Manage products and orders</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Staff</p>
                <p className="text-xs text-gray-600">View only access</p>
              </div>
            </div>
          </Card>

          {/* Language */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5" />
              <h3 className="font-bold">Language Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Default Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="km">Khmer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* SEO */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5" />
              <h3 className="font-bold">SEO Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input placeholder="KUN KHMER Official Store" />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Input placeholder="Shop authentic KUN KHMER products..." />
              </div>
              <div>
                <Label>Keywords</Label>
                <Input placeholder="khmer, boxing, equipment..." />
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" />
              <h3 className="font-bold">Security Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-xs text-gray-600">Require 2FA for admin users</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Strong Password Policy</Label>
                  <p className="text-xs text-gray-600">Minimum 8 characters</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Session Timeout</Label>
                  <p className="text-xs text-gray-600">Auto logout after inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline">Reset to Defaults</Button>
          <Button onClick={() => toast.success("Settings saved successfully")}>
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
