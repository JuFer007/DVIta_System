import React from "react";
import styles from "../styles/StatsCard.module.css";

interface StatsCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon?: React.ElementType;
  color?: string;
  delay?: number;
}

export default function StatsCard({ title, value, sub, icon: Icon, color = "brand", delay = 0 }: StatsCardProps) {
  return (
    <div className={`${styles.card} ${styles[color]}`} style={{ animationDelay: `${delay}ms` }}>
      <div className={styles.top}>
        <div className={styles.iconWrap}>
          {Icon && <Icon />}
        </div>
        <span className={styles.sub}>{sub}</span>
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.title}>{title}</div>
    </div>
  );
}
