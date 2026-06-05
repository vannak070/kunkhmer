import React, { useState } from "react";
import { Plus, Edit, Trash2, Tag, TrendingUp, Package, ImageIcon, GripVertical, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: "active" | "inactive";
  createdAt: string;
}

const initialCategories: Category[] = [
  {
    id: "1",
    name: "Equipment",
    description: "Fighting equipment and gear",
    productCount: 5,
    status: "active",
    createdAt: "2026-01-15",
    icon: "🥊",
    order: 1,
  },
  {
    id: "2",
    name: "Gloves",
    description: "Fighting gloves",
    productCount: 3,
    status: "active",
    createdAt: "2026-01-16",
    icon: "🧤",
    parentId: "1",
    order: 1,
  },
  {
    id: "3",
    name: "Protective Gear",
    description: "Headgear and shin guards",
    productCount: 2,
    status: "active",
    createdAt: "2026-01-17",
    icon: "🛡️",
    parentId: "1",
    order: 2,
  },
  {
    id: "4",
    name: "Apparel",
    description: "Clothing and uniforms",
    productCount: 2,
    status: "active",
    createdAt: "2026-01-20",
    icon: "👕",
    order: 2,
  },
  {
    id: "5",
    name: "Collectibles",
    description: "Memorabilia and collectible items",
    productCount: 1,
    status: "active",
    createdAt: "2026-02-01",
    icon: "🏆",
    order: 3,
  },
  {
    id: "6",
    name: "Training",
    description: "Training aids and accessories",
    productCount: 0,
    status: "inactive",
    createdAt: "2026-03-10",
    icon: "💪",
    order: 4,
  },
];

export function CategoriesSetting() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive",
    icon: "",
    parentId: "none",
  });

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.status === "active").length;
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  const handleAddCategory = () => {
    const parentId = formData.parentId === "none" ? undefined : formData.parentId;
    const newCategory: Category = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      productCount: 0,
      status: formData.status,
      createdAt: new Date().toISOString().split("T")[0],
      icon: formData.icon || "📦",
      parentId: parentId,
      order: categories.filter(c => c.parentId === parentId).length + 1,
    };

    setCategories([...categories, newCategory]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Category added successfully");
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    setCategories(
      categories.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              name: formData.name,
              description: formData.description,
              status: formData.status,
              icon: formData.icon || c.icon,
              parentId: formData.parentId === "none" ? undefined : formData.parentId,
            }
          : c
      )
    );

    setEditingCategory(null);
    resetForm();
    toast.success("Category updated successfully");
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category && category.productCount > 0) {
      toast.error("Cannot delete category with existing products");
      return;
    }

    setCategories(categories.filter((c) => c.id !== id));
    toast.success("Category deleted successfully");
  };

  const toggleStatus = (id: string) => {
    setCategories(
      categories.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "inactive" : "active" }
          : c
      )
    );
    toast.success("Category status updated");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "active",
      icon: "",
      parentId: "none",
    });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status,
      icon: category.icon || "",
      parentId: category.parentId || "none",
    });
  };

  const moveCategory = (categoryId: string, direction: "up" | "down") => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const siblings = categories
      .filter(c => c.parentId === category.parentId)
      .sort((a, b) => a.order - b.order);

    const currentIndex = siblings.findIndex(c => c.id === categoryId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= siblings.length) return;

    const newCategories = categories.map(c => {
      if (c.id === siblings[currentIndex].id) {
        return { ...c, order: siblings[newIndex].order };
      }
      if (c.id === siblings[newIndex].id) {
        return { ...c, order: siblings[currentIndex].order };
      }
      return c;
    });

    setCategories(newCategories);
    toast.success("Category order updated");
  };

  const parentCategories = categories.filter(c => !c.parentId);
  const getChildCategories = (parentId: string) =>
    categories.filter(c => c.parentId === parentId).sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold">Categories Setting</h1>
              <p className="text-gray-600 mt-1">
                Manage product categories and organization
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new product category.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Category Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter category description"
                    />
                  </div>
                  <div>
                    <Label>Icon/Emoji</Label>
                    <Input
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="e.g., 🥊 or image URL"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter emoji or image URL</p>
                  </div>
                  <div>
                    <Label>Parent Category (Optional)</Label>
                    <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value === "none" ? "" : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="None (Top Level)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
                        {parentCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory} disabled={!formData.name}>
                    Add Category
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="font-bold">{totalCategories}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Categories</p>
                <p className="font-bold">{activeCategories}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="font-bold">{totalProducts}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Categories Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parentCategories.sort((a, b) => a.order - b.order).map((category) => (
                  <React.Fragment key={category.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => moveCategory(category.id, "up")}
                          >
                            <GripVertical className="w-4 h-4 text-gray-400" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon || "📦"}</span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{category.description}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium">{category.productCount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={category.status === "active" ? "default" : "secondary"}>
                          {category.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(category.id)}
                          >
                            {category.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(category)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                                <DialogDescription>
                                  Update the category information below.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Category Name</Label>
                                  <Input
                                    value={formData.name}
                                    onChange={(e) =>
                                      setFormData({ ...formData, name: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Input
                                    value={formData.description}
                                    onChange={(e) =>
                                      setFormData({ ...formData, description: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Icon/Emoji</Label>
                                  <Input
                                    value={formData.icon}
                                    onChange={(e) =>
                                      setFormData({ ...formData, icon: e.target.value })
                                    }
                                    placeholder="e.g., 🥊"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingCategory(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdateCategory}>Update Category</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={category.productCount > 0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {/* Child Categories */}
                    {getChildCategories(category.id).map((child) => (
                      <tr key={child.id} className="hover:bg-gray-50 bg-gray-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1 ml-8">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => moveCategory(child.id, "up")}
                            >
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 ml-8">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="text-lg">{child.icon || "📦"}</span>
                            <span className="font-medium text-gray-700">{child.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{child.description}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium">{child.productCount}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={child.status === "active" ? "default" : "secondary"}>
                            {child.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleStatus(child.id)}
                            >
                              {child.status === "active" ? "Deactivate" : "Activate"}
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(child)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit Category</DialogTitle>
                                  <DialogDescription>
                                    Update the category information below.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Category Name</Label>
                                    <Input
                                      value={formData.name}
                                      onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label>Description</Label>
                                    <Input
                                      value={formData.description}
                                      onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label>Icon/Emoji</Label>
                                    <Input
                                      value={formData.icon}
                                      onChange={(e) =>
                                        setFormData({ ...formData, icon: e.target.value })
                                      }
                                      placeholder="e.g., 🥊"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setEditingCategory(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleUpdateCategory}>Update Category</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(child.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={child.productCount > 0}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Category Management Tips
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Categories help organize your products. You cannot delete categories that have products assigned to them. Deactivate unused categories instead.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
