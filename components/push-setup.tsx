"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function PushSetup() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => { setEnabled(Notification.permission === "granted"); }, []);
  async function enable() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setEnabled(permission === "granted");
    if ("serviceWorker" in navigator) await navigator.serviceWorker.register("/sw.js");
  }
  return <Button variant="outline" size="sm" onClick={enable}>{enabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}{enabled ? "Push aktif" : "Aktifkan push"}</Button>;
}
