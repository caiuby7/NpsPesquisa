// utils/withAuth.ts
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { parseCookies } from "nookies";
import { verifyToken } from "./auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAuth<P extends { [key: string]: any; }>(): GetServerSideProps<P> {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
const { token } = parseCookies(ctx);

    if (!token || !verifyToken(token)) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }


    return {
      props: {} as P,
    };
  };
}
