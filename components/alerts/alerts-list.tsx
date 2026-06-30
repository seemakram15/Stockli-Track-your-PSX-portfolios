"use client";

import Link from "next/link";
import { Bell, BellOff, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { IconChip } from "@/components/ui/accent";
import { usePrices } from "@/lib/hooks/use-prices";
import { effectiveQuotePrice } from "@/lib/services/metrics";
import { formatPKR, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteAlert, toggleAlert } from "@/lib/actions/alerts";
import type { Alert } from "@/lib/types";

export function AlertsList({ alerts, demo }: { alerts: Alert[]; demo?: boolean }) {
  const symbols = alerts.map((a) => a.symbol);
  const { quotes } = usePrices(symbols);

  return (
    <ul className="divide-y divide-border">
      {alerts.map((a) => {
        const q = quotes.get(a.symbol.toUpperCase());
        const price = effectiveQuotePrice(q ?? null);
        const distance =
          price != null ? ((a.target_price - price) / price) * 100 : null;
        const triggered = !a.is_active && a.last_triggered_at != null;

        return (
          <li key={a.id} className="py-3">
            <div className="flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-rose-500/5 sm:px-3">
              <IconChip
                accent={a.condition === "ABOVE" ? "sky" : "orange"}
                variant="gradient"
                size="sm"
                className="mt-0.5"
              >
                {a.condition === "ABOVE" ? <ArrowUp /> : <ArrowDown />}
              </IconChip>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/stock/${a.symbol}`} className="font-semibold hover:text-primary">
                    {a.symbol}
                  </Link>
                  <Badge variant={a.condition === "ABOVE" ? "info" : "warning"}>
                    {a.condition === "ABOVE" ? "Above" : "Below"}
                  </Badge>
                  <StatusBadge active={a.is_active} triggered={triggered} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {a.condition === "ABOVE" ? "Rises above" : "Falls below"}{" "}
                  <span className="font-medium text-foreground">{formatPKR(a.target_price)}</span>
                </p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="text-sm tabular-nums">{formatPKR(price)}</p>
                    {distance != null && (
                      <p
                        className={cn(
                          "text-xs tabular-nums",
                          distance > 0 ? "text-gain" : distance < 0 ? "text-loss" : "text-muted-foreground"
                        )}
                      >
                        {formatPercent(distance)} to target
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <ToggleActionButton
                      demo={demo}
                      id={a.id}
                      active={a.is_active}
                    />
                    <DeleteActionButton
                      demo={demo}
                      id={a.id}
                      symbol={a.symbol}
                    />
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function StatusBadge({ active, triggered }: { active: boolean; triggered: boolean }) {
  if (triggered) return <Badge variant="success">Triggered</Badge>;
  if (active) return <Badge variant="gain">Active</Badge>;
  return <Badge variant="secondary">Paused</Badge>;
}

function ToggleActionButton({
  id,
  active,
  demo,
}: {
  id: string;
  active: boolean;
  demo?: boolean;
}) {
  const label = active ? "Pause" : "Resume";
  if (demo) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={label}
        onClick={() => toast.error("Demo mode — add Supabase keys to manage alerts.")}
      >
        {active ? <BellOff className="size-4" /> : <Bell className="size-4" />}
      </Button>
    );
  }
  return (
    <form
      action={async (formData) => {
        await toggleAlert(formData);
        toast.success(active ? "Alert paused." : "Alert resumed.");
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={String(active)} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={label}
      >
        {active ? <BellOff className="size-4" /> : <Bell className="size-4" />}
      </Button>
    </form>
  );
}

function DeleteActionButton({
  id,
  symbol,
  demo,
}: {
  id: string;
  symbol: string;
  demo?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-loss hover:text-loss"
          aria-label="Delete"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {symbol} alert?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the alert permanently. You can create a new alert for
            this symbol any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {demo ? (
            <AlertDialogAction onClick={() => toast.error("Demo mode — add Supabase keys to manage alerts.")}>
              Delete
            </AlertDialogAction>
          ) : (
            <form
              action={async (formData) => {
                await deleteAlert(formData);
                toast.success("Alert deleted.");
              }}
            >
              <input type="hidden" name="id" value={id} />
              <AlertDialogAction type="submit">Delete</AlertDialogAction>
            </form>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
