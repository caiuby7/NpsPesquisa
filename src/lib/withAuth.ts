// utils/withAuth.ts
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { jwtDecode } from "jwt-decode";

export function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const now = Date.now() / 1000; // em segundos
    return decoded.exp > now;
  } catch {
    return false;
  }
}

export function withAuth<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends { [key: string]: any }
>(): GetServerSideProps<P> {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const token = localStorage.getItem("token");

    if (!token || !isTokenValid(token)) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    return {
      props: {} as P,
    };
  };
}
