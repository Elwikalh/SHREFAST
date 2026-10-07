import Link from "next/link";
import { ShareFastMark } from "../brand/share-fast-mark";
import { ShareFastWordmark } from "../brand/share-fast-wordmark";
import styles from "./site.module.css";
export function Brand() {
 return <Link href="/" className={styles.brand} dir="ltr" aria-label="SHARE FAST — الرئيسية">
  <span className={styles.brandMark}><ShareFastMark /></span>
  <ShareFastWordmark className={styles.wordmark} />
 </Link>;
}
