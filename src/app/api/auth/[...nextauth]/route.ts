import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// 하위 호환성을 위해 authOptions를 여기서도 내보냅니다.
export { authOptions };

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
