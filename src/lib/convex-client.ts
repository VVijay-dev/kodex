import { ConvexClient} from "convex/browser";

export const convexClient = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);