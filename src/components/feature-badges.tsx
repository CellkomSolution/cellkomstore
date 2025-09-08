"use client";

import * as React from "react";
import { ShieldCheck, RotateCcw, Clock } from "lucide-react";

interface FeatureItemProps {
  icon: React.ElementType;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Icon className="h-5 w-5 text-primary" />
    <span>{text}</span>
  </div>
);

export function FeatureBadges() {
  return (
    <div className="bg-card p-4 rounded-lg border flex flex-wrap justify-around gap-4">
      <FeatureItem icon={ShieldCheck} text="Pasti ori" />
      <FeatureItem icon={RotateCcw} text="Retur alasan apa pun" />
      <FeatureItem icon={Clock} text="Jaminan tepat waktu" />
    </div>
  );
}