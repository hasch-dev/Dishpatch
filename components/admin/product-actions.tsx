"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MoreHorizontal,
  EyeOff,
  Eye,
  Trash2,
  Pencil,
  PackageCheck,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

interface ProductActionsProps {
  product: any;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  onEditTrigger: () => void;
}

export default function ProductActions({
  product,
  onUpdate,
  onDelete,
  onEditTrigger,
}: ProductActionsProps) {
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const updateStatus = async (updates: any) => {
    try {
      setLoading(true);

      console.log("UPDATE ATTEMPT");
      console.log("Product ID:", product.id);
      console.log("Updates:", updates);

      const result = await supabase
        .from("products")
        .update(updates)
        .eq("id", product.id)
        .select();

      console.log("UPDATE RESULT:", result);

      if (result.error) {
        console.error("UPDATE ERROR:", result.error);
        alert(JSON.stringify(result.error, null, 2));
        return;
      }

      onUpdate(updates);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async () => {
    if (!confirm("CRITICAL: Permanent deletion requested. Proceed?")) {
      return;
    }

    try {
      setLoading(true);

      console.log("DELETE ATTEMPT");
      console.log("Product ID:", product.id);

      const result = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .select();

      console.log("DELETE RESULT:", result);

      if (result.error) {
        console.error("DELETE ERROR:", result.error);
        alert(JSON.stringify(result.error, null, 2));
        return;
      }

      onDelete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-primary/10 rounded-none"
          disabled={loading}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 rounded-none border-foreground/10 bg-background font-mono text-[10px] uppercase"
      >
        <DropdownMenuLabel className="opacity-50">
          Quick Actions
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={onEditTrigger}
          className="cursor-pointer font-bold"
        >
          <Pencil className="mr-2 h-3 w-3 text-primary" />
          Edit Blueprint Details
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            updateStatus({
              is_hidden: !product.is_hidden,
            })
          }
          className="cursor-pointer"
        >
          {product.is_hidden ? (
            <Eye className="mr-2 h-3 w-3" />
          ) : (
            <EyeOff className="mr-2 h-3 w-3" />
          )}

          {product.is_hidden
            ? "Show in Store"
            : "Hide from Registry"}
        </DropdownMenuItem>

        {product.href && (
          <DropdownMenuItem
            onClick={() => window.open(product.href, "_blank")}
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-3 w-3" />
            Preview Live Path
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-foreground/5" />

        <DropdownMenuLabel className="opacity-50">
          Stock Level
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() =>
            updateStatus({
              stock_status: "in_stock",
            })
          }
          className="text-green-500 cursor-pointer"
        >
          <PackageCheck className="mr-2 h-3 w-3" />
          Set: In Stock
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            updateStatus({
              stock_status: "low_stock",
            })
          }
          className="text-yellow-600 dark:text-yellow-400 cursor-pointer"
        >
          <AlertTriangle className="mr-2 h-3 w-3" />
          Set: Low Stock
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            updateStatus({
              stock_status: "out_of_stock",
            })
          }
          className="text-red-500 cursor-pointer"
        >
          <XCircle className="mr-2 h-3 w-3" />
          Set: Out of Stock
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-foreground/5" />

        <DropdownMenuItem
          onClick={deleteProduct}
          className="text-red-500 focus:bg-red-500 focus:text-white cursor-pointer"
        >
          <Trash2 className="mr-2 h-3 w-3" />
          Permanent Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}